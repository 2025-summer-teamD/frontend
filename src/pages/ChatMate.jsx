import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
// import chatMessages from '../data/chatMessages'; // 더미 데이터 삭제
import { useSendMessageToAI } from '../data/chatMessages';
import { useUser } from '@clerk/clerk-react';

const ChatMate = () => {
  const { state } = useLocation();
  const { roomId } = useParams();
  const { user } = useUser();

  // AI 응답 훅 추가
  const { sendMessage: sendMessageToAI, loading: aiLoading, error: aiError } = useSendMessageToAI();

  // 이전 대화기록을 메시지 형식으로 변환하는 함수
  const convertChatHistoryToMessages = (chatHistory, characterData) => {
    console.log('📜 채팅 히스토리 변환 시작:', { chatHistory, characterData });
    
    if (!chatHistory || !Array.isArray(chatHistory)) {
      console.log('❌ 채팅 히스토리가 없거나 배열이 아님');
      return [];
    }
    
    return chatHistory.map(item => {
      const convertedMessage = {
        id: item.id,
        text: item.text,
        sender: item.speaker === 'user' ? 'me' : 'other',
        time: new Date(item.time).toLocaleTimeString('ko-KR', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        characterId: characterData?.character_id || characterData?.id
      };
      console.log('💬 변환된 메시지:', convertedMessage);
      return convertedMessage;
    });
  };

  // 캐릭터 정보 상태
  const [character, setCharacter] = useState(state?.character || null);
  const [loading, setLoading] = useState(!state?.character && !!roomId);
  const [error, setError] = useState(null);

  // 메시지 상태 (이전 대화기록이 있으면 초기값으로 설정)
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(() => {
    console.log('🏁 초기 메시지 상태 설정');
    console.log('🔍 state?.chatHistory:', state?.chatHistory);
    console.log('🔍 state?.character:', state?.character);
    
    const chatHistory = state?.chatHistory || [];
    const initialCharacter = state?.character;
    
    if (chatHistory.length > 0) {
      console.log('✅ 채팅 히스토리 발견, 변환 시작');
      const convertedMessages = convertChatHistoryToMessages(chatHistory, initialCharacter);
      console.log('✅ 변환 완료:', convertedMessages);
      return convertedMessages;
    } else {
      console.log('❌ 채팅 히스토리 없음');
      return [];
    }
  });
  
  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isInitialMount = useRef(true);

  // roomId로 백엔드에서 캐릭터 정보 fetch (state가 없을 때만)
  useEffect(() => {
    console.log('🔄 useEffect 실행 - roomId:', roomId, 'state?.character:', !!state?.character);
    
    // state에서 캐릭터 정보가 있으면 API 호출하지 않음
    if (state?.character) {
      console.log('✅ state에서 캐릭터 정보 있음, API 호출 생략');
      return;
    }
    
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
  }, [roomId, state?.character]);

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

  // AI 응답 포함한 메시지 전송
  const sendMessage = async () => {
    console.log('🚀 ChatMate sendMessage 시작');
    console.log('🔍 newMessage.trim():', newMessage.trim());
    console.log('🔍 aiLoading:', aiLoading);
    
    if (!newMessage.trim() || aiLoading) {
      console.log('❌ 조건 체크 실패 - 메시지 전송 중단');
      return;
    }
    
    console.log('✅ 조건 체크 통과');
    const messageText = newMessage.trim();
    setNewMessage(''); // 입력창 즉시 비우기
    
    console.log('⏰ 시간 생성 시작');
    const now = new Date().toLocaleTimeString('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    console.log('✅ 시간 생성 성공:', now);

    // 사용자 메시지 추가
    console.log('👤 사용자 메시지 객체 생성 시작');
    const userMsg = {
      id: Date.now(), // 고유 ID 생성
      text: messageText,
      sender: 'me',
      time: now,
      characterId: character.id,
    };
    console.log('✅ 사용자 메시지 객체 생성 성공:', userMsg);

    // 로컬 상태에 사용자 메시지 즉시 추가
    console.log('📝 로컬 상태에 사용자 메시지 추가');
    setMessages(prev => [...prev, userMsg]);

    try {
      // AI API 호출
      console.log('🤖 AI API 호출 시작');
      console.log('💬 AI에게 메시지 전송:', { roomId, message: messageText });
      const aiResponse = await sendMessageToAI(roomId, messageText);
      console.log('✅ AI API 호출 성공, 응답:', aiResponse);
      console.log('🔍 AI 응답 타입:', typeof aiResponse);
      
      // AI 응답 메시지 추가 -> 객체에서 string형식으로 변경,, 향후 ai resopose를 객체로 변경 가능
      console.log('💭 AI 메시지 객체 생성 시작');
      const aiMsg = {
        id: Date.now() + 1,
        text: typeof aiResponse === 'string' ? aiResponse : '응답을 받지 못했습니다.',
        sender: 'other',
        time: now,
        characterId: character.id,
      };
      console.log('✅ AI 메시지 객체 생성 성공:', aiMsg);

      // 로컬 상태에 AI 메시지 추가
      console.log('📝 로컬 상태에 AI 메시지 추가');
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error('💥 ChatMate sendMessage에서 에러 발생:', error);
      console.error('💥 에러 타입:', typeof error);
      console.error('💥 에러 message:', error.message);
      console.error('💥 에러 stack:', error.stack);
      console.error('AI 응답 실패:', error);
      
      // 에러 메시지 추가
      console.log('❌ 에러 메시지 객체 생성 시작');
      const errorMsg = {
        id: Date.now() + 2,
        text: '죄송합니다. 응답을 생성하는데 문제가 발생했습니다.',
        sender: 'other',
        time: now,
        characterId: character.id,
      };
      console.log('✅ 에러 메시지 객체 생성 성공:', errorMsg);

      setMessages(prev => [...prev, errorMsg]);
    }
    
    console.log('🏁 ChatMate sendMessage 완료');
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !aiLoading) sendMessage();
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
          <button className="text-white hover:text-white/90 p-2 text-xl">��</button>
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
