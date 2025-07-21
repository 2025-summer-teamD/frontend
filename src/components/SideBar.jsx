import React, { useState, useEffect, useRef } from 'react';

import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

import { useChatRooms } from '../contexts/ChatRoomsContext';
import { chatMessages } from '../data/chatMessages';
import { useAuth } from '@clerk/clerk-react';
import logo from '/assets/logo.png';
import AnimatedAuthHeader from './AnimatedAuthHeader';

// 캐릭터별 마지막 메시지 시간
function getLastMsgTime(character) {
  const msgs = chatMessages.filter(msg => msg.characterId === character.id);
  if (msgs.length === 0) return null;
  return msgs[msgs.length - 1].time;
}

function getLastMsgText(character) {
  const msgs = chatMessages.filter(msg => msg.characterId === character.id);
  if (msgs.length === 0) return character.description;
  return msgs[msgs.length - 1].text;
}

const Sidebar = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { characters, loading, error, refetch } = useChatRooms();

  const sidebarListRef = useRef(null);
  const contentRef = useRef(null);

  const filteredCharacters = characters.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (room.last_chat && room.last_chat.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 채팅방 입장 API 호출 함수
  const enterChatRoom = async (characterId) => {
    console.log('🚪 [Sidebar] 채팅방 입장 시도 - characterId:', characterId);
    
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3001/api/chat/rooms?character_id=${characterId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [Sidebar] 채팅방 입장 API 에러:', errorText);
        throw new Error(`채팅방 입장 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [Sidebar] 채팅방 입장 성공:', result);
      
      return {
        roomId: result.data?.room_id,
        character: result.data?.character,
        chatHistory: result.data?.chat_history || []
      };
    } catch (err) {
      console.error('💥 [Sidebar] 채팅방 입장 에러:', err);
      throw err;
    }
  };

  // 채팅방 클릭 핸들러
  const handleChatRoomClick = async (e, chat) => {
    e.preventDefault();
    console.log('🖱️ [Sidebar] 채팅방 클릭:', chat);
    
    try {
      setSidebarOpen(false);
      
      const characterId = chat.character_id || chat.id;
      console.log('🔍 [Sidebar] 사용할 characterId:', characterId);
      
      const { roomId, character: updatedCharacter, chatHistory } = await enterChatRoom(characterId);
      
      console.log('✅ [Sidebar] 채팅방 입장 완료:', { 
        roomId, 
        updatedCharacter, 
        chatHistoryLength: chatHistory.length 
      });
      
      // ChatMate로 이동 (채팅 히스토리 포함)
      navigate(`/chatMate/${roomId}`, { 
        state: { 
          character: updatedCharacter, 
          chatHistory: chatHistory,
          roomId: roomId 
        } 
      });
    } catch (error) {
      console.error('💥 [Sidebar] 채팅방 입장 실패:', error);
      alert('채팅방 입장에 실패했습니다: ' + error.message);
    }
  };

  // 마지막 메시지 시간 포맷팅 함수
  const formatLastMessageTime = (timeString) => {
    if (!timeString) return '방금';
    
    const now = new Date();
    const messageTime = new Date(timeString);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return '방금';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  useEffect(() => {
    if (sidebarListRef.current) sidebarListRef.current.scrollTop = 0;
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, []);

  return (
    <div className="h-screen flex bg-[linear-gradient(40deg,_#040438_17.08%,_#3C3C56_73.2%)] relative">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-black/40 backdrop-blur-xl border-r border-white/10
                    transition-all duration-300 overflow-hidden z-30 ${sidebarOpen ? 'w-60' : 'w-0'}`}
      >
        <div className="w-60 h-full flex flex-col">
          {/* logo + close */}
          <div className="flex items-center justify-between p-4.5">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Logo" className="w-10 h-10" />
              <span className="text-white font-bold text-lg ml-2">ChatMate</span>
            </Link>
          </div>

          {/* Buttons */}
          <div className="p-4 flex flex-col space-y-3 border-b border-white/10">
            <Link to="/createCharacter" onClick={() => setSidebarOpen(false)} className="flex items-center p-3 rounded-full bg-white/10 text-white justify-center hover:bg-white/20 transition-colors">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create</span>
            </Link>
            <Link to="/communities" onClick={() => setSidebarOpen(false)} className="flex items-center p-3 rounded-full bg-white/10 text-white justify-center hover:bg-white/20 transition-colors">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.001 12.001 0 002.944 12c.036 1.157.26 2.27.653 3.332" />
              </svg>
              <span>Community</span>
            </Link>
            <Link to="/characterList" onClick={() => setSidebarOpen(false)} className="flex items-center p-3 rounded-full bg-white/10 text-white justify-center hover:bg-white/20 transition-colors">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>My Characters</span>
            </Link>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <svg className="text-gray-400 w-5 h-5 absolute left-3 top-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search Characters"
                className="w-full bg-white/10 border-none rounded-full px-10 py-2.5 text-white placeholder-white/60 focus:outline-none focus:bg-white/15"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Character List */}
          <div ref={sidebarListRef} className="flex-1 overflow-y-auto no-scrollbar">
            <h3 className="text-white/70 text-sm px-4 pt-4 pb-2">Chat List</h3>
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                <p className="text-white/50 text-sm mt-2">Loading...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            ) : filteredCharacters.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-white/50 text-sm">No characters found</p>
              </div>
            ) : (
              filteredCharacters.filter(chat => !!chat.room_id).map(chat => (
                <Link
                  key={chat.room_id}
                  to={`/chatMate/${chat.room_id}`}
                  state={{ character: chat }}
                  onClick={(e) => handleChatRoomClick(e, chat)}
                  className="flex items-center p-4 hover:bg-white/5 cursor-pointer border-b border-white/5"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <img src={chat.imageUrl} alt={chat.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-3 flex-1 truncate">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium text-[0.9rem]">{chat.name}</h3>
                      <span className="text-white/50 text-sm">{formatLastMessageTime(chat.time)}</span>
                    </div>
                    <p className="text-white/70 text-sm mt-1 truncate">{chat.last_chat || 'Start a chat'}</p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 flex flex-col space-y-3">
            <div className="flex justify-between text-white/50 text-sm">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 w-full ${sidebarOpen ? 'ml-60' : 'ml-0'}`}>
        {/* Topbar */}
        <div className="w-full h-[80px] z-50 bg-[linear-gradient(40deg,_#040438_17.08%,_#3C3C56_73.2%)] flex items-center px-5">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white mr-4 text-xl hover:bg-white/10 border-white p-2 rounded flex flex-col space-y-1"
            >
              <div className="w-5 h-0.5 bg-white"></div>
              <div className="w-5 h-0.5 bg-white"></div>
              <div className="w-5 h-0.5 bg-white"></div>
            </button>
            {!sidebarOpen && (
              <Link to="/" className="flex items-center">
                <img src={logo} alt="Logo" className="w-8 h-8" />
                <span className="text-white font-bold text-lg ml-2">ChatMate</span>
              </Link>
            )}
          </div>
          <nav className="hidden md:flex items-center space-x-4 ml-auto">
        <NavLink
          to="/"
          className={({ isActive }) => isActive ? "text-white hover:text-white  text-[1.2rem] rounded hover:bg-white/10" : "text-[1.2rem] px-1 text-gray-400"}
        >
          홈
        </NavLink>
        <NavLink
          to="/communities"
          className={({ isActive }) => isActive ? "text-white hover:text-white  text-[1.2rem] rounded hover:bg-white/10" : "text-[1.2rem] px-1 text-gray-400"}
        >
          커뮤니티
        </NavLink>
        <NavLink
          to="/createCharacter"
          className={({ isActive }) => isActive ? "text-white hover:text-white  text-[1.2rem] rounded hover:bg-white/10" : "text-[1.2rem] px-1 text-gray-400"}
        >
          만들기
        </NavLink>
        <NavLink
          to="/characterList"
          className={({ isActive }) => isActive ? "text-white hover:text-white  text-[1.2rem] rounded hover:bg-white/10" : "text-[1.2rem] px-1 text-gray-400"}
        >
          내 캐릭터
        </NavLink>
        <AnimatedAuthHeader />
      </nav>
        </div>

        {/* Main children */}
        <main ref={contentRef} className="flex-1 overflow-y-auto no-scrollbar px-0 py-0">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <button
          className="fixed inset-0 bg-black/30 z-20"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        ></button>
      )}
    </div>
  );
};

export default Sidebar;
