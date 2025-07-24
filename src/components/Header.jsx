import { Link, NavLink } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import AnimatedAuthHeader from './AnimatedAuthHeader';
import { Menu } from 'lucide-react';

export default function Header({ onMenuClick }) {
  return (
    <div className="w-full h-[80px] z-50 bg-[linear-gradient(40deg,_#040438_17.08%,_#3C3C56_73.2%)] flex items-center px-5">
      {/* 왼쪽 로고 */}
      <Link to="/" className="flex items-center">
        <div className="flex items-center">
          <img src="/assets/logo.png" alt="Logo" className="h-[40px] w-[40px] header-logo" />
          <span className="text-white font-bold text-[20px] ml-3 header-logo">ChatMate</span>
        </div>
      </Link>

      {/* 오른쪽 내비게이션 (md 이상에서 보임) */}
      <nav className="hidden md:flex items-center space-x-4 ml-auto">
        <NavLink
          to="/"
          className={({ isActive }) => isActive ? "text-white hover:text-white  text-[1.2rem] rounded hover:bg-white/10" : "text-[1.2rem] text-gray-400"}
        >
          홈
        </NavLink>
        <NavLink
          to="/communities"
          className={() =>
            `text-[1.2rem] px-1 text-gray-400`
          }
        >
          커뮤니티
        </NavLink>
        <NavLink
          to="/createCharacter"
          className={() =>
            `text-[1.2rem] px-1 text-gray-400`
          }
        >
          만들기
        </NavLink>
        <NavLink
          to="/characterList"
          className={() =>
            `text-[1.2rem] px-1 text-gray-400`
          }
        >
          내 캐릭터
        </NavLink>
        <AnimatedAuthHeader />
      </nav>

      {/* 메뉴 버튼 (md 이하에서 보임) */}
      <div className="md:hidden ml-auto">
        <button onClick={onMenuClick} className="text-white">
          <Menu size={24} />
        </button>
      </div>
    </div>
  );
}
