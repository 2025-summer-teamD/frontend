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

  // 1대1 채팅방인지 확인하는 함수
  const isOneOnOneChat = useCallback(async (roomId) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/chat/room-info?roomId=${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // character 필드가 있으면 1대1 채팅 (기존 구조)
        return data.data?.character !== null && data.data?.character !== undefined;
      }
      return false;
    } catch (error) {
      console.error('1대1 채팅방 확인 실패:', error);
      return false;
    }
  }, [getToken]);

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

      // 1대1 채팅방인지 확인
      const isOneOnOne = await isOneOnOneChat(roomId);
      const endpoint = isOneOnOne ? `/chat/rooms/${roomId}/sse` : `/chat/rooms/${roomId}`;
      
      console.log(`💬 메시지 전송 API 호출 (${isOneOnOne ? '1대1 SSE' : '1대다 WebSocket'}):`, `${API_BASE_URL}${endpoint}`);

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

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

      // 1대1 채팅방인 경우에만 SSE 스트리밍 처리
      if (isOneOnOne) {
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
                      return fullResponseAccumulated; // 현재까지 누적된 텍스트 반환
                    }
                  } catch (parseError) {
                    console.error('💥 SSE JSON 파싱 에러 (invalid JSON):', parseError, '데이터:', eventData);
                  }
                }
              }
            }
            return fullResponseAccumulated; // 스트림이 종료된 후 최종 누적된 텍스트 반환

          } finally {
            reader.releaseLock();
          }
        } else {
          console.log('📄 일반 JSON 응답 처리 (1대1이지만 SSE가 아닌 경우)');
          const responseText = await response.text();
          console.log('📄 백엔드 원시 응답 텍스트:', responseText);

          let result;
          try {
            result = JSON.parse(responseText);
            console.log('✅ 일반 응답 JSON 파싱 성공:', result);
            return result.data || result.message || JSON.stringify(result);
          } catch (parseError) {
            console.error('💥 일반 응답 JSON 파싱 에러:', parseError);
            throw new Error(`응답 JSON 파싱 실패: ${parseError.message}. 원시 텍스트: ${responseText.substring(0, 100)}`);
          }
        }
      } else {
        // 1대다 채팅방인 경우 기존 WebSocket 방식 처리
        console.log('📄 1대다 채팅방 - WebSocket 방식 처리');
        const responseText = await response.text();
        console.log('📄 백엔드 원시 응답 텍스트:', responseText);

        let result;
        try {
          result = JSON.parse(responseText);
          console.log('✅ 일반 응답 JSON 파싱 성공:', result);
          return result.data || result.message || JSON.stringify(result);
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
  }, [getToken, isOneOnOneChat]); // useCallback 의존성 배열에 isOneOnOneChat 추가

  return { sendMessage, loading, error };
}

export function useCreateChatRoom() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const createChatRoom = useCallback(async (characterId, isPublic = true) => {
    console.log('🆕 새 채팅방 생성 시작 - characterId:', characterId, 'isPublic:', isPublic);

    if (!characterId) {
      throw new Error('캐릭터 ID가 필요합니다.');
    }

    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      console.log('✅ 토큰 가져오기 성공');

      const requestData = {
        characterId: characterId,
        isPublic: isPublic
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

  const enterOrCreateChatRoom = useCallback(async (characterId, isPublic = true) => {
    console.log('🔍 채팅방 입장/생성 시도 - characterId:', characterId, 'isPublic:', isPublic);

    if (!characterId) {
      throw new Error('캐릭터 ID가 필요합니다.');
    }

    try {
      setLoading(true);
      setError(null);

      const token = await getToken();

      // 1대1 채팅방 생성/입장 (POST)
      console.log('🔍 [enterOrCreateChatRoom] 1대1 채팅방 생성/입장 시도...');
      const requestData = {
        personaId: characterId,
        isPublic: isPublic
      };
      console.log('🔍 [enterOrCreateChatRoom] 요청 데이터:', requestData);

      const postResponse = await fetch(`${API_BASE_URL}/chat/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!postResponse.ok) {
        let errorMessage = '채팅방 생성에 실패했습니다.';
        try {
          const errorData = await postResponse.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
        const errorText = await postResponse.text();
          errorMessage = errorText || errorMessage;
        }
        console.error('💥 1대1 채팅방 생성 실패:', errorMessage);
        throw new Error(errorMessage);
      }

      const postData = await postResponse.json();
      console.log('🔍 [enterOrCreateChatRoom] API 응답:', postData);

      const result = {
        roomId: postData.data.roomId,
        character: postData.data.character,
        chatHistory: postData.data.chatHistory || [],
        isNewRoom: postData.data.isNewRoom || true
      };
      
      console.log('🔍 [enterOrCreateChatRoom] 최종 결과:', result);
      return result;
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
