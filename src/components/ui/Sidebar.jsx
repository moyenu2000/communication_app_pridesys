// src/components/Sidebar.jsx
import React from 'react';
import { useAppState } from '../../contexts/AppStateContext';
import UserList from '../sidebar/user/UserList';
import ChannelList from '../sidebar/channel/ChannelList';
import Activity from '../sidebar/activity/Activity';
import Clip from '../sidebar/clip/Clip';
import Home from '../sidebar/home/Home';


const Sidebar = () => {
  const { selectedOption } = useAppState(); 

  const renderContent = () => {
    switch (selectedOption) {
      case 'home':
        return <Home />;
      case 'userList':
        return <UserList />;
      case 'channelList':
        return <ChannelList />;
      case 'activity':
        return <Activity />;
      case 'clip':
        return <Clip />;
      default:
        return <Home />; 
    }
  };

  return (
    <div>
      
      {renderContent()}
    </div>
  );
};

export default Sidebar;
