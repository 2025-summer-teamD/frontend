import React, { createContext, useContext } from 'react';
import { useMyChatCharacters } from '../data/characters';

const ChatRoomsContext = createContext();

function ChatRoomsProvider({ children }) {
  const { characters, loading, error, refetch } = useMyChatCharacters();

  return (
    <ChatRoomsContext.Provider value={{ characters, loading, error, refetch }}>
      {children}
    </ChatRoomsContext.Provider>
  );
}

function useChatRooms() {
  return useContext(ChatRoomsContext);
}

export { ChatRoomsProvider, useChatRooms }; 