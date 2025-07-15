import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import logo from '/assets/logo.png'
import AnimatedAuthHeader from './AnimatedAuthHeader';

const Sidebar = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  const chatList = [
    { id: 1, name: '이름1', lastMessage: '최근 채팅1', time: '오후 3:45' },
    { id: 2, name: '이름2', lastMessage: '최근 채팅2', time: '오후 2:30' },
    { id: 3, name: '이름3', lastMessage: '최근 채팅3', time: '오후 1:10' },
  ];

  return (
      <div className="h-screen flex  bg-[linear-gradient(40deg,_#040438_17.08%,_#3C3C56_73.2%)] relative">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-black/40 backdrop-blur-xl border-r border-white/10 transition-all duration-300 overflow-hidden z-30 ${sidebarOpen ? 'w-80' : 'w-0'}`}
      >
        <div className="w-80 h-full flex flex-col">
          <div className="flex items-center justify-between p-4.5  border-b border-white/50">
             <img src={logo} alt="logo" className="w-10.5 h-10.5" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white/70 hover:text-white text-2xl hover:bg-white/10 p-1 rounded"
            >
              ×
            </button>
          </div>

          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <svg className="text-gray-400 w-5 h-5 absolute left-3 top-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="채팅 기록 검색..."
                className="w-full bg-white/10 border-none rounded-full px-10 py-2.5 text-white placeholder-white/60 focus:outline-none focus:bg-white/15"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chatList.map(chat => (
              <Link
                key={chat.id}
                to="/chatMate"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center p-4 hover:bg-white/5 cursor-pointer border-b border-white/5"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-300 to-teal-400 flex-shrink-0"></div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium">{chat.name}</h3>
                    <span className="text-white/50 text-sm">{chat.time}</span>
                  </div>
                  <p className="text-white/70 text-sm mt-1">{chat.lastMessage}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 w-full ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
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
            <Link to="/" className={`text-white/70 hover:text-white px-3 py-2 text-[24px] rounded hover:bg-white/10 ${pathname === '/' ? 'font-bold' : ''}`}>홈</Link>
            <Link to="/communities" className={`text-white/70 hover:text-white px-3 py-2 text-[24px] rounded hover:bg-white/10 ${pathname === '/communities' ? 'font-bold' : ''}`}>커뮤니티</Link>
            <Link to="/createCharacter" className={`text-white/70 hover:text-white px-3 py-2 text-[24px] rounded hover:bg-white/10 ${pathname === '/createCharacter' ? 'font-bold' : ''}`}>만들기</Link>
            <Link to="/characterList" className={`text-white/70 hover:text-white px-3 py-2 text-[24px] rounded hover:bg-white/10 ${pathname === '/characterList' ? 'font-bold' : ''}`}>내 캐릭터</Link>
            <AnimatedAuthHeader />
          </nav>
        </div>

        {/* Children Content */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;
