import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { API_BASE_URL } from '../data/characters';

const ChatRoomsContext = createContext();

function useMyChats() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const fetchMyChats = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/my/chat-characters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCharacters((data.data || []).filter(chat => !!chat.roomId));
    } catch (err) {
      setError('채팅 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchMyChats(); }, [fetchMyChats]);

  return { characters, loading, error, refetch: fetchMyChats };
}

function ChatRoomsProvider({ children }) {
  const { characters, loading, error, refetch } = useMyChats();
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