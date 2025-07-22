import React, { createContext, useContext, useState, useCallback } from 'react';

const ChatMessagesContext = createContext();

export const useChatMessages = () => {
  const context = useContext(ChatMessagesContext);
  if (!context) {
    throw new Error('useChatMessages must be used within a ChatMessagesProvider');
  }
  return context;
};

export const ChatMessagesProvider = ({ children }) => {
  // roomId별 메시지를 저장: { [roomId]: messages[] }
  const [allMessages, setAllMessages] = useState({});
  
  // roomId별 AI 로딩 상태: { [roomId]: boolean }
  const [aiLoadingStates, setAiLoadingStates] = useState({});

  // 특정 roomId의 메시지 가져오기
  const getMessages = useCallback((roomId) => {
    return allMessages[roomId] || [];
  }, [allMessages]);

  // 특정 roomId의 AI 로딩 상태 가져오기
  const getAiLoading = useCallback((roomId) => {
    return aiLoadingStates[roomId] || false;
  }, [aiLoadingStates]);

  // 특정 roomId의 AI 로딩 상태 설정
  const setAiLoading = useCallback((roomId, loading) => {
    console.log(`🔄 AI 로딩 상태 변경 - roomId: ${roomId}, loading: ${loading}`);
    setAiLoadingStates(prev => ({
      ...prev,
      [roomId]: loading
    }));
  }, []);

  // 특정 roomId의 메시지를 모두 설정 (채팅방 입장시 히스토리 로드)
  const setMessagesForRoom = useCallback((roomId, messages) => {
    console.log(`📝 채팅방 ${roomId} 메시지 설정:`, messages);
    setAllMessages(prev => ({
      ...prev,
      [roomId]: messages
    }));
  }, []);

  // 특정 roomId에 메시지 추가 (사용자 메시지, AI 응답)
  const addMessageToRoom = useCallback((roomId, message) => {
    console.log(`💬 채팅방 ${roomId}에 메시지 추가:`, message);
    setAllMessages(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), message]
    }));
  }, []);

  // AI 응답을 특정 roomId에 추가하는 전용 함수
  const addAiResponseToRoom = useCallback((roomId, aiResponse) => {
    const aiMessage = {
      id: Date.now() + 1,
      text: aiResponse,
      sender: 'other',
      time: new Date().toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
             characterId: parseInt(roomId) // roomId를 characterId로 사용
    };
    
    console.log(`🤖 채팅방 ${roomId}에 AI 응답 추가:`, aiMessage);
    addMessageToRoom(roomId, aiMessage);
  }, [addMessageToRoom]);

  const value = {
    allMessages,
    getMessages,
    setMessagesForRoom,
    addMessageToRoom,
    addAiResponseToRoom,
    getAiLoading,
    setAiLoading
  };

  return (
    <ChatMessagesContext.Provider value={value}>
      {children}
    </ChatMessagesContext.Provider>
  );
}; 