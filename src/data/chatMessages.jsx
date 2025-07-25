import { useState, useCallback } from 'react';
import { useAuth } from "@clerk/clerk-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// AI 메시지 전송 커스텀 훅
// onNewChunk: 새 텍스트 청크가 도착할 때마다 호출될 콜백 함수 (인자로 청크 텍스트와 전체 누적 텍스트 전달)
// onVideoUrl: 영상 URL이 도착할 때 호출될 콜백 함수 (인자로 영상 URL 전달)
export function useSendMessageToAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  // sendMessage 함수에 onNewChunk 및 onVideoUrl 콜백 추가
  const sendMessage = useCallback(async (roomId, message, onNewChunk, onVideoUrl) => {
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

      const timestamp = new Date().toISOString();
      const requestData = {
        message: message.trim(),
        sender: 'user',
        timestamp: timestamp
      };

      console.log('📤 전송할 데이터:', requestData);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ 요청 타임아웃 발생');
        controller.abort();
      }, 30000); // 30초 타임아웃

      const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId); // 성공시 타임아웃 해제
      console.log('✅ fetch 요청 완료, response status:', response.status);

      if (!response.ok) {
        console.log('❌ 응답 상태 에러');
        const errorText = await response.text();
        console.error('AI 메시지 API 에러:', errorText);
        throw new Error(`AI 메시지 전송 실패: ${response.status} ${response.statusText}. Error: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('text/event-stream')) {
        console.log('🌊 SSE 스트리밍 응답 감지');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = ''; // 부분적으로 수신된 이벤트 라인을 위한 버퍼
        let fullResponseAccumulated = ''; // 전체 AI 응답 누적

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log('✅ 스트리밍 종료 감지');
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // 라인별로 처리
            const lines = buffer.split('\n');
            buffer = lines.pop(); // 마지막 불완전한 라인은 버퍼에 남김

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const eventData = line.substring(6); // 'data: ' 제거

                if (eventData === '[DONE]') {
                  console.log('⭐ [DONE] 이벤트 수신');
                  // 스트림이 완전히 종료됨을 의미하므로 반복문 종료
                  // 여기서는 이미 done=true로 루프가 종료될 것이므로 명시적으로 break는 필요 없을 수 있지만
                  // 파싱 로직의 명확성을 위해 포함
                  return fullResponseAccumulated; // 전체 누적된 텍스트 반환
                }

                try {
                  const parsedData = JSON.parse(eventData);
                  console.log('✅ SSE JSON 파싱 성공:', parsedData);

                  if (parsedData.type === 'text_chunk') {
                    // 한 글자씩 스트리밍 처리 (콜백 호출)
                    fullResponseAccumulated += parsedData.content;
                    if (onNewChunk) {
                      onNewChunk(parsedData.content, fullResponseAccumulated);
                    }
                  } else if (parsedData.type === 'video_url') {
                    // 영상 URL 처리 (콜백 호출)
                    if (onVideoUrl) {
                      onVideoUrl(parsedData.url);
                    }
                  } else if (parsedData.type === 'error') {
                    // 서버에서 발생한 에러 처리
                    setError(parsedData.message || '스트리밍 중 서버 오류가 발생했습니다.');
                    console.error('💥 서버 스트리밍 오류:', parsedData.message);
                    // 에러 발생 시 스트림 중단 가능
                    return fullResponseAccumulated; // 현재까지 누적된 텍스트 반환
                  }
                } catch (parseError) {
                  console.error('💥 SSE JSON 파싱 에러 (invalid JSON):', parseError, '데이터:', eventData);
                  // JSON 파싱 실패 시, 데이터는 무시하고 계속 진행
                }
              }
            }
          }
          return fullResponseAccumulated; // 스트림이 종료된 후 최종 누적된 텍스트 반환

        } finally {
          reader.releaseLock();
        }
      } else {
        console.log('📄 일반 JSON 또는 비-SSE 응답 처리 (예상치 못한 경우)');
        // 이 경로는 백엔드가 SSE를 보내지 않을 경우에만 도달
        // 만약 SSE가 항상 기대된다면 이 else 블록은 에러 처리로 간주할 수 있습니다.
        const responseText = await response.text();
        console.log('📄 백엔드 원시 응답 텍스트:', responseText);

        let result;
        try {
          result = JSON.parse(responseText);
          console.log('✅ 일반 응답 JSON 파싱 성공:', result);
          return result.data || result.message || JSON.stringify(result); // 예상치 못한 응답 처리
        } catch (parseError) {
          console.error('💥 일반 응답 JSON 파싱 에러:', parseError);
          throw new Error(`응답 JSON 파싱 실패: ${parseError.message}. 원시 텍스트: ${responseText.substring(0, 100)}`);
        }
      }
    } catch (err) {
      console.error('💥 useSendMessageToAI에서 에러 발생:', err);
      // 타임아웃 에러 구분
      if (err.name === 'AbortError') {
        setError('요청 시간이 초과되었습니다. 다시 시도해주세요.');
      } else {
        setError(err.message || 'AI 응답을 받는데 실패했습니다.');
      }
      throw err; // 에러를 호출자에게 다시 던져 상위 컴포넌트에서 catch하도록 함
    } finally {
      console.log('🏁 setLoading(false) 호출');
      setLoading(false);
    }
  }, [getToken]); // useCallback 의존성 배열에 getToken 추가

  return { sendMessage, loading, error };
}

// 기존의 다른 훅들은 변경 없음
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

const chatMessages = [
  { id: 1, text: '안녕하세요!qqqqqqqqqqq', sender: 'other', time: '오후 3:45' },
];

export default chatMessages;
export { chatMessages };
