import React, { useEffect } from 'react';
import { useWebSocket } from '../../../contexts/WebSocketContext';
import { useChatState } from '../../../contexts/ChatStateContext';

const ChannelItem = ({ channel }) => {
  const { changeViewStat } = useWebSocket();
  const { selectChat, selectedChat } = useChatState();

  const handleClick = () => {
    if (selectedChat && selectedChat.id === channel.id) return;

    changeViewStat(channel.id, 'monitoring');
    channel.offset = 0;
    console.log("Channel offset:", channel);
    selectChat(channel); 
  };

  return (
    <div onClick={handleClick}>
      <span>{channel.name}</span>
    </div>
  );
};

export default ChannelItem;
