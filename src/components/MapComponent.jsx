import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { useAppContext } from '../context/AppContext';
import { LocateFixed } from 'lucide-react';

export default function MapComponent() {
  const { shops, currentLocation, updateLocation } = useAppContext();
  const [selectedShop, setSelectedShop] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 13.7563, lng: 100.5018 }); // Default Bangkok
  
  const locateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          updateLocation(loc);
          setMapCenter(loc);
        },
        () => {
          alert('Could not fetch location.');
        }
      );
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
      {/* We use an empty string or a restricted demo key if none provided. 
          The @vis.gl/react-google-maps library supports a dummy key for testing */}
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
        <Map
          defaultZoom={13}
          center={mapCenter}
          onCenterChanged={(ev) => setMapCenter(ev.detail.center)}
          mapId="DEMO_MAP_ID"
          disableDefaultUI={true}
        >
          {currentLocation && (
            <AdvancedMarker position={currentLocation}>
              <Pin background={"#0f9d58"} borderColor={"#006425"} glyphColor={"#60d27c"} />
            </AdvancedMarker>
          )}

          {shops.map(shop => (
            <AdvancedMarker 
              key={shop.id} 
              position={{ lat: shop.lat, lng: shop.lng }}
              onClick={() => setSelectedShop(shop)}
            >
              <Pin background={"#ea4335"} borderColor={"#c5221f"} glyphColor={"#fce8e6"} />
            </AdvancedMarker>
          ))}

          {selectedShop && (
            <InfoWindow
              position={{ lat: selectedShop.lat, lng: selectedShop.lng }}
              onCloseClick={() => setSelectedShop(null)}
              style={{ padding: '8px', color: '#000' }}
            >
              <div style={{color: '#000'}}>
                <h3 style={{margin: '0 0 8px 0', fontSize: '16px'}}>{selectedShop.name}</h3>
                <p style={{margin: '0 0 4px 0', fontSize: '12px', fontWeight: 'bold'}}>{selectedShop.category}</p>
                <p style={{margin: '0', fontSize: '14px'}}>{selectedShop.description}</p>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      <button className="btn glass-panel" style={locateBtnStyle} onClick={locateMe} title="Find My Location">
        <LocateFixed size={20} />
      </button>
    </div>
  );
}

const locateBtnStyle = {
  position: 'absolute',
  bottom: '30px',
  right: '30px',
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  padding: 0,
  zIndex: 10,
  background: 'var(--glass-bg)',
  border: '1px solid var(--glass-border)'
};
