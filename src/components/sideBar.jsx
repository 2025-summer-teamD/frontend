// src/components/sideBar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import charactersData from '../data/characters';
import logo from '/assets/logo.png';
import AnimatedAuthHeader from './AnimatedAuthHeader';

const Sidebar = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="h-screen flex bg-[linear-gradient(40deg,_#040438_17.08%,_#3C3C56_73.2%)] relative">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-black/40 backdrop-blur-xl border-r border-white/10
                    transition-all duration-300 overflow-hidden z-30 ${sidebarOpen ? 'w-80' : 'w-0'}`}
      >
        <div className="w-80 h-full flex flex-col">
          {/* logo + close */}
          <div className="flex items-center justify-between p-4.5 border-b border-white/50">
            <img src={logo} alt="logo" className="w-10.5 h-10.5" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white/70 hover:text-white text-2xl hover:bg-white/10 p-1 rounded"
            >
              ×
            </button>
          </div>

          {/* search */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <svg
                className="text-gray-400 w-5 h-5 absolute left-3 top-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="채팅 기록 검색..."
                className="w-full bg-white/10 border-none rounded-full px-10 py-2.5 text-white placeholder-white/60 focus:outline-none focus:bg-white/15"
              />
            </div>
          </div>

          {/* 캐릭터 목록 (더미 대신 연동) */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {charactersData.map((chat) => (
              <Link
                key={chat.id}
                to="/chatMate"
                state={{ character: chat }}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center p-4 hover:bg-white/5 cursor-pointer border-b border-white/5"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={chat.image}
                    alt={chat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium">{chat.name}</h3>
                    <span className="text-white/50 text-sm">방금</span>
                  </div>
                  {/* 최근 대화(더미) + truncate */}
                  <p className="text-white/70 text-sm mt-1 truncate">
                    안녕하세요!
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 w-full ${
          sidebarOpen ? 'ml-80' : 'ml-0'
        }`}
      >
        {/* Topbar */}
        <div className="flex items-center w-full space-x-4 h-[80px] justify-between p-5 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white mr-4 text-xl hover:bg-white/10 p-2 rounded flex flex-col space-y-1"
            >
              <div className="w-5 h-0.5 bg-white"></div>
              <div className="w-5 h-0.5 bg-white"></div>
              <div className="w-5 h-0.5 bg-white"></div>
            </button>
            <h2 className="text-[28px] font-semibold text-white">ChatMate</h2>
          </div>
          <nav className="flex items-center space-x-4">
            <Link
              to="/"
              className={`hover:text-white px-3 py-2 rounded hover:bg-white/10 ${
                pathname === '/' ? 'text-white text-bold text-[24px]' : 'text-white/70 text-[18px]'
              }`}
            >
              홈
            </Link>
            <Link
              to="/communities"
              className={`hover:text-white px-3 py-2 rounded hover:bg-white/10 ${
                pathname === '/communities'
                  ? 'text-white text-[24px] text-bold'
                  : 'text-white/70 text-[18px]'
              }`}
            >
              커뮤니티
            </Link>
            <Link
              to="/createCharacter"
              className={`hover:text-white px-3 py-2 rounded hover:bg-white/10 ${
                pathname === '/createCharacter'
                  ? 'text-white text-[24px] text-bold'
                  : 'text-white/70 text-[18px]'
              }`}
            >
              만들기
            </Link>
            <Link
              to="/characterList"
              className={`hover:text-white px-3 py-2 rounded hover:bg-white/10 ${
                pathname === '/characterList'
                  ? 'text-white text-[24px] text-bold'
                  : 'text-white/70'
              }`}
            >
              내 캐릭터
            </Link>
            <AnimatedAuthHeader />
          </nav>
        </div>

        {/* Children Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar px-8 py-6">{children}</main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-20" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default Sidebar;
