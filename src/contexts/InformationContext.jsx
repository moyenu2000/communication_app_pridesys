// src/context/InformationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchChannels, fetchUsers } from '../services/userServices';

const InformationContext = createContext();

export const useInformation = () => {
  return useContext(InformationContext);
};

export const InformationProvider = ({ children }) => {
  const [channels, setChannels] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInformation = async () => {
      try {
        const channelResponse = await fetchChannels();
        const userResponse = await fetchUsers();
        setChannels(channelResponse.data.public || []);
        setUsers(userResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    getInformation();
  }, []);

  return (
    <InformationContext.Provider value={{ channels, users, loading, setChannels, setUsers }}>
      {children}
    </InformationContext.Provider>
  );
};
