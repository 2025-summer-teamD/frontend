import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMyChatCharacters } from '../data/characters';
import { chatMessages } from '../data/chatMessages';
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
  const [searchQuery, setSearchQuery] = useState('');
  const { characters, loading, error } = useMyChatCharacters();

  const sidebarListRef = useRef(null);
  const contentRef = useRef(null);

  const filteredCharacters = characters.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (room.last_chat && room.last_chat.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white/70 hover:text-white text-2xl hover:bg-white/10 p-1 rounded"
            >
              ×
            </button>
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
              <span>내 캐릭터</span>
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
                placeholder="캐릭터 검색"
                className="w-full bg-white/10 border-none rounded-full px-10 py-2.5 text-white placeholder-white/60 focus:outline-none focus:bg-white/15"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Character List */}
          <div ref={sidebarListRef} className="flex-1 overflow-y-auto no-scrollbar">
            <h3 className="text-white/70 text-sm px-4 pt-4 pb-2">채팅 목록</h3>
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                <p className="text-white/50 text-sm mt-2">로딩 중...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            ) : filteredCharacters.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-white/50 text-sm">캐릭터가 없습니다</p>
              </div>
            ) : (
              filteredCharacters.map(chat => (
                <Link
                  key={chat.character_id}
                  to="/chatMate"
                  state={{ character: chat }}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center p-4 hover:bg-white/5 cursor-pointer border-b border-white/5"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <img src={chat.image_url} alt={chat.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-3 flex-1 truncate">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium text-[0.9rem]">{chat.name}</h3>
                      <span className="text-white/50 text-sm">{formatLastMessageTime(chat.time)}</span>
                    </div>
                    <p className="text-white/70 text-sm mt-1 truncate">{chat.last_chat || '채팅을 시작해보세요'}</p>
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
        <div className="flex items-center w-full space-x-4 h-[80px] justify-between p-5 border-b border-white bg-black/20 backdrop-blur-xl">
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
          <AnimatedAuthHeader />
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
