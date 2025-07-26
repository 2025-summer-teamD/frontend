import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCommunityCharacters, incrementViewCount, toggleLike } from '../data/characters';
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';
import { useEnterOrCreateChatRoom } from '../data/chatMessages';
import { getSafeImageUrl } from '../utils/imageUtils';
import BaseCard from './BaseCard';
import CharacterInfo from './CharacterInfo';
import CharacterStats from './CharacterStats';
import SlideButton from './SlideButton';
import SectionHeader from './SectionHeader';

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
      <SectionHeader 
        title="인기 캐릭터" 
        subtitle="복잡한 설정 없이, 인기 캐릭터와 바로 소통하세요."
      >
        <div className="text-center text-white">로딩 중...</div>
      </SectionHeader>
    );
  }

  if (error) {
    return (
      <SectionHeader 
        title="인기 캐릭터" 
        subtitle="복잡한 설정 없이, 인기 캐릭터와 바로 소통하세요."
      >
        <div className="text-center text-white">{error}</div>
      </SectionHeader>
    );
  }

        return (
    <SectionHeader 
      title="인기 캐릭터" 
      subtitle="복잡한 설정 없이, 인기 캐릭터와 바로 소통하세요."
    >
      
      <div className="flex items-center justify-center relative">
        {/* 왼쪽 화살표 */}
        <SlideButton
          direction="left"
          onClick={() => setCurrentIndex(i => Math.max(0, i - cardsPerPage))}
          disabled={currentIndex === 0}
          ariaLabel="이전 캐릭터들"
        />
        
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
              <BaseCard
                key={character.id}
                character={character}
                onClick={() => handleStartChat(character)}
                onKeyDown={(event) => handleKeyDown(event, character.id)}
                className="w-[240px] h-[320px] flex-shrink-0 neon-card"
              >
                <CharacterInfo character={character} isMine={false} nameSize="text-2xl" />
                <CharacterStats 
                  character={character} 
                  isLiked={isLiked} 
                  onLikeToggle={handleLikeToggle} 
                  characterId={characterId} 
                />
              </BaseCard>
            );
          })}
        </div>
        
        {/* 오른쪽 화살표 */}
        <SlideButton
          direction="right"
          onClick={() => setCurrentIndex(i => Math.min(maxIndex, i + cardsPerPage))}
          disabled={currentIndex >= maxIndex}
          ariaLabel="다음 캐릭터들"
        />
      </div>
      
      {chatLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black/80 glass border-2 border-cyan-700 rounded-2xl p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-cyan-200 font-bold">채팅방 생성 중...</p>
          </div>
        </div>
      )}
    </SectionHeader>
  );
});

PopularCharacters.displayName = 'PopularCharacters';

export default PopularCharacters;