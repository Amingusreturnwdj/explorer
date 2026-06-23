import React from 'react';
import { useAppContext } from '../context/AppContext';
import { LogOut, User as UserIcon, Store } from 'lucide-react';

export default function TopBar({ onLoginClick, onAddShopClick }) {
  const { user, logout } = useAppContext();

  return (
    <div className="glass-panel" style={topBarStyle}>
      <h1 style={{fontSize: '20px', fontWeight: 'bold', margin: 0}}>🗺️ AI Companion</h1>
      
      <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
        {user ? (
          <>
            <span style={{fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px'}}>
              {user.role === 'owner' ? <Store size={16} /> : <UserIcon size={16} />}
              Hi, {user.name}
            </span>
            {user.role === 'owner' && (
              <button className="btn btn-outline" onClick={onAddShopClick}>
                + Add Shop
              </button>
            )}
            <button className="btn" style={{backgroundColor: 'var(--danger)'}} onClick={logout}>
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <button className="btn" onClick={onLoginClick}>Login</button>
        )}
      </div>
    </div>
  );
}

const topBarStyle = {
  position: 'absolute',
  top: '20px',
  left: '20px',
  right: '20px',
  height: '60px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 20px',
  zIndex: 10
};
