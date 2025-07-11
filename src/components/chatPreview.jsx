import ChatDemo from '/assets/chatDemo.png'

export default function ChatPreview() {
    return (
      <section id="chat-preview" className="py-16 px-8">
        <h2 className="text-[48px] font-bold text-center text-white mb-20 mt-20">
          실시간 대화 인터페이스를 직접 확인해보세요
        </h2>
        <div className="w-[1512px] mx-auto">
          <div className="w-[1301px] h-[841px] bg-white/10 rounded-2xl flex items-center justify-center mx-auto hover:bg-[#1F2937]">
            <img src={ChatDemo} alt="Chat Demo" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>
    )
  }