// import React, { createContext, useState, useContext } from 'react';

// const ChatStateContext = createContext();

// export const ChatStateProvider = ({ children }) => {
//   const [selectedChat, setSelectedChat] = useState(null);
//   const [messages, setMessages] = useState([]);


//   const selectChat = (chat) => {
//     setSelectedChat(chat); 
//     // retrive the messages for the selected chat

//   };

//   const addNewMessage = () => {
//     // add next 10 messages 
//   };

//   return (
//     <ChatStateContext.Provider value={{ selectedChat, selectChat , messages, setMessages }}>
//       {children}
//     </ChatStateContext.Provider>
//   );
// };

// // Custom hook to use ChatStateContext
// export const useChatState = () => {
//   return useContext(ChatStateContext);
// };


import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchMessages } from '../services/channelServices';  

const ChatStateContext = createContext();

export const ChatStateProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const selectChat = async (chat) => {
    setSelectedChat(chat);
    setOffset(0);
    setMessages([]); 
    await loadMessages(chat.id);
  };

  const loadMessages = async (channelId, limit = 10, offset = 0) => {
    try {
      setLoading(true);
      const newMessages = await fetchMessages(channelId, limit, offset);
      
      if (newMessages.length < limit) {
        setHasMoreMessages(false); 
      }
      
      setMessages((prevMessages) => [...prevMessages, ...newMessages]);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const addNewMessage = async () => {
    if (selectedChat && hasMoreMessages && !loading) {
      await loadMessages(selectedChat.id, 10, offset + 10); 
      setOffset((prevOffset) => prevOffset + 10);
    }
  };

  return (
    <ChatStateContext.Provider value={{ selectedChat, selectChat, messages, setMessages, addNewMessage }}>
      {children}
    </ChatStateContext.Provider>
  );
};

export const useChatState = () => {
  return useContext(ChatStateContext);
};
