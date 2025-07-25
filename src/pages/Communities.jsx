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

export default function Communities() {
  const { getToken } = useAuth();

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
                // 조회수 증가 - id가 있을 때만
                if (character.id) {
                  const token = await getToken();
                  await incrementViewCount(character.id, token);
                  // 조회수 증가 성공 시 해당 캐릭터의 조회수만 업데이트
                  character.usesCount = (character.usesCount || 0) + 1;
                  // 상태 강제 업데이트를 위해 배열을 새로 생성
                  setCharacters(prev => [...prev]);
                }
              } catch (error) {
                console.error('조회수 증가 실패:', error);
                // 조회수 증가 실패해도 상세보기는 열기
              }
              // 상세보기 모달 열기
              setSelectedCharacter(character);
            };

            return (
              <div
                key={character.id}
                role="button"
                tabIndex={0}
                onClick={handleSelect}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSelect()}
                className="group relative aspect-[3/4] neon-card bg-black/40 glass border-2 border-cyan-700 rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_16px_#0ff,0_0_32px_#f0f] animate-fadeIn"
                style={{
                  boxShadow: '0 0 8px #0ff, 0 0 16px #f0f',
                  border: '2px solid #099',
                  backdropFilter: 'blur(8px)',
                  fontFamily: 'Share Tech Mono, monospace',
                }}
              >
                <img
                  src={character.imageUrl}
                  alt={character.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 opacity-90"
                  style={{ filter: 'brightness(1.1) saturate(1.2) drop-shadow(0 0 6px #0ff)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-cyan-100">
                  <h3 className="font-bold truncate text-cyan-200 drop-shadow-[0_0_4px_#0ff]" style={{fontFamily:'Share Tech Mono, monospace'}}>{character.name}</h3>
                  <p className="text-xs text-fuchsia-300 truncate drop-shadow-[0_0_2px_#f0f]" style={{fontFamily:'Share Tech Mono, monospace'}}>{character.introduction}</p>
                  {/* 태그 */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {character.prompt?.tag && character.prompt.tag.split(',').filter(tag => tag.trim()).map((tag, idx) => (
                      <span key={`tag-${idx}-${tag.trim()}`} className="px-2 py-1 rounded-md border border-cyan-700 bg-black/60 text-cyan-300 text-[0.7rem] font-mono tracking-widest shadow-[0_0_4px_#0ff]" style={{fontFamily:'Share Tech Mono, monospace', letterSpacing:'0.08em', border:'1.5px solid #066', boxShadow:'0 0 4px #0ff'}}>
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-cyan-300 drop-shadow-[0_0_2px_#0ff]" style={{fontFamily:'Share Tech Mono, monospace'}}>👁️ {character.usesCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleLikeToggle(character.id, !isLiked);
                        }}
                        className="flex items-center focus:outline-none"
                        aria-label="좋아요 토글"
                      >
                        {isLiked ? (
                          <span className="text-pink-400 drop-shadow-[0_0_3px_#f0f]">❤️</span>
                        ) : (
                          <OutlineHeart className="w-4 h-4 text-cyan-400 hover:text-pink-400 transition-colors drop-shadow-[0_0_2px_#0ff]" />
                        )}
                      </button>
                      <span className="text-xs text-cyan-300 drop-shadow-[0_0_2px_#0ff]" style={{fontFamily:'Share Tech Mono, monospace'}}>{character.likes || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedCharacter && (
        <CharacterProfile
          character={{ ...selectedCharacter, id: selectedCharacter.id }}
          liked={likedIds.includes(selectedCharacter.id)}
          origin="communities"
          onClose={() => setSelectedCharacter(null)}
          onLikeToggle={handleLikeToggle}
          onChatRoomCreated={refetchMyChatCharacters}
        />
      )}

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
