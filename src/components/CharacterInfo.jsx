import React from 'react';

// 캐릭터 정보 표시 컴포넌트
const CharacterInfo = ({ character, isMine, nameSize = "", showLevel = false }) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        {showLevel ? (
          <span className="text-xs bg-fuchsia-500 text-fuchsia-900 px-2 py-1 rounded font-bold">
            Lv.{character.friendship || 1}
          </span>
        ) : null}
        <span className={`font-bold text-white ${nameSize}`}>
          {character.name}
        </span>
      </div>
      {character.introduction && (
        <p className="text-gray-300 text-sm mt-1 line-clamp-2">
          {character.introduction}
        </p>
      )}
    </div>
  );
};

export default CharacterInfo; 