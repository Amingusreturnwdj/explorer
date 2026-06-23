import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const initialShops = [
  { id: 1, name: 'Cafe Chill', category: 'Cafe', description: 'Cozy place for coffee and work.', lat: 13.7563, lng: 100.5018 },
  { id: 2, name: 'Spicy Noodle', category: 'Restaurant', description: 'Best local noodles in town.', lat: 13.7600, lng: 100.5100 }
];

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { role: 'user' | 'owner', name: string }
  const [shops, setShops] = useState(() => {
    const saved = localStorage.getItem('app_shops');
    return saved ? JSON.parse(saved) : initialShops;
  });
  const [currentLocation, setCurrentLocation] = useState(null);
  
  useEffect(() => {
    localStorage.setItem('app_shops', JSON.stringify(shops));
  }, [shops]);

  const login = (role, name) => {
    setUser({ role, name });
  };

  const logout = () => {
    setUser(null);
  };

  const addShop = (shop) => {
    setShops(prev => [...prev, { ...shop, id: Date.now() }]);
  };

  const updateLocation = (loc) => {
    setCurrentLocation(loc);
  };

  return (
    <AppContext.Provider value={{ user, login, logout, shops, addShop, currentLocation, updateLocation }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
