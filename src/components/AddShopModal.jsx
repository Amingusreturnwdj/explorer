import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { X, MapPin } from 'lucide-react';

export default function AddShopModal({ onClose }) {
  const { addShop, currentLocation } = useAppContext();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Restaurant');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState(currentLocation ? currentLocation.lat : 13.7563);
  const [lng, setLng] = useState(currentLocation ? currentLocation.lng : 100.5018);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      addShop({ name, category, description, lat: parseFloat(lat), lng: parseFloat(lng) });
      onClose();
    }
  };

  const useCurrentLocation = () => {
    if (currentLocation) {
      setLat(currentLocation.lat);
      setLng(currentLocation.lng);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
        },
        () => alert('Could not get current location.')
      );
    }
  };

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="glass-panel animate-fade-in" style={modalStyle}>
        <div style={headerStyle}>
          <h2>Add New Shop</h2>
          <button className="btn-icon btn-outline" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} style={formStyle}>
          <label className="input-label">Shop Name</label>
          <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required />

          <label className="input-label">Category</label>
          <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
            <option>Restaurant</option>
            <option>Cafe</option>
            <option>Retail</option>
            <option>Service</option>
          </select>

          <label className="input-label">Description</label>
          <textarea className="input-field" value={description} onChange={e => setDescription(e.target.value)} rows={3} />

          <div style={{display: 'flex', gap: '12px'}}>
            <div style={{flex: 1}}>
              <label className="input-label">Latitude</label>
              <input type="number" step="any" className="input-field" value={lat} onChange={e => setLat(e.target.value)} required />
            </div>
            <div style={{flex: 1}}>
              <label className="input-label">Longitude</label>
              <input type="number" step="any" className="input-field" value={lng} onChange={e => setLng(e.target.value)} required />
            </div>
          </div>
          
          <button type="button" className="btn btn-outline" onClick={useCurrentLocation} style={{marginBottom: '16px'}}>
            <MapPin size={16} /> Use Current Location
          </button>

          <button type="submit" className="btn" style={{width: '100%'}}>Add Shop</button>
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
  width: '100%', maxWidth: '500px', padding: '24px', backgroundColor: 'var(--surface)'
};

const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'
};

const formStyle = {
  display: 'flex', flexDirection: 'column'
};
