<?php
// 에러 보고 수준 설정
// 실제 운영환경에서는 에러를 사용자에게 표시하지 않기 위해 주석 처리합니다.
// error_reporting(E_ALL);
// ini_set('display_errors', 0);

// CORS 설정
header("Access-Control-Allow-Origin: *"); // 모든 도메인 허용
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// OPTIONS 메소드에 대한 응답 처리 (CORS Preflight 요청 대응)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 데이터베이스 설정 파일 포함
require_once '../db/db_config.php';

// JSON 응답을 반환하는 함수 정의
function sendJsonResponse($statusCode, $message, $data = null)
{
    header('Content-Type: application/json');
    $response = ['StatusCode' => $statusCode, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response);
    exit;
}

// POST 요청 확인
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(405, 'POST 요청만 허용됩니다.');
}

try {
    // 입력 데이터 받아오기
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    // 변수 설정
    $identifier = trim($data['identifier'] ?? ''); // 아이디 또는 이메일
    $password = trim($data['password'] ?? '');
    $searchTerm = trim($data['search_term'] ?? ''); // 검색어가 없으면 빈 문자열로 설정

    // 필수 입력값 확인
    if (!$identifier || !$password) {
        sendJsonResponse(400, '아이디/이메일, 비밀번호를 모두 입력해야 합니다.');
    }

    // 데이터베이스 연결
    $conn = getDbConnection();

    // 사용자 인증
    $sql = "SELECT user_id, username, password FROM members WHERE (username = ? OR email = ?) AND is_active = 1 LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $identifier, $identifier);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendJsonResponse(401, '아이디/이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // 사용자 정보 가져오기
    $user = $result->fetch_assoc();

    // 비밀번호 확인
    if (!password_verify($password, $user['password'])) {
        sendJsonResponse(401, '아이디/이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // 사용자 ID 가져오기
    $user_id = $user['user_id'];

    // 조건 필터링
    $conditions = [];
    $params = [$user_id];
    $types = 'i';

    // 업로드 날짜 필터 처리 (upload:20240101, upload:20240101-20240901)
    if (preg_match('/upload:(\d{8})(?:-(\d{8}))?/', $searchTerm, $matches)) {
        $startDate = DateTime::createFromFormat('Ymd', $matches[1])->format('Y-m-d'); // 시작 날짜
        $endDate = isset($matches[2]) ? DateTime::createFromFormat('Ymd', $matches[2])->format('Y-m-d') : $startDate; // 종료 날짜 (범위 없으면 시작 날짜와 동일)
        $conditions[] = "DATE(fu.upload_date) BETWEEN ? AND ?";
        $params[] = $startDate;
        $params[] = $endDate;
        $types .= 'ss'; // 문자열 파라미터 두 개 추가
    }

    // 파일 형식 필터 처리 (filetype:pdf,hwp)
    if (preg_match('/filetype:([\w,]+)/', $searchTerm, $matches)) {
        $fileTypes = explode(',', $matches[1]);
        $placeholders = implode(',', array_fill(0, count($fileTypes), '?')); // 예: '?,?,?'
        $conditions[] = "fi.file_extension IN ($placeholders)";
        foreach ($fileTypes as $fileType) {
            $params[] = $fileType;
            $types .= 's'; // 문자열 파라미터 추가
        }
    }

    // 페이지 수 필터 처리 (pages:<3, pages:<=3, pages:=3, pages:>=3, pages:>3)
    if (preg_match('/pages:([<>]=?|=)(\d+)/', $searchTerm, $matches)) {
        $operator = $matches[1]; // Comparison operator (>, <, >=, <=, or =)
        $pageCount = (int)$matches[2]; // Page count number
        $conditions[] = "fi.pdf_page_count $operator ?";
        $params[] = $pageCount;
        $types .= 'i'; // 정수 파라미터 추가
    }

    // 파일 크기 필터 처리 (size:500KB, size:<5MB)
    if (preg_match('/size:([<>]=?)?(\d+)([KMGT]B)?/', $searchTerm, $matches)) {
        $operator = $matches[1] ?? '='; // 기본적으로 "=" 연산자
        $size = (int)$matches[2]; // 크기 값
        $unit = strtoupper($matches[3] ?? 'B'); // 기본 단위는 바이트

        // 단위에 따라 크기 변환 (KB, MB, GB, TB)
        switch ($unit) {
            case 'KB': $size *= 1024; break;
            case 'MB': $size *= 1024 * 1024; break;
            case 'GB': $size *= 1024 * 1024 * 1024; break;
        }

        $conditions[] = "fi.file_size $operator ?";
        $params[] = $size;
        $types .= 'i'; // 정수 파라미터 추가
    }

    // 파일명 필터 처리 (filename:파일명)
    if (preg_match('/filename:([\w\.\-]+)/', $searchTerm, $matches)) {
        $fileName = '%' . $matches[1] . '%'; // LIKE 쿼리에 사용할 패턴
        $conditions[] = "fu.file_name LIKE ?";
        $params[] = $fileName;
        $types .= 's'; // 문자열 파라미터 추가
    }

    // OCR 텍스트 필터 처리 (태그 없이 값 입력된 경우)
    if (!preg_match('/filetype:\w+|pages:[<>]=?\d+|size:[<>]=?\d+|filename:\w+|upload:\d+/', $searchTerm) && !empty($searchTerm)) {
        $ocrSearchTerm = '%' . $searchTerm . '%';
        $conditions[] = "od.extracted_text LIKE ?";
        $params[] = $ocrSearchTerm;
        $types .= 's'; // 문자열 파라미터 추가
    }

    // 기본 파일 정보 쿼리
    $fileSql = "SELECT fu.file_id, fu.file_name, fi.file_extension, fi.pdf_page_count, fi.file_size, fu.upload_date 
                FROM file_uploads fu
                JOIN file_info fi ON fu.file_id = fi.file_id
                LEFT JOIN ocr_data od ON fu.file_id = od.file_id 
                WHERE fu.user_id = ?";

    // 조건이 있으면 WHERE에 추가
    if ($conditions) {
        $fileSql .= " AND " . implode(' AND ', $conditions);
    }

    // SQL 실행 준비
    $fileStmt = $conn->prepare($fileSql);
    if (!$fileStmt) {
        throw new Exception('Failed to prepare statement: ' . $conn->error);
    }

    // 바인딩 변수 처리
    $fileStmt->bind_param($types, ...$params);
    $fileStmt->execute();
    $fileResult = $fileStmt->get_result();

    // 결과 처리
    $fileData = [];
    while ($fileRow = $fileResult->fetch_assoc()) {
        $fileData[] = [
            'file_name' => $fileRow['file_name'],
            'file_extension' => $fileRow['file_extension'],
            'pdf_page_count' => $fileRow['pdf_page_count'],
            'file_size' => $fileRow['file_size'],
            'upload_date' => $fileRow['upload_date']
        ];
    }

    // 검색 결과 없을 때 처리
    if (empty($fileData)) {
        sendJsonResponse(404, '검색 결과가 없습니다.');
    }

    // 검색 결과 응답
    sendJsonResponse(200, '검색 성공', $fileData);

    // 자원 해제
    $stmt->close();
    $fileStmt->close();
    $conn->close();

} catch (Exception $e) {
    sendJsonResponse(500, '오류가 발생했습니다: ' . $e->getMessage());
}
?>
