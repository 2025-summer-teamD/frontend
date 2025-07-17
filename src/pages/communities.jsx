// src/pages/Communities.jsx
import React, { useState, useEffect } from 'react';
import CharacterProfile from '../components/CharacterProfile';
import characters from '../data/characters';
import { Heart as OutlineHeart, Heart as SolidHeart } from 'lucide-react';

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
    if (activeTab === '조회수순') {
      return (
        parseInt(b.chats.replace('k', '')) -
        parseInt(a.chats.replace('k', ''))
      );
    } else {
      return (
        parseInt(b.likes.replace('k', '')) -
        parseInt(a.likes.replace('k', ''))
      );
    }
  });

  return (
    <div className="flex flex-col h-screen">
      {/* 상단 탭 & 검색 */}
      <div className="relative flex items-center justify-between gap-[1.5rem] mt-[1.5rem] mb-[2rem] px-[1.5rem] max-w-[100rem] mx-auto w-full">
        {/* 탭 */}
        <div className="flex gap-[0.5rem] min-w-[16rem] flex-shrink-0">
          {['인기순','조회수순'].map(tab => (
            <button
              key={tab}
              className={`px-[2rem] py-[0.5rem] text-sm transition-colors ${
                activeTab === tab
                  ? 'bg-[#413ebc] text-white font-bold'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }${tab==='조회수순'?' rounded-r-lg':' rounded-l-lg'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 타이틀 */}
        <h1 className="absolute left-1/2 -translate-x-1/2 text-white font-bold text-[1.625rem]">
          캐릭터 커뮤니티
        </h1>

        {/* 검색 */}
        <div className="flex items-center justify-end min-w-[20rem] gap-0">
          <span className="flex items-center h-[2.5rem] bg-gray-100 rounded-l-lg px-[0.75rem] border-r border-gray-200">
            <svg className="text-gray-400 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="캐릭터 검색..."
            className="bg-gray-100 text-black placeholder-gray-400 pr-[1rem] h-[2.5rem] rounded-r-lg text-[1rem] focus:outline-none focus:ring-2 focus:ring-indigo-500 w-[16rem]"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 캐릭터 그리드 */}
      <div className="flex-1 px-[1.5rem]">
        {sortedCharacters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
            <svg className="w-16 h-16 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <p className="text-lg">검색 결과가 없습니다</p>
            <p className="text-sm">다른 검색어로 시도해보세요</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(16rem,1fr))]">
            {sortedCharacters.map(character => {
              const isLiked = likedIds.includes(character.id);

              const handleSelect = () => setSelectedCharacter(character);
              const handleKeyDown = e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect();
                }
              };

              return (
                <div
                  key={character.id}
                  role="button"
                  tabIndex={0}
                  onClick={handleSelect}
                  onKeyDown={handleKeyDown}
                  className="bg-gray-600 rounded-4xl overflow-hidden hover:bg-gray-750 transition-all cursor-pointer transform hover:-translate-y-1 hover:shadow-2xl min-w-[10rem] max-w-[14rem]"
                >
                  <div className="relative w-full h-[17rem] overflow-hidden">
                    <img
                      src={character.image}
                      alt={character.name}
                      className="absolute inset-0 w-full h-full object-cover transform scale-110"
                    />
                  </div>
                  <div className="p-4 relative">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-bold">{character.name}</h3>
                      <div className="flex items-center text-gray-300">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span className="text-xs font-bold ml-1">{character.chats}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-gray-400 text-xs line-clamp-2 flex-1 mr-2">
                        {character.description}
                      </p>
                      <div className="flex items-center text-gray-300">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleLikeToggle(character.id, !isLiked);
                          }}
                          className="flex items-center focus:outline-none"
                          aria-label="좋아요 토글"
                        >
                          {isLiked ? (
                            <SolidHeart className="w-3 h-3 text-red-400" />
                          ) : (
                            <OutlineHeart className="w-3 h-3 hover:text-red-400 text-gray-300" />
                          )}
                        </button>
                        <span className="text-xs font-bold ml-1">{character.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
