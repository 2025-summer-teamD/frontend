import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Renders a scrollable list of character cards, each displaying an avatar placeholder, name, introduction, and a visual intimacy progress bar.
 *
 * The component includes a header with a title and a button for creating a new character. Character data is statically defined within the component.
 * No navigation or interactivity beyond visual hover effects is implemented.
 * @returns {JSX.Element} The rendered character list UI.
 */
export default function CharacterList() {

  
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
  return (
        <div className="flex-1 overflow-y-auto">
          <main className="max-w-4xl mx-auto p-6 pt-8">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-semibold text-white">내 캐릭터</h2>
              <button className="bg-[#413ebc] text-white font-bold hover:from-indigo-600 hover:to-purple-700 px-6 py-3 rounded-lg transition-all transform hover:-translate-y-1 flex items-center gap-2">
                <span className="text-xl ">+</span>
                새 캐릭터 만들기
              </button>
            </div>
            {/* Character Cards */}
            <div className="space-y-5">
              {characters.map((character) => (
                <div
                  key={character.id}
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
        </div>
  );
}