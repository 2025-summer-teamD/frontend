import Header from '../components/Header';

export default function AppLayout({ children }) {
  return (
    <div className="h-screen border-b flex flex-col bg-[linear-gradient(to_bottom,_#000034,_#6B7595)]">
      {/* 헤더 포함 (fixed 아님) */}
      <Header />
      {/* 헤더 아래 콘텐츠 스크롤 가능 */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {children}
      </div>
    </div>
  );
}
