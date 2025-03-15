// src/components/NavigationBar.jsx
import React from 'react';
import { useAppState } from '../../contexts/AppStateContext';
// Import icons from a library like heroicons or react-icons
// This example assumes you're using react-icons
import { FaHome, FaUsers, FaLayerGroup, FaBell, FaPaperclip } from 'react-icons/fa';

const NavigationBar = () => {
  const { selectedOption, selectOption } = useAppState();

  return (
    <div className="mt-6 p-2 flex flex-col items-center">
      <button
        className={`my-2 w-full flex flex-col items-center justify-center p-2 rounded ${
          selectedOption === 'home' ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'
        }`}
        onClick={() => selectOption('home')}
        title="Home"
      >
        <FaHome size={32} className={selectedOption === 'home' ? 'text-blue-600' : 'text-gray-600'} />
        <span className='text-sm mt-1'>Home</span>
      </button>

      <button
        className={`my-2 w-full flex flex-col items-center justify-center p-2 rounded ${
          selectedOption === 'channelList' ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'
        }`}
        onClick={() => selectOption('channelList')}
        title="Channel List"
      >
        <FaLayerGroup size={32} className={selectedOption === 'channelList' ? 'text-blue-600' : 'text-gray-600'} />
        <span className='text-sm mt-1'>Channels</span>
      </button>

      <button
        className={`my-2 w-full flex flex-col items-center justify-center p-2 rounded ${
          selectedOption === 'userList' ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'
        }`}
        onClick={() => selectOption('userList')}
        title="User List"
      >
        <FaUsers size={32} className={selectedOption === 'userList' ? 'text-blue-600' : 'text-gray-600'} />
        <span className='text-sm mt-1'>Users</span>
      </button>

      <button
        className={`my-2 w-full flex flex-col items-center justify-center p-2 rounded ${
          selectedOption === 'activity' ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'
        }`}
        onClick={() => selectOption('activity')}
        title="Activity"
      >
        <FaBell size={32} className={selectedOption === 'activity' ? 'text-blue-600' : 'text-gray-600'} />
        <span className='text-sm mt-1'>Activity</span>
      </button>

      <button
        className={`my-2 w-full flex flex-col items-center justify-center p-2 rounded ${
          selectedOption === 'clip' ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'
        }`}
        onClick={() => selectOption('clip')}
        title="Clip"
      >
        <FaPaperclip size={32} className={selectedOption === 'clip' ? 'text-blue-600' : 'text-gray-600'} />
        <span className='text-sm mt-1'>Clip</span>
      </button>
    </div>
  );
};

export default NavigationBar;