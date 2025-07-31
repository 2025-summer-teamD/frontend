import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyChatRooms } from '../data/chatRooms';
import { useAuth } from '@clerk/clerk-react';
import { io } from 'socket.io-client';

export default function MyChatRoomList({ refetchPublicRooms }) {
  const { rooms, loading, refetch } = useMyChatRooms();
  const { getToken, userId } = useAuth();
  const navigate = useNavigate();
  const [editingRoom, setEditingRoom] = useState(null);
  const [editName, setEditName] = useState('');
  const [updatingPublic, setUpdatingPublic] = useState(null);
  const [deletingRoom, setDeletingRoom] = useState(null);
  const [localRooms, setLocalRooms] = useState([]);

  // rooms가 변경될 때 localRooms 업데이트
  React.useEffect(() => {
    setLocalRooms(rooms);
  }, [rooms]);

  // WebSocket 이벤트 수신을 위한 useEffect
  React.useEffect(() => {
    const socket = io('http://localhost:3001', { transports: ['websocket'] });

    // 채팅방 이름 변경 이벤트 수신
    socket.on('roomNameUpdated', (data) => {
      setLocalRooms(prevRooms => {
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
      socket.disconnect();
    };
  }, []);

  const handleEditClick = (e, room) => {
    e.stopPropagation();
    setEditingRoom(room.roomId);
    setEditName(room.name || getDefaultRoomName(room));
  };

  const handlePublicToggle = async (e, room) => {
    e.stopPropagation();
    setUpdatingPublic(room.roomId);
    
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/rooms/${room.roomId}/public`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPublic: !room.isPublic })
      });

      if (response.ok) {
        // 로컬 상태 즉시 업데이트
        setLocalRooms(prevRooms => 
          prevRooms.map(r => 
            r.roomId === room.roomId 
              ? { ...r, isPublic: !r.isPublic }
              : r
          )
        );
        console.log('✅ 채팅방 공개 설정 업데이트 완료:', !room.isPublic);
        
        // 커뮤니티 페이지의 공개 채팅방 목록도 새로고침
        if (refetchPublicRooms) {
          refetchPublicRooms();
        }
      } else {
        console.error('채팅방 공개 설정 수정 실패');
        alert('채팅방 공개 설정 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('채팅방 공개 설정 수정 중 오류:', error);
      alert('채팅방 공개 설정 수정 중 오류가 발생했습니다.');
    } finally {
      setUpdatingPublic(null);
    }
  };

  const getDefaultRoomName = (room) => {
    // AI 참가자가 있는 경우
    if (room.aiParticipants && room.aiParticipants.length > 0) {
      const participantNames = room.aiParticipants.map(p => p.name).join(', ');
      return `${participantNames}와의 채팅방`;
    }
    // persona 정보가 있는 경우
    if (room.persona && room.persona.name) {
      return `${room.persona.name}와의 채팅방`;
    }
    // 기본값
    return room.name || '채팅방';
  };

  const handleSaveName = async (e, roomId) => {
    e.stopPropagation();
    if (!editName.trim()) return;

    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/rooms/${roomId}/name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: editName.trim() })
      });

      if (response.ok) {
        // 로컬 상태 즉시 업데이트
        setLocalRooms(prevRooms => 
          prevRooms.map(room => 
            room.roomId === roomId 
              ? { ...room, name: editName.trim() }
              : room
          )
        );
        console.log('✅ 채팅방 이름 업데이트 완료:', editName.trim());
        setEditingRoom(null);
        setEditName('');
        // 즉시 서버에서 최신 데이터 가져오기
        if (refetch) {
          refetch();
        }
      } else {
        console.error('채팅방 이름 수정 실패');
        alert('채팅방 이름 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('채팅방 이름 수정 중 오류:', error);
      alert('채팅방 이름 수정 중 오류가 발생했습니다.');
    }
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingRoom(null);
    setEditName('');
  };

  const handleDeleteRoom = async (e, room) => {
    e.stopPropagation();
    
    if (!confirm('정말로 이 채팅방을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    
    setDeletingRoom(room.roomId);
    
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/rooms/${room.roomId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        // 로컬 상태에서 채팅방 제거
        setLocalRooms(prevRooms => 
          prevRooms.filter(r => r.roomId !== room.roomId)
        );
        console.log('✅ 채팅방 삭제 완료:', room.roomId);
      } else {
        const errorData = await response.json();
        console.error('채팅방 삭제 실패:', errorData);
        alert(errorData.message || '채팅방 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('채팅방 삭제 중 오류:', error);
      alert('채팅방 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingRoom(null);
    }
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
          character: infoResult.data?.character || infoResult.data?.persona || room,
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
      {localRooms.map(room => (
        <div
          key={room.roomId}
          className="group bg-black/60 border-2 border-cyan-700 rounded-xl p-4 cursor-pointer hover:shadow-[0_0_8px_#0ff] hover:border-cyan-500 transition-all duration-200"
          onClick={() => handleRoomClick(room)}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleRoomClick(room);
            }
          }}
        >
          <div className="flex items-start gap-4">
            {room.imageUrl && (
              <img src={room.imageUrl} alt={room.name} className="w-16 h-16 rounded-full border-2 border-cyan-700 shadow-[0_0_8px_#0ff] object-cover flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
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
                      // 스페이스바 이벤트 전파 방지
                      if (e.key === ' ') {
                        e.stopPropagation();
                      }
                    }}
                    onKeyUp={(e) => {
                      // 스페이스바 이벤트 전파 방지
                      if (e.key === ' ') {
                        e.stopPropagation();
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
                  <div className="font-bold text-cyan-200 text-lg drop-shadow-[0_0_4px_#0ff]">
                    {room.name || getDefaultRoomName(room)}
                  </div>
                  <button
                    onClick={(e) => handleEditClick(e, room)}
                    className="px-2 py-1 bg-cyan-700/50 text-cyan-300 text-xs rounded hover:bg-cyan-600/50 font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    수정
                  </button>
                  {/* 공개 설정 토글 */}
                  <button
                    onClick={(e) => handlePublicToggle(e, room)}
                    disabled={updatingPublic === room.roomId}
                    className={`px-2 py-1 text-xs rounded font-mono opacity-0 group-hover:opacity-100 transition-opacity ${
                      room.isPublic 
                        ? 'bg-green-700/50 text-green-300 hover:bg-green-600/50' 
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    {updatingPublic === room.roomId ? '처리중...' : (room.isPublic ? '공개' : '비공개')}
                  </button>
                  {/* 삭제 버튼 (생성자만 표시) */}
                  {room.clerkId === userId && (
                    <button
                      onClick={(e) => handleDeleteRoom(e, room)}
                      disabled={deletingRoom === room.roomId}
                      className="px-2 py-1 bg-red-700/50 text-red-300 text-xs rounded hover:bg-red-600/50 font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {deletingRoom === room.roomId ? '삭제중...' : '삭제'}
                    </button>
                  )}
                </div>
              )}
              {/* 설명 표시 */}
              {room.description && (
                <div className="text-cyan-300 text-sm mt-2 font-mono line-clamp-2">
                  {room.description}
                </div>
              )}
              <div className="text-cyan-400 text-xs font-mono mt-1">{room.lastChat ? `"${room.lastChat}"` : '대화 내역 없음'}</div>
              <div className="text-cyan-500 text-xs font-mono">{room.time && new Date(room.time).toLocaleString()}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 ml-4">
            {room.unreadCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-fuchsia-700 text-cyan-100 font-bold text-xs shadow-[0_0_8px_#f0f] animate-pulse border-2 border-cyan-400">
                {room.unreadCount} NEW
              </span>
            )}
            {/* 공개/비공개 상태 표시 */}
            <span className={`px-2 py-1 rounded text-xs font-mono ${
              room.isPublic 
                ? 'bg-green-700/50 text-green-300' 
                : 'bg-gray-700/50 text-gray-300'
            }`}>
              {room.isPublic ? '공개' : '비공개'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
} 