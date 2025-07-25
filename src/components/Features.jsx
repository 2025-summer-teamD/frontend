import { useNavigate } from 'react-router-dom';

const features = [
  {
    title: '지능적 대화',
    description: '내가 만든 AI 캐릭터와 실시간으로 대화하며 친밀도를 쌓아보세요.',
    button: { label: '내 캐릭터', to: '/characterList' }
  },
  {
    title: '개성있는 캐릭터',
    description: '말투, 성격, 취향까지 직접 설정해서 나만의 AI 캐릭터를 만들어보세요.',
    button: { label: '만들기', to: '/createCharacter' }
  },
  {
    title: '커뮤니티 공유',
    description: '완성한 AI 캐릭터를 커뮤니티에 공유하고, 다양한 사람들과 소통하며 성장시켜보세요.',
    button: { label: '커뮤니티', to: '/communities' }
  }
];

export default function Features() {
  const navigate = useNavigate();
  return (
    <section id="features" className="py-6 md:py-12 px-4 md:px-6">
      <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-[48px] font-bold text-center text-white mb-4 md:mb-6">
        주요 기능
      </h2>
      <p className="text-center text-lg md:text-xl lg:text-2xl xl:text-[24px] font-bold mb-20 md:mb-24 leading-relaxed">
        AI 캐릭터 생성, 대화, 공유까지. 상상한 모든 기능을 하나의 공간에서 경험해보세요.
      </p>
      
      <div className="max-w-[100rem] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center items-center">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-black/60 glass border-2 border-cyan-700 rounded-2xl p-6 flex flex-col items-center justify-center shadow-[0_0_16px_#0ff,0_0_32px_#a0f] hover:shadow-[0_0_32px_#0ff,0_0_64px_#a0f] transition-all duration-300 animate-fadeIn font-cyberpunk" style={{boxShadow:'0 0 16px #0ff, 0 0 32px #a0f', border:'2px solid #0ff8', textShadow:'0 0 8px #0ff, 0 0 2px #fff'}}>
              <button
                className="mb-4 px-4 py-2 rounded-lg bg-black/70 border-2 border-fuchsia-400 text-fuchsia-200 font-bold shadow-[0_0_8px_#f0f,0_0_16px_#a0f] hover:bg-fuchsia-900/80 hover:text-white transition-all duration-200 tracking-widest font-cyberpunk"
                style={{boxShadow:'0 0 8px #f0f, 0 0 16px #a0f', border:'2px solid #f0f', textShadow:'0 0 4px #f0f'}}
                onClick={() => navigate(feature.button.to)}
              >
                {feature.button.label}
              </button>
              <h3 className="text-xl md:text-2xl xl:text-[20px] font-bold text-cyan-200 mb-2 tracking-widest font-cyberpunk" style={{textShadow:'0 0 8px #0ff, 0 0 2px #fff'}}>{feature.title}</h3>
              <div className="text-cyan-100/90 text-sm md:text-base xl:text-[16px] text-center font-cyberpunk" style={{textShadow:'0 0 4px #0ff2'}}>
                {feature.description}
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}