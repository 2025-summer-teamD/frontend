import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Communities from './pages/Communities';
import CharacterList from './pages/CharacterList';
import CreateCharacter from './pages/CreateCharacter';
import ChatMate from './pages/chatMate';
import AppLayout from './layouts/AppLayout';
import Sidebar from './components/SideBar';
import ProtectedRoute from './components/ProtectedRoute';
import { ChatRoomsProvider } from './contexts/ChatRoomsContext';

function App() {
  const location = useLocation();
  const path = location.pathname;

  const isHome = path === '/';

  return (
    <ChatRoomsProvider>
      {isHome ? (
        <AppLayout>
          <Home />
        </AppLayout>
      ) : (
        <Sidebar>
          <Routes>
            <Route path="/communities" element={<Communities />} />
            <Route
              path="/characterList"
              element={
                <ProtectedRoute>
                  <CharacterList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/createCharacter"
              element={
                <ProtectedRoute>
                  <CreateCharacter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chatMate/:roomId"
              element={
                <ProtectedRoute>
                  <ChatMate />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Sidebar>
      )}
    </ChatRoomsProvider>
  );
}

export default App;
