import Header  from "./components/header";
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Community from './pages/community';
import CharacterList from './pages/CharacterList';
import CreateCharacter from './pages/CreateCharacter';
import ChatMate from './pages/ChatMate';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  return (
    <>
    { isHome && <Header />}
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/community" element={<Community />} />
        <Route path="/characterList" element={<CharacterList />} />
        <Route path="/createCharacter" element={<CreateCharacter />} />
        <Route path="/chatMate" element={<ChatMate />} />
      </Routes>
    </main>
    </>
  );
}

export default App;
