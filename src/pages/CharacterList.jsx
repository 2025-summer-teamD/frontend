// src/pages/CharacterList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CharacterProfile from '../components/CharacterProfile';
import CharacterEditModal from '../components/CharacterEditModal';
import characters from '../data/characters';
import { Search } from 'lucide-react';

export default function CharacterList() {
  const myId = 'me'; // 실제 로그인 정보로 대체

  const [likedIds, setLikedIds] = useState(() =>
    JSON.parse(localStorage.getItem('likedIds')) || []
  );
  useEffect(() => {
    localStorage.setItem('likedIds', JSON.stringify(likedIds));
  }, [likedIds]);

  const [tab, setTab] = useState('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [editingCharacter, setEditingCharacter] = useState(null);

  const myCharacters = characters.filter(
    c => c.creator === myId &&
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const likedCharacters = characters.filter(
    c => likedIds.includes(c.id) &&
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const showCharacters = tab === 'my' ? myCharacters : likedCharacters;

  const handleLikeToggle = (id, newLiked) => {
    setLikedIds(prev =>
      newLiked ? [...prev, id] : prev.filter(x => x !== id)
    );
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

  return (
    <div className="bg-gray-800 text-white min-h-screen font-sans">
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-white font-bold md:text-[1.5rem] text-center">내 캐릭터 목록</h1>
          <p className="text-[1rem] text-gray-400">내가 만들거나 저장한 캐릭터 목록이에요</p>
        </header>

        {/* Search */}
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
                  <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 버튼 3개: 왼쪽 2개, 오른쪽 1개 */}
        <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg font-bold ${tab === 'my' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setTab('my')}
            >
              내 캐릭터
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-bold ${tab === 'liked' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setTab('liked')}
            >
              찜한 캐릭터
            </button>
          </div>
          <Link
            to="/createCharacter"
            className="px-4 py-2 rounded-lg font-bold bg-gradient-to-r from-[#413ebc] to-[#413ebc] text-white hover:from-indigo-600 hover:to-purple-700 transition-all text-center"
          >
            + 새 캐릭터 만들기
          </Link>
        </div>

        {/* 캐릭터 카드 그리드 */}
        {showCharacters.length === 0 ? (
          <div className="text-center py-20">
            <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-white">검색 결과가 없습니다</h3>
            <p className="mt-1 text-sm text-gray-400">다른 검색어로 다시 시도해보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {showCharacters.map(character => {
              const isMine = character.creator === myId;
              const isLiked = likedIds.includes(character.id);

              return (
                <div
                  key={character.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedCharacter(character)}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setSelectedCharacter(character)}
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
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-300 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            
                          )}
                        </button>
                        <span>{character.likes}</span>
                      </div>
                    </div>
                    {/* 수정/삭제 버튼: 내 캐릭터 탭+내꺼, 찜한 캐릭터 탭은 삭제만 */}
                    <div className="flex gap-2 mt-2">
                      {tab === 'my' && isMine && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleEditCharacter(character);
                          }}
                          className="p-1 rounded bg-blue-500 bg-opacity-20 border border-blue-400 border-opacity-30 text-blue-300 hover:bg-blue-500 hover:bg-opacity-40 hover:text-white transition-all duration-200"
                          title="캐릭터 수정"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      )}
                      {(tab === 'my' && isMine) || tab === 'liked' ? (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteCharacter(character);
                          }}
                          className="p-1 rounded bg-red-500 bg-opacity-20 border border-red-400 border-opacity-30 text-red-300 hover:bg-red-500 hover:bg-opacity-40 hover:text-white transition-all duration-200"
                          title="캐릭터 삭제"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 캐릭터 상세/수정 모달 */}
        {selectedCharacter && (
          <CharacterProfile
            character={selectedCharacter}
            liked={likedIds.includes(selectedCharacter.id)}
            origin={tab === 'my' ? 'my' : 'community'}
            onClose={() => setSelectedCharacter(null)}
            onLikeToggle={handleLikeToggle}
          />
        )}

        {editingCharacter && (
          <CharacterEditModal
            character={editingCharacter}
            liked={likedIds.includes(editingCharacter.id)}
            onClose={() => setEditingCharacter(null)}
            onSave={handleSaveCharacter}
            onLikeToggle={handleLikeToggle}
          />
        )}
      </main>
    </div>
  );
}
