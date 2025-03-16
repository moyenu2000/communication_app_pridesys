import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../../contexts/WebSocketContext';
import { useChatState } from '../../../contexts/ChatStateContext';
import { fetchChannel, fetchDMChannel } from '../../../services/userServices';
import { useInformation } from '../../../contexts/InformationContext';

const UserItem = ({ user }) => {
  const { changeViewStat } = useWebSocket();
  const { selectChat,setUserOrChannel ,setSelectedUser } = useChatState();
  const { activeUsers } = useInformation();
  const [isActive, setIsActive] = useState(false);

  // Update active status whenever activeUsers list changes
  useEffect(() => {
    const userIsActive = activeUsers.some(activeUser => activeUser === user.id);
    setIsActive(userIsActive);
  }, [activeUsers, user.id]);

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
      setUserOrChannel('user');
      setSelectedUser(user);

    } catch (error) {
      console.error('Error fetching DM channel:', error);
    }
  };

  // Generate the icon URL
  const iconUrl = user.iconFileId 
    ? `https://traq.duckdns.org/api/v3/files/${user.iconFileId}`
    : null;

  return (
    <div 
      onClick={handleClick}
      className="flex items-center py-2 px-3 cursor-pointer hover:bg-gray-100"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-sm overflow-hidden mr-3 flex-shrink-0">
        {iconUrl ? (
          <img 
            src={iconUrl} 
            alt={`${user.name}'s avatar`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-sm font-medium">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      {/* User Information */}
      <div className="flex-grow min-w-0">
      <div className="text-xs text-gray-500 truncate">{user.displayName}</div>
        <div className="text-sm font-medium truncate">@{user.name}</div>
      </div>
      
      {/* Active Status Indicator */}
      {isActive && (
        <div className="w-2 h-2 rounded-full bg-green-400 ml-2 flex-shrink-0" />
      )}
    </div>
  );
};

export default UserItem;