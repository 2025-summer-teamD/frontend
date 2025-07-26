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
      const res = await fetch('/api/chat/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRooms(data.data?.chatList || []);
    } catch (error) {
      console.error('채팅방 목록 조회 실패:', error);
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