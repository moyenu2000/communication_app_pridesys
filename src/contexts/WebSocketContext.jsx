

import React, { createContext, useContext, useState, useEffect } from 'react';
import WebSocketService from '../services/WebSocketServices';
import { useChatState } from './ChatStateContext';
import { useInformation } from './InformationContext';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

export const WebSocketProvider = ({ children }) => {
  const { setMessages, selectedChat , setTypingUsers, setCurrentChannelViewers} = useChatState();
  const {setChannels, setUsers, setActiveUsers} = useInformation();
  const [connected, setConnected] = useState(false);
  
  // Set up the connection once
  useEffect(() => {
    WebSocketService.connect();
    
    WebSocketService.socket.onopen = () => setConnected(true);
    WebSocketService.socket.onclose = () => setConnected(false);
    
    return () => {
      WebSocketService.close();
    };
  }, []);
  
  // Update the message handler when selectedChat changes
  useEffect(() => {
    if (!WebSocketService.socket) return;

    
    const messageHandler = (event) => {
      const data = JSON.parse(event.data);
      console.log("Message received:", data);
      console.log(selectedChat);
      
      WebSocketService.handleMessage(data, setMessages, selectedChat, setTypingUsers, setChannels, setUsers, setActiveUsers, setCurrentChannelViewers);
    };
    
    WebSocketService.socket.addEventListener('message', messageHandler);
    
    return () => {
      WebSocketService.socket.removeEventListener('message', messageHandler);
    };
  }, [selectedChat, setMessages, setTypingUsers, setChannels, setUsers]);

  const changeViewStat = (channelId, viewState) => {
    WebSocketService.send(`viewstate:${channelId}:${viewState}`);
  };

  return (
    <WebSocketContext.Provider value={{ changeViewStat, connected }}>
      {children}
    </WebSocketContext.Provider>
  );
};