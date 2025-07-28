import React from 'react';
import InterfaceImg from '/assets/interfaceImg.png';

const ChatPreview = React.memo(() => {
  return (
    <section id="chat-preview" className="py-8 md:py-16 px-4 md:px-8">
      <h2 className="section-title font-bold text-center mb-8 md:mb-20 mt-8 md:mt-20">
        실시간 대화 인터페이스를 직접 확인해보세요
      </h2>
      <div className="max-w-[100rem] mx-auto">
        <div className="w-full max-w-[1000px] flex items-center justify-center mx-auto mb-8">
          <img
            src={InterfaceImg}
            alt="Interface Demo"
            className="max-w-full max-h-[500px] object-contain rounded-2xl border-2 border-cyan-400 shadow-[0_0_16px_#0ff,0_0_32px_#a0f] font-cyberpunk"
            style={{boxShadow:'0 0 16px #0ff, 0 0 32px #a0f', border:'2px solid #0ff8'}}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
});

ChatPreview.displayName = 'ChatPreview';

export default ChatPreview;
