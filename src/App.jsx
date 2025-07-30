import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Communities from './pages/Communities';
import CharacterList from './pages/CharacterList';
import CreateCharacter from './pages/CreateCharacter';
import ChatMate from './pages/ChatMate';
import AppLayout from './layouts/AppLayout';
import Sidebar from './components/SideBar';
import ProtectedRoute from './components/ProtectedRoute';
import { ChatRoomsProvider } from './contexts/ChatRoomsContext';
import { ChatMessagesProvider } from './contexts/ChatMessagesContext';
import './App.css'

function App() {
  return (
    <ChatRoomsProvider>
      <ChatMessagesProvider>
        <Routes>
          {/* 홈만 AppLayout */}
          <Route
            path="/"
            element={
              <AppLayout>
                <Home />
              </AppLayout>
            }
          />

          {/* 나머지는 Sidebar 공통 레이아웃 */}
          <Route
            path="*"
            element={
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
                    path="/chatmate/:roomId"
                    element={
                      <ProtectedRoute>
                        <ChatMate />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Sidebar>
            }
          />
        </Routes>
      </ChatMessagesProvider>
    </ChatRoomsProvider>
  );
}

export default App;
