import { Routes, Route, useLocation } from 'react-router-dom';
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

// 모든 페이지에 네온 네모 배경 적용
function NeonBackground() {
  return (
    <div style={{position:'fixed', inset:0, width:'100vw', height:'100vh', pointerEvents:'none', zIndex:0}}>
      <div className="neon-block size1 color1" style={{left:'3vw', top:'7vh', position:'absolute'}}></div>
      <div className="neon-block size2 color2" style={{right:'5vw', top:'10vh', position:'absolute'}}></div>
      <div className="neon-block size3 color3" style={{left:'8vw', bottom:'10vh', position:'absolute'}}></div>
      <div className="neon-block size4 color4" style={{right:'8vw', bottom:'12vh', position:'absolute'}}></div>
      <div className="neon-block size5 color5" style={{left:'50vw', top:'80vh', position:'absolute'}}></div>
    </div>
  );
}

function App() {
  const location = useLocation();
  return (
    <ChatRoomsProvider>
      <ChatMessagesProvider>
        <NeonBackground />
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
          </Route>
          <Route element={<Sidebar />}>
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
          </Route>
        </Routes>
      </ChatMessagesProvider>
    </ChatRoomsProvider>
  );
}

export default App;
