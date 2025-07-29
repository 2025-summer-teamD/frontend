import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useChatMessages } from '../contexts/ChatMessagesContext';
import { FiPaperclip } from 'react-icons/fi';
import { IoGameController } from 'react-icons/io5';
import { io } from 'socket.io-client';
import { useMyCharacters } from '../data/characters';
import { v4 as uuidv4 } from 'uuid';
import NeonBackground from '../components/NeonBackground';
import ChatMessageItem from '../components/ChatMessageItem';
import CharacterProfile from '../components/CharacterProfile';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;



// 레벨 계산 함수 (백엔드와 동일한 로직 - 30레벨 시스템)
// 백엔드에서는 이미 friendship 필드에 레벨이 저장되어 있으므로 이 함수는 fallback용
function getLevel(exp) {
  // 30레벨 시스템: 공식으로 계산
  if (exp < 10) return 1;
  const level = Math.floor((-1 + Math.sqrt(1 + 8 * exp / 10)) / 2) + 1;
  return Math.min(level, 30); // 최대 30레벨
}

// 다음 레벨까지 필요한 경험치 계산
function getExpForNextLevel(level) {
  // 공식: (level * (level + 1) / 2) * 10
  return Math.floor((level * (level + 1) / 2) * 10);
}

// 현재 레벨의 시작 경험치 계산
function getExpBase(level) {
  // 공식: ((level - 1) * level / 2) * 10
  return Math.floor(((level - 1) * level / 2) * 10);
}

// 현재 레벨에서 필요한 경험치 계산
function getExpForCurrentLevel(level) {
  // 공식: level * 10
  return level * 10;
}

// 경험치 게이지 컴포넌트 (백엔드 friendship 필드 사용)
function LevelExpGauge({ exp, friendship }) {
  // 백엔드에서 전송한 friendship을 우선 사용, 없으면 exp로 계산
  const level = friendship || getLevel(exp);
  const expBase = getExpBase(level);
  const expNext = getExpForNextLevel(level + 1);
  const expInLevel = exp - expBase;
  const expMax = expNext - expBase;
  const percent = expMax ? Math.min(100, Math.round((expInLevel / expMax) * 100)) : 100;

  return (
    <div className="flex flex-col items-center gap-1">
      <span>Lv.{level}</span>
      <span>레벨:{level}</span>
      <div className="w-32 h-2 bg-black/60 border border-cyan-700 rounded-full shadow-[0_0_4px_#0ff] relative overflow-hidden">
        <div
          className="h-full bg-cyan-400"
          style={{
            width: `${percent}%`,
            boxShadow: '0 0 4px #0ff, 0 0 8px #0ff',
            transition: 'width 0.4s cubic-bezier(.4,2,.6,1)'
          }}
        />
      </div>
      <span className="text-xs text-cyan-300">
          {expInLevel}/{expMax}
        </span>
      </div>
  );
}

const SOCKET_URL = 'http://localhost:3001'; // 포트 3002로 명시적으로 지정

// AI별 네온 컬러 팔레트 (고정 or 랜덤)
const AI_NEON_COLORS = [
  { bg: 'bg-fuchsia-100/80', border: 'border-fuchsia-200', shadow: 'shadow-[0_0_4px_#f0f]', text: 'text-fuchsia-900' },
  { bg: 'bg-purple-100/80', border: 'border-purple-200', shadow: 'shadow-[0_0_4px_#a0f]', text: 'text-purple-900' },
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
  const { characters: myAIs, loading: aiLoading, fetchMyCharacters } = useMyCharacters('created');
  const [roomInfoParticipants, setRoomInfoParticipants] = useState([]);
  const hasSentInitialGreeting = useRef(false);

  // 1대1 채팅 여부 상태
  const [isOneOnOneChat, setIsOneOnOneChat] = useState(false);

  // SSE 연결 상태 추가
  const [sseConnectionStatus, setSseConnectionStatus] = useState('disconnected');
  const sseRef = useRef(null);

  // WebSocket 연결 상태 추가
  const [webSocketConnectionStatus, setWebSocketConnectionStatus] = useState('disconnected');

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
  const [showGameModal, setShowGameModal] = useState(false);
  const fileInputRef = useRef(null);
  
  // 캐릭터 프로필 모달 상태
  const [selectedCharacter, setSelectedCharacter] = useState(null);

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

          // 1대1 채팅 여부 확인 (백엔드에서 전송한 값 사용)
          const isOneOnOne = data.data.isOneOnOne || false;
          setIsOneOnOneChat(isOneOnOne);

          // 채팅방에 처음 들어왔을 때 AI들이 자동으로 인사 (새로운 방이고 AI가 2명 이상일 때만)
          const currentMessages = getMessages(roomId);
          const chatHistory = data.data.chatHistory || [];

          // 백엔드에서 받은 채팅 기록이 없고, 현재 메시지도 없고, AI 참여자가 2명 이상이고, 아직 인사를 보내지 않았을 때만

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

  // WebSocket 연결 (그룹 채팅용)
  useEffect(() => {
    if (!roomId || !user || isOneOnOneChat) return;

    console.log('🔌 그룹 채팅 WebSocket 연결 시작:', { roomId, userId: user.id, isOneOnOneChat });
    setWebSocketConnectionStatus('connecting');

    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.emit('joinRoom', { roomId, userId: user.id });
    console.log('📡 joinRoom 이벤트 전송:', { roomId, userId: user.id });

    socket.on('connect', () => {
      setWebSocketConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket 연결 해제됨');
      setWebSocketConnectionStatus('disconnected');
    });

    socket.on('connect_error', (error) => {
      console.log('🔌 WebSocket 연결 오류:', error);
      setWebSocketConnectionStatus('error');
    });

    socket.on('receiveMessage', (msg) => {
      console.log('📨 메시지 수신:', msg);
      addMessageToRoom(roomId, {
        id: uuidv4(),
        text: msg.message,
        sender: msg.senderType === 'user' && msg.senderId === user.id ? 'me' : (msg.senderType === 'ai' ? 'ai' : 'other'),
        aiId: msg.aiId ? String(msg.aiId) : undefined,
        aiName: msg.aiName ? String(msg.aiName) : undefined,
        time: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }),
        characterId: msg.senderType === 'ai' ? msg.aiId : character?.id,
      });
    });

    // EXP 업데이트 이벤트 수신 (그룹 채팅용)
    socket.on('expUpdated', (data) => {
      console.log('🔔 expUpdated 이벤트 수신:', data);

      // 참여자 목록 업데이트
      setRoomInfoParticipants(prev => {
        console.log('📊 현재 참여자 목록:', prev);
        const updated = prev.map(participant => {
          if (String(participant.personaId) === String(data.personaId)) {
            console.log(`✅ ${participant.name || participant.personaId} 친밀도 업데이트: ${participant.exp || 0} → ${data.newExp}, 레벨: ${participant.friendship || 1} → ${data.newLevel}`);
            return {
              ...participant,
              exp: data.newExp,
              friendship: data.newLevel
            };
          }
          return participant;
        });
        console.log('📊 업데이트된 참여자 목록:', updated);
        return updated;
      });

      // 캐릭터 목록도 함께 업데이트
      if (fetchMyCharacters) {
        console.log('🔄 캐릭터 목록 새로고침 중...');
        fetchMyCharacters('created').then(() => {
          console.log('✅ 캐릭터 목록 새로고침 완료');
        }).catch(error => {
          console.error('❌ 캐릭터 목록 새로고침 실패:', error);
        });
      } else {
        console.log('⚠️ fetchMyCharacters 함수를 찾을 수 없음');
      }
    });

    socket.on('participants', (data) => {
      if (Array.isArray(data.participants)) {
        setParticipants(data.participants);
      }
    });

    return () => {
      console.log('🔌 WebSocket 연결 해제:', { roomId, userId: user.id });
      socket.emit('leaveRoom', { roomId, userId: user.id });
      socket.disconnect();
      setWebSocketConnectionStatus('disconnected');
    };
  }, [roomId, user, isOneOnOneChat, fetchMyCharacters]);

  // 캐릭터 데이터 디버깅
  useEffect(() => {
    if (isOneOnOneChat && roomInfoParticipants.length > 0) {
      // console.log('🔍 1대1 채팅 캐릭터 데이터:', roomInfoParticipants[0]);
      // console.log('🔍 Available fields:', Object.keys(roomInfoParticipants[0]));
    }
  }, [isOneOnOneChat, roomInfoParticipants]);

  // 1대1 채팅용 SSE 연결
  useEffect(() => {
    if (!roomId || !user || !isOneOnOneChat) return;

    console.log('🔌 1대1 채팅 WebSocket 연결 시작 (친밀도 업데이트용):', { roomId, userId: user.id, isOneOnOneChat });

    // SSE 연결을 위한 WebSocket (친밀도 업데이트용)
    const friendshipSocket = io(SOCKET_URL, { transports: ['websocket'] });
    friendshipSocket.emit('joinRoom', { roomId, userId: user.id });
    console.log('📡 1대1 채팅 joinRoom 이벤트 전송:', { roomId, userId: user.id });

    // 친밀도 업데이트 이벤트 수신 (1대1 채팅용)
    friendshipSocket.on('expUpdated', (data) => {
      console.log('🔔 1대1 채팅 expUpdated 이벤트 수신:', data);

      // 참여자 목록 업데이트
      setRoomInfoParticipants(prev => {
        const updated = prev.map(participant => {
          if (String(participant.personaId) === String(data.personaId)) {
            console.log(`✅ ${participant.name || participant.personaId} 친밀도 업데이트: ${participant.exp || 0} → ${data.newExp}, 레벨: ${participant.friendship || 1} → ${data.newLevel}`);
            return {
              ...participant,
              exp: data.newExp,
              friendship: data.newLevel
            };
          }
          return participant;
        });
        return updated;
      });

      // 캐릭터 목록도 함께 업데이트
      if (fetchMyCharacters) {
        console.log('🔄 캐릭터 목록 새로고침 중...');
        fetchMyCharacters('created').then(() => {
          console.log('✅ 캐릭터 목록 새로고침 완료');
        }).catch(error => {
          console.error('❌ 캐릭터 목록 새로고침 실패:', error);
        });
      } else {
        console.log('⚠️ fetchMyCharacters 함수를 찾을 수 없음');
      }
    });

    return () => {
      console.log('🔌 1대1 채팅 WebSocket 연결 해제:', { roomId, userId: user.id });
      friendshipSocket.emit('leaveRoom', { roomId, userId: user.id });
      friendshipSocket.disconnect();
    };
  }, [roomId, user, isOneOnOneChat, fetchMyCharacters]);

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

  // 메시지 전송 함수 수정
  const sendMessage = async () => {
    if (!newMessage.trim() || aiResponseLoading) return;
    const messageText = newMessage.trim();
    setNewMessage('');

    if (isOneOnOneChat) {
      // 1대1 채팅: SSE 사용
      try {
        const token = await getToken();

        // 사용자 메시지를 먼저 추가
        const userMessage = {
          id: uuidv4(),
      text: messageText,
      sender: 'me',
          time: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }),
          characterId: character?.id,
        };
        addMessageToRoom(roomId, userMessage);

        // AI 로딩 상태 시작
        setAiLoading(roomId, true);
        setSseConnectionStatus('connecting');

        // SSE 스트리밍 요청 (fetch 사용)
        const userName = user?.username || user?.firstName || user?.fullName || user?.id;
        const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/sse`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: messageText,
            sender: user.id,
            userName: userName,
            timestamp: new Date().toISOString()
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setSseConnectionStatus('connected');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let aiResponse = '';

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            let chatId = null;
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6); // 'data: ' 제거

                if (data === '[DONE]') {
                  // AI 응답 완료
                  if (aiResponse.trim()) {
                    // 1대1 채팅에서는 첫 번째 AI 참여자의 정보를 사용
                    const aiParticipant = roomInfoParticipants.find(p => p.personaId);
                    addAiResponseToRoom(roomId, chatId, aiResponse.trim(), character?.id, aiParticipant?.name);
                  }
                  setAiLoading(roomId, false);
                  setSseConnectionStatus('disconnected');
                  return;
                } else {
                  try {
                    const parsedData = JSON.parse(data);
                    if (parsedData.type === 'text_chunk') {
                      aiResponse += parsedData.content;
                    }
                    else if (parsedData.type === 'message_saved') {
                      console.log('메시지가 저장되었습니다:', parsedData);
                      // console.log(`메시지 새로고침: ${parsedData.messageId}`, msg);
                      chatId = parsedData.chatLogId; // chatRoomId 변경
                      // chatRoomId 변경

                    }
                  } catch (e) {
                    // JSON 파싱 실패 시 무시
                  }
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
    } catch (error) {
        console.error('1대1 채팅 메시지 전송 실패:', error);
        setAiLoading(roomId, false);
        setSseConnectionStatus('error');
      }
    } else {
      // 그룹 채팅: WebSocket 사용
      if (socketRef.current) {
        const userName = user?.username || user?.firstName || user?.fullName || user?.id;
        socketRef.current.emit('sendMessage', {
          roomId,
          message: messageText,
          senderType: 'user',
          senderId: user.id,
          userName: userName,
          timestamp: new Date().toISOString()
        });
      }
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
      const imageMessage = `[이미지] ${data.imageUrl}`;

      // 사용자 이미지 메시지 추가
      addMessageToRoom(roomId, {
        id: uuidv4(),
        text: imageMessage,
        imageUrl: data.imageUrl,
        sender: 'me',
        time: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }),
        characterId: character?.id,
      });

      if (isOneOnOneChat) {
        // 1대1 채팅: SSE 사용
        try {
          const token = await getToken();
      setAiLoading(roomId, true);
          setSseConnectionStatus('connecting');

          // SSE 스트리밍 요청 (fetch 사용)
          const userName = user?.username || user?.firstName || user?.fullName || user?.id;
          const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/sse`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: imageMessage,
              sender: user.id,
              userName: userName,
              timestamp: new Date().toISOString()
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          setSseConnectionStatus('connected');

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let aiResponse = '';

      try {
            while (true) {
              const { done, value } = await reader.read();

              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6); // 'data: ' 제거

                  if (data === '[DONE]') {
                    // AI 응답 완료
                    if (aiResponse.trim()) {
                      addAiResponseToRoom(roomId, chatId, aiResponse.trim(), character?.id);
                    }
                    setAiLoading(roomId, false);
                    setSseConnectionStatus('disconnected');
                    return;
                  } else {
                    try {
                      const parsedData = JSON.parse(data);
                      if (parsedData.type === 'text_chunk') {
                        aiResponse += parsedData.content;
                      }
      } catch (e) {
                      // JSON 파싱 실패 시 무시
                    }
                  }
                }
              }
            }
      } finally {
            reader.releaseLock();
          }

        } catch (error) {
          console.error('1대1 채팅 이미지 메시지 전송 실패:', error);
        setAiLoading(roomId, false);
          setSseConnectionStatus('error');
        }
      } else {
        // 그룹 채팅: WebSocket 사용
        if (socketRef.current) {
          const userName = user?.username || user?.firstName || user?.fullName || user?.id;
          socketRef.current.emit('sendMessage', {
            roomId,
            message: imageMessage,
            senderType: 'user',
            senderId: user.id,
            senderName: userName,
            timestamp: new Date().toISOString()
          });
        }
      }
    } else {
      alert('이미지 업로드 실패');
    }
  };

  return (
    <NeonBackground className="flex flex-col h-full font-cyberpunk">
      {/* 헤더: sticky */}
      <header className="sticky top-0 py-4 px-6 z-50">
        <div className="flex items-center gap-3">
          {/* 여러 캐릭터 프로필 이미지 */}
          <div className="flex -space-x-2">
            {roomInfoParticipants.map((participant, index) => {
              const ai = myAIs.find(ai => String(ai.id) === String(participant.personaId));
              return (
                <div
                  key={participant.personaId}
                  className="w-9 h-9 rounded-full border-2 border-cyan-300 shadow-[0_0_4px_#0ff] relative cursor-pointer hover:scale-110 transition-transform"
                  style={{ zIndex: roomInfoParticipants.length - index }}
                  onClick={() => {
                    if (ai) {
                      setSelectedCharacter(ai);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (ai) {
                        setSelectedCharacter(ai);
                      }
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${ai?.name || 'AI'} 프로필 보기`}
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
          <div className="flex items-center gap-3">
          <span className="text-cyan-100 text-lg font-bold drop-shadow-[0_0_2px_#0ff] tracking-widest font-cyberpunk">
              {roomInfoParticipants.length > 1
                ? `${roomInfoParticipants.length}명의 AI와 대화`
                : roomInfoParticipants[0]
                  ? myAIs.find(ai => String(ai.id) === String(roomInfoParticipants[0].personaId))?.name || 'AI'
                  : '채팅방'
              }
            </span>
            {/* 연결 상태 표시 제거 */}
            {/* 레벨 박스 - 1대1 채팅에서만 표시 */}
            {isOneOnOneChat && roomInfoParticipants[0] && (
              <div className="flex gap-2">
                {/* LEVEL 박스 */}
                <div className="bg-white/20 border-2 border-yellow-400 rounded-lg px-3 py-1 text-center">
                  <div className="text-yellow-200 font-bold text-sm font-cyberpunk">
                    Lv.{roomInfoParticipants[0].friendship || 1}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
{/* 경험치 게이지 - 1대1 채팅에서만 표시 */}
{isOneOnOneChat && roomInfoParticipants[0] && (
  <div className="mt-2 flex justify-start ml-12">
    <div
      className="group w-48 h-5 bg-black/60 border-2 border-cyan-700 rounded-full shadow-[0_0_8px_#0ff] relative overflow-hidden cursor-pointer"
    >
      <div
        className="h-full bg-cyan-400"
        style={{
          width: `${Math.min(100, Math.round(((roomInfoParticipants[0].exp || 0) / getExpForNextLevel(roomInfoParticipants[0].friendship || 1)) * 100))}%`,
          boxShadow: '0 0 4px #0ff, 0 0 8px #0ff',
          transition: 'width 0.4s cubic-bezier(.4,2,.6,1)'
        }}
      />
      {/* 경험치 숫자 표시 - 마우스 오버시에만 보임 */}
      <div className="exp-tooltip absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
        <div className="text-cyan-300 text-xs font-cyberpunk font-bold drop-shadow-[0_0_2px_#000]">
          {roomInfoParticipants[0].exp || 0} / {getExpForNextLevel(roomInfoParticipants[0].friendship || 1)}
        </div>
      </div>
    </div>
  </div>
)}
      </header>
      {/* 스크롤 영역: 프로필 + 메시지 */}
      <div
        ref={scrollContainerRef}
        className="flex-1 px-4 overflow-y-auto no-scrollbar sm:px-6 md:px-8 lg:px-12 pb-28 font-cyberpunk relative z-1"
      >
        {/* 프로필 */}
        {isOneOnOneChat ? (
          /* 1대1 채팅: 간단한 캐릭터 설명만 표시 */
        <div className="flex flex-col items-center my-6 text-center font-cyberpunk">
            {roomInfoParticipants.length > 0 && (
              <div className="max-w-md mx-auto">
                <div className="flex flex-col items-center mb-4">
                  <div className="w-24 h-24 rounded-full border-2 border-cyan-300 shadow-[0_0_6px_#0ff] mb-3">
            <img
                      src={roomInfoParticipants[0].imageUrl}
                      alt={roomInfoParticipants[0].name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
                  <h2 className="text-xl text-cyan-100 font-bold drop-shadow-[0_0_2px_#0ff] tracking-widest mb-2">
                    {roomInfoParticipants[0].name}
                  </h2>
                </div>
                <p className="text-cyan-300 text-sm leading-relaxed tracking-wide text-center max-w-sm mx-auto">
                  {roomInfoParticipants[0].introduction ||
                   roomInfoParticipants[0].description ||
                   roomInfoParticipants[0].prompt?.personality ||
                   roomInfoParticipants[0].prompt ||
                   '안녕하세요! 함께 대화해요!'}
          </p>
        </div>
            )}
          </div>
        ) : (
          /* 단체 채팅: 기존 참여자 목록 표시 */
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
                    </div>
                    <span className="text-sm font-bold text-cyan-100 mb-2 drop-shadow-[0_0_2px_#0ff] tracking-widest font-cyberpunk">
                      {ai.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* 메시지들 */}
        <div className="space-y-4 pb-4 max-w-3xl mx-auto font-cyberpunk">
          {messages.map((msg, idx) => {
            // console.log(msg);
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
            return (<ChatMessageItem
              key={msg.id}
              msg={msg}
              showProfile={showProfile}
              showTime={showTime}
              profileImg={profileImg}
              displayName={displayName}
              isAI={isAI} // msg 객체에 senderType이 있다고 가정
              aiObj={aiObj} // AI 캐릭터 정보 객체
              aiColor={aiColor} // AI 말풍선 색상 설정
              roomId={roomId} // 현재 채팅방 ID 전달
              userId={user.id} // 현재 로그인한 사용자 ID 전달
              isLast={isLast} // 마지막 메시지 여부
          />)
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
      {/* 입력창: sticky bottom */}
      <footer className="fixed right-0 left-0 bottom-0 px-4 py-4 border-t-2 border-cyan-200 bg-black/30 glass backdrop-blur-xl shadow-[0_0_8px_#0ff,0_0_16px_#f0f] font-cyberpunk z-20">
        <div className="flex items-center space-x-3 max-w-4xl mx-auto relative font-cyberpunk">
          {/* 게임 버튼은 1:1 채팅에서만 표시 */}
          {isOneOnOneChat && (
            <div className="relative">
              <button
                className="text-cyan-400 hover:text-fuchsia-400 p-2 text-xl drop-shadow-[0_0_2px_#0ff] font-cyberpunk"
                aria-label="게임 메뉴"
                onClick={() => {
                  setShowAttachModal(false); // 다른 모달 닫기
                  setShowGameModal(v => !v);
                }}
              >
                <IoGameController />
              </button>
            {/* 게임 모달: 게임버튼 위에 작게 */}
            {showGameModal && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 bg-blue-900/50 border-2 border-cyan-200 rounded-xl shadow-[0_0_4px_#0ff] p-4 flex flex-col items-center w-64 animate-fadeIn font-cyberpunk">
                <div className="text-cyan-300 font-bold mb-3 text-lg drop-shadow-[0_0_2px_#0ff] tracking-widest">게임 선택</div>
                <div className="space-y-2 w-full">
                  {/* 10레벨 미만: 게임 버튼 숨김 */}
                  {(!roomInfoParticipants[0] || roomInfoParticipants[0].friendship < 10) && (
                    <div className="text-cyan-300 text-sm text-center py-2">
                      레벨 10 이상에서 게임이 열립니다
                    </div>
                  )}
                  {/* 10레벨 이상: 게임 버튼들 표시 */}
                  {roomInfoParticipants[0]?.friendship >= 10 && (
                    <>
                      {/* 끝말잇기 - 10레벨 이상에서 활성화 */}
                      <button
                        className="w-full bg-gradient-to-r from-cyan-200 to-fuchsia-200 hover:from-cyan-100 hover:to-fuchsia-100 text-[#1a1a2e] px-4 py-2 rounded-full font-cyberpunk font-bold transition-all shadow-[0_0_2px_#0ff]"
                        onClick={() => {
                          // 끝말잇기 게임 시작 메시지 전송
                          setNewMessage('[GAME:끝말잇기] 끝말잇기 게임을 시작하고 싶어요!');
                          setShowGameModal(false);
                          // 자동으로 메시지 전송
                          setTimeout(() => {
                            sendMessage();
                          }, 100);
                        }}
                      >
                        끝말잇기
                      </button>
                                        {/* 스무고개 - 20레벨 이상에서만 활성화, 그 전에는 회색 */}
                  <button
                    className={`w-full px-4 py-2 rounded-full font-cyberpunk font-bold transition-all ${
                      roomInfoParticipants[0]?.friendship >= 20
                        ? 'bg-gradient-to-r from-green-200 to-blue-200 hover:from-green-100 hover:to-blue-100 text-[#1a1a2e] shadow-[0_0_2px_#0ff]'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (roomInfoParticipants[0]?.friendship >= 20) {
                        // 스무고개 게임 시작 메시지 전송
                        setNewMessage('[GAME:스무고개] 스무고개 게임을 시작하고 싶어요!');
                        setShowGameModal(false);
                        // 자동으로 메시지 전송
                        setTimeout(() => {
                          sendMessage();
                        }, 100);
                      }
                    }}
                  >
                    {roomInfoParticipants[0]?.friendship >= 20 ? '스무고개' : '20Lv 이후 잠금해제'}
                  </button>
                  {/* 밸런스 게임 - 30레벨 이상에서만 활성화, 그 전에는 회색 */}
                  <button
                    className={`w-full px-4 py-2 rounded-full font-cyberpunk font-bold transition-all ${
                      roomInfoParticipants[0]?.friendship >= 30
                        ? 'bg-gradient-to-r from-purple-200 to-pink-200 hover:from-purple-100 hover:to-pink-100 text-[#1a1a2e] shadow-[0_0_2px_#0ff]'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (roomInfoParticipants[0]?.friendship >= 30) {
                        // 밸런스 게임 시작 메시지 전송
                        setNewMessage('[GAME:밸런스게임] 밸런스 게임을 시작하고 싶어요!');
                        setShowGameModal(false);
                        // 자동으로 메시지 전송
                        setTimeout(() => {
                          sendMessage();
                        }, 100);
                      }
                    }}
                  >
                    {roomInfoParticipants[0]?.friendship >= 30 ? '밸런스 게임' : '30Lv 이후 잠금해제'}
                  </button>
                    </>
                  )}
                </div>
                <button
                  className="mt-3 text-cyan-400 hover:text-fuchsia-400 font-cyberpunk font-bold text-base transition-colors"
                  onClick={() => setShowGameModal(false)}
                >
                  닫기
                </button>
              </div>
            )}
          </div>
          )}
          <div className="relative">
            <button
              className="text-cyan-400 hover:text-fuchsia-400 p-2 text-xl drop-shadow-[0_0_2px_#0ff] font-cyberpunk"
              aria-label="파일 첨부"
              onClick={() => {
                setShowGameModal(false); // 다른 모달 닫기
                setShowAttachModal(v => !v);
              }}
            >
              <FiPaperclip />
            </button>
            {/* 첨부 모달: 클립버튼 위에 작게 */}
            {showAttachModal && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 bg-blue-900/50 border-2 border-cyan-200 rounded-xl shadow-[0_0_4px_#0ff] p-4 flex flex-col items-center w-56 animate-fadeIn font-cyberpunk">
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
          <div className="flex-1 flex items-center space-x-2 bg-cyan-100/60 glass border-2 border-cyan-200 rounded-full px-4 py-2.5 font-cyberpunk focus-within:bg-cyan-100/80 focus-within:border-fuchsia-200 transition-all shadow-[0_0_4px_#0ff]">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="w-full bg-transparent border-none outline-none text-white placeholder-cyan-400 font-cyberpunk tracking-widest"
              disabled={aiResponseLoading}
            />

          </div>
          <button
            onClick={sendMessage}
            className="bg-cyan-200 hover:bg-fuchsia-200 text-[#1a1a2e] w-10 h-10 flex items-center justify-center rounded-full transition-colors text-xl shadow-[0_0_3px_#0ff] font-cyberpunk"
            disabled={aiResponseLoading || !newMessage.trim()} // AI 로딩 중이거나 메시지가 비어있으면 비활성화
          >
            ➤
          </button>
        </div>
      </footer>

      {/* 캐릭터 프로필 모달 */}
      {selectedCharacter && (
        <CharacterProfile
          character={selectedCharacter}
          liked={false}
          origin="chat"
          onClose={() => setSelectedCharacter(null)}
          onLikeToggle={() => {}} // 빈 함수로 설정하여 버튼 비활성화
          onEdit={() => {}} // 빈 함수로 설정하여 버튼 비활성화
        />
      )}
    </NeonBackground>
  );
};

export default ChatMate;
