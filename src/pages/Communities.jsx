// src/pages/Communities.jsx
import React, { useState } from 'react';
import { useCommunityCharacters, toggleLike, incrementViewCount } from '../data/characters';
import { useChatRooms } from '../contexts/ChatRoomsContext';
import CharacterProfile from '../components/CharacterProfile';
import CharacterEditModal from '../components/CharacterEditModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import PageLayout from '../components/PageLayout';
import TabButton from '../components/TabButton';
import { Heart as OutlineHeart, Heart as SolidHeart } from 'lucide-react';
import { useAuth } from "@clerk/clerk-react";
import { CharacterCard } from '../components/CharacterGrid';

export default function Communities() {
  const { getToken, userId } = useAuth();

  const [likedIds, setLikedIds] = useState(() =>
    JSON.parse(localStorage.getItem('likedIds')) || []
  );
  const [activeTab, setActiveTab] = useState('인기순');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [sortBy, setSortBy] = useState('likes'); // 정렬 기준 추가

  const { characters, loading, error, setCharacters } = useCommunityCharacters(sortBy);
  const { refetch: refetchMyChatCharacters } = useChatRooms();

  React.useEffect(() => {
    localStorage.setItem('likedIds', JSON.stringify(likedIds));
  }, [likedIds]);

  // 정렬 버튼 클릭 핸들러
  const handleSortChange = (newSort) => {
    setActiveTab(newSort);
    setSortBy(newSort === '인기순' ? 'likes' : 'usesCount');
  };

  const handleLikeToggle = async (id, newLiked) => {
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
      
      // 해당 캐릭터의 좋아요 수와 상태 업데이트
      const character = characters.find(c => c.id === id);
      if (character) {
        character.likes = result.data.likesCount;
        character.liked = result.data.isLiked; // character.liked 속성도 업데이트
        // 상태 강제 업데이트를 위해 배열을 새로 생성
        setCharacters(prev => [...prev]);
      }
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
      alert('내가 만든 캐릭터는 찜할 수 없습니다.');
    }
  };

  const handleSaveCharacter = (id, formData) => {
    console.log('Saving character:', id, formData);
    // 실제 저장 로직 구현
  };

  // 검색 필터링 (API 데이터 구조에 맞게 수정)
  const filteredCharacters = characters.filter(char => {
    const keyword = searchQuery.toLowerCase();
    return (
      char.name.toLowerCase().includes(keyword) ||
      char.introduction.toLowerCase().includes(keyword)
    );
  });  

  // 정렬 (API 데이터 구조에 맞게 수정)
  const sortedCharacters = [...filteredCharacters].sort((a, b) => {
    const valA = parseFloat(activeTab === '조회수순' ? a.usesCount : a.likes);
    const valB = parseFloat(activeTab === '조회수순' ? b.usesCount : b.likes);
    return valB - valA;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <PageLayout 
      title="캐릭터 커뮤니티"
      subtitle="당신이 좋아하는 캐릭터를 찾아보세요"
    >
      {/* Search and Filter */}
      <SearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div className="flex justify-center gap-2 sm:gap-4 mt-4 mb-3">
        {['인기순', '조회수순'].map(tab => (
          <TabButton
            key={tab}
            isActive={activeTab === tab}
            onClick={() => handleSortChange(tab)}
          >
            {tab}
          </TabButton>
        ))}
      </div>

      {/* Character Grid */}
      {sortedCharacters.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {sortedCharacters.map(character => {
            const isLiked = character.liked || likedIds.includes(character.id);
            const handleSelect = async () => {
              try {
                if (character.id) {
                  const token = await getToken();
                  await incrementViewCount(character.id, token);
                  character.usesCount = (character.usesCount || 0) + 1;
                  setCharacters(prev => [...prev]);
                }
              } catch (error) {
                console.error('조회수 증가 실패:', error);
              }
              setSelectedCharacter(character);
            };
            return (
              <CharacterCard
                key={character.id}
                character={character}
                isMine={false}
                isLiked={isLiked}
                onLikeToggle={handleLikeToggle}
                onEdit={() => {}}
                onSelect={handleSelect}
                showEditButtons={false}
              />
            );
          })}
        </div>
      )}

      {selectedCharacter && (
        <CharacterProfile
          character={{ ...selectedCharacter, id: selectedCharacter.id }}
          liked={likedIds.includes(selectedCharacter.id)}
          origin="communities"
          isMyCharacter={selectedCharacter.clerkId === userId}
          onClose={() => setSelectedCharacter(null)}
          onLikeToggle={handleLikeToggle}
          onChatRoomCreated={refetchMyChatCharacters}
          style={{ zIndex: 100 }}
        />
      )}

      {/* 디버깅 로그 추가 */}
      {selectedCharacter && console.log('Communities CharacterProfile Debug:', {
        selectedCharacterId: selectedCharacter.id,
        selectedCharacterName: selectedCharacter.name,
        selectedCharacterClerkId: selectedCharacter.clerkId,
        userId,
        isMyCharacter: selectedCharacter.clerkId === userId
      })}

      {editingCharacter && (
        <CharacterEditModal
          character={{ ...editingCharacter, id: editingCharacter.id }}
          liked={likedIds.includes(editingCharacter.id)}
          onClose={() => setEditingCharacter(null)}
          onSave={handleSaveCharacter}
          onLikeToggle={handleLikeToggle}
        />
      )}
    </PageLayout>
  );
}
