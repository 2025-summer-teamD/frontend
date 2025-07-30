import React, { createContext, useContext, useState, useCallback } from 'react';

const ChatMessagesContext = createContext();

export const ChatMessagesProvider = ({ children }) => {
  // roomId별 메시지를 저장: { [roomId]: messages[] }
  const [allMessages, setAllMessages] = useState({});

  // roomId별 AI 로딩 상태: { [roomId]: boolean }
  const [aiLoadingStates, setAiLoadingStates] = useState({});

  // --- Getter Functions ---

  // 특정 roomId의 메시지를 가져오는 함수
  const getMessages = useCallback((roomId) => {
    return allMessages[roomId] || [];
  }, [allMessages]);

  // 특정 roomId의 AI 로딩 상태 가져오기
  const getAiLoading = useCallback((roomId) => {
    return aiLoadingStates[roomId] || false;
  }, [aiLoadingStates]);

  const getMessage = useCallback((roomId, messageId) => {
    const messages = allMessages[roomId] || [];
    return messages.find(msg => msg.id === messageId) || null;
  }, [allMessages]);

  // --- Setter/Modifier Functions ---

  // 특정 roomId의 AI 로딩 상태 설정
  const setAiLoading = useCallback((roomId, loading) => {
    console.log(`🔄 AI 로딩 상태 변경 - roomId: ${roomId}, loading: ${loading}`);
    setAiLoadingStates(prev => ({
      ...prev,
      [roomId]: loading
    }));
  }, []);

  // 특정 roomId의 메시지들을 모두 설정 (주로 채팅방 입장 시 히스토리 로드)
  const setMessagesForRoom = useCallback((roomId, messages) => {
    console.log(`📝 채팅방 ${roomId} 메시지 설정:`, messages);
    setAllMessages(prev => ({
      ...prev,
      [roomId]: messages
    }));
  }, []);

  // 특정 roomId에 새 메시지 추가 (사용자 메시지, AI 임시 메시지 등)
  const addMessageToRoom = useCallback((roomId, message) => {
    console.log(`💬 채팅방 ${roomId}에 메시지 추가:`, message);
    setAllMessages(prev => {
      const currentMessages = prev[roomId] || [];
      return {
        ...prev,
        [roomId]: [...currentMessages, message]
      };
    });
  }, []);

  // AI 응답 메시지를 특정 roomId에 추가 (1대1 채팅용)
  const addAiResponseToRoom = useCallback((roomId, chatId, aiResponseText, characterId = null, aiName = null) => {
    console.log(`🤖 채팅방 ${roomId}에 AI 응답 추가:`, aiResponseText);
    const aiMessage = {
      id: chatId,
      text: aiResponseText,
      sender: 'ai', // AI가 보낸 것이므로 'ai'
      aiId: characterId ? String(characterId) : undefined, // AI ID 설정
      aiName: aiName, // AI 이름 설정
      imageUrl: null, // AI 응답은 이미지가 아닌 텍스트이므로 명시적으로 null 설정
      time: new Date().toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      characterId: characterId, // 캐릭터 ID (선택적)
    };
    addMessageToRoom(roomId, aiMessage);
  }, [addMessageToRoom]);

  // --- Streaming Specific Functions ---

  // ⭐ AI 스트리밍 중인 메시지를 업데이트하는 함수
  // `messageId`로 해당 메시지를 찾아서 `newText`로 업데이트합니다.
  // `isError` 플래그는 에러 발생 시 해당 메시지를 에러 상태로 표시하는 데 사용됩니다.
  const updateStreamingAiMessage = useCallback((roomId, messageId, newText, isError = false) => {
    setAllMessages(prev => {
      const currentMessages = prev[roomId] || [];
      return {
        ...prev,
        [roomId]: currentMessages.map(msg =>
          msg.id === messageId
            ? {
                ...msg,
                text: newText,
                isStreaming: true, // 스트리밍 중임을 유지
                isError: isError,   // 에러 상태 반영
                // 시간은 첫 생성시 할당된 시간 그대로 유지
              }
            : msg
        ),
      };
    });
  }, []);

  // ⭐ AI 스트리밍이 완료되었음을 알리는 함수
  // 스트리밍이 끝나면 `isStreaming` 플래그를 `false`로 변경합니다.
  const finishStreamingAiMessage = useCallback((roomId, messageId) => {
    setAllMessages(prev => {
      const currentMessages = prev[roomId] || [];
      return {
        ...prev,
        [roomId]: currentMessages.map(msg =>
          msg.id === messageId
            ? { ...msg, isStreaming: false } // isStreaming 플래그 제거
            : msg
        ),
      };
    });
  }, []);

  // ⭐ 로딩 메시지를 제거하는 함수
  // AI 응답이 완료되면 해당 AI의 로딩 메시지를 제거합니다.
  const removeLoadingMessage = useCallback((roomId, aiId) => {
    setAllMessages(prev => {
      const currentMessages = prev[roomId] || [];
      return {
        ...prev,
        [roomId]: currentMessages.filter(msg => 
          !(msg.sender === 'ai' && msg.aiId === aiId && msg.text === '...' && msg.isStreaming)
        ),
      };
    });
  }, []);

  // ⭐ AI가 생성한 비디오 메시지를 추가하는 함수
  // 비디오 메시지는 별도의 ChatLog로 저장되므로, 새 메시지로 추가합니다.
  const addVideoMessageToRoom = useCallback((roomId, videoUrl, characterId) => {
    const videoMessage = {
      id: Date.now(), // 고유 ID
      text: videoUrl, // URL을 텍스트로 저장 (혹은 imageUrl/videoUrl 필드 따로 추가 가능)
      type: 'video', // 비디오 타입 명시
      sender: 'other', // AI가 보낸 것이므로 'other' (AI)
      time: new Date().toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      characterId: characterId,
    };
    console.log(`🎥 채팅방 ${roomId}에 비디오 메시지 추가:`, videoMessage);
    addMessageToRoom(roomId, videoMessage);
  }, [addMessageToRoom]);


  // --- Context Value ---

  const value = {
    allMessages,          // 모든 채팅방의 메시지 데이터 (디버깅용)
    getMessages,          // 특정 방 메시지 가져오기
    getMessage,
    setMessagesForRoom,   // 특정 방 메시지 초기 설정
    addMessageToRoom,     // 일반 메시지 추가
    addAiResponseToRoom,  // AI 응답 메시지 추가 (1대1 채팅용)
    getAiLoading,         // AI 로딩 상태 가져오기
    setAiLoading,         // AI 로딩 상태 설정
    updateStreamingAiMessage, // ⭐ 스트리밍 AI 메시지 업데이트
    finishStreamingAiMessage, // ⭐ 스트리밍 AI 메시지 완료 처리
    removeLoadingMessage, // ⭐ 로딩 메시지 제거
    addVideoMessageToRoom,    // ⭐ 비디오 메시지 추가
  };

  return (
    <ChatMessagesContext.Provider value={value}>
      {children}
    </ChatMessagesContext.Provider>
  );
};

// useChatMessages 훅은 Provider 밖에서 사용될 경우 에러를 던짐
const useChatMessages = () => {
  const context = useContext(ChatMessagesContext);
  if (!context) {
    throw new Error('useChatMessages must be used within a ChatMessagesProvider');
  }
  return context;
};

export { useChatMessages };
