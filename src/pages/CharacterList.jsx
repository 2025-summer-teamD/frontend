import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CharacterProfile from '../components/characterProfile';

export default function CharacterList() {
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const characters = [
    { id: 1, name: 'Iron Man', description: '천재 발명가이자 아이언맨 슈트를 착용한 토니 스타크', intimacy: 60, chats: '10', likes: '23', image: '/assets/ironman.png' },
    { id: 2, name: 'Karina', description: '에스파의 멤버이자 리더', intimacy: 45, chats: '7', likes: '8', image: '/assets/karina.png' },
    { id: 3, name: 'Andrew Park', description: '천재 개발자 겸 창업가 온라인 비즈니스 분야 전문가', intimacy: 75, chats: '17', likes: '50', image: '/assets/andrew.png' },
    { id: 4, name: 'Moana', description: '바다의 부름을 받은 모아나 와이알리키', intimacy: 30, chats: '1', likes: '3', image: '/assets/moana.png' },
    { id: 5, name: 'Andrew Park', description: '천재 개발자 겸 창업가 온라인 비즈니스 분야 전문가', intimacy: 85, chats: '29', likes: '77', image: '/assets/andrew.png' },
  ];

  const handleCharacterClick = (character) => {
    setSelectedCharacter(character);
  };

  const handleCloseModal = () => {
    setSelectedCharacter(null);
  };

  const handleEditCharacter = (character) => {
    // 편집 모달 열기 또는 편집 페이지로 이동
    console.log('Edit character:', character);
    // 여기에 편집 로직 추가
  };

  const handleDeleteCharacter = (character) => {
    // 삭제 확인 모달 표시 후 삭제 처리
    if (window.confirm(`${character.name} 캐릭터를 삭제하시겠습니까?`)) {
      console.log('Delete character:', character);
      // 여기에 삭제 로직 추가
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
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
          {characters.map((character) => (
            <div
              key={character.id}
              className="relative flex items-center gap-6 p-8 rounded-2xl backdrop-blur-md transition-all duration-300 bg-[#1E1E1E] bg-opacity-10 border border-white border-opacity-20 hover:bg-indigo-500 hover:bg-opacity-20 hover:border-indigo-400 hover:-translate-y-2 group"
              onClick={() => handleCharacterClick(character)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCharacterClick(character);
                }
              }}
              role="button"
              tabIndex={0}
            >
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 border-2 border-black overflow-hidden flex-shrink-0">
                {character.image && (
                  <img src={character.image} alt={character.name} className="w-full h-full object-cover" />
                )}
              </div>

              {/* Character Info */}
              <div className="flex-1">
                <h3 className="text-xl font-extrabold mb-2 text-white">{character.name}</h3>
                <p className="text-white font-bold mb-3">{character.description}</p>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span>친밀도</span>
                  <div className="w-48 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${character.intimacy}%` }}
                    ></div>
                    <span>친밀도</span>
                  </div>
                </div>
              </div>

              {/* Edit/Delete 버튼 (hover 시만 표시됨) */}
              <div
  className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
  onClick={(e) => e.stopPropagation()}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation(); // 클릭과 동일한 동작
    }
  }}
  tabIndex={0} // 포커스 가능하게 만들어줌
  role="group" // optional: 접근성 역할 지정 (또는 'button'으로 변경 가능)
>
                <button
                  onClick={() => handleEditCharacter(character)}
                  className="p-2 rounded-lg bg-blue-500 bg-opacity-20 border border-blue-400 border-opacity-30 text-blue-300 hover:bg-blue-500 hover:bg-opacity-40 hover:text-white transition-all duration-200 backdrop-blur-sm"
                  title="캐릭터 수정"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                <button
                  onClick={() => handleDeleteCharacter(character)}
                  className="p-2 rounded-lg bg-red-500 bg-opacity-20 border border-red-400 border-opacity-30 text-red-300 hover:bg-red-500 hover:bg-opacity-40 hover:text-white transition-all duration-200 backdrop-blur-sm"
                  title="캐릭터 삭제"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedCharacter && (
        <CharacterProfile
          character={selectedCharacter}
          onClose={handleCloseModal}
          origin="my"
        />
      )}
    </div>
  );
}
