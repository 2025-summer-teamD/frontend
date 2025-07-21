import React, { createContext, useContext } from 'react';
import { useMyChatCharacters } from '../data/characters';

const ChatRoomsContext = createContext();

export function ChatRoomsProvider({ children }) {
  const { characters, loading, error, refetch } = useMyChatCharacters();

  return (
    <ChatRoomsContext.Provider value={{ characters, loading, error, refetch }}>
      {children}
    </ChatRoomsContext.Provider>
  );
}

export function useChatRooms() {
  return useContext(ChatRoomsContext);
} 