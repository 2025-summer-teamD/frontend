import { Link } from 'react-router-dom';
import ChatIcon from '/assets/icon-chat.png'
import CharacterIcon from '/assets/icon-character.png'
import CommunityIcon from '/assets/icon-community.png'

const features = [
  {
    title: '지능적 대화',
    desc: '최신 AI 기술로 자연스럽고 맥락을 이해하는 대화를 경험하세요.',
    icon: ChatIcon,
  },
  {
    title: '개성있는 캐릭터',
    desc: '말투, 성격, 취향까지… 똑같은 AI는 단 하나도 없습니다.',
    icon: CharacterIcon,
  },
  {
    title: '커뮤니티 공유',
    desc: '완성한 AI 캐릭터를 커뮤니티에 공유하고, 다양한 사람들과의 피드백 속에서 더 풍부하게 성장시켜보세요.',
    icon: CommunityIcon,
  },
]

export default function Features() {
  return (
    <section id="features" className="py-16 px-8">
      <h2 className="text-[48px] font-bold text-center text-white mb-18">
        주요 기능
      </h2>
      <p className="text-center text-[24px] font-extrabold mb-10 leading-relaxed">
        AI 캐릭터 생성, 대화, 공유까지. 상상한 모든 기능을 하나의 공간에서 경험해보세요.
      </p>
      <div className="w-[1512px] mx-auto flex justify-evenly">
        {features.map(({ title, desc, icon }) => (
          <div
            key={title}
            className="w-[400px] h-[251px] bg-[linear-gradient(to_top,_#0C0F2B_40%,_#040438_59%)]  p-6 flex flex-col items-center text-center hover:bg-[#1F2937]"
          >
            <img src={icon} alt={title} className="h-[90px] w-[90px] mb-4" />
            <span className="text-[24px] font-semibold text-white/0 mb-2">
              {title}
            </span>
            <p className="text-[16px] text-white/60">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}