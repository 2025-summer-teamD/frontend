import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useChatMessages } from '../contexts/ChatMessagesContext';
import { FiPaperclip } from 'react-icons/fi';
import { io } from 'socket.io-client';
import { useMyCharacters } from '../data/characters';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 레벨/게이지 계산 및 네온 게이지 컴포넌트
function getLevel(exp) {
  // 친밀도 1,2,3,4,5 쌓일 때마다 레벨업
  if (exp >= 20) return 5;
  if (exp >= 15) return 4;
  if (exp >= 10) return 3;
  if (exp >= 5) return 2;
  if (exp >= 1) return 1;
  return 1; // exp가 0이거나 음수일 때도 레벨 1을 반환 (friendship 기본값과 일치)
}
function getExpForNextLevel(level) {
  // 각 레벨별 필요 친밀도: 1레벨(1), 2레벨(5), 3레벨(10), 4레벨(15), 5레벨(20)
  return [0, 1, 5, 10, 15, 20][level] || 0;
}
function getExpBase(level) {
  // 누적 기준 exp
  return [0, 0, 1, 5, 10, 15][level] || 0;
}
function LevelExpGauge({ exp }) {
  const level = getLevel(exp);
  const expBase = getExpBase(level);
  const expNext = getExpForNextLevel(level + 1);
  const expInLevel = exp - expBase;
  const expMax = expNext - expBase;
  const percent = expMax ? Math.min(100, Math.round((expInLevel / expMax) * 100)) : 100;
  return (
    <>
      <div className="flex gap-2 items-center text-cyan-200 font-bold font-cyberpunk text-xs tracking-widest">
        <span>Lv.{level}</span>
        <span>친밀도:{exp}</span>
      </div>
      <div className="w-32 h-3 bg-black/60 border border-cyan-700 rounded-full shadow-[0_0_4px_#0ff] relative overflow-hidden">
        <div
          className="h-full bg-cyan-400"
          style={{
            width: `${percent}%`,
            boxShadow: '0 0 4px #0ff, 0 0 8px #0ff',
            transition: 'width 0.4s cubic-bezier(.4,2,.6,1)'
          }}
        />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-cyan-100 font-bold drop-shadow-[0_0_2px_#0ff]">
          {expInLevel}/{expMax}
        </span>
      </div>
    </>
  );
}

const SOCKET_URL = 'http://localhost:3001'; // 포트 3002로 명시적으로 지정

// AI별 네온 컬러 팔레트 (고정 or 랜덤)
const AI_NEON_COLORS = [
  { bg: 'bg-fuchsia-100/80', border: 'border-fuchsia-200', shadow: 'shadow-[0_0_4px_#f0f]', text: 'text-fuchsia-900' },
  { bg: 'bg-cyan-100/80', border: 'border-cyan-200', shadow: 'shadow-[0_0_4px_#0ff]', text: 'text-cyan-900' },
  { bg: 'bg-green-100/80', border: 'border-green-200', shadow: 'shadow-[0_0_4px_#0f0]', text: 'text-green-900' },
  { bg: 'bg-pink-100/80', border: 'border-pink-200', shadow: 'shadow-[0_0_4px_#f0c]', text: 'text-pink-900' },
  { bg: 'bg-blue-100/80', border: 'border-blue-200', shadow: 'shadow-[0_0_4px_#0cf]', text: 'text-blue-900' },
];
// AI id별로 고정된 색상 인덱스 반환
function getAiColorIdx(aiId) {
  if (!aiId) return 0;
  return Math.abs(parseInt(aiId, 10)) % AI_NEON_COLORS.length;
}

const ChatMate = () => {
  const { state } = useLocation();
  const { roomId } = useParams();
  const { user } = useUser();
  const { getToken } = useAuth();

  // 전역 메시지 Context 사용
  const {
    getMessages,
    setMessagesForRoom,
    addMessageToRoom,
    addAiResponseToRoom,
    getAiLoading,
    setAiLoading
  } = useChatMessages();

  // 소켓 상태
  const socketRef = useRef(null);
  const [participants, setParticipants] = useState([]);
  const { characters: myAIs, loading: aiLoading } = useMyCharacters('created');
  const [roomInfoParticipants, setRoomInfoParticipants] = useState([]);
  const hasSentInitialGreeting = useRef(false);

  // 이전 대화기록을 메시지 형식으로 변환하는 함수
  const convertChatHistoryToMessages = (chatHistory, characterData) => {
    if (!chatHistory || !Array.isArray(chatHistory)) {
      return [];
    }

    return chatHistory.map(item => ({
      id: item.id,
      text: item.text,
      sender: item.senderType === 'user' && item.senderId === user.id ? 'me' : (item.senderType === 'ai' ? 'ai' : 'other'),
      aiId: item.aiId ?? (item.senderType === 'ai' ? item.senderId : undefined),
      aiName: item.aiName ?? undefined,
      time: new Date(item.time).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }),
      characterId: item.characterId ?? undefined,
    }));
  };

  // 캐릭터 정보 상태
  const [character, setCharacter] = useState(state?.character || null);
  const [loading, setLoading] = useState(!state?.character && !!roomId);
  const [error, setError] = useState(null);

  // 메시지 상태 (전역 Context에서 관리)
  const [newMessage, setNewMessage] = useState('');

  // 현재 채팅방의 메시지와 AI 로딩 상태
  const messages = getMessages(roomId);
  // 기존 aiLoading 변수명 변경 (AI 응답 로딩)
  const aiResponseLoading = getAiLoading(roomId);

  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isInitialMount = useRef(true);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const fileInputRef = useRef(null);

  // 🆕 사이드바 채팅방 전환 감지: state 변경 시 상태 업데이트
  useEffect(() => {
    if (state?.character) {
      // 캐릭터 정보 업데이트
      setCharacter(state.character);
      setError(null);
      setLoading(false);

      // 메시지 히스토리를 전역 Context에 저장
      const newChatHistory = state.chatHistory || [];
      if (newChatHistory.length > 0) {
        const convertedMessages = convertChatHistoryToMessages(newChatHistory, state.character);
        setMessagesForRoom(roomId, convertedMessages);
      } else {
        setMessagesForRoom(roomId, []);
      }
      // 참여자 목록 동기화
      if (state.participants && Array.isArray(state.participants)) {
        setParticipants(state.participants);
      }
    }
  }, [state?.character, state?.chatHistory, roomId]); // roomId도 의존성에 추가

  // roomId가 변경될 때 인사 플래그 리셋
  useEffect(() => {
    hasSentInitialGreeting.current = false;
  }, [roomId]);

  // room-info API 호출 (채팅방 정보 및 참여자 목록 조회)
  useEffect(() => {
    if (!roomId || !getToken) return;
    
    (async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${API_BASE_URL}/chat/room-info?roomId=${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (data.success && data.data && data.data.character) {
          setCharacter(data.data.character);
          setRoomInfoParticipants(data.data.participants || []);
          setParticipants(data.data.participants || []); // 참여자 목록도 동기화
          
          // 채팅방에 처음 들어왔을 때 AI들이 자동으로 인사 (새로운 방이고 AI가 2명 이상일 때만)
          const currentMessages = getMessages(roomId);
          const chatHistory = data.data.chatHistory || [];
          
          // 백엔드에서 받은 채팅 기록이 없고, 현재 메시지도 없고, AI 참여자가 2명 이상이고, 아직 인사를 보내지 않았을 때만
          const hasGreetedKey = `room_${roomId}_greeted`;
          const hasGreeted = localStorage.getItem(hasGreetedKey);
          
          if (currentMessages.length === 0 && 
              chatHistory.length === 0 && 
              data.data.participants && 
              data.data.participants.length > 1 && 
              !hasSentInitialGreeting.current &&
              !hasGreeted) {
            hasSentInitialGreeting.current = true;
            localStorage.setItem(hasGreetedKey, 'true');
            
            // AI 자동 인사 요청
            setTimeout(async () => {
              try {
                const token = await getToken();
                const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/greetings`, {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                const greetingData = await response.json();
                
                if (greetingData.success && greetingData.data.greetings) {
                  // 각 AI의 인사 메시지를 소켓으로 전송
                  greetingData.data.greetings.forEach((greeting, index) => {
                    setTimeout(() => {
                      if (socketRef.current) {
                        socketRef.current.emit('sendMessage', {
                          roomId,
                          message: greeting.message,
                          senderType: 'ai',
                          senderId: greeting.personaId,
                          aiName: greeting.personaName,
                          aiId: greeting.personaId,
                          timestamp: greeting.timestamp
                        });
                      }
                    }, index * 2000); // 각 AI가 2초 간격으로 인사
                  });
                }
              } catch (error) {
                console.error('❌ AI 자동 인사 요청 실패:', error);
              }
            }, 2000); // 2초 후 AI 인사 시작
          }
        } else {
          setError('존재하지 않거나 삭제된 채팅방입니다.');
        }
      } catch (error) {
        console.error('❌ room-info API 호출 실패:', error);
        setError('존재하지 않거나 삭제된 채팅방입니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [roomId, getToken]);

  // 소켓 연결 및 이벤트 등록 (단 하나만 남김)
  useEffect(() => {
    if (!roomId || !user) return;
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('joinRoom', { roomId, userId: user.id });
    
    // 채팅방 입장 시 unreadCount 초기화 이벤트 수신
    socket.on('roomJoined', (data) => {
      console.log('채팅방 입장됨, unreadCount 초기화:', data);
    });
    
    socket.on('receiveMessage', async (msg) => {
      addMessageToRoom(roomId, {
        id: Date.now() + Math.random(),
        text: msg.message,
        sender: msg.senderType === 'user' && msg.senderId === user.id ? 'me' : (msg.senderType === 'ai' ? 'ai' : 'other'),
        aiId: msg.aiId ? String(msg.aiId) : undefined,
        aiName: msg.aiName ? String(msg.aiName) : undefined,
        time: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }),
        characterId: msg.senderType === 'ai' ? msg.aiId : character?.id,
      });
    });
    
    // EXP 업데이트 이벤트 수신
    socket.on('expUpdated', (data) => {
      setRoomInfoParticipants(prev => {
        return prev.map(participant => {
          if (String(participant.personaId) === String(data.personaId)) {
            return {
              ...participant,
              exp: data.newExp,
              // 백엔드에서 전송한 레벨 사용 (없으면 계산)
              friendship: data.newLevel || getLevel(data.newExp)
            };
          }
          return participant;
        });
      });
    });
    
    socket.on('participants', (data) => {
      if (Array.isArray(data.participants)) {
        setParticipants(data.participants);
      }
    });
    return () => {
      socket.emit('leaveRoom', { roomId, userId: user.id });
      socket.disconnect();
    };
  }, [roomId, user]);

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



  // 조건부 렌더링은 모든 Hook 선언 이후에 위치해야 함
  if (loading) return <div className="text-white p-8">캐릭터 정보를 불러오는 중...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;
  if (!character) return null;

  // 메시지 전송은 소켓 emit만 사용
  const sendMessage = async () => {
    if (!newMessage.trim() || aiResponseLoading) return;
    const messageText = newMessage.trim();
    setNewMessage('');
    // addMessageToRoom(roomId, { ... }) // 이 부분 삭제!
    if (socketRef.current) {
      // 사용자 이름 결정 (username > firstName > name > userId 순서)
      const userName = user?.username || user?.firstName || user?.fullName || user?.id;
      socketRef.current.emit('sendMessage', {
        roomId,
        message: messageText,
        senderType: 'user',
        senderId: user.id,
        userName: userName, // 사용자 이름 추가
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !aiResponseLoading) sendMessage();
  };

  // 1. handleImageUpload 함수 추가
  const handleImageUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    // 인증 필요시 토큰 추가 가능
    // const token = await getToken();
    const res = await fetch('/api/chat/upload-image', {
      method: 'POST',
      // headers: { Authorization: `Bearer ${token}` }, // 필요시
      body: formData,
    });
    const data = await res.json();
    if (data.success && data.imageUrl) {
      addMessageToRoom(roomId, {
        id: Date.now(),
        text: '',
        imageUrl: data.imageUrl,
        sender: 'me',
        time: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }),
        characterId: character.id,
      });
      // AI에게도 이미지 메시지 전송
      setAiLoading(roomId, true);
      try {
        // 프롬프트에 이미지 URL을 명시적으로 포함
        const aiResponse = await fetch(`${API_BASE_URL}/chat/ai-response?roomId=${roomId}&message=[이미지] ${data.imageUrl}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${await getToken()}`,
            'Content-Type': 'application/json'
          }
        })
          .then(res => res.json())
          .then(data => data.content);
        addAiResponseToRoom(roomId, aiResponse);
      } catch (e) {
        console.error('AI 이미지 답변 생성 에러:', e);
        addAiResponseToRoom(roomId, '이미지에 대한 답변 생성에 실패했습니다.');
      } finally {
        setAiLoading(roomId, false);
      }
    } else {
      alert('이미지 업로드 실패');
    }
  };

  return (
    <div className="flex flex-col h-full font-cyberpunk" style={{fontFamily:undefined, background:'radial-gradient(circle at 30% 10%, #23234d 0%, #2e3a5e 60%, #181a2b 100%)', minHeight:'100vh'}}>
      {/* 헤더: sticky */}
      <header className="sticky top-0 py-4 px-6 z-10">
        <div className="flex items-center gap-3">
          {/* 여러 캐릭터 프로필 이미지 */}
          <div className="flex -space-x-2">
            {roomInfoParticipants.map((participant, index) => {
              const ai = myAIs.find(ai => String(ai.id) === String(participant.personaId));
              return (
                <div 
                  key={participant.personaId} 
                  className="w-9 h-9 rounded-full border-2 border-cyan-300 shadow-[0_0_4px_#0ff] relative"
                  style={{ zIndex: roomInfoParticipants.length - index }}
                >
                  <img
                    src={ai?.imageUrl || '/assets/icon-character.png'}
                    alt={ai?.name || `AI#${participant.personaId}`}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              );
            })}
          </div>
          <div className="flex flex-col">
            <span className="text-cyan-100 text-lg font-bold drop-shadow-[0_0_2px_#0ff] tracking-widest font-cyberpunk">
              {roomInfoParticipants.length > 1 
                ? `${roomInfoParticipants.length}명의 AI와 대화` 
                : roomInfoParticipants[0] 
                  ? myAIs.find(ai => String(ai.id) === String(roomInfoParticipants[0].personaId))?.name || 'AI'
                  : '채팅방'
              }
            </span>
            <span className="text-cyan-300 text-xs drop-shadow-[0_0_1px_#0ff]">
              {roomInfoParticipants.map((p, index) => {
                const ai = myAIs.find(ai => String(ai.id) === String(p.personaId));
                return ai?.name || `AI#${p.personaId}`;
              }).join(', ')}
            </span>
          </div>
        </div>
      </header>
      {/* 스크롤 영역: 프로필 + 메시지 */}
      <div
        ref={scrollContainerRef}
        className="flex-1 px-4 overflow-y-auto no-scrollbar sm:px-6 md:px-8 lg:px-12 pb-28 font-cyberpunk"
      >
        {/* 프로필 */}
        <div className="flex flex-col items-center my-6 text-center font-cyberpunk">
          {/* 참여자 목록 제목 */}
          <div className="mb-6">
            <span className="text-lg text-cyan-300 font-bold drop-shadow-[0_0_2px_#0ff] tracking-widest">참여자 목록</span>
          </div>
          {/* 여러 캐릭터 카드 + 내 프로필 */}
          <div className="flex flex-wrap justify-center gap-6 w-full max-w-4xl">
            {/* 내 프로필 */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-cyan-300 shadow-[0_0_6px_#0ff] mb-2">
                  <img
                    src={user?.imageUrl || '/assets/icon-character.png'}
                    alt="나"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center border border-cyan-300 shadow-[0_0_4px_#0ff]">
                  <span className="text-sm font-bold text-cyan-900">나</span>
                </div>
              </div>
              <span className="text-sm font-bold text-cyan-100 mb-1 drop-shadow-[0_0_2px_#0ff] tracking-widest font-cyberpunk">
                {user?.username || user?.firstName || '사용자'}
              </span>
            </div>
            
            {/* AI 참여자들 */}
            {roomInfoParticipants.map((participant, index) => {
              // 프롬포트 정보와 exp를 participant에서 직접 사용
              const ai = {
                ...participant,
                ...myAIs.find(ai => String(ai.id) === String(participant.personaId))
              };
              // 실시간 업데이트된 friendship(레벨) 사용, 없으면 계산
              const level = ai.friendship || getLevel(ai.exp || 0);
              const expBase = getExpBase(level);
              const expNext = getExpForNextLevel(level + 1);
              const expInLevel = (ai.exp || 0) - expBase;
              const expMax = expNext - expBase;
              const percent = expMax ? Math.min(100, Math.round((expInLevel / expMax) * 100)) : 100;
              return (
                <div key={ai.personaId} className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-2 border-cyan-300 shadow-[0_0_6px_#0ff] mb-2">
                      <img
                        src={ai.imageUrl}
                        alt={ai.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-fuchsia-500 rounded-full flex items-center justify-center border border-fuchsia-300 shadow-[0_0_4px_#f0f]">
                      <span className="text-sm font-bold text-fuchsia-900">Lv.{level}</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-cyan-100 mb-2 drop-shadow-[0_0_2px_#0ff] tracking-widest font-cyberpunk">
                    {ai.name}
                  </span>
                  <div className="w-20 h-2 bg-black/60 border border-cyan-700 rounded-full shadow-[0_0_4px_#0ff] relative overflow-hidden">
                    <div
                      className="h-full bg-cyan-400"
                      style={{
                        width: `${percent}%`,
                        boxShadow: '0 0 4px #0ff, 0 0 8px #0ff',
                        transition: 'width 0.4s cubic-bezier(.4,2,.6,1)'
                      }}
                    />
                  </div>
                                     <span className="text-xs text-cyan-300 mt-1 font-bold">
                     {ai.exp || 0}
                   </span>
                </div>
              );
            })}
          </div>
        </div>
        {/* 메시지들 */}
        <div className="space-y-4 pb-4 max-w-3xl mx-auto font-cyberpunk">
                  {messages.map((msg, idx) => {
          const isAI = msg.sender === 'ai';
          // 메시지 렌더링 시에도 aiObj를 myAIs가 아니라 roomInfoParticipants에서 찾아 exp, personality 등 활용
          const aiObj = isAI ? roomInfoParticipants.find(ai => String(ai.personaId) === String(msg.aiId)) : null;
            const profileImg = msg.sender === 'me'
              ? user?.imageUrl || '/assets/icon-character.png'
              : isAI
                ? (aiObj?.imageUrl || '/assets/icon-character.png')
                : '/assets/icon-character.png';
            const displayName = msg.sender === 'me'
              ? user?.username || user?.firstName || 'You'
              : isAI
                ? (msg.aiName || aiObj?.name || `AI#${msg.aiId}`)
                : 'AI';
            const aiColorIdx = isAI ? getAiColorIdx(msg.aiId) : 0;
            const aiColor = isAI ? AI_NEON_COLORS[aiColorIdx] : null;
            const isLast = idx === messages.length - 1;
            const nextMsg = messages[idx + 1];
            const prevMsg = messages[idx - 1];
            const showTime = isLast || msg.time !== nextMsg?.time || msg.sender !== "prevMsg?.sender";
            const showProfile = idx === 0 || msg.time !== prevMsg?.time || msg.sender !== "prevMsg?.sender";
            return (
              <div
                key={msg.id}
                className={`flex flex-col w-full ${msg.sender === 'me' ? 'items-end' : 'items-start'} font-cyberpunk`}
              >
                {showProfile && (
                  <div className={`flex items-center mb-1 ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'} font-cyberpunk`}>
                    <div className="w-8 h-8 rounded-full border-2 border-cyan-300 shadow-[0_0_3px_#0ff] flex-shrink-0 bg-gradient-to-br from-cyan-200/60 to-fuchsia-200/40">
                      <img
                        src={profileImg}
                        alt=""
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <span className={`text-cyan-100 font-bold text-sm tracking-widest drop-shadow-[0_0_1px_#0ff] font-cyberpunk ${msg.sender === 'me' ? 'mr-2' : 'ml-2'}`}>
                      {displayName}
                      {isAI && aiObj && (
                        <span className="ml-2 text-xs text-cyan-300 font-bold">
                          Lv.{roomInfoParticipants.find(p => String(p.personaId) === String(msg.aiId))?.friendship || getLevel(roomInfoParticipants.find(p => String(p.personaId) === String(msg.aiId))?.exp || 0)}
                        </span>
                      )}
                    </span>
                  </div>
                )}
                <div
                  className={`max-w-[80%] sm:max-w-[70%] lg:max-w-[60%] px-4 py-3 rounded-xl break-words tracking-widest font-cyberpunk ${msg.sender === 'me'
                    ? 'bg-cyan-100/80 border-2 border-cyan-200 text-[#1a1a2e] shadow-[0_0_4px_#0ff]'
                    : isAI
                      ? `${aiColor.bg} border-2 ${aiColor.border} ${aiColor.text} ${aiColor.shadow}`
                      : 'bg-fuchsia-100/80 border-2 border-fuchsia-200 text-[#1a1a2e] shadow-[0_0_4px_#f0f]'
                    }`}
                  style={isAI ? { boxShadow: aiColor.shadow.replace('shadow-', '').replace('[', '').replace(']', '') } : {}}
                >
                  {msg.imageUrl
                    ? <img
                      src={msg.imageUrl.startsWith('http') ? msg.imageUrl : API_BASE_URL + msg.imageUrl}
                      alt="전송된 이미지"
                      className="max-w-xs rounded-lg border-2 border-cyan-200 shadow-[0_0_4px_#0ff] font-cyberpunk"
                    />
                    : <p className="font-cyberpunk">{msg.text}</p>
                  }
                </div>
                {showTime && (
                  <div className={`flex w-full mt-1 ${msg.sender === 'me' ? 'justify-end pr-2' : 'justify-start pl-2'}`}>
                    <span className="text-xs text-cyan-400 font-cyberpunk">
                      {msg.time}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
      {/* 입력창: sticky bottom */}
      <footer className="fixed right-0 left-0 bottom-0 px-4 py-4 border-t-2 border-cyan-200 bg-black/30 glass backdrop-blur-xl shadow-[0_0_8px_#0ff,0_0_16px_#f0f] font-cyberpunk">
        <div className="flex items-center space-x-3 max-w-4xl mx-auto relative font-cyberpunk">
          <div className="relative">
            <button
              className="text-cyan-400 hover:text-fuchsia-400 p-2 text-xl drop-shadow-[0_0_2px_#0ff] font-cyberpunk"
              aria-label="파일 첨부"
              onClick={() => setShowAttachModal(v => !v)}
            >
              <FiPaperclip />
            </button>
            {/* 첨부 모달: 클립버튼 위에 작게 */}
            {showAttachModal && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 bg-black/80 glass border-2 border-cyan-200 rounded-xl shadow-[0_0_4px_#0ff] p-4 flex flex-col items-center w-56 backdrop-blur-sm animate-fadeIn font-cyberpunk">
                <button
                  className="bg-gradient-to-r from-cyan-200 to-fuchsia-200 hover:from-cyan-100 hover:to-fuchsia-100 text-[#1a1a2e] px-4 py-2 rounded-full font-cyberpunk font-bold transition-all shadow-[0_0_2px_#0ff]"
                  onClick={() => fileInputRef.current.click()}
                >
                  사진 보내기
                </button>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={e => {
                    if (e.target.files[0]) {
                      handleImageUpload(e.target.files[0]);
                      setShowAttachModal(false);
                    }
                  }}
                />
                <button
                  className="mt-2 text-cyan-400 hover:text-fuchsia-400 font-cyberpunk font-bold text-base transition-colors"
                  onClick={() => setShowAttachModal(false)}
                >
                  닫기
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 flex items-center space-x-2 bg-cyan-100/60 glass border-2 border-cyan-200 text-[#1a1a2e] placeholder-cyan-400 rounded-full px-4 py-2.5 font-cyberpunk focus:outline-none focus:bg-cyan-100/80 focus:border-fuchsia-200 focus:text-fuchsia-700 transition-all shadow-[0_0_4px_#0ff]">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="w-full bg-transparent border-none outline-none text-white placeholder-cyan-400 font-cyberpunk tracking-widest"
            />
          </div>
          <button
            onClick={sendMessage}
            className="bg-cyan-200 hover:bg-fuchsia-200 text-[#1a1a2e] w-10 h-10 flex items-center justify-center rounded-full transition-colors text-xl shadow-[0_0_3px_#0ff] font-cyberpunk"
          >
            ➤
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatMate;
