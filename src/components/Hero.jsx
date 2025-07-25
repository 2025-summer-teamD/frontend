import pokemon from '/assets/gif/pokemon.gif';
import { useNavigate } from 'react-router-dom';

// 메인화면 컴포넌트
export default function Hero() {
    const navigate = useNavigate();

    return (
        <section id="home" className="relative w-full h-screen overflow-hidden">
            <img
                src={pokemon} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-4 md:px-8">
                <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-[75px] font-extrabold mb-4 bg-clip-text text-transparent bg-[linear-gradient(to_right,_#555555_16%,_#FFFFFF_59%)] max-w-6xl">
                    나만의 AI 인격체와<br/>자유롭게 대화하세요
                </h1>
                <p className="max-w-xs md:max-w-2xl lg:max-w-3xl mb-8 md:mb-12 text-sm md:text-lg lg:text-xl xl:text-[20px] text-white/70 text-center font-bold leading-relaxed">
                    지금 이 순간에도 누군가는 새로운 AI를 만나고,나만의 AI친구를 성장시키고 있어요. <br className="hidden md:block"/> 대화로 시작해,연결로 이어지는 특별한 경험을 함께하세요.
                </p>
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-10 w-full max-w-sm md:max-w-none justify-center">
                    <button 
                        onClick={() => navigate('/createCharacter')}
                        className="flex items-center justify-center w-full md:w-[280px] lg:w-[353px] h-[60px] md:h-[73px] font-extrabold text-lg md:text-xl lg:text-[22px] bg-[#4F46E5] rounded-lg hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        새 인격체 만들기
                    </button>
                    <button 
                        onClick={() => navigate('/communities')}
                        className="flex items-center justify-center w-full md:w-[280px] lg:w-[353px] h-[60px] md:h-[73px] font-extrabold text-lg md:text-xl lg:text-[22px] bg-[#1F2937] rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        커뮤니티 둘러보기
                    </button>
                </div>
            </div>
        </section>
    )
}