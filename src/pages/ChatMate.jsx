import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useSendMessageToAI } from '../data/chatMessages'; // 경로 확인
import { useUser, useAuth } from '@clerk/clerk-react';
import { useChatMessages } from '../contexts/ChatMessagesContext'; // 경로 확인
import { FiPaperclip } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- Level/Exp Gauge Components (변경 없음) ---
function getLevel(exp) {
  if (exp >= 7) return 5;
  if (exp >= 4) return 4;
  if (exp >= 2) return 3;
  if (exp >= 1) return 2;
  return 1;
}
function getExpForNextLevel(level) {
  return [0, 1, 2, 3, 4][level] || 0;
}
function getExpBase(level) {
  return [0, 0, 1, 2, 4][level] || 0;
}
function LevelExpGauge({ exp }) {
  const level = getLevel(exp);
  const expBase = getExpBase(level);
  const expNext = getExpForNextLevel(level);
  const expInLevel = exp - expBase;
  const expMax = expNext;
  const percent = expMax ? Math.min(100, Math.round((expInLevel / expMax) * 100)) : 100;
  return (
    <>
      <div className="flex gap-4 items-center text-cyan-200 font-bold font-cyberpunk text-sm tracking-widest">
        <span>레벨: {level}</span>
        <span>친밀도: {exp}</span>
      </div>
      <div className="w-48 h-5 bg-black/60 border-2 border-cyan-700 rounded-full shadow-[0_0_8px_#0ff] relative overflow-hidden">
        <div
          className="h-full bg-cyan-400"
          style={{
            width: `${percent}%`,
            boxShadow: '0 0 8px #0ff, 0 0 16px #0ff',
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

const ChatMate = () => {
  const { state } = useLocation();
  const { roomId } = useParams();
  const { user } = useUser();
  const { getToken } = useAuth();

  // useSendMessageToAI 훅: sendMessageToAI 함수와 에러 상태를 가져옴
  const { sendMessage: sendMessageToAI, error: aiError } = useSendMessageToAI();

  // 전역 메시지 Context 사용
  const {
    getMessages,
    setMessagesForRoom,
    addMessageToRoom,
    // addAiResponseToRoom 대신 스트리밍 중 업데이트하는 방식으로 변경
    updateStreamingAiMessage, // ⭐ 새로 추가할 함수
    finishStreamingAiMessage, // ⭐ 새로 추가할 함수
    addVideoMessageToRoom,    // ⭐ 새로 추가할 함수
    getAiLoading,
    setAiLoading
  } = useChatMessages();

  // 이전 대화기록을 메시지 형식으로 변환하는 함수
  const convertChatHistoryToMessages = useCallback((chatHistory, characterData) => {
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
        characterId: characterData?.characterId || characterData?.id,
        // 이미지가 있다면 imageUrl 추가
        imageUrl: item.type === 'video' ? item.text : undefined // 백엔드에서 type: 'video'로 오고 text가 URL이라면
      };
      // 실제 비디오 URL이 text에 포함되어 있다면 videoType으로 구분하여 저장
      if (item.type === 'video' && item.text) {
        convertedMessage.type = 'video';
      }
      console.log('💬 변환된 메시지:', convertedMessage);
      return convertedMessage;
    });
  }, []); // 의존성 없음

  // 캐릭터 정보 상태
  const [character, setCharacter] = useState(state?.character || null);
  const [loading, setLoading] = useState(!state?.character && !!roomId);
  const [error, setError] = useState(null);

  // 메시지 상태 (전역 Context에서 관리)
  const [newMessage, setNewMessage] = useState('');

  // 현재 채팅방의 메시지와 AI 로딩 상태
  const messages = getMessages(roomId);
  const aiLoading = getAiLoading(roomId);

  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isInitialMount = useRef(true);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const fileInputRef = useRef(null);

  // 🆕 사이드바 채팅방 전환 감지: state 변경 시 상태 업데이트
  useEffect(() => {
    console.log('🔄 [채팅방 전환 감지] state 변경됨');
    console.log('🔍 새로운 state?.character:', state?.character);
    console.log('🔍 새로운 state?.chatHistory 길이:', state?.chatHistory?.length || 0);

    if (state?.character) {
      console.log('✅ 새로운 채팅방 데이터로 상태 업데이트');

      // 캐릭터 정보 업데이트
      setCharacter(state.character);
      setError(null);
      setLoading(false);

      // 메시지 히스토리를 전역 Context에 저장
      const newChatHistory = state.chatHistory || [];
      if (newChatHistory.length > 0) {
        console.log('✅ 새로운 채팅 히스토리 변환 시작');
        const convertedMessages = convertChatHistoryToMessages(newChatHistory, state.character);
        console.log('✅ 새로운 메시지 변환 완료:', convertedMessages);
        setMessagesForRoom(roomId, convertedMessages);
      } else {
        console.log('❌ 새로운 채팅방에 히스토리 없음, 메시지 초기화');
        setMessagesForRoom(roomId, []);
      }
    }
  }, [state?.character, state?.chatHistory, roomId, convertChatHistoryToMessages, setMessagesForRoom]); // 의존성 추가

  // 채팅방 입장 시 캐릭터 정보 fetch (state가 있든 없든 항상 최신값으로)
  useEffect(() => {
    if (roomId) {
      setLoading(true);
      (async () => {
        const token = await getToken();
        fetch(`${API_BASE_URL}/chat/room-info?roomId=${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
          .then(res => res.json())
          .then(data => {
            console.log('[room-info] API 응답:', data);
            if (data.success && data.data && data.data.character) {
              console.log('[room-info] setCharacter 호출: exp:', data.data.character.exp, 'friendship:', data.data.character.friendship, '전체:', data.data.character);
              setCharacter(data.data.character);
              // 초기 로드시 chatHistory도 함께 로드하여 메시지 상태 업데이트
              if (data.data.chatHistory) {
                const convertedMessages = convertChatHistoryToMessages(data.data.chatHistory, data.data.character);
                setMessagesForRoom(roomId, convertedMessages);
              }
            } else {
              setError('존재하지 않거나 삭제된 채팅방입니다.');
            }
          })
          .catch((err) => {
            console.error('room-info fetch error:', err);
            setError('존재하지 않거나 삭제된 채팅방입니다.');
          })
          .finally(() => setLoading(false));
      })();
    }
  }, [roomId, getToken, convertChatHistoryToMessages, setMessagesForRoom]); // 의존성 추가

  // 첫 로드시 스크롤을 맨 위에 고정 (이 부분은 보통 하단으로 스크롤이 더 일반적입니다)
  // 현재 코드는 첫 로드시 0으로 가고, 새 메시지 시 맨 아래로 갑니다.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollContainerRef.current) {
        // 맨 위로 고정 대신 맨 아래로 고정하는 것이 UX상 더 좋습니다.
        // scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [messages, aiLoading]); // messages와 aiLoading 변경 시에도 스크롤

  // 새 메시지 추가 시(첫 렌더 제외) 아래로 스크롤
  useEffect(() => {
    // aiLoading이 true일 때도 스크롤이 자동으로 내려가도록 처리
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, aiLoading]); // messages 또는 aiLoading이 변경될 때마다 스크롤

  useEffect(() => {
    if (character) {
      console.log(`[ChatMate] 채팅방 입장: 캐릭터 이름 = ${character.name}, id = ${character.id}`);
    }
  }, [character]);

  // 조건부 렌더링은 모든 Hook 선언 이후에 위치해야 함
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

    // 전역 상태에 사용자 메시지 즉시 추가
    console.log('📝 전역 상태에 사용자 메시지 추가');
    addMessageToRoom(roomId, userMsg);

    // AI 응답 스트리밍을 위한 임시 AI 메시지 추가 (초기에는 비어있음)
    const aiMessageId = Date.now() + 1; // AI 메시지 ID 미리 생성
    addMessageToRoom(roomId, {
      id: aiMessageId,
      text: '', // 빈 텍스트로 시작
      sender: 'other',
      time: new Date().toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      characterId: character.id,
      isStreaming: true // ⭐ 스트리밍 중임을 나타내는 플래그
    });

    try {
      setAiLoading(roomId, true); // AI 로딩 상태 시작

      // AI 응답 스트리밍 받기
      // onNewChunk: AI가 한 글자씩 보낼 때마다 호출
      // onVideoUrl: 영상 URL이 도착했을 때 호출
      await sendMessageToAI(
        roomId,
        messageText,
        (chunk, accumulatedText) => {
          // ⭐ 각 청크가 올 때마다 AI 메시지 업데이트
          updateStreamingAiMessage(roomId, aiMessageId, accumulatedText);
        },
        (videoUrl) => {
          // ⭐ 영상 URL이 도착했을 때 영상 메시지 추가
          addVideoMessageToRoom(roomId, videoUrl, character.id);
        }
      );

      // 스트리밍이 완료된 후 AI 메시지의 isStreaming 플래그 제거
      finishStreamingAiMessage(roomId, aiMessageId);

      // 메시지 전송 후 exp/레벨/게이지 실시간 갱신
      // 이 부분은 AI 응답 완료 후 한 번만 호출하면 됩니다.
      (async () => {
        const token = await getToken();
        fetch(`${API_BASE_URL}/chat/room-info?roomId=${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
          .then(res => res.json())
          .then(data => {
            console.log('[room-info] (sendMessage 후) API 응답:', data);
            if (data.success && data.data && data.data.character) {
              console.log('[room-info] (sendMessage 후) setCharacter 호출: exp:', data.data.character.exp, 'friendship:', data.data.character.friendship, '전체:', data.data.character);
              setCharacter(data.data.character);
            }
          });
      })();

    } catch (error) {
      console.error('💥 ChatMate sendMessage에서 에러 발생:', error);
      console.error('💥 에러 타입:', typeof error);
      console.error('💥 에러 message:', error.message);
      console.error('💥 에러 stack:', error.stack);
      console.error('AI 응답 실패:', error);

      // 에러 발생 시 스트리밍 중인 메시지 업데이트 (또는 삭제 후 에러 메시지 추가)
      // 여기서는 스트리밍 메시지를 에러 메시지로 변경
      updateStreamingAiMessage(roomId, aiMessageId, '죄송합니다. 응답을 생성하는데 문제가 발생했습니다.', true); // isError 플래그 추가
      finishStreamingAiMessage(roomId, aiMessageId); // 스트리밍 종료 처리

    } finally {
      setAiLoading(roomId, false); // AI 로딩 상태 종료
    }

    console.log('🏁 ChatMate sendMessage 완료');
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !aiLoading) {
      e.preventDefault(); // Enter 키 기본 동작 (개행) 방지
      sendMessage();
    }
  };

  // handleImageUpload 함수는 변경 없음 (이미지 업로드 로직은 그대로 유지)
  const handleImageUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    const token = await getToken(); // 이미지 업로드에도 토큰 필요할 수 있음
    const res = await fetch(`${API_BASE_URL}/api/chat/upload-image`, { // API_BASE_URL 추가
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }, // 필요시
      body: formData,
    });
    const data = await res.json();
    if (data.success && data.imageUrl) {
      const userImageMsgId = Date.now();
      addMessageToRoom(roomId, {
        id: userImageMsgId,
        text: '',
        imageUrl: data.imageUrl,
        sender: 'me',
        time: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }),
        characterId: character.id,
      });

      // AI에게 이미지 메시지 전송 (스트리밍 답변 받기)
      setAiLoading(roomId, true);
      const aiMessageId = Date.now() + 1; // AI 메시지 ID 미리 생성
      addMessageToRoom(roomId, {
        id: aiMessageId,
        text: '', // 빈 텍스트로 시작
        sender: 'other',
        time: new Date().toLocaleTimeString('ko-KR', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        characterId: character.id,
        isStreaming: true // ⭐ 스트리밍 중임을 나타내는 플래그
      });

      try {
        await sendMessageToAI(
          roomId,
          `[이미지] ${data.imageUrl}`, // 백엔드 LLM에 이미지 URL 전달 (프롬프트로)
          (chunk, accumulatedText) => {
            updateStreamingAiMessage(roomId, aiMessageId, accumulatedText);
          },
          (videoUrl) => {
            addVideoMessageToRoom(roomId, videoUrl, character.id);
          }
        );
        finishStreamingAiMessage(roomId, aiMessageId);
      } catch (e) {
        console.error('AI 이미지 답변 생성 에러:', e);
        updateStreamingAiMessage(roomId, aiMessageId, '이미지에 대한 답변 생성에 실패했습니다.', true);
        finishStreamingAiMessage(roomId, aiMessageId);
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
          <div className="w-9 h-9 rounded-full border-2 border-cyan-300 shadow-[0_0_4px_#0ff]">
            <img
              src={character.imageUrl}
              alt={character.name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="text-cyan-100 text-lg font-bold drop-shadow-[0_0_2px_#0ff] tracking-widest font-cyberpunk">
            {character.name}
          </span>
        </div>
        {/* 레벨/친밀도/게이지 UI 추가 */}
        {character && (
          <div className="mt-2 flex flex-col items-start gap-1">
            {/* 레벨/친밀도 */}
            <LevelExpGauge exp={character.exp || 0} />
          </div>
        )}
      </header>
      {/* 스크롤 영역: 프로필 + 메시지 */}
      <div
        ref={scrollContainerRef}
        className="flex-1 px-4 overflow-y-auto no-scrollbar sm:px-6 md:px-8 lg:px-12 pb-28 font-cyberpunk"
      >
        {/* 프로필 */}
        <div className="flex flex-col items-center my-6 text-center font-cyberpunk">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-cyan-300 shadow-[0_0_6px_#0ff]">
            <img
              src={character.imageUrl}
              alt={character.name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h3 className="text-2xl font-bold text-cyan-100 mb-2 mt-3 drop-shadow-[0_0_2px_#0ff] tracking-widest font-cyberpunk">
            {character.name}
          </h3>
          <p className="text-cyan-100/80 text-xs sm:text-sm px-2 max-w-lg mx-auto mt-1 mb-2 drop-shadow-[0_0_1px_#0ff] font-cyberpunk">
            {character.description || character.introduction || character.desc}
          </p>
        </div>
        {/* 메시지들 */}
        <div className="space-y-4 pb-4 max-w-3xl mx-auto font-cyberpunk">
          {messages.map((msg, idx) => {
            const isLast = idx === messages.length - 1;
            const nextMsg = messages[idx + 1];
            const prevMsg = messages[idx - 1];
            // 메시지 그룹화 로직 강화 (시간이 바뀌거나, 보낸 사람이 바뀌거나, 첫 메시지일 경우 프로필/시간 표시)
            const showTime = isLast || (nextMsg && (msg.time !== nextMsg.time || msg.sender !== nextMsg.sender));
            const showProfile = idx === 0 || (prevMsg && (msg.time !== prevMsg.time || msg.sender !== prevMsg.sender));

            // ⭐ 스트리밍 중인 메시지 표시 로직
            const isStreaming = msg.isStreaming && msg.sender === 'other';

            return (
              <div
                key={msg.id}
                className={`flex flex-col w-full ${msg.sender === 'me' ? 'items-end' : 'items-start'} font-cyberpunk`}
              >
                {showProfile && (
                  <div className={`flex items-center mb-1 ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'} font-cyberpunk`}>
                    <div className="w-8 h-8 rounded-full border-2 border-cyan-300 shadow-[0_0_3px_#0ff] flex-shrink-0 bg-gradient-to-br from-cyan-200/60 to-fuchsia-200/40">
                      <img
                        src={msg.sender === 'me' ? user?.imageUrl || '/assets/icon-character.png' : character.imageUrl}
                        alt=""
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <span className={`text-cyan-100 font-bold text-sm tracking-widest drop-shadow-[0_0_1px_#0ff] font-cyberpunk ${msg.sender === 'me' ? 'mr-2' : 'ml-2'}`}>
                      {msg.sender === 'me' ? user?.username || user?.firstName || 'You' : character.name}
                    </span>
                  </div>
                )}
                <div
                  className={`max-w-[80%] sm:max-w-[70%] lg:max-w-[60%] px-4 py-3 rounded-xl break-words tracking-widest font-cyberpunk ${msg.sender === 'me'
                    ? 'bg-cyan-100/80 border-2 border-cyan-200 text-[#1a1a2e] shadow-[0_0_4px_#0ff]'
                    : 'bg-fuchsia-100/80 border-2 border-fuchsia-200 text-[#1a1a2e] shadow-[0_0_4px_#f0f]'
                    }`}
                  style={{boxShadow: msg.sender==='me'?'0 0 4px #0ff':'0 0 4px #f0f', border: msg.sender==='me'?'2px solid #7ff':'2px solid #e7e'}}
                >
                  {msg.imageUrl // 이미지 URL이 있다면 이미지 렌더링
                    ? <img
                      src={msg.imageUrl.startsWith('http') ? msg.imageUrl : API_BASE_URL + msg.imageUrl}
                      alt="전송된 이미지"
                      className="max-w-xs rounded-lg border-2 border-cyan-200 shadow-[0_0_4px_#0ff] font-cyberpunk"
                    />
                    : msg.type === 'video' // 영상 URL이 있다면 비디오 렌더링
                      ? <video
                          controls
                          src={msg.text.startsWith('http') ? msg.text : API_BASE_URL + msg.text}
                          className="max-w-xs rounded-lg border-2 border-cyan-200 shadow-[0_0_4px_#0ff] font-cyberpunk"
                        />
                      : <p className="font-cyberpunk">
                          {isStreaming && !msg.text ? '...' : msg.text} {/* AI 로딩 시 표시 */}
                          {isStreaming && msg.text && <span className="cursor">|</span>} {/* 스트리밍 중 커서 */}
                        </p>
                  }
                </div>
                {(showTime || isStreaming) && ( // 스트리밍 중에도 시간 표시 (선택 사항)
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
              disabled={aiLoading} // AI 로딩 중에는 입력 비활성화
            />
          </div>
          <button
            onClick={sendMessage}
            className="bg-cyan-200 hover:bg-fuchsia-200 text-[#1a1a2e] w-10 h-10 flex items-center justify-center rounded-full transition-colors text-xl shadow-[0_0_3px_#0ff] font-cyberpunk"
            disabled={aiLoading || !newMessage.trim()} // AI 로딩 중이거나 메시지가 비어있으면 비활성화
          >
            ➤
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatMate;
