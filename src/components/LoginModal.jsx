import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { X, User, Store } from 'lucide-react';

export default function LoginModal({ onClose }) {
  const { login } = useAppContext();
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');

  const handleLogin = (e) => {
    e.preventDefault();
    if (name.trim()) {
      login(role, name);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="glass-panel animate-fade-in" style={modalStyle}>
        <div style={headerStyle}>
          <h2>Login</h2>
          <button className="btn-icon btn-outline" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleLogin} style={formStyle}>
          <div style={roleSelectStyle}>
            <button 
              type="button" 
              className={`btn ${role === 'user' ? '' : 'btn-outline'}`}
              onClick={() => setRole('user')}
              style={{flex: 1}}
            >
              <User size={18} /> General User
            </button>
            <button 
              type="button" 
              className={`btn ${role === 'owner' ? '' : 'btn-outline'}`}
              onClick={() => setRole('owner')}
              style={{flex: 1}}
            >
              <Store size={18} /> Shop Owner
            </button>
          </div>

          <label className="input-label">Name</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Enter your name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <button type="submit" className="btn" style={{width: '100%', marginTop: '16px'}}>
            Login as {role === 'owner' ? 'Owner' : 'User'}
          </button>
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const modalStyle = {
  width: '100%', maxWidth: '400px', padding: '24px', backgroundColor: 'var(--surface)'
};

const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'
};

const formStyle = {
  display: 'flex', flexDirection: 'column'
};

const roleSelectStyle = {
  display: 'flex', gap: '12px', marginBottom: '20px'
};
