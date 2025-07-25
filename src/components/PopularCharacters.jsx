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
    <section id="characters" className="py-8 md:py-16 px-4 md:px-8">
      <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-[48px] font-bold text-center text-white mb-4 md:mb-6">
        인기 캐릭터
      </h2>
      <p className="text-lg md:text-xl lg:text-2xl xl:text-[24px] text-center font-bold mb-16 md:mb-20 leading-relaxed">
        복잡한 설정 없이, 인기 캐릭터와 바로 소통하세요.
      </p>

      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto px-2 py-4 scroll-smooth"
        style={{
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE, Edge
        }}
      >
        {/* 🧼 스크롤바 숨기기 (Webkit 기반 브라우저용) */}
        <style>
          {`
            div::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>

        {popularCharacters.map((character) => (
          <button
            key={character.id}
            className="w-[240px] h-[320px] flex-shrink-0 relative neon-card bg-black/40 glass border-2 border-cyan-700 rounded-2xl overflow-hidden shadow-[0_0_16px_#0ff,0_0_32px_#f0f] hover:scale-105 transition-transform duration-300 cursor-pointer focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-800 animate-fadeIn font-rounded"
            style={{boxShadow:'0 0 8px #0ff, 0 0 16px #f0f', border:'2px solid #099', backdropFilter:'blur(8px)', fontFamily:'Noto Sans Rounded, Pretendard, sans-serif'}}
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
              {/* 태그 */}
              {character.prompt?.tag && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {character.prompt.tag.split(',').filter(tag => tag.trim()).map((tag, idx) => (
                    <span key={`tag-${idx}-${tag.trim()}`} className="px-2 py-1 rounded-md border border-cyan-700 bg-black/60 text-cyan-300 text-[0.7rem] font-rounded tracking-widest shadow-[0_0_4px_#0ff]" style={{fontFamily:'Noto Sans Rounded, Pretendard, sans-serif', letterSpacing:'0.08em', border:'1.5px solid #066', boxShadow:'0 0 4px #0ff'}}>
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 w-full py-1.5 bg-gradient-to-r from-cyan-700 to-fuchsia-700 rounded-lg text-white font-semibold text-sm hover:bg-fuchsia-700 transition-all font-rounded">
                {chatLoading ? '생성 중...' : '바로 대화하기'}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export default PopularCharacters;