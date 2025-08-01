import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

export function useMyChatRooms() {
  const { getToken } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const url = `${import.meta.env.VITE_API_BASE_URL}/my/chat-characters`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ useMyChatRooms - API 오류:', { status: res.status, error: errorText });
        return;
      }
      
      const data = await res.json();
      
      // Backend returns { success: true, message: "...", data: chatList }
      // So we need to access data.data, not data.data?.chatList
      const chatList = data.data || [];
      
      setRooms(chatList);
    } catch (error) {
      console.error('❌ useMyChatRooms - 오류:', error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // 소켓 연결 및 실시간 업데이트
  useEffect(() => {
    const newSocket = io(SOCKET_URL, { transports: ['websocket'] });
    setSocket(newSocket);

    // 새 메시지 수신 시 채팅방 목록 업데이트
    newSocket.on('receiveMessage', (msg) => {
      setRooms(prevRooms => {
        return prevRooms.map(room => {
          if (room.roomId === msg.roomId) {
            return {
              ...room,
              lastChat: msg.message,
              time: new Date().toISOString(),
              unreadCount: room.unreadCount + 1
            };
          }
          return room;
        });
      });
    });

    // 채팅방 입장 시 unreadCount 초기화
    newSocket.on('roomJoined', (data) => {
      setRooms(prevRooms => {
        return prevRooms.map(room => {
          if (room.roomId === data.roomId) {
            return {
              ...room,
              unreadCount: 0
            };
          }
          return room;
        });
      });
    });

    // 채팅방 이름 변경 이벤트 수신
    newSocket.on('roomNameUpdated', (data) => {
      setRooms(prevRooms => {
        return prevRooms.map(room => {
          if (room.roomId === data.roomId) {
            return {
              ...room,
              name: data.name
            };
          }
          return room;
        });
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // 주기적으로 채팅방 목록 새로고침 (30초마다)
  useEffect(() => {
    fetchRooms();
    
    const interval = setInterval(() => {
      fetchRooms();
    }, 30000); // 30초마다 새로고침

    return () => clearInterval(interval);
  }, [fetchRooms]);

  return { rooms, loading, refetch: fetchRooms };
} 