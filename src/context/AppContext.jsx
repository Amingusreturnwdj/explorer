import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext();

// Mock shops just to have something if API fails
const initialShops = [
  { id: 1, name: 'Cafe Chill (Local)', category: 'Cafe', description: 'Cozy place for coffee.', lat: 13.7563, lng: 100.5018 },
  { id: 2, name: 'Spicy Noodle (Local)', category: 'Restaurant', description: 'Best local noodles.', lat: 13.7600, lng: 100.5100 }
];

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { role: 'user' | 'owner', name: string }
  const [localShops, setLocalShops] = useState(() => {
    const saved = localStorage.getItem('app_shops');
    return saved ? JSON.parse(saved) : initialShops;
  });
  const [fetchedShops, setFetchedShops] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(1000); // meters
  const [isFetching, setIsFetching] = useState(false);
  
  useEffect(() => {
    localStorage.setItem('app_shops', JSON.stringify(localShops));
  }, [localShops]);

  const fetchOverpassData = useCallback(async (lat, lng, radius) => {
    if (!lat || !lng) return;
    setIsFetching(true);
    
    // Overpass QL to fetch restaurants, cafes, and fast_food within radius
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"~"restaurant|cafe|fast_food|bar|pub"](around:${radius},${lat},${lng});
        way["amenity"~"restaurant|cafe|fast_food|bar|pub"](around:${radius},${lat},${lng});
      );
      out center;
    `;
    
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const newShops = data.elements.map(el => {
        const pLat = el.lat || el.center.lat;
        const pLng = el.lon || el.center.lon;
        const name = el.tags.name || el.tags['name:en'] || 'Unnamed Place';
        const category = el.tags.amenity ? el.tags.amenity.replace('_', ' ') : 'Shop';
        
        return {
          id: `osm-${el.id}`,
          name: name,
          category: category.charAt(0).toUpperCase() + category.slice(1),
          description: `Fetched from OpenStreetMap`,
          lat: pLat,
          lng: pLng
        };
      });
      
      // Filter out unnamed places to keep the map clean
      setFetchedShops(newShops.filter(s => s.name !== 'Unnamed Place'));
    } catch (error) {
      console.error("Failed to fetch from Overpass:", error);
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Whenever location or radius changes, re-fetch data
  useEffect(() => {
    if (currentLocation) {
      fetchOverpassData(currentLocation.lat, currentLocation.lng, searchRadius);
    }
  }, [currentLocation, searchRadius, fetchOverpassData]);

  const login = (role, name) => setUser({ role, name });
  const logout = () => setUser(null);

  const addShop = (shop) => {
    setLocalShops(prev => [...prev, { ...shop, id: Date.now() }]);
  };

  const updateLocation = (loc) => {
    setCurrentLocation(loc);
  };

  const shops = [...localShops, ...fetchedShops];

  return (
    <AppContext.Provider value={{ 
      user, login, logout, 
      shops, addShop, 
      currentLocation, updateLocation,
      searchRadius, setSearchRadius,
      isFetching
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
