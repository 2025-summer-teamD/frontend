import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CharacterProfile = ({ character, onClose }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 p-5">
      <div className="bg-gray-800 rounded-3xl p-8 w-80 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 프로필 헤더 */}
        <div className="flex items-center mb-8">
          <div className="w-20 h-20 bg-gray-300 rounded-full border-4 border-blue-500 mr-5"></div>
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">{character.name}</h1>
            <p className="text-gray-400 text-sm mb-3">By ...</p>
            <p className="text-gray-300 text-sm">{character.intro}</p>
          </div>
        </div>


        {/* 통계 */}
        <div className="flex justify-between mb-10">
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-white mb-1">5</div>
            <div className="text-gray-400 text-sm">대화</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-white mb-1">7</div>
            <div className="text-gray-400 text-sm">공유</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-white mb-1">10</div>
            <div className="text-gray-400 text-sm">좋아요</div>
          </div>
        </div>

        {/* 캐릭터 정보 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">캐릭터 정보</h2>
          
          <div className="space-y-8">
            <div className="pb-6 border-b border-gray-700">
              <div className="text-gray-400 text-sm">성격</div>
            </div>
            
            <div className="pb-6 border-b border-gray-700">
              <div className="text-gray-400 text-sm">특징</div>
            </div>
            
            <div className="pb-6 border-b border-gray-700">
              <div className="text-gray-400 text-sm mb-3">태그</div>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs">
                  #캐릭터 id
                </span>
                <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs">
                  #만든 이
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 닫기 버튼 */}
        <button 
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-2xl transition-colors duration-200 text-lg"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default function CharacterList() {
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const characters = [
    { id: 1, name: '캐릭터 이름', intro: '소개 · 소개입니다.', intimacy: 60 },
    { id: 2, name: '캐릭터 이름', intro: '소개 · 소개입니다.', intimacy: 45 },
    { id: 3, name: '캐릭터 이름', intro: '소개 · 소개입니다.', intimacy: 75 },
    { id: 4, name: '캐릭터 이름', intro: '소개 · 소개입니다.', intimacy: 30 },
    { id: 5, name: '캐릭터 이름', intro: '소개 · 소개입니다.', intimacy: 85 },
  ];

  const chatList = [
    { id: 1, name: "이름", lastMessage: "최근 채팅", time: "채팅 시간" },
    { id: 2, name: "이름", lastMessage: "최근 채팅", time: "채팅 시간" },
    { id: 3, name: "이름", lastMessage: "최근 채팅", time: "채팅 시간" }
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
          <Link to="/createCharacter" className="bg-[#413ebc] text-white font-bold hover:from-indigo-600 hover:to-purple-700 px-6 py-3 rounded-lg transition-all transform hover:-translate-y-1 flex items-center gap-2">
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
              /* 키보드 접근성 추가 */
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault(); // space 키는 기본 스크롤 방지
                  handleCharacterClick(character);
                }
              }}
              role="button"
              tabIndex={0}

              className="flex items-center gap-6 p-8 rounded-2xl backdrop-blur-md transition-all duration-300 cursor-pointer bg-[#1E1E1E] bg-opacity-10 border border-white border-opacity-20 hover:bg-indigo-500 hover:bg-opacity-20 hover:border-indigo-400 hover:-translate-y-2"
            >
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 border-2 border-black flex-shrink-0"></div>
              
              {/* Character Info */}
              <div className="flex-1">
                <h3 className="text-xl font-extrabold mb-2 text-white">{character.name}</h3>
                <p className="text-white font-bold mb-3">{character.intro}</p>
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
        />
      )}
    </div>
  );
}