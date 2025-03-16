

// src/components/ChatBox.jsx
import React, { useRef, useEffect, useState } from 'react';
import MessageList from '../chat/MessageList';
import MessageInput from '../chat/MessageInput';
import TypingUser from '../chat/TypingUser';
import ChannelHeader from '../chat/ChannelHeader';

const ChatBox = () => {
  const inputContainerRef = useRef(null);
  const [inputHeight, setInputHeight] = useState(0);

  useEffect(() => {
    if (inputContainerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          setInputHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(inputContainerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <div className="flex flex-col h-full relative">
      <div
        className="absolute top-0 right-0 w-full bg-white z-100"
      >
        <ChannelHeader />
      </div>

      <div className="flex-1 overflow-y-auto pt-20"
        style={{ paddingBottom: `${inputHeight}px` }}
      >
        <MessageList />
      </div>

      <div
        ref={inputContainerRef}
        className="absolute bottom-0 right-0 w-full bg-white"
      >
        <TypingUser />
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatBox;