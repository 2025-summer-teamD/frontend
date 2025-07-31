// src/data/characters.jsx
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from "@clerk/clerk-react";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;



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

    const result = await response.json();
    console.log('API 응답:', result);

    if (!response.ok) {
      console.error('API 에러 응답:', result);
      throw new Error(result.message || `API 호출 실패: ${response.status} ${response.statusText}`);
    }

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
      'Content-Type': 'application/json',
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

  const fetchCharacters = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${API_BASE_URL}/communities/characters?sortBy=${sortBy}&page=1&limit=100`);
      console.log('🔍 useCommunityCharacters - API 응답:', response.data);
      const newCharacters = response.data.data?.data || [];
      console.log('🔍 useCommunityCharacters - 파싱된 데이터:', { newCharacters: newCharacters.length });
      
      setCharacters(newCharacters);
    } catch (err) {
      const errorMessage = handleApiError(err, '캐릭터 목록을 불러오는데 실패했습니다.');
      setError(errorMessage);
      if (err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED' || err.code === 'ERR_EMPTY_RESPONSE') {
        setCharacters([]);
      }
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  return { characters, loading, error, setCharacters };
}

// 내가 채팅한 캐릭터 목록을 가져오는 커스텀 훅
export function useMyChatCharacters() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const fetchMyChatCharacters = useCallback(async () => {
    try {
      setLoading(true);
      const data = await authenticatedApiCall(
        `${API_BASE_URL}/my/chat-characters`,
        getToken,
        {}
      );
      setCharacters((data.data || []).filter(chat => !!chat.roomId));
    } catch (err) {
      const errorMessage = handleApiError(err, '채팅 목록을 불러오는데 실패했습니다.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchMyChatCharacters();
  }, [fetchMyChatCharacters]);

  return { characters, loading, error, refetch: fetchMyChatCharacters };
}

// 내가 만든 캐릭터 목록을 가져오는 커스텀 훅
export function useMyCharacters(type = 'created') {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();
  const [refreshTimestamp, setRefreshTimestamp] = useState(Date.now());

  const fetchCharacters = async (characterType = type) => {
    // 'mychats' 타입인 경우 API 호출하지 않고 빈 배열 반환
    if (characterType === 'mychats') {
      setCharacters([]);
      setLoading(false);
      setError(null);
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      
      // 캐시 강제 새로고침을 위한 타임스탬프 추가
      const timestamp = Date.now();
      const data = await authenticatedApiCall(
        `${API_BASE_URL}/my/characters?type=${characterType}&_t=${timestamp}`,
        getToken,
        {}
      );
      
      console.log('✅ useMyCharacters - API response:', data);
      setCharacters(data.data);
      return data.data;
    } catch (err) {
      console.error('❌ useMyCharacters - API error:', err);
      const errorMessage = handleApiError(err, '캐릭터 목록을 불러오는데 실패했습니다.');
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCharacters = useCallback(async (characterType = type) => {
    // 강제 새로고침을 위한 타임스탬프 업데이트
    setRefreshTimestamp(Date.now());
    return await fetchCharacters(characterType);
  }, [getToken, type]);

  useEffect(() => {
    fetchCharacters();
  }, [type, refreshTimestamp]);

  return { characters, loading, error, fetchMyCharacters, setCharacters };
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
        `${API_BASE_URL}/my/characters/${characterId}`,
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
        name: updateData.name,
        introduction: updateData.introduction || updateData.description,
        personality: updateData.personality,
        tone: updateData.tone,
        tag: updateData.tag || updateData.tags
      };

      console.log('🔍 useUpdateCharacter - API call:', {
        url: `${API_BASE_URL}/my/characters/${characterId}`,
        requestData,
        characterId
      });

      const data = await authenticatedApiCall(
        `${API_BASE_URL}/my/characters/${characterId}`,
        getToken,
        {
          method: 'PATCH',
          body: JSON.stringify(requestData),
        }
      );

      console.log('✅ useUpdateCharacter - API response:', data);

      return data.data;
    } catch (err) {
      console.error('❌ useUpdateCharacter - API error:', err);
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
        `${API_BASE_URL}/my/characters/${characterId}`,
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
  console.log('🔍 toggleLike API 호출 - 시작:', { characterId, token });
  console.log('🔍 toggleLike API 호출 - URL:', `${API_BASE_URL}/characters/${characterId}/like`);

  const result = await apiCall(`${API_BASE_URL}/characters/${characterId}/like`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log('🔍 toggleLike API 호출 - 결과:', result);
  return result;
};

// 조회수 증가 API 호출 함수
export const incrementViewCount = async (characterId, token) => {
  console.log('조회수 증가 요청:', characterId);

  return apiCall(`${API_BASE_URL}/characters/${characterId}/view`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

