import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import chatMessages from '../data/chatMessages';
import { useUser } from '@clerk/clerk-react';

const ChatMate = () => {
  const { state } = useLocation();
  const character = state?.character;

  const { user } = useUser();

  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(chatMessages);
  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isInitialMount = useRef(true);

  // 첫 로드시 스크롤을 맨 위에 고정
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // 새 메시지 추가 시(첫 렌더 제외) 아래로 스크롤
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // character 정보가 없으면 아무것도 렌더하지 않음
  if (!character) return null;

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const now = new Date().toLocaleTimeString('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    setMessages(prev => [
      ...prev,
      { id: prev.length + 1, text: newMessage, sender: 'me', time: now }
    ]);
    setNewMessage('');
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 헤더: sticky */}
      <header className="sticky top-0 py-4 px-6 z-10 bg-black/20 backdrop-blur-xl"> {/* Added background for header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-[#a6c0c6]">
            <img
              src={character.image}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-white text-lg font-bold">
            {character.name}
          </span>
        </div>
      </header>

      {/* 스크롤 영역: 프로필 + 메시지 */}
      <div
        ref={scrollContainerRef}
        className="flex-1 px-4 overflow-y-auto no-scrollbar sm:px-6 md:px-8 lg:px-12" // Adjusted horizontal padding
      >
        {/* 프로필 */}
        <div className="flex flex-col items-center my-6 text-center"> {/* Added text-center for small screens */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden"> {/* Responsive profile image size */}
            <img
              src={character.image}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2 mt-3"> {/* Responsive font size */}
            {character.name}
          </h3>
          <p className="text-white/70 text-sm sm:text-base px-2 max-w-lg mx-auto"> {/* Responsive font size and max-width */}
            {character.description}
          </p>
        </div>

        {/* 메시지들 */}
{/* 메시지들 */}
        <div className="space-y-4 pb-4 max-w-3xl mx-auto">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col w-full ${ // Changed to flex-col for vertical stacking
                msg.sender === 'me' ? 'items-end' : 'items-start'
              }`}
            >
              <div className={`flex items-center mb-1 ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}> {/* Profile image and name */}
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-green-300 to-teal-400">
                  <img
                    src={msg.sender === 'me' ? user?.imageUrl || '/assets/icon-character.png' : character.image} // For 'me', you might want a user avatar. For now, using character.image
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className={`text-white font-medium text-sm ${msg.sender === 'me' ? 'mr-2' : 'ml-2'}`}>
                  {msg.sender === 'me' ? user?.username || user?.firstName || 'You' : character.name}
                </span>
              </div>

              <div
                className={`max-w-[80%] sm:max-w-[70%] lg:max-w-[60%] px-4 py-3 rounded-2xl break-words ${
                  msg.sender === 'me'
                    ? 'bg-[#413ebc] text-white mr-10' // <-- 여기에 mr-10을 추가합니다.
                    : 'bg-white text-black ml-10'
                }`}
              >
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>


      {/* 입력창: sticky bottom */}
      <footer className="sticky bottom-0 px-4 py-4 border-t border-white/10 bg-black/20 backdrop-blur-xl"> {/* Added background for footer and adjusted horizontal padding */}
        <div className="flex items-center space-x-3 max-w-4xl mx-auto">
          <button className="text-white hover:text-white/90 p-2 text-xl">📎</button> {/* Increased icon size */}
          <div className="flex-1 flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-4 py-2.5"> {/* Adjusted vertical padding */}
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-white placeholder-white/60 focus:outline-none focus:border-blue-400 focus:bg-white/15" // Adjusted vertical padding
            />
          </div>
          <button
            onClick={sendMessage}
            className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-full transition-colors text-xl" // Changed padding to fixed width/height and added flex for centering
          >
            ➤
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatMate;
