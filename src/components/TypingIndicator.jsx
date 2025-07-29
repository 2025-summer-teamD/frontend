import React from 'react';

const TypingIndicator = ({ aiColor, aiName = 'AI', profileImg }) => {
  return (
    <div className="flex flex-col w-full items-start font-cyberpunk">
      {/* AI 프로필 */}
      <div className="flex items-center mb-1 flex-row font-cyberpunk">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-300 shadow-[0_0_3px_#0ff] flex-shrink-0 bg-gradient-to-br from-cyan-200/60 to-fuchsia-200/40">
          <img
            src={profileImg || '/assets/icon-character.png'}
            alt=""
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <span className="text-cyan-100 font-bold text-sm tracking-widest drop-shadow-[0_0_1px_#0ff] font-cyberpunk ml-2">
          {aiName}
        </span>
      </div>
      
      {/* 타이핑 인디케이터 말풍선 */}
      <div
        className={`max-w-[80%] sm:max-w-[70%] lg:max-w-[60%] px-4 py-3 rounded-xl font-cyberpunk ${
          aiColor
            ? `${aiColor.bg} border-2 ${aiColor.border} ${aiColor.text} ${aiColor.shadow}`
            : 'bg-fuchsia-100/80 border-2 border-fuchsia-200 text-fuchsia-900 shadow-[0_0_4px_#f0f]'
        }`}
        style={aiColor ? { boxShadow: aiColor.shadow.replace('shadow-', '').replace('[', '').replace(']', '') } : {}}
      >
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-sm opacity-70 ml-2">...</span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator; 