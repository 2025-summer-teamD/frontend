import ChatDemo from '/assets/chatDemo.png'

export default function ChatPreview() {
    return (
      <section id="chat-preview" className="py-8 md:py-16 px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-[48px] font-bold text-center text-white mb-8 md:mb-20 mt-8 md:mt-20">
          실시간 대화 인터페이스를 직접 확인해보세요
        </h2>
        <div className="max-w-[100rem] mx-auto">
          <div className="w-full max-w-[1301px] h-[300px] sm:h-[400px] md:h-[500px] lg:h-[700px] xl:h-[841px] bg-white/10 rounded-2xl flex items-center justify-center mx-auto hover:bg-[#1F2937] transition-all p-4">
            <img 
              src={ChatDemo} 
              alt="Chat Demo" 
              className="w-full h-full object-contain rounded-lg" 
            />
          </div>
        </div>
      </section>
    )
}