// src/components/ChatBox.jsx
import React from 'react';
// import { useChatState } from '../contexts/ChatStateContext';
import MessageList from '../chat/MessageList';
import MessageInput from '../chat/MessageInput';

const ChatBox = () => {

  return (


    <div>
      <MessageList />
      <MessageInput />
    </div>
  );
};

export default ChatBox;
