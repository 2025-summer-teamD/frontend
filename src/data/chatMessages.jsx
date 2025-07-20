// src/data/chatMessages.jsx
import { useState, useEffect, useCallback } from 'react';
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
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }
    return apiCall(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch (error) {
    console.warn('인증 토큰 없음:', error.message);
    throw new Error('로그인이 필요한 기능입니다.');
  }
};

// 채팅 메시지를 가져오는 커스텀 훅
export function useChatMessages(roomId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchChatMessages = async () => {
      if (!roomId) return;
      
      try {
        setLoading(true);
        const data = await authenticatedApiCall(
          `http://localhost:3001/api/chat/rooms/${roomId}`,
          getToken,
          {}
        );
        setMessages(data.messages || []);
      } catch (err) {
        setError('채팅 메시지를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchChatMessages();
  }, [roomId, getToken]);

  return { messages, loading, error, setMessages };
}
