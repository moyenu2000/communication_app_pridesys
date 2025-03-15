// src/context/InformationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchActiveUsers, fetchChannels, fetchUsers } from '../services/userServices';
import { getStarredChannels, getSubscribedChannels } from '../services/channelServices';


const InformationContext = createContext();

export const useInformation = () => {
  return useContext(InformationContext);
};

export const InformationProvider = ({ children }) => {
  const [channels, setChannels] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [starredChannels, setStarredChannels] = useState([]);
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInformation = async () => {
      try {
        const channelResponse = await fetchChannels();
        const userResponse = await fetchUsers();
        const activeUserResponse = await fetchActiveUsers();
        const starredChannelsResponse = await getStarredChannels();
        const subscribedChannelsResponse = await getSubscribedChannels();


        setChannels(channelResponse.data.public || []);
        setUsers(userResponse.data);
        setActiveUsers(activeUserResponse.data);
        setStarredChannels(starredChannelsResponse);
        setSubscribedChannels(subscribedChannelsResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    getInformation();
  }, []);

  return (
    <InformationContext.Provider value={{ channels, users, loading, setChannels, setUsers, activeUsers, setActiveUsers ,starredChannels, setStarredChannels, subscribedChannels, setSubscribedChannels }}>
      {children}
    </InformationContext.Provider>
  );
};
