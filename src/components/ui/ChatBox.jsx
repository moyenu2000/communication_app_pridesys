

// src/components/ChatBox.jsx
import React, { useRef, useEffect, useState } from 'react';
// import { useChatState } from '../contexts/ChatStateContext';
import MessageList from '../chat/MessageList';
import MessageInput from '../chat/MessageInput';
import TypingUser from '../chat/TypingUser';

const ChatBox = () => {
  const inputContainerRef = useRef(null);
  const [inputHeight, setInputHeight] = useState(0);
  
  // Measure the height of the input container
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
      {/* Message list that scrolls */}
      <div 
        className="flex-1 overflow-y-auto" 
        style={{ paddingBottom: `${inputHeight}px` }}
      >
        <MessageList />
      </div>
      
      {/* Fixed container at bottom right */}
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