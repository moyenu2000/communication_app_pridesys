import React, { useState } from 'react';
import { useInformation } from '../../../contexts/InformationContext';
import { createChannelService } from '../../../services/channelServices';

const ChannelCreationModal = ({ onClose }) => {
  const { channels, setChannels } = useInformation();
  const [channelName, setChannelName] = useState('');
  const [parentChannel, setParentChannel] = useState(null);
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);
  const [error, setError] = useState('');

  const formatChannelPath = (channel) => {
    if (!channel.parentId) {
      return `#${channel.name}`;
    }
    
    const findParentPath = (channelId) => {
      const parent = channels.find(c => c.id === channelId);
      if (!parent) return '';
      if (!parent.parentId) return `#${parent.name}`;
      return `${findParentPath(parent.parentId)}/${parent.name}`;
    };
    
    return `${findParentPath(channel.parentId)}/${channel.name}`;
  };

  const createChannel = async () => {
    if (!channelName.trim()) {
      setError('Channel name cannot be empty');
      return;
    }
  
    try {
      const result = await createChannelService(channelName, parentChannel?.id);
      // setChannels([...channels, result]);
      onClose();
    } catch (error) {
      setError('Failed to create channel');
      console.error('Error creating channel:', error);
    }
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="w-full max-w-md bg-transparent text-black rounded-md p-4 shadow-lg backdrop-blur-md border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-xl mr-2">#</span>
            <h2 className="text-xl font-semibold">Create a channel</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-black hover:text-gray-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">Parent Channel</label>
          <div className="relative">
            <button 
              className="w-full bg-white bg-opacity-50 border border-gray-700 rounded p-2 text-left flex justify-between items-center"
              onClick={() => setIsParentDropdownOpen(!isParentDropdownOpen)}
            >
              {parentChannel ? formatChannelPath(parentChannel) : "-----"}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isParentDropdownOpen && (
              <div className="absolute z-10 w-full bg-white bg-opacity-75 backdrop-blur-sm border border-gray-700 mt-1 rounded max-h-60 overflow-y-auto">
                <div className="p-2 hover:bg-gray-700 hover:bg-opacity-50 cursor-pointer" onClick={() => {
                  setParentChannel(null);
                  setIsParentDropdownOpen(false);
                }}>
                  (root)
                </div>
                {channels.map(channel => (
                  <div 
                    key={channel.id} 
                    className="p-2 hover:bg-gray-700 hover:bg-opacity-50 cursor-pointer"
                    onClick={() => {
                      setParentChannel(channel);
                      setIsParentDropdownOpen(false);
                    }}
                  >
                    {formatChannelPath(channel)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block mb-2">Channel name</label>
          <input 
            type="text"
            className="w-full bg-white bg-opacity-50 border border-gray-700 rounded p-2"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            maxLength={20}
            autoFocus
          />
          <div className="flex justify-end mt-1 text-sm text-black">
            {channelName.length}/20
          </div>
          
          <p className="mt-4 text-black text-sm">
            When executed, a new # is created. (You can't delete or move a channel or change the channel name after it's created.)
          </p>
          
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
        
        <div className="flex justify-end">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2"
            onClick={createChannel}
          >
            creation
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelCreationModal;