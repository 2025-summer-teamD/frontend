import AndrewImg from '/assets/andrew.png'
import IronManImg from '/assets/ironman.png'
import MoanaImg from '/assets/moana.png'
import KarinaImg from '/assets/karina.png'

const characters = [
  {
    name: 'Andrew Park',
    desc: '언제나 믿고 따를 수 있는 든든한 조언자',
    img: AndrewImg,
  },
  {
    name: 'Iron Man',
    desc: '천재,억만장자,발명가, 그리고 슈퍼히어로',
    img: IronManImg,
  },
  {
    name: 'Moana',
    desc: '바다의 부름에 응답한 진정한 탐험가',
    img: MoanaImg,
  },
  {
    name: 'Karina',
    desc: '에스파의 완성형 리더',
    img: KarinaImg,
  },
]

export default function PopularCharacters() {
  return (
    <section
      id="characters"
      className="
        py-16 px-8
      "
    >
      <h2 className="text-[48px] font-bold text-center text-white mb-6">
        인기 캐릭터
      </h2>
      <p className="text-[24px] text-center font-extrabold mb-12 leading-relaxed">
        복잡한 설정 없이, 인기 캐릭터와 바로 소통하세요.
      </p>

      <div className="w-[1512px] mx-auto flex justify-evenly">
        {characters.map(({ name, desc, img }) => (
          <div
            key={name}
           className="w-[300px] h-[440px] relative rounded-2xl overflow-hidden shadow-lg"
          >
            <img
              src={img}
              alt={name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h3 className="text-4xl font-extrabold text-white">{name}</h3>
              <p className="text-sm font-bold text-white mt-1">{desc}</p>
              <button className="x-[250px] h-[50px] text-[16px] mt-4 w-full py-2 bg-[#4F46E5] rounded-lg text-white font-extrabold text-center shadow-lg">
                바로 대화하기
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}