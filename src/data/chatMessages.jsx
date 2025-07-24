import { useState, useCallback } from 'react';
import { useAuth } from "@clerk/clerk-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// AI 메시지 전송 커스텀 훅
export function useSendMessageToAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const sendMessage = useCallback(async (roomId, message) => {
    console.log('🔥 sendMessage 시작 - roomId:', roomId, 'message:', message);

    if (!roomId || !message.trim()) {
      console.log('❌ 유효성 검사 실패');
      throw new Error('채팅방 ID와 메시지가 필요합니다.');
    }

    try {
      console.log('🔄 setLoading(true) 호출');
      setLoading(true);
      setError(null);

      console.log('🔑 토큰 가져오기 시작');
      const token = await getToken();
      console.log('✅ 토큰 가져오기 성공');

      console.log('💬 메시지 전송 API 호출:', `${API_BASE_URL}/chat/rooms/${roomId}`);

      // 백엔드에서 요구하는 필드들 모두 포함
      console.log('📅 timestamp 생성 시작');
      const timestamp = new Date().toISOString();
      console.log('✅ timestamp 생성 성공:', timestamp);

      console.log('📦 requestData 객체 생성 시작');
      const requestData = {
        message: message.trim(),
        sender: 'user', // 또는 'me'
        timestamp: timestamp // ISO 형식의 timestamp
      };
      console.log('✅ requestData 객체 생성 성공:', requestData);

      console.log('📤 전송할 데이터 (객체):', requestData);
      console.log('📤 전송할 데이터 (JSON):', JSON.stringify(requestData, null, 2));
      console.log('🔍 각 필드 확인:');
      console.log('  - message:', requestData.message);
      console.log('  - sender:', requestData.sender);
      console.log('  - timestamp:', requestData.timestamp);

      console.log('🌐 fetch 요청 시작');

      // 타임아웃 설정 (30초)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ 요청 타임아웃 발생');
        controller.abort();
      }, 30000);

      const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
        signal: controller.signal, // 타임아웃 시그널 추가
      });

      clearTimeout(timeoutId); // 성공시 타임아웃 해제
      console.log('✅ fetch 요청 완료, response status:', response.status);

      if (!response.ok) {
        console.log('❌ 응답 상태 에러');
        const errorText = await response.text();
        console.error('AI 메시지 API 에러:', errorText);
        throw new Error(`AI 메시지 전송 실패: ${response.status} ${response.statusText}`);
      }

      console.log('📥 응답 JSON 파싱 시작');

      // 응답 헤더 확인
      console.log('🔍 응답 헤더 확인:');
      console.log('  - Content-Type:', response.headers.get('content-type'));
      console.log('  - Content-Length:', response.headers.get('content-length'));

      const contentType = response.headers.get('content-type');

      // SSE 스트리밍 응답 처리 (백엔드가 text/event-stream으로 응답)
      if (contentType && contentType.includes('text/event-stream')) {
        console.log('🌊 SSE 스트리밍 응답 감지');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            console.log('📦 스트리밍 청크:', chunk);
            result += chunk;
          }

          console.log('✅ 스트리밍 완료, 전체 결과:', result);

          // SSE 형식에서 실제 JSON 추출
          const lines = result.split('\n');
          let aiResponseText = '';

          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              const jsonData = line.substring(6); // 'data: ' 제거
              try {
                const parsedData = JSON.parse(jsonData);
                console.log('✅ SSE JSON 파싱 성공:', parsedData);
                aiResponseText = parsedData.content || parsedData.message || parsedData;
                break; // 첫 번째 데이터만 사용
              } catch (parseError) {
                console.error('💥 SSE JSON 파싱 에러:', parseError);
              }
            }
          }

          if (aiResponseText) {
            return aiResponseText;
          } else {
            console.warn('⚠️ SSE에서 유효한 데이터를 찾지 못함');
            return '응답을 받지 못했습니다.';
          }
        } finally {
          reader.releaseLock();
        }
      } else {
        console.log('📄 일반 JSON 응답 처리');
        // 일반 JSON 응답 처리 (혹시 백엔드가 일반 응답을 보낼 경우)
        const responseText = await Promise.race([
          response.text(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('응답 텍스트 읽기 타임아웃')), 10000)
          )
        ]);
        console.log('📄 백엔드 원시 응답 텍스트:', responseText);

        let result;
        try {
          result = JSON.parse(responseText);
          console.log('✅ 응답 JSON 파싱 성공:', result);
          return result.data || result.message || result;
        } catch (parseError) {
          console.error('💥 JSON 파싱 에러:', parseError);
          throw new Error(`응답 JSON 파싱 실패: ${parseError.message}`);
        }
      }
    } catch (err) {
      console.error('💥 useSendMessageToAI에서 에러 발생:', err);
      console.error('💥 에러 타입:', typeof err);
      console.error('💥 에러 name:', err.name);
      console.error('💥 에러 message:', err.message);
      console.error('💥 에러 stack:', err.stack);

      // 타임아웃 에러 구분
      if (err.name === 'AbortError') {
        setError('요청 시간이 초과되었습니다. 다시 시도해주세요.');
        throw new Error('요청 시간이 초과되었습니다. 다시 시도해주세요.');
      } else if (err.message.includes('타임아웃')) {
        setError('응답을 읽는데 시간이 너무 오래 걸립니다.');
        throw new Error('응답을 읽는데 시간이 너무 오래 걸립니다.');
      } else {
        setError(err.message || 'AI 응답을 받는데 실패했습니다.');
        throw err;
      }
    } finally {
      console.log('🏁 setLoading(false) 호출');
      setLoading(false);
    }
  }, [getToken]);

  return { sendMessage, loading, error };
}

// 새 채팅방 생성 커스텀 훅 (POST 전용)
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

// 채팅방 입장/생성 통합 커스텀 훅 (기존 방이 있으면 입장, 없으면 생성)
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
        character: postData.data.character, // 백엔드에서 이제 character 정보를 포함해서 반환함
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


