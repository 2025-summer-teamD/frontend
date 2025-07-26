import { useState, useCallback } from 'react';
import { useAuth } from "@clerk/clerk-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export function useCreateChatRoom() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const createChatRoom = useCallback(async (characterId) => {
    console.log('🆕 새 채팅방 생성 시작 - characterId:', characterId);

    if (!characterId) {
      throw new Error('캐릭터 ID가 필요합니다.');
    }

    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      console.log('✅ 토큰 가져오기 성공');

      const requestData = {
        characterId: characterId
      };

      console.log('📤 채팅방 생성 요청 데이터:', requestData);

      const response = await fetch(`${API_BASE_URL}/chat/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('채팅방 생성 API 에러:', errorText);
        throw new Error(errorText || '채팅방 생성에 실패했습니다.');
      }

      const data = await response.json();
      console.log('✅ 채팅방 생성 응답:', data);

      return {
        roomId: data.data.id,
        character: data.data.character || data.data,
        chatHistory: data.data.chatHistory || []
      };
    } catch (err) {
      console.error('💥 채팅방 생성 에러:', err);
      setError(err.message || '채팅방 생성에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { createChatRoom, loading, error };
}

export function useEnterOrCreateChatRoom() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const enterOrCreateChatRoom = useCallback(async (characterId) => {
    console.log('🔍 채팅방 입장/생성 시도 - characterId:', characterId);

    if (!characterId) {
      throw new Error('캐릭터 ID가 필요합니다.');
    }

    try {
      setLoading(true);
      setError(null);

      const token = await getToken();

      // 1단계: 먼저 기존 채팅방 조회 시도 (GET)
      console.log('📖 1단계: 기존 채팅방 조회 시도...');
      try {
        const getResponse = await fetch(`${API_BASE_URL}/chat/rooms?characterId=${characterId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (getResponse.ok) {
          const getData = await getResponse.json();
          console.log('✅ 기존 채팅방 발견! 히스토리와 함께 입장:', getData);

          return {
            roomId: getData.data.roomId,
            character: getData.data.character,
            chatHistory: getData.data.chatHistory || [],
            isNewRoom: false
          };
        }
      } catch (getError) {
        console.log('📖 기존 채팅방 없음, 새로 생성 진행...');
      }

      // 2단계: 기존 채팅방이 없으면 새로 생성 (POST)
      console.log('🆕 2단계: 새 채팅방 생성...');
      const requestData = {
        characterId: characterId
      };

      const postResponse = await fetch(`${API_BASE_URL}/chat/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!postResponse.ok) {
        const errorText = await postResponse.text();
        console.error('💥 새 채팅방 생성 실패:', errorText);
        throw new Error(errorText || '채팅방 생성에 실패했습니다.');
      }

      const postData = await postResponse.json();
      console.log('✅ 새 채팅방 생성 완료:', postData);

      return {
        roomId: postData.data.id,
        character: postData.data.character,
        chatHistory: postData.data.chatHistory || [],
        isNewRoom: true
      };
    } catch (err) {
      console.error('💥 채팅방 입장/생성 에러:', err);
      setError(err.message || '채팅방 처리에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { enterOrCreateChatRoom, loading, error };
}

// 레거시 메시지 데이터 (임시로 유지)
const chatMessages = [
  { id: 1, text: '안녕하세요!qqqqqqqqqqq', sender: 'other', time: '오후 3:45' },
];

export default chatMessages;
export { chatMessages };
