// src/context/InformationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchActiveUsers, fetchChannels, fetchUsers, getUnReadMessages } from '../services/userServices';
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
  const [dmChannels, setDmChannels] = useState([]);
  const [unReadMessages, setUnReadMessages] = useState([]);

  useEffect(() => {
    const getInformation = async () => {
      try {
        const channelResponse = await fetchChannels();
        const userResponse = await fetchUsers();
        const activeUserResponse = await fetchActiveUsers();
        const starredChannelsResponse = await getStarredChannels();
        const subscribedChannelsResponse = await getSubscribedChannels();
        const unReadMessagesResponse = await getUnReadMessages();


        setChannels(channelResponse.data.public || []);
        setDmChannels(channelResponse.data.dm || []);
        setUsers(userResponse.data);
        setActiveUsers(activeUserResponse.data);
        setStarredChannels(starredChannelsResponse);
        setSubscribedChannels(subscribedChannelsResponse);
        setUnReadMessages(unReadMessagesResponse.data);
        console.log('Unread messages:', unReadMessagesResponse.data);
        console.log("All channels:", channelResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    getInformation();
  }, []);

  return (
    <InformationContext.Provider value={{ channels, users, loading, setChannels, setUsers, activeUsers, setActiveUsers ,starredChannels, setStarredChannels, subscribedChannels, setSubscribedChannels, unReadMessages, setUnReadMessages ,dmChannels, setDmChannels }}>
      {children}
    </InformationContext.Provider>
  );
};
