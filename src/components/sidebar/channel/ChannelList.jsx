// src/components/channels/ChannelList.jsx
import React, { useEffect, useState } from 'react';
import { fetchChannels } from '../../../services/userServices';  // Import the fetchChannels function
import ChannelItem from './ChannelItem'; 


const ChannelList = () => {
  const [channels, setChannels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    
    const getChannels = async () => {
      try {
        const response = await fetchChannels(); 
        const data = response.data;  
        console.log(data);
        
        setChannels(data.public || []);  
      } catch (error) {
        console.error('Error fetching channels:', error);
      }
    };

    getChannels();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search channels"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <div>
        {filteredChannels.map((channel) => (
          <ChannelItem key={channel.id} channel={channel} />
        ))}
      </div>
    </div>
  );
};

export default ChannelList;
