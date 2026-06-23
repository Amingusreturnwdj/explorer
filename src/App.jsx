import React, { useState } from 'react';
import MapComponent from './components/MapComponent';
import TopBar from './components/TopBar';
import LoginModal from './components/LoginModal';
import AddShopModal from './components/AddShopModal';
import AIChat from './components/AIChat';
import './App.css';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showAddShop, setShowAddShop] = useState(false);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <MapComponent />
      <TopBar 
        onLoginClick={() => setShowLogin(true)} 
        onAddShopClick={() => setShowAddShop(true)} 
      />
      <AIChat />

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showAddShop && <AddShopModal onClose={() => setShowAddShop(false)} />}
    </div>
  );
}

export default App;
