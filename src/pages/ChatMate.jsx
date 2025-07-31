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
import TypingIndicator from '../components/TypingIndicator';
import './ChatMate.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SOCKET_URL = 'http://localhost:3001';

// AI별 네온 컬러 팔레트
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

// 레벨 계산 함수 (백엔드와 동일한 로직 - 30레벨 시스템)
function getLevel(exp) {
  if (exp < 10) return 1;
  const level = Math.floor((-1 + Math.sqrt(1 + 8 * exp / 10)) / 2) + 1;
  return Math.min(level, 30);
}

// 다음 레벨까지 필요한 경험치 계산
function getExpForNextLevel(level) {
  return Math.floor((level * (level + 1) / 2) * 10);
}

// 현재 레벨의 시작 경험치 계산
function getExpBase(level) {
  return Math.floor(((level - 1) * level / 2) * 10);
}

// 현재 레벨에서 필요한 경험치 계산
function getExpForCurrentLevel(level) {
  return level * 10;
}

// 경험치 게이지 컴포넌트
function LevelExpGauge({ exp, friendship }) {
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

const ChatMate = () => {
  const { state } = useLocation();
  const { roomId } = useParams();
  const { user } = useUser();
  const { getToken } = useAuth();

  // 전역 메시지 Context 사용
  const {
    allMessages,
    getMessages,
    getMessage,
    setMessagesForRoom,
    addMessageToRoom,
    addAiResponseToRoom,
    getAiLoading,
    setAiLoading,
    updateStreamingAiMessage,
    removeLoadingMessage
  } = useChatMessages();

  // 상태 관리
  const [participants, setParticipants] = useState([]);
  const { characters: myAIs, loading: aiLoading, fetchMyCharacters } = useMyCharacters('created');
  const [roomInfoParticipants, setRoomInfoParticipants] = useState([]);
  const [isOneOnOneChat, setIsOneOnOneChat] = useState(false);
  const [sseConnectionStatus, setSseConnectionStatus] = useState('disconnected');
  const [character, setCharacter] = useState(state?.character || null);
  const [loading, setLoading] = useState(!state?.character && !!roomId);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // refs
  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isInitialMount = useRef(true);
  const hasSentInitialGreeting = useRef(false);
  const fileInputRef = useRef(null);
  const sseRef = useRef(null);

  // 현재 채팅방의 메시지와 AI 로딩 상태
  const messages = getMessages(roomId);
  const aiResponseLoading = getAiLoading(roomId);
  console.log('🔍 [ChatMate] aiResponseLoading 상태:', { roomId, aiResponseLoading });

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

  // 🆕 사이드바 채팅방 전환 감지: state 변경 시 상태 업데이트
  useEffect(() => {
    if (state?.character) {
      setCharacter(state.character);
      setError(null);
      setLoading(false);

      const newChatHistory = state.chatHistory || [];
      if (newChatHistory.length > 0) {
        const convertedMessages = convertChatHistoryToMessages(newChatHistory, state.character);
        setMessagesForRoom(roomId, convertedMessages);
      } else {
        setMessagesForRoom(roomId, []);
      }
      if (state.participants && Array.isArray(state.participants)) {
        setParticipants(state.participants);
      }
    }
  }, [state?.character, state?.chatHistory, roomId]);

  // roomId가 변경될 때 인사 플래그 리셋
  useEffect(() => {
    console.log('🔄 [ChatMate2] roomId 변경 감지!');
    hasSentInitialGreeting.current = false;
  }, [roomId]);

  // room-info API 호출 (채팅방 정보 및 참여자 목록 조회)
  useEffect(() => {
    if (!roomId || !getToken) return;
    
    (async () => {
      try {
        console.log('🔍 [room-info] API 호출 시작 - roomId:', roomId);
        const token = await getToken();
        const response = await fetch(`${API_BASE_URL}/chat/room-info?roomId=${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        console.log('🔍 [room-info] API 응답:', JSON.stringify(data, null, 2));
        
        if (data.success && data.data && (data.data.character || data.data.persona)) {
          const characterData = data.data.character || data.data.persona;
          console.log('🔍 [room-info] 사용할 캐릭터 데이터:', characterData);
          setCharacter(characterData);
          setRoomInfoParticipants(data.data.participants || []);
          setParticipants(data.data.participants || []);

          const isOneOnOne = data.data.isOneOnOne || false;
          console.log('🔍 [room-info] isOneOnOne 값:', isOneOnOne);
          setError(null);
          setIsOneOnOneChat(isOneOnOne);

          const chatHistory = data.data.chatHistory || [];
          console.log('🔍 [room-info] chatHistory 길이:', chatHistory.length);
          
          if (chatHistory.length > 0) {
            console.log('🔍 [room-info] chatHistory 샘플:', chatHistory[0]);
            const convertedMessages = convertChatHistoryToMessages(chatHistory, characterData);
            console.log('🔍 [room-info] 변환된 메시지 수:', convertedMessages.length);
            setMessagesForRoom(roomId, convertedMessages);
          } else {
            console.log('🔍 [room-info] 채팅 기록 없음 - 빈 배열로 초기화');
            setMessagesForRoom(roomId, []);
          }
        } else {
          console.error('🚨 [room-info] 조건 실패:', data);
          setError('존재하지 않거나 삭제된 채팅방입니다.');
        }
      } catch (error) {
        console.error('🚨 [room-info] API 호출 실패:', error);
        setError('존재하지 않거나 삭제된 채팅방입니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [roomId, getToken]);

  // 1대1 채팅용 WebSocket 연결 (친밀도 업데이트용)
  useEffect(() => {
    if (!roomId || !user || !isOneOnOneChat) return;

    console.log('🔌 1대1 채팅 WebSocket 연결 시작 (친밀도 업데이트용):', { roomId, userId: user.id, isOneOnOneChat });

    const friendshipSocket = io(SOCKET_URL, { transports: ['websocket'] });
    friendshipSocket.emit('joinRoom', { roomId, userId: user.id });
    console.log('📡 1대1 채팅 joinRoom 이벤트 전송:', { roomId, userId: user.id });

    friendshipSocket.on('expUpdated', (data) => {
      console.log('🔔 1대1 채팅 expUpdated 이벤트 수신:', data);

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

      if (fetchMyCharacters) {
        console.log('🔄 캐릭터 목록 새로고침 중...');
        fetchMyCharacters('created').then(() => {
          console.log('✅ 캐릭터 목록 새로고침 완료');
        }).catch(error => {
          console.error('❌ 캐릭터 목록 새로고침 실패:', error);
        });
      }
    });

    return () => {
      console.log('🔌 1대1 채팅 WebSocket 연결 해제:', { roomId, userId: user.id });
      friendshipSocket.emit('leaveRoom', { roomId, userId: user.id });
      friendshipSocket.disconnect();
    };
  }, [roomId, user, isOneOnOneChat, fetchMyCharacters]);

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

  // 올바른 아키텍처: 메시지 전송과 AI 응답 수신 분리
  const sendMessage = async () => {
    if (!newMessage.trim() || aiResponseLoading) return;
    const messageText = newMessage.trim();
    setNewMessage('');

    console.log('🔍 [sendMessage] 메시지 전송 시작:', { roomId, messageText, isOneOnOneChat });

    if (isOneOnOneChat) {
      // 1대1 채팅: SSE 사용
      console.log('🔍 [sendMessage] 1대1 채팅 모드 - /chat/rooms/${roomId}/sse 호출');
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

        // AI 로딩 메시지 추가 (TypingIndicator용)
        const loadingMessageId = uuidv4();
        const loadingMessage = {
          id: loadingMessageId,
          text: '...',
          sender: 'ai',
          aiId: character?.id ? String(character.id) : undefined,
          aiName: character?.name || 'Unknown AI',
          imageUrl: null, // 로딩 메시지는 imageUrl을 가지지 않음
          time: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }),
          characterId: character?.id,
          isStreaming: true,
        };
        addMessageToRoom(roomId, loadingMessage);

        // SSE 스트리밍 요청
        const userName = user?.username || user?.firstName || user?.fullName || user?.id;
        
        const requestUrl = `${API_BASE_URL}/chat/rooms/${roomId}/sse`;
        const requestBody = {
          message: messageText,
          sender: user.id,
          userName: userName,
          timestamp: new Date().toISOString()
        };
        
        console.log('🔍 [1대1채팅] 요청 URL:', requestUrl);
        console.log('🔍 [1대1채팅] 요청 body:', requestBody);
        
        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        
        console.log('🔍 [1대1채팅] fetch 응답:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
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

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  console.log('🔍 [1대1채팅] [DONE] 신호 수신');
                  setAiLoading(roomId, false);
                  setSseConnectionStatus('disconnected');
                  return;
                } else {
                  try {
                    const parsedData = JSON.parse(data);
                    if (parsedData.type === 'ai_response' || parsedData.type === 'ai_message') {
                      aiResponse = parsedData.message || parsedData.content;
                      console.log('🔍 [1대1채팅] AI 응답 수신:', { 
                        aiId: parsedData.aiId, 
                        aiIdType: typeof parsedData.aiId,
                        characterId: character?.id,
                        characterIdType: typeof character?.id
                      });
                      
                      // AI 응답 메시지 추가
                      addMessageToRoom(roomId, {
                        id: uuidv4(),
                        text: aiResponse,
                        sender: 'ai',
                        aiId: parsedData.aiId ? String(parsedData.aiId) : undefined,
                        aiName: parsedData.aiName ? String(parsedData.aiName) : undefined,
                        imageUrl: null, // 프로필 이미지는 imageUrl에 저장하지 않음
                        time: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }),
                        characterId: parsedData.aiId || character?.id,
                      });
                      
                      // 로딩 메시지 제거
                      console.log('🔍 [1대1채팅] removeLoadingMessage 호출:', { 
                        roomId, 
                        aiId: parsedData.aiId, 
                        characterId: character?.id,
                        finalAiId: parsedData.aiId || character?.id 
                      });
                      removeLoadingMessage(roomId, parsedData.aiId || character?.id);
                    } else if (parsedData.type === 'complete') {
                      console.log('🔍 [1대1채팅] 완료 신호 수신');
                      console.log('🔍 [1대1채팅] AI 로딩 상태 해제:', { roomId, currentLoadingState: getAiLoading(roomId) });
                      setAiLoading(roomId, false);
                      setSseConnectionStatus('disconnected');
                      return;
                    }
                  } catch (e) {
                    console.log('🔍 [1대1채팅] JSON 파싱 실패:', e.message);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('🚨 [1대1채팅] SSE 스트리밍 오류:', error);
          setAiLoading(roomId, false);
          setSseConnectionStatus('error');
        } finally {
          reader.releaseLock();
        }
      } catch (error) {
        console.error('🚨 [1대1채팅] 메시지 전송 실패:', error);
        setAiLoading(roomId, false);
        setSseConnectionStatus('error');
      }
    } else {
      // 그룹 채팅: SSE 사용
      console.log('🔍 [sendMessage] 그룹 채팅 모드 - /chat/rooms/${roomId}/sse 호출');
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

        // 각 AI별 로딩 메시지 추가
        const loadingMessageIds = [];
        if (roomInfoParticipants && roomInfoParticipants.length > 0) {
          roomInfoParticipants.forEach((participant, index) => {
            const loadingMessageId = uuidv4();
            loadingMessageIds.push(loadingMessageId);
            console.log('🔍 [그룹채팅] 로딩 메시지 생성:', { 
              participantId: participant.id, 
              participantName: participant.name,
              aiId: participant.id ? String(participant.id) : undefined 
            });
            const loadingMessage = {
              id: loadingMessageId,
              text: '...',
              sender: 'ai',
              aiId: participant.id ? String(participant.id) : undefined,
              aiName: participant.name || 'Unknown AI',
              imageUrl: null, // 로딩 메시지는 imageUrl을 가지지 않음
              time: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }),
              characterId: participant.id,
              isStreaming: true,
            };
            addMessageToRoom(roomId, loadingMessage);
          });
        }

        // SSE 스트리밍 요청
        const userName = user?.username || user?.firstName || user?.fullName || user?.id;
        
        const requestUrl = `${API_BASE_URL}/chat/rooms/${roomId}/sse`;
        const requestBody = {
          message: messageText,
          sender: user.id,
          userName: userName,
          timestamp: new Date().toISOString()
        };
        
        console.log('🔍 [그룹채팅] 요청 URL:', requestUrl);
        console.log('🔍 [그룹채팅] 요청 body:', requestBody);
        
        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        
        console.log('🔍 [그룹채팅] fetch 응답:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setSseConnectionStatus('connected');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            console.log('🔍 [그룹채팅] 분할된 라인 수:', lines.length);

            for (const line of lines) {
              console.log('🔍 [그룹채팅] 처리 중인 라인:', JSON.stringify(line));
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                console.log('🔍 [그룹채팅] 추출된 data:', JSON.stringify(data));

                if (data === '[DONE]') {
                  console.log('🔍 [그룹채팅] [DONE] 신호 수신 - 스트리밍 종료');
                  setAiLoading(roomId, false);
                  setSseConnectionStatus('disconnected');
                  return;
                } else {
                  try {
                    const parsedData = JSON.parse(data);
                    console.log('🔍 [그룹채팅] 수신된 데이터:', parsedData);
                    console.log('🔍 [그룹채팅] 메시지 타입:', parsedData.type);
                    
                    if (parsedData.type === 'ai_message' || parsedData.type === 'ai_response') {
                      console.log('🔍 [그룹채팅] AI 메시지 추가:', parsedData);
                      console.log('🔍 [그룹채팅] AI ID 비교:', { 
                        receivedAiId: parsedData.aiId, 
                        receivedAiIdType: typeof parsedData.aiId,
                        roomInfoParticipants: roomInfoParticipants.map(p => ({ id: p.id, name: p.name }))
                      });
                      
                      addMessageToRoom(roomId, {
                        id: uuidv4(),
                        text: parsedData.message || parsedData.content,
                        sender: 'ai',
                        aiId: parsedData.aiId ? String(parsedData.aiId) : undefined,
                        aiName: parsedData.aiName ? String(parsedData.aiName) : undefined,
                        imageUrl: null, // 프로필 이미지는 imageUrl에 저장하지 않음
                        time: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }),
                        characterId: parsedData.aiId,
                      });
                      console.log('🔍 [그룹채팅] removeLoadingMessage 호출:', { 
                        roomId, 
                        aiId: parsedData.aiId 
                      });
                      removeLoadingMessage(roomId, parsedData.aiId);
                      
                      const remainingLoadingMessages = getMessages(roomId).filter(msg => 
                        msg.isStreaming && msg.sender === 'ai'
                      );
                      console.log('🔍 [그룹채팅] 남은 로딩 메시지 확인:', {
                        totalMessages: getMessages(roomId).length,
                        loadingMessages: remainingLoadingMessages.length,
                        loadingMessageDetails: remainingLoadingMessages.map(msg => ({
                          id: msg.id,
                          aiId: msg.aiId,
                          text: msg.text,
                          isStreaming: msg.isStreaming
                        }))
                      });
                      if (remainingLoadingMessages.length === 0) {
                        console.log('🔍 [그룹채팅] 모든 AI 응답 완료 - 로딩 상태 해제');
                        setAiLoading(roomId, false);
                        setSseConnectionStatus('disconnected');
                      }
                    } else if (parsedData.type === 'exp_updated') {
                      console.log('🔍 [그룹채팅] 친밀도 업데이트:', parsedData);
                    } else if (parsedData.type === 'complete') {
                      console.log('🔍 [그룹채팅] 완료 신호 수신');
                      console.log('🔍 [그룹채팅] AI 로딩 상태 해제:', { roomId, currentLoadingState: getAiLoading(roomId) });
                      setAiLoading(roomId, false);
                      setSseConnectionStatus('disconnected');
                      return;
                    } else if (parsedData.type === 'user_message') {
                      console.log('🔍 [그룹채팅] 사용자 메시지 echo 수신 (무시):', parsedData);
                    } else if (parsedData.type === 'text_chunk') {
                      console.log('🔍 [그룹채팅] 텍스트 chunk 수신:', parsedData);
                    } else {
                      console.log('🔍 [그룹채팅] 알 수 없는 메시지 타입:', parsedData.type, parsedData);
                    }
                  } catch (e) {
                    console.log('🔍 [그룹채팅] JSON 파싱 실패:', e.message);
                    console.log('🔍 [그룹채팅] 파싱 실패한 데이터:', data);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('🚨 [그룹채팅] SSE 스트리밍 오류:', error);
          setAiLoading(roomId, false);
          setSseConnectionStatus('error');
        } finally {
          reader.releaseLock();
        }
      } catch (error) {
        console.error('🚨 [sendMessage] 실패:', error);
        
        addMessageToRoom(roomId, {
          id: uuidv4(),
          text: `오류: ${error.message}`,
          sender: 'system',
          time: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }),
          isError: true
        });
        
        setAiLoading(roomId, false);
        setSseConnectionStatus('error');
      }
    }
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !aiResponseLoading) sendMessage();
  };

  // 이미지 업로드 함수
  const handleImageUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    
    const res = await fetch(`${API_BASE_URL}/chat/upload-image`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.success && data.imageUrl) {
      const imageMessage = `[이미지] ${data.imageUrl}`;

      addMessageToRoom(roomId, {
        id: uuidv4(),
        text: imageMessage,
        imageUrl: data.imageUrl,
        sender: 'me',
        time: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }),
        characterId: character?.id,
      });

      if (isOneOnOneChat) {
        try {
          const token = await getToken();
          setAiLoading(roomId, true);
          setSseConnectionStatus('connecting');

          const loadingMessageId = uuidv4();
          const loadingMessage = {
            id: loadingMessageId,
            text: '...',
            sender: 'ai',
            aiId: character?.id ? String(character.id) : undefined,
            aiName: character?.name || 'Unknown AI',
            imageUrl: character?.imageUrl || null,
            time: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }),
            characterId: character?.id,
            isStreaming: true,
          };
          addMessageToRoom(roomId, loadingMessage);

          console.log('🔍 [handleImageUpload] 통합 SSE API 호출...');
          setAiLoading(roomId, true);
          setSseConnectionStatus('connecting');

          const userName = user?.username || user?.firstName || user?.fullName || user?.id;
          const sseResponse = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/send`, {
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

          if (!sseResponse.ok) {
            throw new Error(`이미지 통합 SSE API 실패: ${sseResponse.status}`);
          }

          setSseConnectionStatus('connected');
          console.log('✅ [handleImageUpload] 통합 SSE API 연결 성공');

          const reader = sseResponse.body.getReader();
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
                  const data = line.slice(6);
                  console.log('🔍 [이미지업로드] 추출된 data:', JSON.stringify(data));

                  if (data === '[DONE]') {
                    if (aiResponse.trim()) {
                      addAiResponseToRoom(roomId, uuidv4(), aiResponse.trim(), character?.id);
                      removeLoadingMessage(roomId, character?.id);
                    }
                    setAiLoading(roomId, false);
                    setSseConnectionStatus('disconnected');
                    return;
                  } else {
                    try {
                      const parsedData = JSON.parse(data);
                      if (parsedData.type === 'text_chunk') {
                        aiResponse += parsedData.content;
                        updateStreamingAiMessage(roomId, loadingMessageId, aiResponse, false);
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
          console.error('🚨 [handleImageUpload] 이미지 메시지 처리 실패:', error);
          setAiLoading(roomId, false);
          setSseConnectionStatus('error');
        }
      }
    } else {
      alert('이미지 업로드 실패');
    }
  };

  // 조건부 렌더링은 모든 Hook 선언 이후에 위치해야 함
  if (loading) return <div className="text-white p-8">캐릭터 정보를 불러오는 중...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;
  if (!character) return null;

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
                    // participant에 직접 캐릭터 정보가 있으면 사용, 없으면 myAIs에서 찾기
                    const characterInfo = participant.name ? participant : ai;
                    if (characterInfo) {
                      setSelectedCharacter(characterInfo);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const characterInfo = participant.name ? participant : ai;
                      if (characterInfo) {
                        setSelectedCharacter(characterInfo);
                      }
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${participant.name || ai?.name || 'AI'} 프로필 보기`}
                >
                  <img
                    src={participant.imageUrl || ai?.imageUrl || '/assets/icon-character.png'}
                    alt={participant.name || ai?.name || `AI#${participant.personaId}`}
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
                  ? roomInfoParticipants[0].name || myAIs.find(ai => String(ai.id) === String(roomInfoParticipants[0].personaId))?.name || 'AI'
                  : '채팅방'
              }
            </span>
            {/* 레벨 박스 - 1대1 채팅에서만 표시 */}
            {isOneOnOneChat && roomInfoParticipants[0] && (
              <div className="flex gap-2">
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
            <div className="group w-48 h-5 bg-black/60 border-2 border-cyan-700 rounded-full shadow-[0_0_8px_#0ff] relative overflow-hidden cursor-pointer">
              <div
                className="h-full bg-cyan-400"
                style={{
                  width: `${Math.min(100, Math.round(((roomInfoParticipants[0].exp || 0) / getExpForNextLevel(roomInfoParticipants[0].friendship || 1)) * 100))}%`,
                  boxShadow: '0 0 4px #0ff, 0 0 8px #0ff',
                  transition: 'width 0.4s cubic-bezier(.4,2,.6,1)'
                }}
              />
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
            <div className="mb-6">
              <span className="text-lg text-cyan-300 font-bold drop-shadow-[0_0_2px_#0ff] tracking-widest">참여자 목록</span>
            </div>
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
            const isAI = msg.sender === 'ai';
            const aiObj = isAI ? roomInfoParticipants.find(ai => String(ai.id) === String(msg.aiId)) : null;
            const profileImg = msg.sender === 'me'
              ? user?.imageUrl || '/assets/icon-character.png'
              : isAI
                ? (aiObj?.imageUrl || '/assets/icon-character.png')
                : '/assets/icon-character.png';
            const displayName = msg.sender === 'me'
              ? user?.username || user?.firstName || 'You'
              : isAI
                ? (msg.aiName || aiObj?.name || `Unknown AI#${msg.aiId}`)
                : 'Unknown';
            const aiColorIdx = isAI ? getAiColorIdx(msg.aiId) : 0;
            const aiColor = isAI ? AI_NEON_COLORS[aiColorIdx] : null;
            const isLast = idx === messages.length - 1;
            const nextMsg = messages[idx + 1];
            const prevMsg = messages[idx - 1];
            const showTime = isLast || msg.time !== nextMsg?.time || msg.sender !== nextMsg?.sender;
            const showProfile = (idx === 0 || msg.time !== prevMsg?.time || msg.sender !== prevMsg?.sender || 
                              (msg.sender === 'ai' && prevMsg?.sender === 'ai' && msg.aiId !== prevMsg?.aiId)) && 
                              !(msg.sender === 'ai' && msg.isStreaming && msg.text === '...');
            
            return (
              <ChatMessageItem
                key={msg.id}
                msg={msg}
                showProfile={showProfile}
                showTime={showTime}
                profileImg={profileImg}
                displayName={displayName}
                isAI={isAI}
                aiObj={aiObj}
                aiColor={aiColor}
                roomId={roomId}
                userId={user.id}
                isLast={isLast}
              />
            );
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
                  setShowAttachModal(false);
                  setShowGameModal(v => !v);
                }}
              >
                <IoGameController />
              </button>
              {/* 게임 모달 */}
              {showGameModal && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 bg-blue-900/50 border-2 border-cyan-200 rounded-xl shadow-[0_0_4px_#0ff] p-4 flex flex-col items-center w-64 font-cyberpunk animate-fadeIn">
                  <div className="text-cyan-300 font-bold mb-3 text-lg drop-shadow-[0_0_2px_#0ff] tracking-widest">게임 선택</div>
                  <div className="space-y-2 w-full">
                    {(!roomInfoParticipants[0] || roomInfoParticipants[0].friendship < 1) && (
                      <div className="text-cyan-300 text-sm text-center py-2">
                        레벨 10 이상에서 게임이 열립니다
                      </div>
                    )}
                    {roomInfoParticipants[0]?.friendship >= 1 && (
                      <>
                        <button
                          className="w-full bg-gradient-to-r from-cyan-200 to-fuchsia-200 hover:from-cyan-100 hover:to-fuchsia-100 text-[#1a1a2e] px-4 py-2 rounded-full font-cyberpunk font-bold transition-all shadow-[0_0_2px_#0ff]"
                          onClick={() => {
                            setNewMessage('[GAME:끝말잇기] 끝말잇기 게임을 시작하고 싶어요!');
                            setShowGameModal(false);
                            setTimeout(() => {
                              sendMessage();
                            }, 100);
                          }}
                        >
                          끝말잇기
                        </button>
                        <button
                          className={`w-full px-4 py-2 rounded-full font-cyberpunk font-bold transition-all ${
                            roomInfoParticipants[0]?.friendship >= 2
                              ? 'bg-gradient-to-r from-green-200 to-blue-200 hover:from-green-100 hover:to-blue-100 text-[#1a1a2e] shadow-[0_0_2px_#0ff]'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                          onClick={() => {
                            if (roomInfoParticipants[0]?.friendship >= 2) {
                              setNewMessage('[GAME:스무고개] 스무고개 게임을 시작하고 싶어요!');
                              setShowGameModal(false);
                              setTimeout(() => {
                                sendMessage();
                              }, 100);
                            }
                          }}
                        >
                          {roomInfoParticipants[0]?.friendship >= 2 ? '스무고개' : '2Lv 이후 잠금해제'}
                        </button>
                        <button
                          className={`w-full px-4 py-2 rounded-full font-cyberpunk font-bold transition-all ${
                            roomInfoParticipants[0]?.friendship >= 3
                              ? 'bg-gradient-to-r from-purple-200 to-pink-200 hover:from-purple-100 hover:to-pink-100 text-[#1a1a2e] shadow-[0_0_2px_#0ff]'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                          onClick={() => {
                            if (roomInfoParticipants[0]?.friendship >= 3) {
                              setNewMessage('[GAME:밸런스게임] 밸런스 게임을 시작하고 싶어요!');
                              setShowGameModal(false);
                              setTimeout(() => {
                                sendMessage();
                              }, 100);
                            }
                          }}
                        >
                          {roomInfoParticipants[0]?.friendship >= 3 ? '밸런스 게임' : '3Lv 이후 잠금해제'}
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
                setShowGameModal(false);
                setShowAttachModal(v => !v);
              }}
            >
              <FiPaperclip />
            </button>
            {/* 첨부 모달 */}
            {showAttachModal && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 bg-blue-900/50 border-2 border-cyan-200 rounded-xl shadow-[0_0_4px_#0ff] p-4 flex flex-col items-center w-56 font-cyberpunk animate-fadeIn">
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
            disabled={aiResponseLoading || !newMessage.trim()}
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
          onLikeToggle={() => {}}
          onEdit={() => {}}
        />
      )}
    </NeonBackground>
  );
};

export default ChatMate; 