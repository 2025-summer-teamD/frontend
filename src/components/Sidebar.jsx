import { useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const chatList = [
    { id: 1, name: "이름", lastMessage: "최근 채팅", time: "채팅 시간" },
    { id: 2, name: "이름", lastMessage: "최근 채팅", time: "채팅 시간" },
    { id: 3, name: "이름", lastMessage: "최근 채팅", time: "채팅 시간" }
  ];

  const navigationItems = [
    { path: '/', label: '홈', icon: '🏠' },
    { path: '/characterList', label: '내 캐릭터', icon: '👤' },
    { path: '/community', label: '커뮤니티', icon: '💬' },
    { path: '/createCharacter', label: '캐릭터 만들기', icon: '✨' }
  ];

  return (
    <>
      {/* 햄버거 메뉴 버튼 */}
      <button 
        onClick={() => setSidebarOpen(true)}
        className="fixed top-6 left-6 z-50 text-white hover:bg-white/10 p-2 rounded flex flex-col space-y-1 lg:hidden"
      >
        <div className="w-5 h-0.5 bg-white"></div>
        <div className="w-5 h-0.5 bg-white"></div>
        <div className="w-5 h-0.5 bg-white"></div>
      </button>

      {/* 사이드바 */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* 사이드바 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <h1 className="text-xl font-semibold text-white">ChatMate</h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="text-white/70 hover:text-white text-2xl hover:bg-white/10 p-1 rounded lg:hidden"
          >
            ×
          </button>
        </div>

        {/* 네비게이션 메뉴 */}
        <div className="p-4 border-b border-white/10">
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* 검색바 */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <input 
              type="text" 
              placeholder="채팅 기록 검색..."
              className="w-full bg-white/10 border-none rounded-full px-10 py-2.5 text-white placeholder-white/60 focus:outline-none focus:bg-white/15"
            />
            <div className="absolute left-3 top-3 text-white/60">
              🔍
            </div>
          </div>
        </div>

        {/* 채팅 목록 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-white/70 text-sm font-medium mb-3">최근 채팅</h3>
          </div>
          {chatList.map((chat) => (
            <Link 
              key={chat.id} 
              to="/chatmate"
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

        {/* 사용자 프로필 */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"></div>
            <div className="flex-1">
              <h4 className="text-white font-medium text-sm">사용자 이름</h4>
              <p className="text-white/60 text-xs">온라인</p>
            </div>
            <button className="text-white/60 hover:text-white">
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* 모바일용 오버레이 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;