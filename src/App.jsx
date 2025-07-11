import Header from "./components/header";
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Community from './pages/community';
import CharacterList from './pages/CharacterList';
import CreateCharacter from './pages/CreateCharacter';
import ChatMate from './pages/ChatMate';

function App() {
  const location = useLocation();
  const isChatMate = location.pathname === '/chatmate';

  return (
    <>
    {!isChatMate && <Header />}
    <main className={isChatMate ? "" : "pt-20"}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/community" element={<Community />} />
        <Route path="/characterList" element={<CharacterList />} />
        <Route path="/createCharacter" element={<CreateCharacter />} />
        <Route path="/chatmate" element={<ChatMate />} />
      </Routes>
    </main>
    </>
  );
}

export default App;
