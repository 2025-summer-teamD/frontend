import React, { useState, useEffect, useRef } from 'react';

import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useChatRooms } from '../contexts/ChatRoomsContext';
import { useAuth } from '@clerk/clerk-react';
import logo from '/assets/logo.png';
import AnimatedAuthHeader from './AnimatedAuthHeader';

const Sidebar = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { characters, loading, error, refetch } = useChatRooms();

  const sidebarListRef = useRef(null);
  const contentRef = useRef(null);

  console.log('[SideBar] 렌더 시작');

  // characters 원본 데이터 로그
  console.log('[SideBar] characters:', characters);
  // searchQuery 값 로그
  console.log('[SideBar] searchQuery:', searchQuery);

  const filteredCharacters = characters.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (room.lastChat && room.lastChat.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // filteredCharacters가 바뀔 때마다 로그 출력
  useEffect(() => {
    console.log('[SideBar] filteredCharacters:', filteredCharacters);
    filteredCharacters.forEach((chat, idx) => {
      console.log(`[SideBar] filteredCharacters[${idx}]:`, chat);
    });
  }, [filteredCharacters]);

  // 채팅방 입장 API 호출 함수
  const enterChatRoom = async (characterId) => {
    console.log('🚪 [Sidebar] 채팅방 입장 시도 - characterId:', characterId);

    try {
      const token = await getToken();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/chat/rooms?characterId=${characterId}`, {
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
        roomId: result.data?.roomId,
        character: result.data?.character,
        chatHistory: result.data?.chatHistory || []
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

      const characterId = chat.characterId || chat.id;
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

  // 🔄 사이드바가 열릴 때마다 채팅목록 새로고침
  useEffect(() => {
    if (sidebarOpen) {
      console.log('[SideBar] 메뉴 열림 - 채팅목록 새로고침(refetch 호출)');
      refetch(); // 채팅목록 업데이트
    }
  }, [sidebarOpen, refetch]);

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
    <div className="h-screen flex bg-transparent relative">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-black/60 glass border-r-2 border-cyan-400 shadow-[0_0_32px_#0ff,0_0_64px_#f0f] backdrop-blur-xl transition-all duration-300 overflow-hidden z-30 ${sidebarOpen ? 'w-60' : 'w-0'}`}
        style={{boxShadow:'0 0 32px #0ff, 0 0 64px #f0f', borderRight:'2px solid #0ff', backdropFilter:'blur(16px)'}}
      >
        <div className="w-60 h-full flex flex-col">
          {/* logo + close */}
          <div className="flex items-center justify-between p-4.5">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Logo" className="w-10 h-10 drop-shadow-[0_0_12px_#0ff]" />
              <span className="text-cyan-200 font-extrabold text-lg ml-2 drop-shadow-[0_0_8px_#0ff]">ChatMate</span>
            </Link>
          </div>
          {/* Buttons */}
          <div className="p-4 flex flex-col space-y-3 border-b border-cyan-400/30">
            <Link to="/createCharacter" onClick={() => setSidebarOpen(false)} className="flex items-center p-3 rounded-full bg-black/40 glass border-2 border-fuchsia-400 text-fuchsia-200 justify-center hover:bg-black/60 hover:border-cyan-400 hover:text-cyan-200 transition-colors shadow-[0_0_8px_#f0f,0_0_16px_#0ff] animate-neonPulse">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>만들기</span>
            </Link>
            <Link to="/communities" onClick={() => setSidebarOpen(false)} className="flex items-center p-3 rounded-full bg-black/40 glass border-2 border-cyan-400 text-cyan-200 justify-center hover:bg-black/60 hover:border-fuchsia-400 hover:text-fuchsia-200 transition-colors shadow-[0_0_8px_#0ff,0_0_16px_#f0f] animate-neonPulse">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.001 12.001 0 002.944 12c.036 1.157.26 2.27.653 3.332" />
              </svg>
              <span>커뮤니티</span>
            </Link>
            <Link to="/characterList" onClick={() => setSidebarOpen(false)} className="flex items-center p-3 rounded-full bg-black/40 glass border-2 border-cyan-400 text-cyan-200 justify-center hover:bg-black/60 hover:border-fuchsia-400 hover:text-fuchsia-200 transition-colors shadow-[0_0_8px_#0ff,0_0_16px_#f0f] animate-neonPulse">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>내 캐릭터</span>
            </Link>
          </div>
          {/* Search */}
          <div className="p-4 border-b border-cyan-400/30">
            <div className="relative">
              <svg className="text-cyan-400 w-5 h-5 absolute left-3 top-3 drop-shadow-[0_0_6px_#0ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="검색하기"
                className="w-full bg-black/60 glass border-2 border-cyan-400 text-cyan-100 placeholder-cyan-400 rounded-full px-10 py-2.5 font-cyberpunk focus:outline-none focus:bg-black/70 focus:border-fuchsia-400 focus:text-fuchsia-200 transition-all shadow-[0_0_8px_#0ff]"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{textShadow:'0 0 8px #0ff', boxShadow:'0 0 8px #0ff'}}
              />
            </div>
          </div>
          {/* Character List */}
          <div ref={sidebarListRef} className="flex-1 overflow-y-auto no-scrollbar">
            <h3 className="text-cyan-200 text-sm px-4 pt-4 pb-2 drop-shadow-[0_0_6px_#0ff]">채팅 목록</h3>
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400 mx-auto"></div>
                <p className="text-cyan-200 text-sm mt-2">로딩 중...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-fuchsia-400 text-sm">{error}</p>
              </div>
            ) : filteredCharacters.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-cyan-200 text-sm">캐릭터와 대화해보세요!</p>
              </div>
            ) : (
              filteredCharacters.filter(chat => !!chat.roomId).map((chat, idx) => {
                return (
                  <Link
                    key={chat.roomId}
                    to={`/chatMate/${chat.roomId}`}
                    state={{ character: chat }}
                    onClick={(e) => handleChatRoomClick(e, chat)}
                    className="flex items-center p-4 hover:bg-black/30 cursor-pointer border-b border-cyan-400/10 transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2 border-cyan-400 shadow-[0_0_8px_#0ff] group-hover:border-fuchsia-400 group-hover:shadow-[0_0_12px_#f0f]">
                      <img src={chat.imageUrl} alt={chat.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="ml-3 flex-1 truncate">
                      <div className="flex items-center justify-between">
                        <h3 className="text-cyan-100 font-cyberpunk font-medium text-[0.9rem] drop-shadow-[0_0_4px_#0ff]">{chat.name}</h3>
                        <span className="text-cyan-400 text-sm drop-shadow-[0_0_2px_#0ff]">{formatLastMessageTime(chat.time)}</span>
                      </div>
                      <p className="text-cyan-200 text-sm mt-1 truncate drop-shadow-[0_0_2px_#0ff]">{chat.lastChat || '대화 시작하기'}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
          {/* Footer */}
          <div className="p-4 border-t border-cyan-400/30 flex flex-col space-y-3">
            <div className="flex justify-between text-cyan-400 text-sm">
              <a href="#" className="hover:text-fuchsia-400">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-fuchsia-400">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 w-full ${sidebarOpen ? 'ml-60' : 'ml-0'}`}>
        {/* Topbar */}
        <div className="w-full h-[80px] z-50 bg-gradient-to-r from-black/80 via-cyan-900/40 to-fuchsia-900/30 flex items-center px-5 shadow-[0_0_16px_#0ff,0_0_32px_#f0f]">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-cyan-200 mr-4 text-xl hover:bg-black/20 border-cyan-400 p-2 rounded flex flex-col space-y-1 shadow-[0_0_8px_#0ff]"
            >
              <div className="w-5 h-0.5 bg-cyan-400"></div>
              <div className="w-5 h-0.5 bg-cyan-400"></div>
              <div className="w-5 h-0.5 bg-cyan-400"></div>
            </button>
            {!sidebarOpen && (
              <Link to="/" className="flex items-center">
                <img src={logo} alt="Logo" className="w-8 h-8 drop-shadow-[0_0_8px_#0ff]" />
                <span className="text-cyan-200 font-extrabold text-lg ml-2 drop-shadow-[0_0_6px_#0ff]">ChatMate</span>
              </Link>
            )}
          </div>
          <nav className="hidden md:flex items-center space-x-4 ml-auto">
            <NavLink
              to="/"
              className={({ isActive }) => isActive ? "text-cyan-200 hover:text-fuchsia-400 text-[1.2rem] rounded bg-black/30 px-2 shadow-[0_0_8px_#0ff]" : "text-[1.2rem] px-1 text-cyan-400 hover:text-fuchsia-400"}
            >
              홈
            </NavLink>
            <NavLink
              to="/communities"
              className={({ isActive }) => isActive ? "text-cyan-200 hover:text-fuchsia-400 text-[1.2rem] rounded bg-black/30 px-2 shadow-[0_0_8px_#0ff]" : "text-[1.2rem] px-1 text-cyan-400 hover:text-fuchsia-400"}
            >
              커뮤니티
            </NavLink>
            <NavLink
              to="/createCharacter"
              className={({ isActive }) => isActive ? "text-cyan-200 hover:text-fuchsia-400 text-[1.2rem] rounded bg-black/30 px-2 shadow-[0_0_8px_#0ff]" : "text-[1.2rem] px-1 text-cyan-400 hover:text-fuchsia-400"}
            >
              만들기
            </NavLink>
            <NavLink
              to="/characterList"
              className={({ isActive }) => isActive ? "text-cyan-200 hover:text-fuchsia-400 text-[1.2rem] rounded bg-black/30 px-2 shadow-[0_0_8px_#0ff]" : "text-[1.2rem] px-1 text-cyan-400 hover:text-fuchsia-400"}
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
