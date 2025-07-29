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
      
      // 데이터 구조 확인 및 처리
      let chatList = [];
      if (data.success && data.data) {
        // data.data가 배열인 경우 (직접 chatList)
        if (Array.isArray(data.data)) {
          chatList = data.data;
        }
        // data.data.chatList인 경우 (페이지네이션 응답)
        else if (data.data.chatList && Array.isArray(data.data.chatList)) {
          chatList = data.data.chatList;
        }
      }
      
      // roomId가 있는 채팅방만 필터링
      const filteredChats = chatList.filter(chat => !!chat.roomId);
      setCharacters(filteredChats);
    } catch (err) {
      setError('채팅 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchMyChats(); }, [fetchMyChats]);

  return { characters, loading, error, refetch: fetchMyChats };
}

function usePublicChatRooms() {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const fetchPublicChatRooms = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/chat/public-rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        setChatRooms(data.data);
      } else {
        setChatRooms([]);
      }
    } catch (err) {
      setError('공개 채팅방 목록을 불러오는데 실패했습니다.');
      setChatRooms([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchPublicChatRooms(); }, [fetchPublicChatRooms]);

  return { chatRooms, loading, error, refetch: fetchPublicChatRooms };
}

function ChatRoomsProvider({ children }) {
  const { characters, loading, error, refetch } = useMyChats();
  const { chatRooms, loading: chatRoomsLoading, error: chatRoomsError, refetch: refetchPublicRooms } = usePublicChatRooms();
  
  return (
    <ChatRoomsContext.Provider value={{ 
      characters, 
      loading, 
      error, 
      refetch,
      chatRooms,
      chatRoomsLoading,
      chatRoomsError,
      refetchPublicRooms
    }}>
      {children}
    </ChatRoomsContext.Provider>
  );
}

function useChatRooms() {
  return useContext(ChatRoomsContext);
}

export { ChatRoomsProvider, useChatRooms }; 