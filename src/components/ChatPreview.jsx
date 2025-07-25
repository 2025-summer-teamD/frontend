import ChatDemo from '/assets/chat-preview.png'

export default function ChatPreview() {
  return (
    <section id="chat-preview" className="py-8 md:py-16 px-4 md:px-8">
      <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-[48px] font-bold text-center text-cyan-200 mb-8 md:mb-20 mt-8 md:mt-20 font-rounded drop-shadow-[0_0_8px_#0ff]" style={{textShadow:'0 0 12px #0ff, 0 0 32px #a0f, 0 0 2px #fff'}}>실시간 대화 인터페이스를 직접 확인해보세요</h2>
      <div className="max-w-[100rem] mx-auto">
        <div className="w-full max-w-[1000px] flex items-center justify-center mx-auto mb-8">
          <img
            src={ChatDemo}
            alt="Chat Demo"
            className="max-w-full max-h-[500px] object-contain rounded-2xl border-2 border-cyan-400 shadow-[0_0_16px_#0ff,0_0_32px_#a0f] font-rounded"
            style={{boxShadow:'0 0 16px #0ff, 0 0 32px #a0f', border:'2px solid #0ff8'}}
          />
        </div>
      </div>
    </section>
  )
}
