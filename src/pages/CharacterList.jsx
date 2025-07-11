import React from 'react';

export default function CharacterList() {
  const characters = [
    { id: 1, name: '캐릭터 이름', intro: '소개 · 소개입니다.', intimacy: 60, isSelected: true },
    { id: 2, name: '캐릭터 이름', intro: '소개 · 소개입니다.', intimacy: 45, isSelected: false },
    { id: 3, name: '캐릭터 이름', intro: '소개 · 소개입니다.', intimacy: 75, isSelected: false },
    { id: 4, name: '캐릭터 이름', intro: '소개 · 소개입니다.', intimacy: 30, isSelected: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 pt-16">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-semibold">내 캐릭터</h2>
          <button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-6 py-3 rounded-lg font-medium transition-all transform hover:-translate-y-1 flex items-center gap-2">
            <span className="text-xl">+</span>
            새 캐릭터 만들기
          </button>
        </div>

        {/* Character Cards */}
        <div className="space-y-5">
          {characters.map((character) => (
            <div
              key={character.id}
              className={`
                flex items-center gap-6 p-8 rounded-2xl backdrop-blur-md transition-all duration-300 cursor-pointer
                ${character.isSelected 
                  ? 'bg-indigo-500 bg-opacity-20 border border-indigo-400' 
                  : 'bg-white bg-opacity-10 border border-white border-opacity-20 hover:bg-opacity-15 hover:-translate-y-2'
                }
              `}
            >
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex-shrink-0"></div>
              
              {/* Character Info */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{character.name}</h3>
                <p className="text-gray-300 mb-3">{character.intro}</p>
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
    </div>
  );
}