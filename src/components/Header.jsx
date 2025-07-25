import { Link, NavLink } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import AnimatedAuthHeader from './AnimatedAuthHeader';
import { Menu } from 'lucide-react';

export default function Header({ onMenuClick }) {
  return (
    <div className="w-full h-[80px] z-50 bg-black/60 glass border-b-2 border-cyan-400 shadow-[0_0_16px_#0ff,0_0_32px_#f0f] flex items-center px-5 font-cyberpunk" style={{boxShadow:'0 0 16px #0ff, 0 0 32px #f0f', borderBottom:'2px solid #0ff'}}>
      {/* 왼쪽 로고 */}
      <Link to="/">
        <div className="flex items-center">
          <img src="/assets/logo.png" alt="Logo" className="h-[40px] w-[40px] drop-shadow-[0_0_12px_#0ff]" />
          <span className="text-cyan-200 font-extrabold text-[28px] ml-3 drop-shadow-[0_0_8px_#0ff] font-cyberpunk">ChatMate</span>
        </div>
      </Link>
      {/* 오른쪽 내비게이션 */}
      <nav className="hidden md:flex items-center space-x-4 ml-auto">
        <NavLink
          to="/"
          className={({ isActive }) => isActive ? "text-cyan-200 hover:text-fuchsia-400 text-[1.2rem] rounded bg-black/30 px-2 shadow-[0_0_8px_#0ff] font-cyberpunk" : "text-[1.2rem] px-1 text-cyan-400 hover:text-fuchsia-400 font-cyberpunk"}
        >
          홈
        </NavLink>
        <NavLink
          to="/communities"
          className={({ isActive }) => isActive ? "text-cyan-200 hover:text-fuchsia-400 text-[1.2rem] rounded bg-black/30 px-2 shadow-[0_0_8px_#0ff] font-cyberpunk" : "text-[1.2rem] px-1 text-cyan-400 hover:text-fuchsia-400 font-cyberpunk"}
        >
          커뮤니티
        </NavLink>
        <NavLink
          to="/createCharacter"
          className={({ isActive }) => isActive ? "text-cyan-200 hover:text-fuchsia-400 text-[1.2rem] rounded bg-black/30 px-2 shadow-[0_0_8px_#0ff] font-cyberpunk" : "text-[1.2rem] px-1 text-cyan-400 hover:text-fuchsia-400 font-cyberpunk"}
        >
          만들기
        </NavLink>
        <NavLink
          to="/characterList"
          className={({ isActive }) => isActive ? "text-cyan-200 hover:text-fuchsia-400 text-[1.2rem] rounded bg-black/30 px-2 shadow-[0_0_8px_#0ff] font-cyberpunk" : "text-[1.2rem] px-1 text-cyan-400 hover:text-fuchsia-400 font-cyberpunk"}
        >
          내 캐릭터
        </NavLink>
        <AnimatedAuthHeader />
      </nav>
      {/* 메뉴 버튼 (모바일) */}
      <div className="md:hidden ml-auto">
        <button onClick={onMenuClick} className="text-cyan-200">
          <Menu size={24} />
        </button>
      </div>
    </div>
  );
}
