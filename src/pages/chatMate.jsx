// src/pages/ChatMate.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ChatMate = () => {
  const { state } = useLocation();
  const character = state?.character;

  // 훅은 무조건 최상단에서 호출
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: '안녕하세요!', sender: 'other', time: '오후 3:45' },
    { id: 2, text: '반갑습니다!', sender: 'me',    time: '오후 3:46' },
  ]);
  const messagesEndRef = useRef(null);

  // 메시지 변경 시 스크롤 하단으로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // character 데이터 없으면 렌더링 중단
  if (!character) return null;

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const now = new Date().toLocaleTimeString('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    setMessages(msgs => [
      ...msgs,
      { id: msgs.length + 1, text: newMessage, sender: 'me', time: now }
    ]);
    setNewMessage('');
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 헤더: sticky */}
      <header className="sticky top-0 bg-black/20 backdrop-blur-xl py-4 px-6 z-10">
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
      <div className="flex-1 px-8 overflow-y-auto">
        {/* 프로필 */}
        <div className="flex flex-col items-center my-6">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
            <img
              src={character.image}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">
            {character.name}
          </h3>
          <p className="text-white/70 text-center px-4">
            {character.description}
          </p>
        </div>

        {/* 메시지들 */}
        <div className="space-y-4 pb-24">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col w-full ${
                msg.sender === 'me' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`flex items-end space-x-2 ${
                  msg.sender === 'me' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'other' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-green-300 to-teal-400 flex-shrink-0">
                    <img
                      src={character.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    msg.sender === 'me'
                      ? 'bg-[#413ebc] text-white rounded-br-sm'
                      : 'bg-white text-black rounded-bl-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                {msg.sender === 'me' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-green-300 to-teal-400 flex-shrink-0">
                    <img
                      src={character.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="text-xs mt-1 text-white px-4">
                {msg.time}
              </div>
            </div>
          ))}
          {/* 스크롤 최하단 포커스 */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력창: sticky bottom */}
      <footer className="sticky bottom-0 backdrop-blur-xl bg-black/20 px-6 py-4 border-t border-white/10">
        <div className="flex items-center space-x-3 max-w-4xl mx-auto">
          <button className="text-white hover:text-white/90 p-2">📎</button>
          <div className="flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
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
      </footer>
    </div>
  );
};

export default ChatMate;