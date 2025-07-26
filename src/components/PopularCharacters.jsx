import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCommunityCharacters, incrementViewCount, toggleLike } from '../data/characters';
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';
import { useEnterOrCreateChatRoom } from '../data/chatMessages';
import { getSafeImageUrl } from '../utils/imageUtils';

const PopularCharacters = React.memo(({ onChatRoomCreated }) => {
  const containerRef = useRef(null);
  const scrollInterval = useRef(null);
  const { characters, loading, error } = useCommunityCharacters();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [chatLoading, setChatLoading] = useState(false);
  const { enterOrCreateChatRoom } = useEnterOrCreateChatRoom();
  const [likedIds, setLikedIds] = useState(() =>
    JSON.parse(localStorage.getItem('likedIds')) || []
  );

  // 좋아요 수 순으로 정렬하고 상위 8개만 가져오기
  const popularCharacters = characters
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 8);

  // 슬라이드 인덱스 상태
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerPage = 6;
  const maxIndex = Math.max(0, popularCharacters.length - cardsPerPage);
  const visibleCharacters = popularCharacters.slice(currentIndex, currentIndex + cardsPerPage);

  // localStorage에 좋아요 상태 저장
  useEffect(() => {
    localStorage.setItem('likedIds', JSON.stringify(likedIds));
  }, [likedIds]);

  // 조회수 증가 함수
  const handleViewCount = useCallback(async (characterId) => {
    try {
      const token = await getToken();
      await incrementViewCount(characterId, token);
    } catch (error) {
      console.error('조회수 증가 실패:', error);
    }
  }, [getToken]);

  // 좋아요 토글 함수  
  const handleLikeToggle = useCallback(async (id, newLiked) => {
    try {
      if (!id) {
        console.error('캐릭터 ID가 없습니다.');
        return;
      }
      
      const token = await getToken();
      const result = await toggleLike(id, token);
      
      // API 응답에 따라 로컬 상태 업데이트
      if (result.data.isLiked) {
        setLikedIds(prev => [...prev, id]);
      } else {
        setLikedIds(prev => prev.filter(x => x !== id));
      }
      
      // 해당 캐릭터의 좋아요 수 업데이트
      const character = characters.find(c => c.id === id);
      if (character) {
        character.likes = result.data.likesCount;
        character.liked = result.data.isLiked;
      }
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
      alert('내가 만든 캐릭터는 찜할 수 없습니다.');
    }
  }, [getToken, characters]);

  // 채팅방 입장/생성 함수
  const handleStartChat = useCallback(async (character) => {
    setChatLoading(true);
    try {
      const characterId = character.characterId || character.id;
      
      // 조회수 증가
      await handleViewCount(characterId);
      
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
  }, [handleViewCount, enterOrCreateChatRoom, onChatRoomCreated, navigate]);

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback((event, characterId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleViewCount(characterId);
    }
  }, [handleViewCount]);

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
        <h2 className="section-title font-bold text-center mb-4 md:mb-6">
          인기 캐릭터
        </h2>
        <p className="text-lg md:text-xl lg:text-2xl xl:text-[24px] text-center font-bold mb-16 md:mb-20 leading-relaxed text-cyan-100" style={{textShadow:'0 0 4px #0080ff, 0 0 8px #0080ff, 0 0 12px #0080ff'}}>
          복잡한 설정 없이, 인기 캐릭터와 바로 소통하세요.
        </p>
        <div className="text-center text-white">로딩 중...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="characters" className="py-8 md:py-16 px-4 md:px-8">
        <h2 className="section-title font-bold text-center mb-4 md:mb-6">
          인기 캐릭터
        </h2>
        <p className="text-lg md:text-xl lg:text-2xl xl:text-[24px] text-center font-bold mb-16 md:mb-20 leading-relaxed text-cyan-100" style={{textShadow:'0 0 4px #0080ff, 0 0 8px #0080ff, 0 0 12px #0080ff'}}>
          복잡한 설정 없이, 인기 캐릭터와 바로 소통하세요.
        </p>
        <div className="text-center text-white">{error}</div>
      </section>
    );
  }

      return (
      <section id="characters" className="py-8 md:py-16 px-4 md:px-8">
        <h2 className="section-title font-bold text-center mb-4 md:mb-6">
          인기 캐릭터
        </h2>
      <p className="text-lg md:text-xl lg:text-2xl xl:text-[24px] text-center font-bold mb-16 md:mb-20 leading-relaxed text-cyan-100" style={{textShadow:'0 0 4px #0080ff, 0 0 8px #0080ff, 0 0 12px #0080ff'}}>
        복잡한 설정 없이, 인기 캐릭터와 바로 소통하세요.
      </p>
      
      <div className="flex items-center justify-center relative">
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
        <div ref={containerRef} className="flex gap-6 overflow-x-auto overflow-y-visible w-full max-w-7xl px-8 py-6" style={{scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch'}}>
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {visibleCharacters.map((character) => {
            const isLiked = character.liked || likedIds.includes(character.id);
            const characterId = character.id;
            
            return (
              <div
                key={character.id}
                role="button"
                tabIndex={0}
                onClick={() => handleStartChat(character)}
                onKeyDown={(event) => handleKeyDown(event, character.id)}
                className="group relative w-[240px] h-[320px] flex-shrink-0 neon-card bg-black/40 glass border-2 border-cyan-700 rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_16px_#0ff,0_0_32px_#f0f] animate-fadeIn"
                style={{
                  boxShadow: '0 0 8px #0ff, 0 0 16px #f0f',
                  border: '2px solid #099',
                  backdropFilter: 'blur(8px)',
                  fontFamily: 'Share Tech Mono, monospace',
                }}
                aria-label={`${character.name}와 대화하기`}
              >
                <img
                  src={getSafeImageUrl(character.imageUrl)}
                  alt={character.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 opacity-90"
                  style={{ filter: 'brightness(1.1) saturate(1.2) drop-shadow(0 0 6px #0ff)' }}
                  onError={(e) => {
                    e.target.src = '/api/uploads/default-character.svg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-cyan-100">
                  <h3 className="font-bold truncate text-cyan-200 drop-shadow-[0_0_4px_#0ff] text-2xl" style={{fontFamily:'Share Tech Mono, monospace'}}>{character.name}</h3>
                  <p className="text-xs text-fuchsia-300 truncate drop-shadow-[0_0_2px_#f0f]" style={{fontFamily:'Share Tech Mono, monospace'}}>{character.introduction || character.description}</p>
                  <div className="flex justify-between items-center mt-2 text-xs gap-2">
                    {/* VIEWS 박스 */}
                    <div className="flex-1 bg-white/20 border-2 border-cyan-400 rounded-lg px-2 py-1 text-center">
                      <div className="text-cyan-400 font-bold text-[10px] tracking-wider" style={{fontFamily:'Share Tech Mono, monospace'}}>VIEWS</div>
                      <div className="text-cyan-200 font-bold text-sm" style={{fontFamily:'Share Tech Mono, monospace'}}>{character.usesCount || character.messageCount || 0}</div>
                    </div>
                    
                    {/* LIKES 박스 */}
                    <div className="flex-1 bg-white/20 border-2 border-fuchsia-400 rounded-lg px-2 py-1 text-center">
                      <div className="text-fuchsia-400 font-bold text-[10px] tracking-wider" style={{fontFamily:'Share Tech Mono, monospace'}}>LIKES</div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleLikeToggle(characterId, !isLiked);
                        }}
                        className="w-full focus:outline-none"
                        aria-label="좋아요 토글"
                      >
                        <div className={`font-bold text-sm transition-all ${isLiked ? 'text-pink-300' : 'text-fuchsia-200'}`} style={{fontFamily:'Share Tech Mono, monospace'}}>
                          {character.likes ?? 0}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
      
      {chatLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black/80 glass border-2 border-cyan-700 rounded-2xl p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-cyan-200 font-bold">채팅방 생성 중...</p>
          </div>
        </div>
      )}
    </section>
  );
});

PopularCharacters.displayName = 'PopularCharacters';

export default PopularCharacters;