import { useState } from 'react';
import Header from '../components/Header';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[linear-gradient(to_bottom,_#000034,_#6B7595)]">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {children}
      </div>
    </div>
  );
}
