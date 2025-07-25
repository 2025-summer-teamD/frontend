import { useEffect, useRef, useState } from 'react';
import { useCommunityCharacters, incrementViewCount } from '../data/characters';
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';
import { useEnterOrCreateChatRoom } from '../data/chatMessages';

const PopularCharacters = ({ onChatRoomCreated }) => {
  const containerRef = useRef(null);
  const scrollInterval = useRef(null);
  const { characters, loading, error } = useCommunityCharacters();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [chatLoading, setChatLoading] = useState(false);
  const { enterOrCreateChatRoom } = useEnterOrCreateChatRoom();

  // 좋아요 수 순으로 정렬하고 상위 8개만 가져오기
  const popularCharacters = characters
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 8);

  // 슬라이드 인덱스 상태
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerPage = 6;
  const maxIndex = Math.max(0, popularCharacters.length - cardsPerPage);
  const visibleCharacters = popularCharacters.slice(currentIndex, currentIndex + cardsPerPage);

  // 조회수 증가 함수
  const handleViewCount = async (characterId) => {
    try {
      const token = await getToken();
      await incrementViewCount(characterId, token);
    } catch (error) {
      console.error('조회수 증가 실패:', error);
    }
  };

  // 채팅방 입장/생성 함수 (기존 방이 있으면 히스토리와 함께 입장, 없으면 새로 생성)
  const handleStartChat = async (character) => {
    setChatLoading(true);
    try {
      const characterId = character.characterId || character.id;
      const { roomId, character: updatedCharacter, chatHistory, isNewRoom } = await enterOrCreateChatRoom(characterId);

      console.log(isNewRoom ? '🆕 새 채팅방 생성됨' : '🔄 기존 채팅방 입장 (히스토리 ' + chatHistory.length + '개)');

      if (onChatRoomCreated) onChatRoomCreated();
      navigate(`/chatMate/${roomId}`, {
        state: { character: updatedCharacter, chatHistory: chatHistory, roomId: roomId }
      });
    } catch (error) {
      alert('채팅방 처리에 실패했습니다: ' + error.message);
    } finally {
      setChatLoading(false);
    }
  };

  // 키보드 이벤트 핸들러
  const handleKeyDown = (event, characterId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleViewCount(characterId);
    }
  };

  // 마우스 드래그로 스크롤 기능
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let isDown = false;
    let startX;
    let scrollLeft;
    const onMouseDown = (e) => {
      isDown = true;
      container.classList.add('dragging');
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };
    const onMouseLeave = () => {
      isDown = false;
      container.classList.remove('dragging');
    };
    const onMouseUp = () => {
      isDown = false;
      container.classList.remove('dragging');
    };
    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5; // 스크롤 속도 조절
      container.scrollLeft = scrollLeft - walk;
    };
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mouseleave', onMouseLeave);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mousemove', onMouseMove);
    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      const { left, right } = container.getBoundingClientRect();
      const mouseX = e.clientX;

      clearInterval(scrollInterval.current);

      if (mouseX - left < 200) {
        scrollInterval.current = setInterval(() => {
          container.scrollLeft -= 1000; // 스크롤 이동속도(오른쪽)
        }, 10);
      } else if (right - mouseX < 200) {
        scrollInterval.current = setInterval(() => {
          container.scrollLeft += 1000; // 스크롤 이동속도(왼쪽)
        }, 10);
      }
    };

    const stopScrolling = () => {
      clearInterval(scrollInterval.current);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', stopScrolling);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', stopScrolling);

      clearInterval(scrollInterval.current);
    };
  }, []);

  if (loading) {
    return (
      <section id="characters" className="py-8 md:py-16 px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-[48px] font-bold text-center text-white mb-4 md:mb-6">
          인기 캐릭터
        </h2>
        <p className="text-lg md:text-xl lg:text-2xl xl:text-[24px] text-center font-bold mb-16 md:mb-20 leading-relaxed">
          복잡한 설정 없이, 인기 캐릭터와 바로 소통하세요.
        </p>
        <div className="text-center text-white">로딩 중...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="characters" className="py-8 md:py-16 px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-[48px] font-bold text-center text-white mb-4 md:mb-6">
          인기 캐릭터
        </h2>
        <p className="text-lg md:text-xl lg:text-2xl xl:text-[24px] text-center font-bold mb-16 md:mb-20 leading-relaxed">
          복잡한 설정 없이, 인기 캐릭터와 바로 소통하세요.
        </p>
        <div className="text-center text-white">{error}</div>
      </section>
    );
  }

  return (
    <div id="characters" className="py-8 md:py-16 px-4 md:px-8 flex items-center justify-center relative">
      {/* 왼쪽 화살표 */}
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 glass border-2 border-cyan-700 text-cyan-200 hover:text-fuchsia-400 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        onClick={() => setCurrentIndex(i => Math.max(0, i - cardsPerPage))}
        disabled={currentIndex === 0}
        aria-label="이전 캐릭터들"
      >
        <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
      </button>
      {/* 카드 리스트 */}
      <div className="flex gap-6 overflow-hidden w-full max-w-7xl">
        {visibleCharacters.map((character) => (
          <button
            key={character.id}
            className="w-[240px] h-[320px] flex-shrink-0 relative neon-card bg-black/40 glass border-2 border-cyan-700 overflow-hidden shadow-[0_0_16px_#0ff,0_0_32px_#f0f] hover:scale-105 transition-transform duration-300 cursor-pointer focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-800 animate-fadeIn font-rounded"
            style={{boxShadow:'0 0 8px #0ff, 0 0 16px #f0f', border:'2px solid #099', backdropFilter:'blur(8px)', fontFamily:'Noto Sans Rounded, Pretendard, sans-serif', borderRadius:0}}
            onClick={() => {
              handleViewCount(character.id);
              handleStartChat(character);
            }}
            disabled={chatLoading}
            onKeyDown={(event) => handleKeyDown(event, character.id)}
            aria-label={`${character.name}와 대화하기`}
          >
            <img
              src={character.imageUrl || '/assets/icon-character.png'}
              alt={character.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 opacity-90"
              style={{ filter: 'brightness(1.1) saturate(1.2) drop-shadow(0 0 6px #0ff)' }}
              onError={(e) => {
                e.target.src = '/assets/icon-character.png';
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h3 className="text-xl font-bold text-cyan-200 drop-shadow-[0_0_4px_#0ff] font-rounded">{character.name}</h3>
              <p className="text-xs text-fuchsia-300 mt-1 drop-shadow-[0_0_2px_#f0f] font-rounded">{character.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-cyan-300 drop-shadow-[0_0_2px_#0ff] font-rounded">👁️ {character.usesCount || 0}</span>
                <span className="text-xs text-pink-400 drop-shadow-[0_0_3px_#f0f] font-rounded">❤️ {character.likes || 0}</span>
              </div>
              <div className="mt-3 w-full py-1.5 bg-gradient-to-r from-cyan-700 to-fuchsia-700 rounded-lg text-white font-semibold text-sm hover:bg-fuchsia-700 transition-all font-rounded">
                {chatLoading ? '생성 중...' : '바로 대화하기'}
              </div>
            </div>
          </button>
        ))}
      </div>
      {/* 오른쪽 화살표 */}
      <button
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 glass border-2 border-cyan-700 text-cyan-200 hover:text-fuchsia-400 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        onClick={() => setCurrentIndex(i => Math.min(maxIndex, i + cardsPerPage))}
        disabled={currentIndex >= maxIndex}
        aria-label="다음 캐릭터들"
      >
        <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>
  );
}

export default PopularCharacters;