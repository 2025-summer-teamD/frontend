import React, { useEffect, useState, useCallback } from 'react';
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
import ScrollContainer from './ScrollContainer';
import LoadingOverlay from './LoadingOverlay';
import { useDragScroll } from '../hooks/useDragScroll';

const PopularCharacters = React.memo(({ onChatRoomCreated }) => {
  const containerRef = useDragScroll();
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
        <ScrollContainer ref={containerRef}>
          {visibleCharacters.map((character) => (
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
                isLiked={character.liked || likedIds.includes(character.id)} 
                onLikeToggle={handleLikeToggle} 
                characterId={character.id} 
              />
            </BaseCard>
          ))}
        </ScrollContainer>
        
        {/* 오른쪽 화살표 */}
        <SlideButton
          direction="right"
          onClick={() => setCurrentIndex(i => Math.min(maxIndex, i + cardsPerPage))}
          disabled={currentIndex >= maxIndex}
          ariaLabel="다음 캐릭터들"
        />
      </div>
      
      <LoadingOverlay isVisible={chatLoading} message="채팅방 생성 중..." />
    </SectionHeader>
  );
});

PopularCharacters.displayName = 'PopularCharacters';

export default PopularCharacters;