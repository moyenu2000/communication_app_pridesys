// src/components/channels/CreateChannelModal.jsx
import React, { useState } from 'react';

const CreateChannelModal = ({ isOpen, onClose, onCreateChannel }) => {
  const [channelName, setChannelName] = useState('');
  const [parentChannel, setParentChannel] = useState('');

  const handleCreate = () => {
    onCreateChannel({ name: channelName, parentChannel });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div>
      <div>
        <input
          type="text"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          placeholder="Channel name"
        />
        
        <select onChange={(e) => setParentChannel(e.target.value)}>

          <option value="">Select Parent Channel</option>
        </select>
        <button onClick={handleCreate}>Create</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default CreateChannelModal;
