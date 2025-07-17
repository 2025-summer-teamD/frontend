// src/pages/CharacterList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CharacterProfile from '../components/CharacterProfile';
import CharacterEditModal from '../components/CharacterEditModal';
import CharacterSearchBar from '../components/CharacterSearchBar';
import CharacterGrid from '../components/CharacterGrid';
import characters from '../data/characters';

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
            <CharacterSearchBar value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
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
          <CharacterGrid
            characters={showCharacters}
            myId={myId}
            tab={tab}
            likedIds={likedIds}
            onLikeToggle={handleLikeToggle}
            onEdit={handleEditCharacter}
            onDelete={handleDeleteCharacter}
            onSelect={setSelectedCharacter}
          />
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
