import React from 'react';
import { useAppContext } from '../context/AppContext';
import { LogOut, User as UserIcon, Store, Loader2 } from 'lucide-react';

export default function TopBar({ onLoginClick, onAddShopClick }) {
  const { user, logout, searchRadius, setSearchRadius, isFetching } = useAppContext();

  return (
    <div className="glass-panel" style={topBarStyle}>
      <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
        <h1 style={{fontSize: '20px', fontWeight: 'bold', margin: 0}}>🗺️ AI Companion</h1>
        
        <div style={sliderContainerStyle}>
          <label style={{fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)'}}>
            Radius: {searchRadius >= 1000 ? `${(searchRadius/1000).toFixed(1)}km` : `${searchRadius}m`}
          </label>
          <input 
            type="range" 
            min="200" 
            max="5000" 
            step="100" 
            value={searchRadius} 
            onChange={(e) => setSearchRadius(Number(e.target.value))}
            style={{width: '100px'}}
          />
        </div>
        
        {isFetching && <Loader2 size={16} className="spinner" style={{animation: 'spin 1s linear infinite', color: 'var(--primary)'}} />}
      </div>
      
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
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
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
  zIndex: 1000
};

const sliderContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  marginLeft: '16px',
  borderLeft: '1px solid var(--glass-border)',
  paddingLeft: '16px'
};
