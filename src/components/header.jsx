import { Link, NavLink } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import AnimatedAuthHeader from './AnimatedAuthHeader';

export default function Header() {
  return (
    <div className="w-full h-[80px] z-50 bg-[linear-gradient(40deg,_#040438_17.08%,_#3C3C56_73.2%)] shadow-md flex items-center px-5">
      {/* 왼쪽 로고 */}
      <Link to="/">
        <div className="flex items-center">
          <img src="/assets/logo.png" alt="Logo" className="h-[40px] w-[40px]" />
          <span className="text-white font-bold text-[28px] ml-3">ChatMate</span>
        </div>
      </Link>

      {/* 오른쪽 내비게이션 (Sidebar 스타일과 동일하게 적용) */}
      <nav className="ml-auto flex items-center space-x-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `text-white/70 hover:text-white px-3 py-2 text-[24px] rounded hover:bg-white/10 ${isActive ? 'font-bold' : ''}`
          }
        >
          홈
        </NavLink>
        <NavLink
          to="/community"
          className={({ isActive }) =>
            `text-white/70 hover:text-white px-3 py-2 text-[24px] rounded hover:bg-white/10 ${isActive ? 'font-bold' : ''}`
          }
        >
          커뮤니티
        </NavLink>
        <NavLink
          to="/createCharacter"
          className={({ isActive }) =>
            `text-white/70 hover:text-white px-3 py-2 text-[24px] rounded hover:bg-white/10 ${isActive ? 'font-bold' : ''}`
          }
        >
          만들기
        </NavLink>
        <NavLink
          to="/characterList"
          className={({ isActive }) =>
            `text-white/70 hover:text-white px-3 py-2 text-[24px] rounded hover:bg-white/10 ${isActive ? 'font-bold' : ''}`
          }
        >
          내 캐릭터
        </NavLink>

        {/* 기존 아바타 버튼 유지 */}
        {/* <button className="flex items-center text-[#9CA3AF]"> */}
        <AnimatedAuthHeader />
        {/* </button> */}
      </nav>
    </div>
  );
}
