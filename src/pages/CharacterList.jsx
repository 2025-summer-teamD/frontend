import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CharacterProfile from '../components/characterProfile'; // 경로 맞춰주세요

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

  return (
    <div className="flex-1 overflow-y-auto">
      <main className="max-w-4xl mx-auto p-6 pt-8">
        {/* Page Header */}
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

        {/* Character Cards */}
        <div className="space-y-5">
          {characters.map((character) => (
            <div
              key={character.id}
              onClick={() => handleCharacterClick(character)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCharacterClick(character);
                }
              }}
              role="button"
              tabIndex={0}
              className="flex items-center gap-6 p-8 rounded-2xl backdrop-blur-md transition-all duration-300 cursor-pointer bg-[#1E1E1E] bg-opacity-10 border border-white border-opacity-20 hover:bg-indigo-500 hover:bg-opacity-20 hover:border-indigo-400 hover:-translate-y-2"
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
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal */}
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
