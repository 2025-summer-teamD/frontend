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
import { useAuth } from "@clerk/clerk-react";
import { CharacterCard } from '../components/CharacterGrid';

export default function Communities() {
  const { getToken, userId } = useAuth();

  const [likedIds, setLikedIds] = useState(() =>
    JSON.parse(localStorage.getItem('likedIds')) || []
  );
  const [activeTab, setActiveTab] = useState('캐릭터'); // 기본 탭을 캐릭터로 변경
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [sortBy, setSortBy] = useState('likes'); // 정렬 기준 추가

  const { characters, loading, error, setCharacters } = useCommunityCharacters(sortBy);
  const { chatRooms, loading: chatRoomsLoading, error: chatRoomsError, refetch: refetchMyChatCharacters } = useChatRooms();

  React.useEffect(() => {
    localStorage.setItem('likedIds', JSON.stringify(likedIds));
  }, [likedIds]);

  // 정렬 버튼 클릭 핸들러
  const handleSortChange = (newSort) => {
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
    const valA = parseFloat(sortBy === 'usesCount' ? a.usesCount : a.likes);
    const valB = parseFloat(sortBy === 'usesCount' ? b.usesCount : b.likes);
    return valB - valA;
  });

  // 채팅방 필터링
  const filteredChatRooms = chatRooms.filter(room => {
    const keyword = searchQuery.toLowerCase();
    return (
      room.name?.toLowerCase().includes(keyword) ||
      room.participants?.some(p => p.persona?.name?.toLowerCase().includes(keyword))
    );
  });

  if (loading && activeTab === '캐릭터') {
    return <LoadingSpinner />;
  }

  if (chatRoomsLoading && activeTab === '채팅방') {
    return <LoadingSpinner />;
  }

  if (error && activeTab === '캐릭터') {
    return <ErrorDisplay error={error} />;
  }

  if (chatRoomsError && activeTab === '채팅방') {
    return <ErrorDisplay error={chatRoomsError} />;
  }

  return (
    <PageLayout 
      title="커뮤니티"
      subtitle="다른 사용자들이 만든 캐릭터와 채팅방을 둘러보세요"
    >
      {/* 탭 버튼 */}
      <div className="flex justify-center gap-2 sm:gap-4 mb-6">
        {['캐릭터', '채팅방'].map(tab => (
          <TabButton
            key={tab}
            isActive={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </TabButton>
        ))}
      </div>

      {/* Search and Filter */}
      <SearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      {/* 캐릭터 탭 */}
      {activeTab === '캐릭터' && (
        <>
          <div className="flex justify-center gap-2 sm:gap-4 mt-4 mb-3">
            {['인기순', '조회수순'].map(tab => (
              <TabButton
                key={tab}
                isActive={sortBy === (tab === '인기순' ? 'likes' : 'usesCount')}
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
        </>
      )}

      {/* 채팅방 탭 */}
      {activeTab === '채팅방' && (
        <>
          <div className="flex justify-center gap-2 sm:gap-4 mt-4 mb-3">
            {['최신순', '인기순'].map(tab => (
              <TabButton
                key={tab}
                isActive={sortBy === (tab === '최신순' ? 'createdAt' : 'likes')}
                onClick={() => setSortBy(tab === '최신순' ? 'createdAt' : 'likes')}
              >
                {tab}
              </TabButton>
            ))}
          </div>

          {/* Chat Rooms Grid */}
          {filteredChatRooms.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredChatRooms.map(room => (
                <div
                  key={room.id}
                  className="bg-black/60 glass border-2 border-cyan-700 rounded-2xl p-4 shadow-[0_0_16px_#0ff,0_0_32px_#f0f] hover:shadow-[0_0_20px_#0ff,0_0_40px_#f0f] transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    // 채팅방 클릭 시 해당 채팅방으로 이동
                    window.location.href = `/chatMate/${room.id}`;
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex -space-x-2">
                      {room.participants?.slice(0, 3).map((participant, index) => (
                        <div
                          key={participant.personaId || index}
                          className="w-8 h-8 rounded-full border-2 border-cyan-300 shadow-[0_0_4px_#0ff]"
                          style={{ zIndex: 3 - index }}
                        >
                          <img
                            src={participant.persona?.imageUrl || '/assets/icon-character.png'}
                            alt={participant.persona?.name || 'AI'}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-cyan-200 font-bold text-sm">
                        {room.name || `${room.participants?.length || 0}명의 AI와 대화`}
                      </h3>
                      <p className="text-cyan-300 text-xs">
                        {room.participants?.length || 0}명 참여
                      </p>
                    </div>
                  </div>
                  <div className="text-cyan-400 text-xs">
                    {room.isPublic ? '공개' : '비공개'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
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
