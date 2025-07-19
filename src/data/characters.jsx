// src/data/characters.jsx
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from "@clerk/clerk-react";

// 공통 API 호출 함수
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 에러 응답:', errorText);
      throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('API 성공:', result);
    return result;
  } catch (error) {
    console.error('API 에러:', error);
    throw error;
  }
};

// 인증 토큰을 포함한 API 호출 함수
const authenticatedApiCall = async (url, getToken, options = {}) => {
  const token = await getToken();
  return apiCall(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};

// 에러 메시지 처리 함수
const handleApiError = (error, defaultMessage) => {
  console.error('API 에러:', error);
  
  if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED' || error.code === 'ERR_EMPTY_RESPONSE') {
    return '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.';
  }
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.';
  }
  
  return error.message || defaultMessage;
};

// 커뮤니티 캐릭터 목록을 가져오는 커스텀 훅
export function useCommunityCharacters(sortBy = 'likes') {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/api/communities/characters?sort=${sortBy}`);
        setCharacters(response.data.data || []);
      } catch (err) {
        const errorMessage = handleApiError(err, '캐릭터 목록을 불러오는데 실패했습니다.');
        setError(errorMessage);
        if (err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED' || err.code === 'ERR_EMPTY_RESPONSE') {
          setCharacters([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCharacters();
  }, [sortBy]);

  return { characters, loading, error, setCharacters };
}

// 내가 채팅한 캐릭터 목록을 가져오는 커스텀 훅
export function useMyChatCharacters() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchMyChatCharacters = async () => {
      try {
        setLoading(true);
        const data = await authenticatedApiCall(
          "http://localhost:3001/api/my/chat-characters",
          getToken,
          {}
        );
        setCharacters(data.data);
      } catch (err) {
        const errorMessage = handleApiError(err, '채팅 목록을 불러오는데 실패했습니다.');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMyChatCharacters();
  }, [getToken]);

  return { characters, loading, error };
}

// 내가 만든 캐릭터 목록을 가져오는 커스텀 훅
export function useMyCharacters() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const fetchMyCharacters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authenticatedApiCall(
        `http://localhost:3001/api/my/characters?type=created`,
        getToken,
        {}
      );
      setCharacters(data.data);
    } catch (err) {
      const errorMessage = handleApiError(err, '캐릭터 목록을 불러오는데 실패했습니다.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchMyCharacters();
  }, [fetchMyCharacters]);

  return { characters, loading, error };
}

// 개별 캐릭터 상세 정보를 가져오는 커스텀 훅
export function useCharacterDetail() {
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const fetchCharacterDetail = useCallback(async (characterId) => {
    if (!characterId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await authenticatedApiCall(
        `http://localhost:3001/api/my/characters/${characterId}`,
        getToken,
        {}
      );
      setCharacter(data.data);
      return data.data;
    } catch (err) {
      const errorMessage = handleApiError(err, '캐릭터 정보를 불러오는데 실패했습니다.');
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const resetCharacter = useCallback(() => {
    setCharacter(null);
    setError(null);
  }, []);

  return { character, loading, error, fetchCharacterDetail, resetCharacter };
}

// 캐릭터 수정을 위한 커스텀 훅
export function useUpdateCharacter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const updateCharacter = useCallback(async (characterId, updateData) => {
    if (!characterId) {
      throw new Error('캐릭터 ID가 필요합니다.');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // API 요청에 맞는 형태로 데이터 구성
      const requestData = {
        introduction: updateData.introduction || updateData.description,
        personality: updateData.personality,
        tone: updateData.tone,
        tag: updateData.tag || updateData.tags
      };
      
      console.log('Updating character with data:', requestData);
      
      const data = await authenticatedApiCall(
        `http://localhost:3001/api/my/characters/${characterId}`,
        getToken,
        {
          method: 'PATCH',
          body: JSON.stringify(requestData),
        }
      );
      
      return data.data;
    } catch (err) {
      const errorMessage = handleApiError(err, '캐릭터 수정에 실패했습니다.');
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { updateCharacter, loading, error };
}

// 캐릭터 삭제를 위한 커스텀 훅
export function useDeleteCharacter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const deleteCharacter = useCallback(async (characterId) => {
    if (!characterId) {
      throw new Error('캐릭터 ID가 필요합니다.');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Deleting character with ID:', characterId);
      
      const data = await authenticatedApiCall(
        `http://localhost:3001/api/my/characters/${characterId}`,
        getToken,
        {
          method: 'DELETE',
        }
      );
      
      return data.data;
    } catch (err) {
      const errorMessage = handleApiError(err, '캐릭터 삭제에 실패했습니다.');
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { deleteCharacter, loading, error };
}

// 좋아요 토글 API 호출 함수
export const toggleLike = async (characterId, token) => {
  console.log('좋아요 토글 요청:', characterId, token);
  
  return apiCall(`http://localhost:3001/api/characters/${characterId}/like`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 조회수 증가 API 호출 함수
export const incrementViewCount = async (characterId) => {
  console.log('조회수 증가 요청:', characterId);
  
  return apiCall(`http://localhost:3001/api/characters/${characterId}/view`, {
    method: 'POST',
  });
};  

  