import React, { createContext, useState, useContext, useEffect, use } from 'react';
import { fetchMessages, fetchPinnedMessages } from '../services/channelServices';  

const ChatStateContext = createContext();

export const ChatStateProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);

  const selectChat = async (chat) => {
    setSelectedChat(chat);
    setOffset(0);
    setMessages([]); 
    setTypingUsers([]);
    setPinnedMessages([]); 
    await loadMessages(chat.id, 10, 0, true);
  };



  const loadMessages = async (channelId, limit = 10, offset = 0, loadPinned=false) => {
    try {
      setLoading(true);

      const newMessages = await fetchMessages(channelId, limit, offset);
      
      let fetchedPinnedMessages = [];
      if (loadPinned) {
        fetchedPinnedMessages = await fetchPinnedMessages(channelId);
        console.log("Fetched pinned messages:", fetchedPinnedMessages);
      }

      // Combine pinned messages with new messages
      const updatedMessages = newMessages.map((message) => {
        const pinnedMessage = fetchedPinnedMessages.find((pinnedMessage) => pinnedMessage.message.id === message.id);
        if (pinnedMessage) {
          message.pinnedBy = pinnedMessage.userId;
          console.log("Pinned by:", pinnedMessage.userId);
        }
        return message;
      });

      if (newMessages.length < limit) {
        setHasMoreMessages(false); 
      }

      setMessages((prevMessages) => [...prevMessages, ...updatedMessages]);

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
    <ChatStateContext.Provider value={{ selectedChat, selectChat, messages, setMessages, addNewMessage , typingUsers, setTypingUsers }}>
      {children}
    </ChatStateContext.Provider>
  );
};

export const useChatState = () => {
  return useContext(ChatStateContext);
};
