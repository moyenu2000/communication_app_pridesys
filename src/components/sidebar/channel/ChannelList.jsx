
// src/components/channels/ChannelList.jsx
import React, { useState } from 'react';
import ChannelItem from './ChannelItem';
import { useInformation } from '../../../contexts/InformationContext';

const ChannelList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { channels, loading } = useInformation();

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading channels...</div>;

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
