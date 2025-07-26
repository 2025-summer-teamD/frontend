import React from 'react';

// 캐릭터 정보 표시 컴포넌트
const CharacterInfo = ({ character, isMine, nameSize = "", showLevel = false }) => {
  return (
    <>
      <h3 className={`font-bold truncate text-cyan-200 drop-shadow-[0_0_4px_#0ff] ${nameSize}`} style={{fontFamily:'Share Tech Mono, monospace'}}>
        {character.name}
      </h3>
      {isMine && showLevel ? (
        <p className="text-xs text-yellow-300 truncate font-bold" style={{fontFamily:'Share Tech Mono, monospace', textShadow:'0 0 4px #ffff00, 0 0 8px #ffff00'}}>
          Lv.{character.level || 1}
        </p>
      ) : (
        <p className="text-xs text-fuchsia-300 truncate drop-shadow-[0_0_2px_#f0f]" style={{fontFamily:'Share Tech Mono, monospace'}}>
          {character.introduction || character.description}
        </p>
      )}
    </>
  );
};

export default CharacterInfo; 