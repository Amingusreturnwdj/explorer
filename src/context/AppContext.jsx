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

  const fetchGooglePlacesData = useCallback(async (lat, lng, radius) => {
    if (!lat || !lng) return;
    setIsFetching(true);
    
    try {
      const GOOGLE_API_KEY = "AIzaSyAsIMxWSI1zXc3B28aLdIaQ0q55vikXEb0";
      
      const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.primaryType,places.shortFormattedAddress'
        },
        body: JSON.stringify({
          locationRestriction: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: radius
            }
          },
          includedTypes: ['restaurant', 'cafe', 'fast_food', 'bar', 'coffee_shop', 'pizza_restaurant', 'thai_restaurant'],
          maxResultCount: 20
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.error("Google Places API Error:", data.error.message);
        if (data.error.message.includes('billing')) {
          alert('Google Maps Error: โควต้าฟรีจะไม่ทำงานหากยังไม่ผูกบัตรเครดิตใน Google Cloud Console ครับ');
        }
        return;
      }

      if (!data.places) {
        setFetchedShops([]);
        return;
      }
      
      const newShops = data.places.map(place => {
        return {
          id: `google-${place.id}`,
          name: place.displayName?.text || 'Unnamed Place',
          category: (place.primaryType || 'Shop').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: place.shortFormattedAddress || 'Fetched from Google Maps',
          lat: place.location.latitude,
          lng: place.location.longitude
        };
      });
      
      setFetchedShops(newShops);
    } catch (error) {
      console.error("Failed to fetch from Google Places:", error);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (currentLocation) {
      fetchGooglePlacesData(currentLocation.lat, currentLocation.lng, searchRadius);
    }
  }, [currentLocation, searchRadius, fetchGooglePlacesData]);

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
