import React from 'react';
import { useWebSocket } from '../../../contexts/WebSocketContext';
import { useChatState } from '../../../contexts/ChatStateContext';
import { fetchChannel, fetchDMChannel } from '../../../services/userServices';

const UserItem = ({ user }) => {
  const { changeViewStat } = useWebSocket();
  const { selectChat } = useChatState();

  const handleClick = async () => {
    try {
      const response = await fetchDMChannel(user.id);
      const channelId = response.data.id;
      
      const channelResponse = await fetchChannel(channelId);
      const channel = channelResponse.data;
      
      console.log('Channel:', channel);

      changeViewStat(channel.id, 'monitoring');
      channel.offset = 0;
      selectChat(channel);
    } catch (error) {
      console.error('Error fetching DM channel:', error);
    }
  };

  return (
    <div onClick={handleClick}>
      <span>{user.name}</span>
      <span>{user.displayname}</span>
    </div>
  );
};

export default UserItem;
