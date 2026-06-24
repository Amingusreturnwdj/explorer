import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ref, onValue, push, set } from "firebase/database";
import { database } from '../firebase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [localShops, setLocalShops] = useState([]);
  const [fetchedShops, setFetchedShops] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(1000);
  const [isFetching, setIsFetching] = useState(false);
  
  // Firebase Realtime Listener
  useEffect(() => {
    const shopsRef = ref(database, 'shops');
    const unsubscribe = onValue(shopsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const shopsList = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setLocalShops(shopsList);
      } else {
        setLocalShops([]);
      }
    });
    
    return () => unsubscribe();
  }, []);

  const fetchOverpassData = useCallback(async (lat, lng, radius) => {
    if (!lat || !lng) return;
    setIsFetching(true);
    
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
      
      setFetchedShops(newShops.filter(s => s.name !== 'Unnamed Place'));
    } catch (error) {
      console.error("Failed to fetch from Overpass:", error);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (currentLocation) {
      fetchOverpassData(currentLocation.lat, currentLocation.lng, searchRadius);
    }
  }, [currentLocation, searchRadius, fetchOverpassData]);

  const login = (role, name) => setUser({ role, name });
  const logout = () => setUser(null);

  // Write new shop to Firebase
  const addShop = (shop) => {
    const shopsRef = ref(database, 'shops');
    const newShopRef = push(shopsRef);
    set(newShopRef, shop);
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
