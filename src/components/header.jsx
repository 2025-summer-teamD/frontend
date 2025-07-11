import { Link } from 'react-router-dom';
// 상단 바 컴포넌트
export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full h-[80px] bg-[#040438] shadow-md z-50 flex items-center px-8">  {/* 상단에 고정하고 배경색 #040438,콘텐츠 수평,좌유정렬,좌우패딩 8px */}
        {/* 왼쪽 로고 & 웹 이름 */}
        <Link to="/">
        <div className="flex items-center space-x-2"> {/* 로고,텍스트 사이에 0.5rem 간격 */}
        <img src="/assets/vite.svg" alt="Logo" className="h-8 w-8" />  {/* 로고 이미지 추가 */}
        <span className="text-white font-bold text-[28px]">ChatMate</span> {/* 흰색,굵고 xl사이즈 글씨 */}
      </div>
      </Link>
      {/* 오른쪽 내비게이션 */}
      <nav className="ml-auto flex items-center space-x-6 text-[24px]"> {/* 로고와 멀리떨어트려 오른쪽으로 정렬,흰색글씨 */}
        <Link to="/"className="hover:underline text-white">홈</Link>
        <Link to="/chatmate" className="hover:underline text-white/80 hover:text-white transition-colors">ChatMate</Link>
        <Link to="/characterList" className="hover:underline text-[#9CA3AF]" >내 캐릭터</Link>
        <Link to="/community" className="hover:underline text-[#9CA3AF]">커뮤니티</Link>
        <Link to="/CreateCharacter" className="hover:underline text-[#9CA3AF]">캐릭터 만들기</Link>
        <button className="flex items-center space-x-1 hover:underline text-[#9CA3AF]">
          <img src="/assets/Avatar.png" alt="User" className="h-[40px] w-[40px] rounded-full" />
        </button>
      </nav>
    </header>)
}
