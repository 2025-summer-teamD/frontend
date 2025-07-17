import { Link, NavLink } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import AnimatedAuthHeader from './AnimatedAuthHeader';
import { Menu } from 'lucide-react';

export default function Header({ onMenuClick }) {
  return (
    <div className="w-full h-[80px] z-50 border-b border-white bg-[linear-gradient(40deg,_#040438_17.08%,_#3C3C56_73.2%)] flex items-center px-5">
      {/* 왼쪽 로고 */}
      <Link to="/">
        <div className="flex items-center">
          <img src="/assets/logo.png" alt="Logo" className="h-[40px] w-[40px]" />
          <span className="text-white font-bold text-[28px] ml-3">ChatMate</span>
        </div>
      </Link>

      {/* 오른쪽 내비게이션 (md 이상에서 보임) */}
      <nav className="hidden md:flex items-center space-x-4 ml-auto">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `text-white hover:text-white px-3 py-2 text-[24px] rounded hover:bg-white/10`
          }
        >
          홈
        </NavLink>
        <NavLink
          to="/communities"
          className={({ isActive }) =>
            `text-white/70 hover:text-white text-white text-[18px] px-3 py-2 rounded hover:bg-white/10`
          }
        >
          커뮤니티
        </NavLink>
        <NavLink
          to="/createCharacter"
          className={({ isActive }) =>
            `text-white/70 hover:text-white px-3 py-2 text-[18px] rounded hover:bg-white/10`
          }
        >
          만들기
        </NavLink>
        <NavLink
          to="/characterList"
          className={({ isActive }) =>
            `text-white/70 hover:text-white px-3 py-2 text-[18px] rounded hover:bg-white/10`
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
