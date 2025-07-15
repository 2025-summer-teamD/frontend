import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CharacterProfile = ({ character, onClose }) => {
  const navigate = useNavigate();

  const handleStartChat = () => {
    // 대화창으로 이동 (라우트는 프로젝트에 맞게 수정)
    navigate(`/chatmate`, {
      state: {
        characterName: character.name,
        characterIntro: character.intro
      }
    });
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 p-5">
      <div className="bg-gray-800 rounded-3xl p-8 w-180 shadow-2xl max-h-[90vh] overflow-y-auto">
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

        {/* 액션 버튼들 */}
        <div className="space-y-3">
          {/* 대화하기 버튼 */}
          <button
            onClick={handleStartChat}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-4 px-6 rounded-2xl transition-all duration-200 text-lg transform hover:scale-105 flex items-center justify-center gap-2"
          >
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            대화하기
          </button>

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-2xl transition-colors duration-200"
          >
            닫기
          </button>
        </div>
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
        {/* Page Header */}
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-semibold text-white">내 캐릭터</h2>
          <Link to="/createCharacter" className="bg-gradient-to-r from-[#413ebc] to-[#413ebc] text-white font-bold hover:from-indigo-600 hover:to-purple-700 px-6 py-3 rounded-lg transition-all transform hover:-translate-y-1 flex items-center gap-2">
            <span className="text-xl">+</span>
            새 캐릭터 만들기
          </Link>
        </div>

        {/* Character Cards */}
        <div className="space-y-5">
          {characters.map((character) => (
            <div
              key={character.id}
              className="relative flex items-center gap-6 p-8 rounded-2xl backdrop-blur-md transition-all duration-300 bg-[#1E1E1E] bg-opacity-10 border border-white border-opacity-20 hover:bg-indigo-500 hover:bg-opacity-20 hover:border-indigo-400 hover:-translate-y-2 group"
            >
              {/* Main Content - 클릭 가능한 영역 */}
              <div
                onClick={() => handleCharacterClick(character)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCharacterClick(character);
                  }
                }}
                role="button"
                tabIndex={0}
                className="flex items-center gap-6 flex-1 cursor-pointer"
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

              {/* Action Buttons */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Edit Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 부모 클릭 이벤트 방지
                    handleEditCharacter(character);
                  }}
                  className="p-2 rounded-lg bg-blue-500 bg-opacity-20 border border-blue-400 border-opacity-30 text-blue-300 hover:bg-blue-500 hover:bg-opacity-40 hover:text-white transition-all duration-200 backdrop-blur-sm"
                  title="캐릭터 수정"
                >
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 부모 클릭 이벤트 방지
                    handleDeleteCharacter(character);
                  }}
                  className="p-2 rounded-lg bg-red-500 bg-opacity-20 border border-red-400 border-opacity-30 text-red-300 hover:bg-red-500 hover:bg-opacity-40 hover:text-white transition-all duration-200 backdrop-blur-sm"
                  title="캐릭터 삭제"
                >
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
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
