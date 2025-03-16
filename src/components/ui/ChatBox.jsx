

// src/components/ChatBox.jsx
import React from 'react';
import MessageList from '../chat/MessageList';
import MessageInput from '../chat/MessageInput';
import TypingUser from '../chat/TypingUser';
import ChannelHeader from '../chat/ChannelHeader';

const ChatBox = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white z-10">
        <ChannelHeader />
      </div>

      <div className="flex-1 overflow-y-auto">
        <MessageList />
      </div>

      <div>
        <TypingUser />
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatBox;