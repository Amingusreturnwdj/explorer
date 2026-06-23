import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAppContext } from '../context/AppContext';
import { LocateFixed } from 'lucide-react';

// Fix Leaflet's default icon missing issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon for User
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom Icon for Custom Local Shops
const localIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom Icon for Fetched OSM Shops
const osmIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to recenter map when location changes
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

export default function MapComponent() {
  const { shops, currentLocation, updateLocation, searchRadius } = useAppContext();
  const [mapCenter, setMapCenter] = useState([13.7563, 100.5018]); // Default Bangkok
  
  const locateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          updateLocation(loc);
          setMapCenter([loc.lat, loc.lng]);
        },
        () => {
          alert('Could not fetch location.');
        }
      );
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
      <MapContainer 
        center={mapCenter} 
        zoom={14} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {currentLocation && <MapRecenter center={[currentLocation.lat, currentLocation.lng]} />}

        {currentLocation && (
          <>
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>
            <Circle 
              center={[currentLocation.lat, currentLocation.lng]} 
              radius={searchRadius} 
              pathOptions={{ color: 'var(--primary)', fillColor: 'var(--primary)', fillOpacity: 0.1, weight: 2 }}
            />
          </>
        )}

        {shops.map(shop => {
          const isOsm = shop.id.toString().startsWith('osm-');
          return (
            <Marker 
              key={shop.id} 
              position={[shop.lat, shop.lng]}
              icon={isOsm ? osmIcon : localIcon}
            >
              <Popup>
                <div style={{color: '#000'}}>
                  <h3 style={{margin: '0 0 8px 0', fontSize: '16px'}}>{shop.name}</h3>
                  <p style={{margin: '0 0 4px 0', fontSize: '12px', fontWeight: 'bold'}}>{shop.category}</p>
                  <p style={{margin: '0', fontSize: '14px'}}>{shop.description}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

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
  zIndex: 1000, /* high z-index required for leaflet */
  background: 'var(--glass-bg)',
  border: '1px solid var(--glass-border)'
};
