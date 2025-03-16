import React, { useState } from 'react';
import { useInformation } from '../../../contexts/InformationContext';
import { useChatState } from '../../../contexts/ChatStateContext';
import { useWebSocket } from '../../../contexts/WebSocketContext';

const Home = () => {
  const { changeViewStat } = useWebSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const { channels, loading, subscribedChannels, starredChannels } = useInformation();
  const { selectChat, selectedChat, setUserOrChannel } = useChatState();

  console.log('Channels:', subscribedChannels);


  const getChannelPath = (channelId) => {
    const path = [];
    let currentChannel = channels.find(c => c.id === channelId);

    while (currentChannel) {
      path.unshift(currentChannel.name);
      currentChannel = currentChannel.parentId ?
        channels.find(c => c.id === currentChannel.parentId) :
        null;
    }
    return path.join('/');
  };

  const getFilteredChannels = () => {
    let filtered = channels.filter(channel => {
      return subscribedChannels && 
        subscribedChannels.some(subscription => subscription.channelId === channel.id);
    });
    if (searchTerm) {
      filtered = filtered.filter(channel =>
        channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getChannelPath(channel.id).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredChannels = getFilteredChannels();
  const handleChannelSelect = (channel) => {
    if (selectedChat && selectedChat.id === channel.id) return;
    changeViewStat(channel.id, 'monitoring');
    channel.offset = 0;
    selectChat(channel);
    setUserOrChannel('channel');
  };

  if (loading) return <div className="p-4 text-gray-500">Loading subscribed channels...</div>;

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-medium text-gray-700 mb-3">Home</h2>
        <h3 className="text-base text-gray-600 mb-3">Subscribed Channels</h3>


      </div>

      <div className="channels-container flex-1 overflow-y-auto">
        {filteredChannels.length > 0 ? (
          filteredChannels.map(channel => {
            const isStarred = starredChannels && starredChannels.includes(channel.id);

            return (
              <div
                key={channel.id}
                className={`flex items-center justify-between py-3 px-4 hover:bg-gray-100 cursor-pointer ${selectedChat && selectedChat.id === channel.id ? 'bg-blue-50' : ''}`}
                onClick={() => handleChannelSelect(channel)}
              >
                <div className="flex items-center flex-1">
                  <span className="mr-2 text-gray-400">#</span>
                  <div className="flex flex-col">
                    <span className={`${selectedChat && selectedChat.id === channel.id ? 'font-medium text-gray-700' : 'text-gray-600'}`}>
                      {getChannelPath(channel.id)}
                    </span>
                    {channel.lastMessage && (
                      <span className="text-sm text-gray-500 truncate max-w-xs">
                        {channel.lastMessage.substr(0, 50)}{channel.lastMessage.length > 50 ? '...' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {isStarred && (
                  <span className="text-yellow-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="text-gray-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 15h8M9.5 9h.01M14.5 9h.01"></path>
              </svg>
            </div>
            <p className="text-gray-500 mb-1">No subscribed channels found</p>
            <p className="text-gray-400 text-sm">Subscribe to channels to see them here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;