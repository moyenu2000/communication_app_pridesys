// src/contexts/AppStateContext.jsx
import React, { createContext, useState, useContext } from 'react';

// Creating a context for AppState
const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {
  const [selectedOption, setSelectedOption] = useState('home');

  const selectOption = (option) => {
    setSelectedOption(option); 
  };

  return (
    <AppStateContext.Provider value={{ selectedOption, selectOption }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  return useContext(AppStateContext);
};
