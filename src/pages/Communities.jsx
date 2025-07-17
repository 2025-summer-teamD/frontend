// src/pages/Communities.jsx
import React, { useState, useEffect } from 'react';
import CharacterProfile from '../components/CharacterProfile';
import characters from '../data/characters';
import { Heart as OutlineHeart, Heart as SolidHeart, Search, XCircle } from 'lucide-react';

export default function Communities() {
  const [likedIds, setLikedIds] = useState(() =>
    JSON.parse(localStorage.getItem('likedIds')) || []
  );
  useEffect(() => {
    localStorage.setItem('likedIds', JSON.stringify(likedIds));
  }, [likedIds]);

  const [activeTab, setActiveTab] = useState('인기순');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const handleLikeToggle = (id, newLiked) => {
    setLikedIds(prev =>
      newLiked ? [...prev, id] : prev.filter(x => x !== id)
    );
  };

  const filteredCharacters = characters.filter(char =>
    char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedCharacters = [...filteredCharacters].sort((a, b) => {
    const valA = parseFloat(activeTab === '조회수순' ? a.chats : a.likes);
    const valB = parseFloat(activeTab === '조회수순' ? b.chats : b.likes);
    return valB - valA;
  });

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
                  onClick={() => setActiveTab(tab)}
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
              const isLiked = likedIds.includes(character.id);
              const handleSelect = () => setSelectedCharacter(character);

              return (
                <div
                  key={character.id}
                  role="button"
                  tabIndex={0}
                  onClick={handleSelect}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSelect()}
                  className="group relative aspect-[3/4] bg-gray-700 rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/30"
                >
                  <img
                    src={character.image}
                    alt={character.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h3 className="font-bold truncate">{character.name}</h3>
                    <p className="text-xs text-gray-300 truncate">{character.description}</p>
                    <div className="flex justify-between items-center mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>{character.messageCount}</span>
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
                            <SolidHeart className="w-4 h-4 text-red-500" />
                          ) : (
                            <OutlineHeart className="w-4 h-4 text-gray-300 group-hover:text-red-400" />
                          )}
                        </button>
                        <span>{character.likes}</span>
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
          liked={likedIds.includes(selectedCharacter.id)}
          origin="communities"
          onClose={() => setSelectedCharacter(null)}
          onLikeToggle={handleLikeToggle}
        />
      )}
    </div>
  );
}
