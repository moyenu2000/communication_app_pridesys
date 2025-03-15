import React, { useState } from 'react';
import ChannelItem from './ChannelItem';
import ChannelCreationModal from './ChannelCreationModal';
import { useInformation } from '../../../contexts/InformationContext';
import { useChatState } from '../../../contexts/ChatStateContext';
import { useWebSocket } from '../../../contexts/WebSocketContext';

const ChannelList = () => {
  const { changeViewStat } = useWebSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const { channels, loading, starredChannels } = useInformation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const { selectChat, selectedChat } = useChatState();
  
  // Track expanded channel states
  const [expandedChannels, setExpandedChannels] = useState({});

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const toggleExpand = (channelId) => {
    setExpandedChannels(prev => ({
      ...prev,
      [channelId]: !prev[channelId]
    }));
  };

  // Get channel's full path (parent/parent/channel)
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

  // Filter channels based on active filter and search term
  const getFilteredChannels = () => {
    // First, apply the favorites filter if active
    let filtered = channels;
    
    if (activeFilter === 'Favourites') {
      filtered = channels.filter(channel => starredChannels.includes(channel.id));
    }
    
    // Then, apply search term if present
    if (searchTerm) {
      filtered = filtered.filter(channel => 
        channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getChannelPath(channel.id).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredChannels = getFilteredChannels();

  // Get only root channels (parentId is null)
  const rootChannels = filteredChannels.filter((channel) => !channel.parentId);

  // Check if a channel has children
  const hasChildren = (channelId) => {
    return channels.some(channel => channel.parentId === channelId);
  };

  // Get children of a specific channel
  const getChildrenChannels = (parentId) => {
    return filteredChannels.filter(channel => channel.parentId === parentId);
  };

  // Recursive function to render channel and its children
  const renderChannelWithChildren = (channel, depth = 0) => {
    const hasChildChannels = hasChildren(channel.id);
    const isExpanded = expandedChannels[channel.id];
    const isStarred = starredChannels.includes(channel.id);
    
    return (
      <React.Fragment key={channel.id}>
        <ChannelItem 
          channel={channel} 
          hasChildren={hasChildChannels}
          isExpanded={isExpanded}
          isStarred={isStarred}
          onToggleExpand={() => toggleExpand(channel.id)}
          depth={depth}
        />
        
        {/* If expanded and has children, render them */}
        {isExpanded && hasChildChannels && getChildrenChannels(channel.id).map(childChannel => 
          renderChannelWithChildren(childChannel, depth + 1)
        )}
      </React.Fragment>
    );
  };

  // Render search results with full path and hash symbol
  const renderSearchResults = () => {
    return filteredChannels.map(channel => {
      const isStarred = starredChannels.includes(channel.id);
      
      return (
        <div key={channel.id} className="flex items-center justify-between py-2 px-4 hover:bg-gray-200 cursor-pointer">
          <div className="flex-1" onClick={() => {
            if(selectedChat && selectedChat.id === channel.id) return;
            changeViewStat(channel.id, 'monitoring');
            channel.offset = 0;
            selectChat(channel);
          }}>
            <span className={selectedChat && selectedChat.id === channel.id ? "text-gray-700 font-medium" : "text-gray-600"}>
              #{getChannelPath(channel.id)}
            </span>
          </div>
          
          
        </div>
      );
    });
  };

  if (loading) return <div className="p-4 text-gray-500">Loading channels...</div>;

  return (
    <div className="h-full bg-gray-100 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-medium text-gray-700 mb-3">Channel</h2>
        
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base text-gray-600">Channel List</h3>
          <button 
            onClick={openModal}
            className="bg-gray-200 hover:bg-gray-300 rounded-full p-1 text-gray-600"
            title="Add Channel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
        
        <div className="search-container mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search channels"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 p-2 bg-white rounded border border-gray-300 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="filter-tabs flex space-x-2 mb-3">
          <button 
            className={`px-4 py-1 rounded-full text-sm ${activeFilter === 'All' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            onClick={() => setActiveFilter('All')}
          >
            All
          </button>
          <button 
            className={`px-4 py-1 rounded-full text-sm ${activeFilter === 'Favourites' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            onClick={() => setActiveFilter('Favourites')}
          >
            Favourites
          </button>
        </div>
      </div>
      
      <div className="channels-container flex-1 overflow-y-auto">
        {searchTerm ? (
          // Display search results with full path and hash symbol
          filteredChannels.length > 0 ? renderSearchResults() : (
            <div className="text-gray-500 text-center py-4">No channels found</div>
          )
        ) : (
          // Display normal hierarchical view when not searching
          rootChannels.length > 0 ? (
            rootChannels.map(channel => renderChannelWithChildren(channel))
          ) : (
            <div className="text-gray-500 text-center py-4">
              {activeFilter === 'Favourites' ? 'No favorite channels' : 'No channels found'}
            </div>
          )
        )}
      </div>

      {isModalOpen && <ChannelCreationModal onClose={closeModal} />}
    </div>
  );
};

export default ChannelList;