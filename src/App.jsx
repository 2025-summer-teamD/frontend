import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Community from './pages/community';
import CharacterList from './pages/CharacterList';
import CreateCharacter from './pages/CreateCharacter';
import ChatMate from './pages/ChatMate';
import AppLayout from './layouts/AppLayout';
import Sidebar from './components/sideBar';

function App() {
  const location = useLocation();
  const path = location.pathname;

  const isHome = path === '/';

  return (
    <>
      {isHome ? (
        <AppLayout>
          <Home />
        </AppLayout>
      ) : (
        <Sidebar>
          <Routes>
            <Route path="/community" element={<Community />} />
            <Route path="/characterList" element={<CharacterList />} />
            <Route path="/createCharacter" element={<CreateCharacter />} />
            <Route path="/chatMate" element={<ChatMate />} />
          </Routes>
        </Sidebar>
      )}
    </>
  );
}

export default App;
