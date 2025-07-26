import React, { useState } from 'react';
import { useMyChatRooms } from '../data/chatRooms';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

export default function MyChatRoomList() {
  const { rooms, loading, refetch } = useMyChatRooms();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [editingRoom, setEditingRoom] = useState(null);
  const [editName, setEditName] = useState('');

  const handleEditClick = (e, room) => {
    e.stopPropagation();
    setEditingRoom(room.roomId);
    setEditName(room.name);
  };

  const handleSaveName = async (e, roomId) => {
    e.stopPropagation();
    if (!editName.trim()) return;

    try {
      const token = await getToken();
      const response = await fetch(`/api/chat/rooms/${roomId}/name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: editName.trim() })
      });

      if (response.ok) {
        setEditingRoom(null);
        setEditName('');
        refetch(); // 채팅방 목록 새로고침
      } else {
        console.error('채팅방 이름 수정 실패');
      }
    } catch (error) {
      console.error('채팅방 이름 수정 중 오류:', error);
    }
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingRoom(null);
    setEditName('');
  };

  const handleRoomClick = async (room) => {
    // 채팅방 클릭 시 unreadCount 초기화를 위해 목록 새로고침
    refetch();
    // 사이드바와 동일하게 채팅방 정보 API를 통해 character, chatHistory를 받아서 state로 전달
    try {
      const token = await getToken();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      // room-info API 호출
      const infoResponse = await fetch(`${API_BASE_URL}/chat/room-info?roomId=${room.roomId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!infoResponse.ok) {
        const errorText = await infoResponse.text();
        throw new Error(`채팅방 정보 조회 실패: ${infoResponse.status}`);
      }
      const infoResult = await infoResponse.json();
      navigate(`/chatMate/${room.roomId}`, {
        state: {
          character: infoResult.data?.character || room,
          chatHistory: infoResult.data?.chatHistory || [],
          roomId: room.roomId
        }
      });
    } catch (error) {
      alert('채팅방 입장에 실패했습니다: ' + error.message);
    }
  };

  if (loading) return <div className="text-cyan-300 font-mono">로딩 중...</div>;
  if (!rooms.length) return <div className="text-cyan-400 font-mono">참여한 채팅방이 없습니다.</div>;

  return (
    <div className="grid grid-cols-1 gap-4 mt-6">
      {rooms.map(room => (
        <div
          key={room.roomId}
          className="group bg-black/60 border-2 border-cyan-700 rounded-xl p-4 cursor-pointer hover:shadow-[0_0_8px_#0ff] flex items-center justify-between"
          onClick={() => handleRoomClick(room)}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleRoomClick(room);
            }
          }}
        >
          <div className="flex items-center gap-4 flex-1">
            {room.imageUrl && (
              <img src={room.imageUrl} alt={room.name} className="w-12 h-12 rounded-full border-2 border-cyan-700 shadow-[0_0_8px_#0ff] object-cover" />
            )}
            <div className="flex-1">
              {editingRoom === room.roomId ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-black/80 border-2 border-cyan-500 text-cyan-200 px-2 py-1 rounded text-sm font-mono focus:outline-none focus:border-cyan-300"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveName(e, room.roomId);
                      } else if (e.key === 'Escape') {
                        handleCancelEdit(e);
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={(e) => handleSaveName(e, room.roomId)}
                    className="px-2 py-1 bg-cyan-700 text-cyan-100 text-xs rounded hover:bg-cyan-600 font-mono"
                  >
                    저장
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600 font-mono"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="font-bold text-cyan-200 text-lg drop-shadow-[0_0_4px_#0ff]">{room.name}</div>
                  <button
                    onClick={(e) => handleEditClick(e, room)}
                    className="px-2 py-1 bg-cyan-700/50 text-cyan-300 text-xs rounded hover:bg-cyan-600/50 font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    수정
                  </button>
                </div>
              )}
              <div className="text-cyan-400 text-xs font-mono">{room.lastChat ? `"${room.lastChat}"` : '대화 내역 없음'}</div>
              <div className="text-cyan-500 text-xs font-mono">{room.time && new Date(room.time).toLocaleString()}</div>
            </div>
          </div>
          {room.unreadCount > 0 && (
            <span className="ml-4 px-3 py-1 rounded-full bg-fuchsia-700 text-cyan-100 font-bold text-xs shadow-[0_0_8px_#f0f] animate-pulse border-2 border-cyan-400">
              {room.unreadCount} NEW
            </span>
          )}
        </div>
      ))}
    </div>
  );
} 