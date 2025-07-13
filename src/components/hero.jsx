import RobotVideo from '/assets/robotVideo.mp4'; 
import { Link } from 'react-router-dom';

// 메인화면 컴포넌트
export default function Hero() {
    return (
        <section id="home" className="">
            <div className="relative w-full">
        <video src={RobotVideo} autoPlay loop muted playsInline className="w-full h-full object-cover"/>
        <div className="absolute inset-x-0 top-[50vh] -translate-y-1/2 flex flex-col justify-center items-center text-white text-center px-8">
        <h1 className="text-[75px] font-extrabold mb-4 bg-clip-text text-transparent bg-[linear-gradient(to_right,_#555555_16%,_#FFFFFF_59%)]">    {/* 헤딩 텍스트 추가 */}          
          나만의 AI 인격체와<br/>자유롭게 대화하세요
        </h1>
        <h1 className="max-w-3xl mb-12 text-[20px] text-white/70 text-center font-bold"> {/* 텍스트 최대 너비 추가 */}
          지금 이 순간에도 누군가는 새로운 AI를 만나고,나만의 AI친구를 성장시키고 있어요. <br/> 대화로 시작해,연결로 이어지는 특별한 경험을 함께하세요.
        </h1>
        <div className="flex space-x-10"> {/* 버튼 그룹 추가 */}
          <Link to="/createCharacter" className="flex items-center justify-center w-[353px] h-[73px] font-extrabold text-[22px] bg-[#4F46E5] rounded-lg hover:bg-purple-700">
            새 인격체 만들기
          </Link>
          <Link to="/community" className="flex items-center justify-center w-[353px] h-[73px] font-extrabold text-[22px] bg-[#1F2937] rounded-lg hover:bg-gray-800"> {/* 버튼 스타일 추가 */}
            커뮤니티 둘러보기
          </Link>
        </div>
        </div>
        </div>
      </section>
    )
  }