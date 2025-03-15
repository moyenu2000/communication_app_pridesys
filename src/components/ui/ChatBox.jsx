// src/components/ChatBox.jsx
import React from 'react';
// import { useChatState } from '../contexts/ChatStateContext';
import MessageList from '../chat/MessageList';
import MessageInput from '../chat/MessageInput';
import TypingUser from '../chat/TypingUser';

const ChatBox = () => {

  return (
    <div>
      <MessageList />
      <MessageInput />
      <TypingUser />
    </div>
  );
};

export default ChatBox;
