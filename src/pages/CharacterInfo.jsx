
import React, { useState } from 'react';

const CharacterProfile = ({ character, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-5">
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