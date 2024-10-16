<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
//HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ActivityIndicator, Text, FlatList } from 'react-native';
import { FAB, Provider, TouchableRipple, Chip } from 'react-native-paper';
import { AntDesign, MaterialIcons } from '@expo/vector-icons'; // MaterialIcons 추가
import UploadModal from '../Modal/UploadModal';
import DocumentList from './DocumentList';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@env';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    elevation: 5,
    paddingHorizontal: 10,
  },
  SearchIcon: {
    marginLeft: 8,
    marginRight: 8,
  },
  HomeTextInput: {
    flex: 1,
    height: 55,
    backgroundColor: 'transparent',
    paddingLeft: 8,
  },
  FilterForm: {
    backgroundColor: '#FAFAFA',
    height: 40,
    borderColor: '#BDBDBD',
    borderWidth: 1,
    borderRadius: 25,
    marginRight: 8,
  },
  FilterText: {
    color: '#6E6E6E',
    fontSize: 13
  }
});

async function getCredentials() {
  const identifier = await SecureStore.getItemAsync('identifier');
  const password = await SecureStore.getItemAsync('password');
  return { identifier, password };
}

// 파일 크기 변환 함수
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const fileSize = parseFloat((bytes / Math.pow(1024, i)).toFixed(2));

  return `${fileSize} ${sizes[i]}`;
};
=======
// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { FAB, Provider, TextInput, Button } from 'react-native-paper';
import UploadModal from '../Modal/UploadModal';
import DocumentList from './DocumentList';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@env'; 
>>>>>>> parent of 964327c (태그추가)

const parseSearchTerm = (searchTerm) => {
  return searchTerm.trim(); // 모든 검색어를 그대로 반환
};

async function fetchDocuments(searchTerm) {
  const { identifier, password } = await getCredentials();
  const formattedSearchTerm = parseSearchTerm(searchTerm);
=======
// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { FAB, Provider, TextInput, Button } from 'react-native-paper';
import UploadModal from '../Modal/UploadModal';
import DocumentList from './DocumentList';
import * as SecureStore from 'expo-secure-store';
=======
// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { FAB, Provider, TextInput, Button } from 'react-native-paper';
import UploadModal from '../Modal/UploadModal';
import DocumentList from './DocumentList';
import * as SecureStore from 'expo-secure-store';
>>>>>>> parent of 964327c (태그추가)
import { API_BASE_URL } from '@env'; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchBar: {
    flex: 1,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#536ed9',
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});

// 파일 크기 변환 함수
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const fileSize = parseFloat((bytes / Math.pow(1024, i)).toFixed(2));
  
  return `${fileSize} ${sizes[i]}`;
};

async function getCredentials() {
  const identifier = await SecureStore.getItemAsync('identifier');
  const password = await SecureStore.getItemAsync('password');
  return { identifier, password };
}

async function fetchDocuments(searchTerm) {
  const { identifier, password } = await getCredentials();
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> parent of 964327c (태그추가)
=======
>>>>>>> parent of 964327c (태그추가)
=======
>>>>>>> parent of 964327c (태그추가)

  const searchData = {
    identifier: identifier,
    password: password,
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    search_term: formattedSearchTerm,
=======
    search_term: searchTerm,
>>>>>>> parent of 964327c (태그추가)
=======
    search_term: searchTerm,
>>>>>>> parent of 964327c (태그추가)
=======
    search_term: searchTerm,
>>>>>>> parent of 964327c (태그추가)
  };

  try {
    const response = await fetch(`${API_BASE_URL}/search/api.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchData),
    });

    const data = await response.json();

    if (data.StatusCode === 200) {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
      return { data: data.data, status: 200 }; // 성공 시 데이터 반환
    } else {
      return { data: [], status: data.StatusCode }; // 실패 시 상태 코드와 빈 데이터 반환
=======
=======
>>>>>>> parent of 964327c (태그추가)
=======
>>>>>>> parent of 964327c (태그추가)
      return data.data;
    } 
    else 
    {
      return [];
>>>>>>> parent of 964327c (태그추가)
    }
  } catch (error) {
    return { data: [], status: 500 }; // 네트워크 오류 시 상태 코드 500 반환
  }
}

const HomeScreen = () => {
  const [documents, setDocuments] = useState([]);
  const [open, setOpen] = useState(false);
  const [visibleModal, setVisibleModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const clearSearch = () => {
    setSearchTerm(''); // 검색어 상태 초기화
  };

  const tags = [
    { key: 'upload:20240101', label: 'upload:20240101' },
    { key: 'filetype:pdf', label: 'filetype:pdf' },
    { key: 'pages:>15', label: 'pages:>15' },
    { key: 'size:<5MB', label: 'size:<5MB' },
    { key: 'filename:report', label: 'filename:report' },
  ];

  const formatDocuments = (fetchedDocuments) => {
    if (fetchedDocuments && fetchedDocuments.length > 0) {
      const formattedData = fetchedDocuments.map((doc, index) => {
        const formattedSize = formatFileSize(doc.file_size);
        console.log('Original file size:', doc.file_size); // 원래 파일 크기 출력
        console.log('Formatted file size:', formattedSize); // 변환된 파일 크기 출력

        return {
          id: index.toString(),
          title: doc.file_name,
          extenstion: doc.file_extension,
          content: formattedSize, 
          thumbnail: doc.first_page_image
            ? `data:image/jpeg;base64,${doc.first_page_image}`
            : null,
          pages: doc.pdf_page_count,
          uploaddate: doc.upload_date
        };
      });
      setDocuments(formattedData);
    } else {
      setDocuments([]);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    setSearchError(null); // 검색 시작 시 오류 상태 초기화
    const result = await fetchDocuments(searchTerm);

    if (result.status === 404) {
      setSearchError('검색 결과가 없습니다.'); // 검색 결과가 없을 때 오류 메시지 설정
      setDocuments([]); // 문서 목록 초기화
    } else if (result.status === 200) {
      formatDocuments(result.data);
    } else {
      setSearchError('오류가 발생했습니다. 나중에 다시 시도해주세요.');
    }

    setIsSearching(false);
  };
  useEffect(() => {
    let isMounted = true; // 컴포넌트 마운트 상태 체크 변수
    const fetchData = async () => {
      if (isMounted) {  // 컴포넌트가 마운트된 상태에서만 데이터 가져오기
        await handleSearch();
      }
    };
    fetchData();
    return () => {
      isMounted = false; // 컴포넌트 언마운트 시 상태 업데이트 중지
    };
  }, []);

  const addTagToSearch = (tag) => {
    setSearchTerm((prev) => {
      const tagText = `${tag} `;
      if (!prev.includes(tagText)) {
        return `${prev}${tagText}`.trim();
      }
      return prev;
    });
  };
=======
    const fetchedDocuments = await fetchDocuments(searchTerm); // 검색어 포함
    formatDocuments(fetchedDocuments);
    setIsSearching(false);
  };
>>>>>>> parent of 964327c (태그추가)
=======
    const fetchedDocuments = await fetchDocuments(searchTerm); // 검색어 포함
    formatDocuments(fetchedDocuments);
    setIsSearching(false);
  };
>>>>>>> parent of 964327c (태그추가)
=======
    const fetchedDocuments = await fetchDocuments(searchTerm); // 검색어 포함
    formatDocuments(fetchedDocuments);
    setIsSearching(false);
  };
>>>>>>> parent of 964327c (태그추가)

  const showModal = (modalType) => setVisibleModal(modalType);
  const hideModal = () => setVisibleModal(null);

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.searchBarContainer}>
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
          <TouchableRipple
            onPress={isSearching ? null : handleSearch} // 검색 중일 땐 클릭 불가
            rippleColor="rgba(0, 0, 0, .32)"
            borderless={true}
          >
            <AntDesign
              name="search1"
              size={20}
              color={isSearching ? 'lightgray' : 'gray'} // 검색 중일 때 색상 변경
              style={styles.SearchIcon}
            />
          </TouchableRipple>
=======
>>>>>>> parent of 964327c (태그추가)
=======
>>>>>>> parent of 964327c (태그추가)
=======
>>>>>>> parent of 964327c (태그추가)
          <TextInput
            style={styles.HomeTextInput}
            placeholder="검색어를 입력하세요"
            value={searchTerm}
            onChangeText={setSearchTerm}
            mode="outlined"
<<<<<<< HEAD
<<<<<<< HEAD
          />
<<<<<<< HEAD
          {searchTerm.length > 0 && (
            <TouchableRipple onPress={clearSearch}>
              <MaterialIcons name="close" size={20} color="gray" />
            </TouchableRipple>
          )}
        </View>
        <View>
          <FlatList
            data={tags}
            horizontal
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <Chip
                style={styles.FilterForm}
                textStyle={styles.FilterText}
                onPress={() => addTagToSearch(item.key)}
              >
                {item.label}
              </Chip>
            )}
            showsHorizontalScrollIndicator={false}
=======
>>>>>>> parent of 964327c (태그추가)
          />
          <Button
            mode="contained"
            style={styles.searchButton}
            onPress={handleSearch}
            loading={isSearching}
            disabled={isSearching}
          >
            검색
          </Button>
        </View>
<<<<<<< HEAD
        <View style={{ borderBottomWidth: 1, borderColor: '#E0E0E0', marginVertical: 10 }} />
        {isSearching ? (
          <View style={{ flex: 1, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#1e90ff" />
          </View>
        ) : (
          <>
            {searchError && (
              <View style={{ alignItems: 'center', marginTop: 1 }}>
                <Text style={{ color: '#999', fontSize: 16 }}>{searchError}</Text>
              </View>
            )}
            <DocumentList documents={documents} />
          </>
        )}
=======
          <Button
            mode="contained"
            style={styles.searchButton}
            onPress={handleSearch}
            loading={isSearching}
            disabled={isSearching}
          >
            검색
          </Button>
        </View>
        <DocumentList documents={documents} />
>>>>>>> parent of 964327c (태그추가)
=======
        <DocumentList documents={documents} />
>>>>>>> parent of 964327c (태그추가)
=======
          />
          <Button
            mode="contained"
            style={styles.searchButton}
            onPress={handleSearch}
            loading={isSearching}
            disabled={isSearching}
          >
            검색
          </Button>
        </View>
        <DocumentList documents={documents} />
>>>>>>> parent of 964327c (태그추가)
        <UploadModal visible={visibleModal === 'upload'} hideModal={hideModal} />
        <FAB.Group
          open={open}
          icon={open ? 'close' : 'plus'}
          actions={[
            {
              icon: 'upload',
              label: '파일 업로드',
              onPress: () => showModal('upload'),
            }
          ]}
          onStateChange={({ open }) => setOpen(open)}
        />
      </View>
    </Provider>
  );
};

export default HomeScreen;
