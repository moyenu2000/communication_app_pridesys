// import React, { createContext, useContext, useState, useEffect } from 'react';
// import WebSocketService from '../services/WebSocketServices';
// import { useChatState } from './ChatStateContext'; // Import the custom hook

// const WebSocketContext = createContext();

// export const useWebSocket = () => {
//   return useContext(WebSocketContext);
// };

// export const WebSocketProvider = ({ children }) => {
//   const { setMessages, selectedChat } = useChatState();
//   const [connected, setConnected] = useState(false);



//   useEffect(() => {
//     WebSocketService.connect();
  
//     WebSocketService.socket.onopen = () => setConnected(true);
//     WebSocketService.socket.onclose = () => setConnected(false);
  
//     WebSocketService.socket.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       console.log(selectedChat);
//       WebSocketService.handleMessage(data, setMessages, selectedChat);
//     };
  
//     return () => {
//       WebSocketService.close();
//     };
//   }, [selectedChat, setMessages]);

//   const changeViewStat = (channelId, viewState) => {
//     WebSocketService.send(`viewstate:${channelId}:${viewState}`);
//   };

//   return (
//     <WebSocketContext.Provider value={{ changeViewStat, connected }}>
//       {children}
//     </WebSocketContext.Provider>
//   );
// };


import React, { createContext, useContext, useState, useEffect } from 'react';
import WebSocketService from '../services/WebSocketServices';
import { useChatState } from './ChatStateContext';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

export const WebSocketProvider = ({ children }) => {
  const { setMessages, selectedChat } = useChatState();
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
      
      WebSocketService.handleMessage(data, setMessages, selectedChat);
    };
    
    WebSocketService.socket.addEventListener('message', messageHandler);
    
    return () => {
      WebSocketService.socket.removeEventListener('message', messageHandler);
    };
  }, [selectedChat, setMessages]);

  const changeViewStat = (channelId, viewState) => {
    WebSocketService.send(`viewstate:${channelId}:${viewState}`);
  };

  return (
    <WebSocketContext.Provider value={{ changeViewStat, connected }}>
      {children}
    </WebSocketContext.Provider>
  );
};