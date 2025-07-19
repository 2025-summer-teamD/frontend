// src/data/characters.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "@clerk/clerk-react";

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
        console.error('캐릭터 목록 조회 실패:', err);
        // 400 에러는 정렬 파라미터 문제일 수 있으므로 빈 배열로 설정
        if (err.response && err.response.status === 400) {
          setCharacters([]);
          setError('정렬 옵션을 변경해주세요.');
        } else {
          setError('캐릭터 목록을 불러오는데 실패했습니다.');
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
        const token = await getToken();
        const response = await fetch("http://localhost:3001/api/my/chat-characters", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('채팅 목록을 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setCharacters(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyChatCharacters();
  }, [getToken]);

  return { characters, loading, error };
}

// 좋아요 토글 API 호출 함수
export const toggleLike = async (characterId, token) => {
  try {
    console.log('좋아요 토글 요청:', characterId, token);
    const response = await fetch(`http://localhost:3001/api/characters/${characterId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('좋아요 토글 응답:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('좋아요 토글 에러 응답:', errorText);
      throw new Error(`좋아요 토글에 실패했습니다: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('좋아요 토글 성공:', result);
    return result;
  } catch (error) {
    console.error('좋아요 토글 에러:', error);
    throw error;
  }
};

// 조회수 증가 API 호출 함수
export const incrementViewCount = async (characterId) => {
  try {
    console.log('조회수 증가 요청:', characterId);
    const response = await fetch(`http://localhost:3001/api/characters/${characterId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('조회수 증가 응답:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('조회수 증가 에러 응답:', errorText);
      throw new Error(`조회수 증가에 실패했습니다: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('조회수 증가 성공:', result);
    return result;
  } catch (error) {
    console.error('조회수 증가 에러:', error);  
    throw error;
  }
};  

// 이미지 업로드 API 호출 함수
export const uploadImage = async (file, token) => {
  try {
    console.log('이미지 업로드 요청:', file.name);
    
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('http://localhost:3001/api/characters/upload-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    console.log('이미지 업로드 응답:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('이미지 업로드 에러 응답:', errorText);
      throw new Error(`이미지 업로드에 실패했습니다: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('이미지 업로드 성공:', result);
    return result;
  } catch (error) {
    console.error('이미지 업로드 에러:', error);
    throw error;
  }
};  