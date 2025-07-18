import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import charactersData from '../data/characters';
import logo from '/assets/logo.png';
import AnimatedAuthHeader from './AnimatedAuthHeader';

const Sidebar = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  const sidebarListRef = useRef(null);
  const contentRef = useRef(null);

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

          <div className="p-4 flex flex-col space-y-3 border-b border-white/10">
            <Link
              to="/createCharacter"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center p-3 rounded-full bg-white/10 text-white justify-center hover:bg-white/20 transition-colors"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create</span>
            </Link>
            <Link
              to="/communities"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center p-3 rounded-full bg-white/10 text-white justify-center hover:bg-white/20 transition-colors"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.001 12.001 0 002.944 12c.036 1.157.26 2.27.653 3.332m0 0C4.305 17.587 7.02 19 12 19c4.98 0 7.695-1.413 8.403-3.668.393-1.062.617-2.175.653-3.332A12.001 12.001 0 0021.056 12C21.012 10.843 20.788 9.73 20.395 8.668z" />
              </svg>
              <span>Community</span>
            </Link>
            <Link
              to="/characterList"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center p-3 rounded-full bg-white/10 text-white justify-center hover:bg-white/20 transition-colors"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>내 캐릭터</span>
            </Link>
          </div>

          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <svg className="text-gray-400 w-5 h-5 absolute left-3 top-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="채팅방 검색용 api 필요 부가기능"
                className="w-full bg-white/10 border-none rounded-full px-10 py-2.5 text-white placeholder-white/60 focus:outline-none focus:bg-white/15"
              />
            </div>
          </div>

          <div ref={sidebarListRef} className="flex-1 overflow-y-auto no-scrollbar">
            <h3 className="text-white/70 text-sm px-4 pt-4 pb-2">This Week</h3>
            {charactersData.map(chat => (
              <Link
                key={chat.id}
                to="/chatMate"
                state={{ character: chat }}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center p-4 hover:bg-white/5 cursor-pointer border-b border-white/5"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img src={chat.image} alt={chat.name} className="w-full h-full object-cover" />
                </div>
                <div className="ml-3 flex-1 truncate">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium text-[0.9rem]">{chat.name}</h3>
                    <span className="text-white/50 text-sm">방금</span>
                  </div>
                  <p className="text-white/70 text-sm mt-1 truncate">안녕하세요!qqqqqqqqqqqqwerqwerqwerqweq</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="p-4 border-t border-white/10 flex flex-col space-y-3">
            <div className="flex justify-between text-white/50 text-sm">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 w-full ${sidebarOpen ? 'ml-60' : 'ml-0'}`}
      >
        {/* 헤더 영역 */}
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

            {/* 사이드바 닫혔을 때만 로고 보여줌 */}
            {!sidebarOpen && (
              <Link to="/" className="flex items-center">
                <img src={logo} alt="Logo" className="w-10 h-10" />
                <span className="text-white font-bold text-lg ml-2">ChatMate</span>
              </Link>
            )}
          </div>
          <AnimatedAuthHeader />
        </div>

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
