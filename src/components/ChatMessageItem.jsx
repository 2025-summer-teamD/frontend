import React, { useState, useEffect } from 'react';
import TypingIndicator from './TypingIndicator.jsx';
import { useChatMessages } from '../contexts/ChatMessagesContext.jsx';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ChatMessageItem 컴포넌트라고 가정하고 작성합니다.
// 이 컴포넌트가 부모로부터 msg, showProfile, showTime, profileImg, displayName, isAI, aiObj, aiColor 등을 props로 받는다고 가정합니다.
const ChatMessageItem = ({ msg, showProfile, showTime, profileImg, displayName, isAI, aiObj, aiColor, roomId, userId }) => {
  // TTS 재생 상태 관리를 위한 state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null); // Audio 객체를 저장할 state
  console.log('messageId:' + msg.id);
  console.log(msg);
  
  // AI별 타이핑 상태 확인
  const { getAiLoadingForSpecificAi } = useChatMessages();
  const isAiTyping = isAI && msg.aiId ? getAiLoadingForSpecificAi(roomId, msg.aiId) : false;
  
  // 🆕 로딩 메시지인지 확인 (점 세개 애니메이션 표시용)
  const isLoadingMessage = msg.isStreaming && msg.text === '...';
  
  // 디버깅을 위한 로그 추가
  console.log('🔍 ChatMessageItem 디버깅:', {
    messageId: msg.id,
    sender: msg.sender,
    isAI: isAI,
    aiId: msg.aiId,
    isAiTyping: isAiTyping,
    isStreaming: msg.isStreaming,
    isLoadingMessage: isLoadingMessage,
    text: msg.text,
    roomId: roomId
  });
  
  // TTS 오디오 캐싱을 위한 유틸리티 함수들
  const getTTSCacheKey = (roomId, msgId) => `tts_${roomId}_${msgId}`;

  const TypingEffectText = ({ text, speed = 50 }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [index, setIndex] = useState(0);

    useEffect(() => {
      if (index < text.length) {
        const timeoutId = setTimeout(() => {
          setDisplayedText((prev) => prev + text.charAt(index));
          setIndex((prev) => prev + 1);
        }, speed); // `speed` 밀리초마다 한 글자씩 추가

        return () => clearTimeout(timeoutId); // 클린업 함수
      }
    }, [index, text, speed]);

    // text가 변경되었을 때 displayedText와 index를 초기화
    useEffect(() => {
      setDisplayedText('');
      setIndex(0);
    }, [text]);

    return <p className="font-cyberpunk">{displayedText}</p>;
  }

  const getCachedTTSUrl = (cacheKey) => {
    try {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const { audioBase64, timestamp } = JSON.parse(cachedData);
        // 24시간 후 캐시 만료
        const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간
        if (Date.now() - timestamp < CACHE_DURATION) {
          // Base64를 Blob으로 변환
          const byteCharacters = atob(audioBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const audioBlob = new Blob([byteArray], { type: 'audio/mpeg' });
          return URL.createObjectURL(audioBlob);
        } else {
          // 만료된 캐시 삭제
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error('캐시된 TTS 데이터 로드 실패:', error);
      localStorage.removeItem(cacheKey);
    }
    return null;
  };

  const cacheTTSData = async (cacheKey, audioBlob) => {
    try {
      // Blob을 Base64로 변환
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // data:audio/mpeg;base64, 부분 제거
        const cacheData = {
          audioBase64: base64,
          timestamp: Date.now()
        };

        // localStorage 용량 체크 (5MB 제한)
        const dataSize = JSON.stringify(cacheData).length;
        if (dataSize < 5 * 1024 * 1024) { // 5MB
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
          console.log('TTS 오디오가 캐시되었습니다:', cacheKey);
        } else {
          console.warn('TTS 오디오가 너무 커서 캐시하지 않습니다:', cacheKey);
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('TTS 데이터 캐싱 실패:', error);
    }
  };

  // TTS 재생 버튼 클릭 핸들러
  const handlePlayTTS = async () => {
    // 이미 재생 중이면 다시 호출하지 않음
    if (isPlaying) {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
      }
      return;
    }

    setIsPlaying(true); // 재생 시작 상태로 변경

    try {
      const cacheKey = getTTSCacheKey(roomId, msg.id);

      // 먼저 캐시된 데이터가 있는지 확인
      let audioUrl = getCachedTTSUrl(cacheKey);

      if (!audioUrl) {
        // 캐시된 데이터가 없으면 API 호출
        console.log('캐시된 TTS 데이터가 없습니다. API 호출합니다:', cacheKey);

        const ttsApiUrl = `${API_BASE_URL}/chat/tts/${roomId}/${msg.id}`;
        const response = await fetch(ttsApiUrl);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'TTS 오디오를 가져오지 못했습니다.');
        }

        // MP3 오디오 데이터를 Blob으로 받아서 URL 생성
        const audioBlob = await response.blob();
        audioUrl = URL.createObjectURL(audioBlob);

        // 백그라운드에서 캐싱 (재생과 병렬로 처리)
        cacheTTSData(cacheKey, audioBlob);
      } else {
        console.log('캐시된 TTS 데이터를 사용합니다:', cacheKey);
      }

      // Audio 객체 생성 및 재생
      const newAudio = new Audio(audioUrl);
      setAudio(newAudio); // Audio 객체를 state에 저장하여 제어 가능하게 함

      newAudio.onended = () => {
        setIsPlaying(false); // 재생 완료 시 상태 변경
        URL.revokeObjectURL(audioUrl); // 사용 후 URL 해제
        setAudio(null); // Audio 객체 state 비우기
      };

      newAudio.onerror = (e) => {
        console.error('오디오 재생 중 오류 발생:', e);
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        setAudio(null);
        alert('오디오 재생에 실패했습니다.');
      };

      await newAudio.play(); // 오디오 재생 시작

    } catch (error) {
      console.error('TTS 재생 중 오류:', error);
      setIsPlaying(false); // 오류 발생 시 상태 변경
      alert(`TTS 재생에 실패했습니다: ${error.message}`);
      if (audio) { // 오류 발생 시 기존 audio 객체도 정리
        audio.pause();
        audio.currentTime = 0;
        URL.revokeObjectURL(audio.src);
        setAudio(null);
      }
    }
  };

  return (
    <div
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
              <span className="ml-2 text-xs text-cyan-300 font-bold flex items-center">
                Lv.{aiObj.friendship || 1}
                {/* 재생 버튼 추가 */}
                <button
                  onClick={handlePlayTTS}
                  disabled={isPlaying} // 재생 중일 때는 버튼 비활성화
                  className={`ml-2 p-1 rounded-full text-cyan-400 hover:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors duration-200
                              ${isPlaying ? 'animate-pulse' : ''} ${aiColor.text}`} // aiColor.text를 사용해 버튼 색상 일관성 유지
                >
                  {isPlaying ? (
                    // 재생 중일 때 아이콘 (일시정지 또는 로딩 스피너)
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                  ) : (
                    // 재생 대기 중일 때 아이콘 (재생)
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                    </svg>
                  )}
                </button>
              </span>
            )}
          </span>
        </div>
      )}
      {/* AI가 타이핑 중이거나 로딩 메시지인 경우 TypingIndicator 렌더링 */}
      {msg.sender === 'ai' && isLoadingMessage ? (
        <TypingIndicator 
          aiColor={aiColor}
          aiName={msg.aiName || displayName}
          profileImg={profileImg}
        />
      ) : (
        <div
          className={`max-w-[80%] sm:max-w-[70%] lg:max-w-[60%] px-4 py-3 rounded-xl break-words tracking-widest font-cyberpunk ${msg.sender === 'me'
            ? 'bg-cyan-100/80 border-2 border-cyan-200 text-[#1a1a2e] shadow-[0_0_4px_#0ff]'
            : isAI
              ? `${aiColor.bg} border-2 ${aiColor.border} ${aiColor.text} ${aiColor.shadow}`
              : 'bg-fuchsia-100/80 border-2 border-fuchsia-200 text-[#1a1a2e] shadow-[0_0_4px_#f0f]'
            }`}
          style={isAI ? { boxShadow: aiColor.shadow.replace('shadow-', '').replace('[', '').replace(']', '') } : {}}
        >
          {/* 🆕 이미지와 텍스트를 함께 표시하도록 수정 */}
          {msg.imageUrl && (
            <img
              src={msg.imageUrl.startsWith('http') ? msg.imageUrl : API_BASE_URL + msg.imageUrl}
              alt="전송된 이미지"
              className="max-w-xs rounded-lg border-2 border-cyan-200 shadow-[0_0_4px_#0ff] font-cyberpunk mb-2"
            />
          )}
          {msg.text && (
            <p className="font-cyberpunk">{msg.text}</p>
          )}
        </div>
      )}
      {showTime && (
        <div className={`flex w-full mt-1 ${msg.sender === 'me' ? 'justify-end pr-2' : 'justify-start pl-2'}`}>
          <span className="text-xs text-cyan-400 font-cyberpunk">
            {msg.time}
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatMessageItem;
