// src/pages/Communities.jsx
import React, { useState, useEffect } from 'react';
import { useCommunityCharacters, toggleLike, incrementViewCount } from '../data/characters';
import CharacterProfile from '../components/CharacterProfile';
import CharacterEditModal from '../components/CharacterEditModal';
import { Heart as OutlineHeart, Heart as SolidHeart, Search, XCircle } from 'lucide-react';
import { useAuth } from "@clerk/clerk-react";

export default function Communities() {
  const myId = 'me'; // 실제 로그인 정보로 대체
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

  React.useEffect(() => {
    localStorage.setItem('likedIds', JSON.stringify(likedIds));
  }, [likedIds]);

  // 정렬 버튼 클릭 핸들러
  const handleSortChange = (newSort) => {
    setActiveTab(newSort);
    setSortBy(newSort === '인기순' ? 'likes' : 'uses_count');
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
      const character = characters.find(c => c.character_id === id);
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

  const handleEditCharacter = character => {
    setEditingCharacter(character);
  };

  const handleSaveCharacter = (id, formData) => {
    console.log('Saving character:', id, formData);
    // 실제 저장 로직 구현
  };

  const handleDeleteCharacter = character => {
    if (window.confirm(`${character.name} 캐릭터를 삭제하시겠습니까?`)) {
      // 삭제 로직 구현
    }
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
    const valA = parseFloat(activeTab === '조회수순' ? a.uses_count : a.likes);
    const valB = parseFloat(activeTab === '조회수순' ? b.uses_count : b.likes);
    return valB - valA;
  });

  if (loading) {
    return (
      <div className="bg-gray-800 text-white min-h-screen font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">캐릭터 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 text-white min-h-screen font-sans flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-white min-h-screen font-sans">
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-white font-bold md:text-[1.5rem] text-center">캐릭터 커뮤니티</h1>
          <p className="text-[1rem] text-gray-400">당신이 좋아하는 캐릭터를 찾아보세요</p>
        </header>

        {/* Search and Filter */}
        <div className="mb-8 top-4 z-10 bg-gray-800 py-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="캐릭터 이름 또는 설명으로 검색..."
                className="w-full bg-gray-700 text-white placeholder-gray-400 border border-transparent rounded-full py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label="검색어 지우기"
                >
                  <XCircle className="text-gray-400 hover:text-white" />
                </button>
              )}
            </div>
            <div className="flex justify-center gap-2 sm:gap-4 mt-4">
              {['인기순', '조회수순'].map(tab => (
                <button
                  key={tab}
                  className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-colors ${
                    activeTab === tab
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => handleSortChange(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Character Grid */}
        {sortedCharacters.length === 0 ? (
          <div className="text-center py-20">
            <Search className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-white">검색 결과가 없습니다</h3>
            <p className="mt-1 text-sm text-gray-400">다른 검색어로 다시 시도해보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {sortedCharacters.map(character => {
              const isLiked = character.liked || likedIds.includes(character.character_id);
              
              const handleSelect = async () => {
                try {
                  // 조회수 증가 - character_id가 있을 때만
                  if (character.character_id) {
                    const token = await getToken();
                    await incrementViewCount(character.character_id, token);
                    // 조회수 증가 성공 시 해당 캐릭터의 조회수만 업데이트
                    character.uses_count = (character.uses_count || 0) + 1;
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
                  key={character.character_id}
                  role="button"
                  tabIndex={0}
                  onClick={handleSelect}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSelect()}
                  className="group relative aspect-[3/4] bg-gray-700 rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/30"
                >
                  <img
                    src={character.image_url}
                    alt={character.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h3 className="font-bold truncate">{character.name}</h3>
                    <p className="text-xs text-gray-300 truncate">{character.introduction}</p>
                    <div className="flex justify-between items-center mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <span>👁️ {character.uses_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleLikeToggle(character.character_id, !isLiked);
                          }}
                          className="flex items-center focus:outline-none"
                          aria-label="좋아요 토글"
                        >
                          {isLiked ? (
                            <span className="text-red-500">❤️</span>
                          ) : (
                            <OutlineHeart className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                          )}
                        </button>
                        <span className="text-xs text-gray-300">{character.likes || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedCharacter && (
        <CharacterProfile
          character={selectedCharacter}
          liked={likedIds.includes(selectedCharacter.character_id)}
          origin="communities"
          onClose={() => setSelectedCharacter(null)}
          onLikeToggle={handleLikeToggle}
        />
      )}

      {editingCharacter && (
        <CharacterEditModal
          character={editingCharacter}
          liked={likedIds.includes(editingCharacter.character_id)}
          onClose={() => setEditingCharacter(null)}
          onSave={handleSaveCharacter}
          onLikeToggle={handleLikeToggle}
        />
      )}
    </div>
  );
}
