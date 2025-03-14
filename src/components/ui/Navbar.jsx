// src/components/NavigationBar.jsx
import React from 'react';
import { useAppState } from '../../contexts/AppStateContext';

const NavigationBar = () => {
  const { selectedOption, selectOption } = useAppState(); // Access selected option and function to change it

  return (
    <div>
      <button onClick={() => selectOption('home')}>Home</button>
      <button onClick={() => selectOption('userList')}>User List</button>
      <button onClick={() => selectOption('channelList')}>Channel List</button>
      <button onClick={() => selectOption('activity')}>Activity</button>
      <button onClick={() => selectOption('clip')}>Clip</button>

      <p>Selected Option: {selectedOption}</p>
    </div>
  );
};

export default NavigationBar;
