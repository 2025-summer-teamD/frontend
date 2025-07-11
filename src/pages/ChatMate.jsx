import { useState } from 'react';
import { Link } from 'react-router-dom';

const ChatMate = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "채팅내용",
      sender: "other",
      time: "오후 3:45"
    },
    {
      id: 2,
      text: "채팅내용",
      sender: "me",
      time: "오후 3:45"
    }
  ]);

  const chatList = [
    { id: 1, name: "이름", lastMessage: "최근 채팅", time: "채팅 시간" },
    { id: 2, name: "이름", lastMessage: "최근 채팅", time: "채팅 시간" },
    { id: 3, name: "이름", lastMessage: "최근 채팅", time: "채팅 시간" }
  ];

  const sendMessage = () => {
    if (newMessage.trim() === '') return;

    const message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'me',
      time: new Date().toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative">
      {/* 사이드바 - 적응형 레이아웃 */}
      <div className={`h-full bg-black/40 backdrop-blur-xl border-r border-white/10 transition-all duration-300 ${
        sidebarOpen ? 'w-80' : 'w-0'
      } overflow-hidden`}>
        {/* 사이드바 내용 - 고정 너비 */}
        <div className="w-80 h-full flex flex-col">
          {/* 사이드바 헤더 */}
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h1 className="text-xl font-semibold text-white">ChatMate</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white/70 hover:text-white text-2xl hover:bg-white/10 p-1 rounded"
            >
              ×
            </button>
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
            {chatList.map((chat) => (
              <div key={chat.id} className="flex items-center p-4 hover:bg-white/5 cursor-pointer border-b border-white/5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-300 to-teal-400 flex-shrink-0"></div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium">{chat.name}</h3>
                    <span className="text-white/50 text-sm">{chat.time}</span>
                  </div>
                  <p className="text-white/70 text-sm mt-1">{chat.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 - 적응형 */}
      <div className="flex-1 flex flex-col transition-all duration-300">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white mr-4 text-xl hover:bg-white/10 p-2 rounded flex flex-col space-y-1"
            >
              <div className="w-5 h-0.5 bg-white"></div>
              <div className="w-5 h-0.5 bg-white"></div>
              <div className="w-5 h-0.5 bg-white"></div>
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-300 to-teal-400 mr-3"></div>
              <h2 className="text-xl font-semibold text-white">ChatMate</h2>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/community" className="text-white/70 hover:text-white px-3 py-2 rounded hover:bg-white/10">
              커뮤니티
            </Link>
            <Link to="/createCharacter" className="text-white/70 hover:text-white px-3 py-2 rounded hover:bg-white/10">
              만들기
            </Link>
            <Link to="/characterList" className="text-white/70 hover:text-white px-3 py-2 rounded hover:bg-white/10">
              내 캐릭터
            </Link>
            <div className="w-9 h-9 rounded-full bg-white/90"></div>
          </div>
        </div>

        {/* 채팅 영역 */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* 프로필 섹션 */}
          <div className="text-center mb-12">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-300 to-teal-400 mx-auto mb-4"></div>
              <div className="absolute -top-2 -right-2 bg-white/90 rounded-full px-3 py-1 flex items-center space-x-1">
                <span className="text-xs text-gray-600">S</span>
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">이름</h3>
            <p className="text-white/70">캐릭터 설명</p>
          </div>

          {/* 메시지 영역 */}
          <div className="absolute bottom-32 left-0 right-0 max-w-4xl mx-auto px-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'} items-end space-x-2`}>
                  {message.sender === 'other' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-300 to-teal-400 flex-shrink-0"></div>
                  )}
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === 'me'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-sm'
                      : 'bg-white/10 text-white rounded-bl-sm border border-blue-400'
                  }`}>
                    <p>{message.text}</p>
                  </div>
                  {message.sender === 'me' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-300 to-teal-400 flex-shrink-0"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 하단 시간 표시 */}
          <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2">
            <p className="text-white/50 text-sm">오후 3:45</p>
          </div>
        </div>

        {/* 입력 영역 */}
        <div className="p-5 bg-black/30 backdrop-blur-xl border-t border-white/10">
          <div className="flex items-center space-x-3 max-w-4xl mx-auto">
            <button className="text-white/70 hover:text-white p-2">
              📎
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-blue-400 focus:bg-white/15"
              />
            </div>
            <button
              onClick={sendMessage}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-colors"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMate;
