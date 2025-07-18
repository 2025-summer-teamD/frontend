import { useEffect, useRef } from 'react';
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
  {
    name: 'Karina',
    desc: '에스파의 완성형 리더',
    img: KarinaImg,
  },
  {
    name: 'Karina',
    desc: '에스파의 완성형 리더',
    img: KarinaImg,
  },
  {
    name: 'Karina',
    desc: '에스파의 완성형 리더',
    img: KarinaImg,
  },
  {
    name: 'Karina',
    desc: '에스파의 완성형 리더',
    img: KarinaImg,
  }
  
];

export default function PopularCharacters() {
  const containerRef = useRef(null);
  const scrollInterval = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    const handleMouseMove = (e) => {
      const { left, right } = container.getBoundingClientRect();
      const mouseX = e.clientX;

      clearInterval(scrollInterval.current);

      if (mouseX - left < 200) {
        scrollInterval.current = setInterval(() => {
          container.scrollLeft -= 1000; // 스크롤 이동속도(오른쪽)
        }, 10);
      } else if (right - mouseX < 200) {
        scrollInterval.current = setInterval(() => {
          container.scrollLeft += 1000; // 스크롤 이동속도(왼쪽)
        }, 10);
      }
    };

    const stopScrolling = () => {
      clearInterval(scrollInterval.current);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', stopScrolling);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', stopScrolling);
      clearInterval(scrollInterval.current);
    };
  }, []);

  return (
    <section id="characters" className="py-8 md:py-16 px-4 md:px-8">
      <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-[48px] font-bold text-center text-white mb-4 md:mb-6">
        인기 캐릭터
      </h2>
      <p className="text-lg md:text-xl lg:text-2xl xl:text-[24px] text-center font-extrabold mb-16 md:mb-20 leading-relaxed">
        복잡한 설정 없이, 인기 캐릭터와 바로 소통하세요.
      </p>

      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto px-2 py-4 scroll-smooth"
        style={{
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE, Edge
        }}
      >
        {/* 🧼 스크롤바 숨기기 (Webkit 기반 브라우저용) */}
        <style>
          {`
            div::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>

        {characters.map(({ name, desc, img }) => (
          <div
            key={name}
            className="min-w-[240px] aspect-[3/4] relative rounded-2xl overflow-hidden shadow-lg bg-white/10 hover:scale-105 transition-transform duration-300"
          >
            <img
              src={img}
              alt={name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h3 className="text-2xl font-extrabold text-white">{name}</h3>
              <p className="text-sm font-medium text-white mt-1">{desc}</p>
              <button className="mt-3 w-full py-1.5 bg-[#4F46E5] rounded-lg text-white font-semibold text-sm hover:bg-purple-700 transition-all">
                바로 대화하기
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
