import React from 'react';
import { useWebSocket } from '../../../contexts/WebSocketContext';
import { useChatState } from '../../../contexts/ChatStateContext';

const ChannelItem = ({
  channel,
  hasChildren,
  isExpanded,
  isStarred = false,
  onToggleExpand,
  depth = 0
}) => {
  const { changeViewStat } = useWebSocket();
  const { selectChat, selectedChat, setUserOrChannel } = useChatState();
  
  const isSelected = selectedChat && selectedChat.id === channel.id;
  
  const handleClick = () => {
    selectChannel();
    setUserOrChannel('channel');
  };
  
  const handleHashClick = (e) => {
    // If this channel has children, toggle expansion
    if (hasChildren) {
      e.stopPropagation();
      onToggleExpand();
    } else {
      // If no children, just select the channel
      selectChannel();
    }
  };
  
  const selectChannel = () => {
    if (isSelected) return;
    
    changeViewStat(channel.id, 'monitoring');
    channel.offset = 0;
    selectChat(channel);
  };
  
  return (
    <div 
      className={`flex items-center justify-between py-2 px-4 cursor-pointer ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-200'}`}
      onClick={handleClick}
      style={{ paddingLeft: `${depth * 16 + 16}px` }}
    >
      <div className="flex items-center flex-1">
        {hasChildren && (
          <span 
            className="mr-2 text-gray-500 transform transition-transform"
            onClick={handleHashClick}
            style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </span>
        )}
        
        <span 
          className="mr-1 text-gray-500"
          onClick={handleHashClick}
        >
          {hasChildren ? (
            <span className="text-gray-400">
              #
            </span>
          ) : (
            <span className="text-gray-400">
              #
            </span>
          )}
        </span>
        
        <span className={`${isSelected ? 'font-medium text-gray-700' : 'text-gray-600'}`}>
          {channel.name}
        </span>
      </div>
      
     
    </div>
  );
};

export default ChannelItem;