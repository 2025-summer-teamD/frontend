import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/sideBar';

const ChatMate = () => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '채팅내용',
      sender: 'other',
      time: '오후 3:45'
    },
    {
      id: 2,
      text: '채팅내용',
      sender: 'me',
      time: '오후 3:45'
    }
  ]);

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
    <Sidebar>
      <div className="flex flex-col justify-between h-full">
        {/* 채팅 영역 */}
        <div className="flex flex-col items-center justify-start pt-10 pb-28 relative overflow-y-auto">
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
          <div className="w-full max-w-4xl px-6 space-y-4">
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

        {/* 입력 영역 */}
          <div className="p-5 backdrop-blur-xl border-t border-white/10 sticky bottom-0 w-full">
          <div className="flex items-center space-x-3 max-w-4xl mx-auto">
            <button className="text-white/70 hover:text-white p-2">📎</button>
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
    </Sidebar>
  );
};

export default ChatMate;
