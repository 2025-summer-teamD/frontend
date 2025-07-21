import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
// import chatMessages from '../data/chatMessages'; // 더미 데이터 삭제
import { useUser } from '@clerk/clerk-react';

const ChatMate = () => {
  const { state } = useLocation();
  const { roomId } = useParams();
  const { user } = useUser();

  // 캐릭터 정보 상태
  const [character, setCharacter] = useState(state?.character || null);
  const [loading, setLoading] = useState(!state?.character && !!roomId);
  const [error, setError] = useState(null);

  // 메시지 상태(초기값 빈 배열)
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isInitialMount = useRef(true);

  // roomId로 백엔드에서 캐릭터 정보 fetch
  useEffect(() => {
    setCharacter(null);
    setMessages([]);
    setError(null);
    if (roomId) {
      setLoading(true);
      fetch(`http://localhost:3001/api/chat/room-info?room_id=${roomId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.character) {
            setCharacter(data.data.character);
          } else {
            setError('존재하지 않거나 삭제된 채팅방입니다.');
          }
        })
        .catch(() => setError('존재하지 않거나 삭제된 채팅방입니다.'))
        .finally(() => setLoading(false));
    }
  }, [roomId]);

  // 더미 데이터 삭제: character가 바뀌어도 messages는 빈 배열 유지

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

  useEffect(() => {
    if (character) {
      console.log(`[ChatMate] 채팅방 입장: 캐릭터 이름 = ${character.name}, id = ${character.id}`);
    }
  }, [character]);

  if (loading) return <div className="text-white p-8">캐릭터 정보를 불러오는 중...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;
  if (!character) return null;

  // 메시지 전송(임시: 프론트 상태에만 추가)
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const now = new Date().toLocaleTimeString('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const msg = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'me',
      time: now,
      characterId: character.id,
    };
    setMessages([...messages, msg]);
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
              src={character.image_url}
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
        className="flex-1 px-4 overflow-y-auto no-scrollbar sm:px-6 md:px-8 lg:px-12"
      >
        {/* 프로필 */}
        <div className="flex flex-col items-center my-6 text-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden">
            <img
              src={character.image_url  }
              alt={character.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2 mt-3">
            {character.name}
          </h3>
          <p className="text-white/70 text-sm sm:text-base px-2 max-w-lg mx-auto">
            {character.description}
          </p>
        </div>

        {/* 메시지들 */}
        <div className="space-y-4 pb-4 max-w-3xl mx-auto">
          {messages.map((msg, idx) => {
            const isLast = idx === messages.length - 1;
            const nextMsg = messages[idx + 1];
            const prevMsg = messages[idx - 1];
            const showTime = isLast || msg.time !== nextMsg?.time;
            const showProfile = idx === 0 || msg.time !== prevMsg?.time;

            return (
              <div
                key={msg.id}
                className={`flex flex-col w-full ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
              >
                {showProfile && (
                  <div className={`flex items-center mb-1 ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-green-300 to-teal-400">
                      <img
                        src={msg.sender === 'me' ? user?.imageUrl || '/assets/icon-character.png' : character.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className={`text-white font-medium text-sm ${msg.sender === 'me' ? 'mr-2' : 'ml-2'}`}>
                      {msg.sender === 'me' ? user?.username || user?.firstName || 'You' : character.name}
                    </span>
                  </div>
                )}
                <div
                  className={`max-w-[80%] sm:max-w-[70%] lg:max-w-[60%] px-4 py-3 rounded-2xl break-words ${
                    msg.sender === 'me'
                      ? 'bg-[#413ebc] text-white mr-10'
                      : 'bg-white text-black ml-10'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                {showTime && (
                  <span
                    className={`text-xs text-white/60 mt-1 block text-right ${
                      msg.sender === 'me' ? 'mr-10' : 'ml-10'
                    }`}
                  >
                    {msg.time}
                  </span>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력창: sticky bottom */}
      <footer className="sticky bottom-0 px-4 py-4 border-t border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="flex items-center space-x-3 max-w-4xl mx-auto">
          <button className="text-white hover:text-white/90 p-2 text-xl">📎</button>
          <div className="flex-1 flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-4 py-2.5">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-white placeholder-white/60 focus:outline-none focus:border-blue-400 focus:bg-white/15"
            />
          </div>
          <button
            onClick={sendMessage}
            className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-full transition-colors text-xl"
          >
            ➤
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatMate;
