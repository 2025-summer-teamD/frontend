// src/pages/CharacterList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CharacterProfile from '../components/CharacterProfile';
import CharacterEditModal from '../components/CharacterEditModal';
import characters from '../data/characters';

export default function CharacterList() {
  const [likedIds, setLikedIds] = useState(() =>
    JSON.parse(localStorage.getItem('likedIds')) || []
  );
  useEffect(() => {
    localStorage.setItem('likedIds', JSON.stringify(likedIds));
  }, [likedIds]);

  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [editingCharacter, setEditingCharacter] = useState(null);

  const handleLikeToggle = (id, newLiked) => {
    setLikedIds(prev =>
      newLiked ? [...prev, id] : prev.filter(x => x !== id)
    );
  };

  const handleEditCharacter = character => {
    setEditingCharacter(character);
  };

  const handleSaveCharacter = (id, formData) => {
    // 여기에 실제 저장 로직을 구현하세요
    console.log('Saving character:', id, formData);
    // 예시: characters 배열 업데이트 또는 API 호출
  };

  const handleDeleteCharacter = character => {
    if (window.confirm(`${character.name} 캐릭터를 삭제하시겠습니까?`)) {
      // 삭제 로직
    }
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      <main className="max-w-4xl mx-auto p-6 pt-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-semibold text-white">내 캐릭터</h2>
          <Link
            to="/createCharacter"
            className="bg-gradient-to-r from-[#413ebc] to-[#413ebc] text-white font-bold hover:from-indigo-600 hover:to-purple-700 px-6 py-3 rounded-lg transition-all transform hover:-translate-y-1 flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            새 캐릭터 만들기
          </Link>
        </div>

        <div className="space-y-5">
          {characters.map(character => (
            <div
              key={character.id}
              className="relative flex items-center gap-6 p-8 rounded-2xl backdrop-blur-md transition-all duration-300 bg-[#1E1E1E] bg-opacity-10 border border-white border-opacity-20 hover:bg-indigo-500 hover:bg-opacity-20 hover:border-indigo-400 hover:-translate-y-2 group"
              onClick={() => setSelectedCharacter(character)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedCharacter(character);
                }
              }}
              role="button"
              tabIndex={0}
            >
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 border-2 border-black overflow-hidden flex-shrink-0">
                <img
                  src={character.image}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Character Info */}
              <div className="flex-1">
                <h3 className="text-xl font-extrabold mb-2 text-white">
                  {character.name}
                </h3>
                <p className="text-white font-bold mb-3">
                  {character.description}
                </p>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span>친밀도</span>
                  <div className="w-48 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${character.intimacy}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* 좋아요 */}
              <div className="flex items-center text-gray-300 absolute bottom-4 right-8">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleLikeToggle(
                      character.id,
                      !likedIds.includes(character.id)
                    );
                  }}
                  className="flex items-center focus:outline-none"
                  aria-label="좋아요 토글"
                >
                  <svg
                    className={`w-5 h-5 ${
                      likedIds.includes(character.id)
                        ? 'text-red-400'
                        : 'text-gray-300'
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78
                      0L12 5.67l-1.06-1.06a5.5 5.5 0
                      0 0-7.78 7.78l1.06 1.06L12 21.23l7.78
                      -7.78 1.06-1.06a5.5 5.5 0 0 0 0
                      -7.78z" />
                  </svg>
                  <span className="text-xs font-bold ml-1">
                    {character.likes}
                  </span>
                </button>
              </div>

              {/* Edit/Delete */}
              <div
                className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={e => e.stopPropagation()}
                onKeyDown={e =>
                  (e.key === 'Enter' || e.key === ' ') && e.stopPropagation()
                }
                role="group"
                tabIndex={0}
              >
                <button
                  onClick={() => handleEditCharacter(character)}
                  className="p-2 rounded-lg bg-blue-500 bg-opacity-20 border border-blue-400 border-opacity-30 text-blue-300 hover:bg-blue-500 hover:bg-opacity-40 hover:text-white transition-all duration-200 backdrop-blur-sm"
                  title="캐릭터 수정"
                >
                  {/* Pencil Icon */}
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0
                        002 2h11a2 2 0 002-2v-5m-1.414
                        -9.414a2 2 0 112.828 2.828L11.828
                        15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteCharacter(character)}
                  className="p-2 rounded-lg bg-red-500 bg-opacity-20 border border-red-400 border-opacity-30 text-red-300 hover:bg-red-500 hover:bg-opacity-40 hover:text-white transition-all duration-200 backdrop-blur-sm"
                  title="캐릭터 삭제"
                >
                  {/* Trash Icon */}
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0
                        0116.138 21H7.862a2 2 0
                        01-1.995-1.858L5 7m5 4v6m4-6v6m1
                        -10V4a1 1 0 00-1-1h-4a1
                        1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedCharacter && (
          <CharacterProfile
            character={selectedCharacter}
            liked={likedIds.includes(selectedCharacter.id)}
            origin="my"
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
