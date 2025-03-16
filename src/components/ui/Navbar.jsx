
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../contexts/AppStateContext';
import { useAuth } from '../../contexts/AuthContext';

const NavigationBar = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('home');
  const { selectOption } = useAppState();
  const { user } = useAuth();
  console.log(user);
  const userIcon = user?.data?.iconFileId ? `https://traq.duckdns.org/api/v3/files/${user.data.iconFileId}` : '';

  const handleNavigation = (route, itemName) => {
    setActiveItem(itemName);
    navigate(route);
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-md py-4">
      {/* Logo at the top */}
      <div className="flex justify-center mb-6 mt-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 28 28" width="28" height="28" role="img" class="_icon_w3eq5_1"><path fill="currentColor" fill-rule="evenodd" d="m21.894 17.94-3.835-2.604a.45.45 0 0 0-.268-.083H11.4c-.206 0-.309.228-.185.393L13.069 18c-1.051.352-2.206.455-3.299.248a6.62 6.62 0 0 1-3.855-2.438c-1.402-1.86-1.67-4.38-.763-6.426 1.01-2.356 3.381-3.843 5.835-3.843h.433c2.598.186 4.866 2.045 5.65 4.442.432 1.385.37 2.893-.124 4.257h1.196c.103 0 .206.02.268.082l1.01.703c.536-1.508.66-3.14.371-4.711-.35-1.819-1.32-3.554-2.66-4.856A9.02 9.02 0 0 0 10.987 3h-.227c-2.763.062-5.36 1.446-6.99 3.616-1.402 1.88-2 4.319-1.69 6.633.35 2.542 1.855 4.876 3.979 6.302a9.1 9.1 0 0 0 5.093 1.447h6.618c.104 0 .186-.021.268-.083l3.836-2.583c.165-.082.165-.29.02-.393" clip-rule="evenodd"></path></svg>
          {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="20" height="20">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg> */}
        </div>
      </div>

      {/* Navigation items */}
      <div className="flex flex-col items-center space-y-6 flex-grow">
        <NavItem
          label="Home"
          iconPath="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
          isActive={activeItem === 'home'}
          onClick={() => {
            selectOption('home');
            setActiveItem('home');
          }
        }

        />

        <NavItem
          label="Channels"
          iconPath="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z M4 4h16v16H4z"
          isActive={activeItem === 'channels'}
          onClick={() => {
            selectOption('channelList');
            setActiveItem('channels');
          }
        }

        />

        <NavItem
          label="Users"
          iconPath="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
          isActive={activeItem === 'users'}
          onClick={() =>{
            selectOption('userList');
            setActiveItem('users');
          }}
        />

        <NavItem
          label="Activity"
          iconPath="M7.58 4.08L6.15 2.65C3.75 4.48 2.17 7.3 2.03 10.5h2c.15-2.65 1.51-4.97 3.55-6.42zm12.39 6.42h2c-.15-3.2-1.73-6.02-4.12-7.85l-1.42 1.43c2.02 1.45 3.39 3.77 3.54 6.42zM18 11c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2v-5zm-6 11c.14 0 .27-.01.4-.04.65-.14 1.18-.58 1.44-1.18.1-.24.15-.5.15-.78h-4c.01 1.1.9 2 2.01 2z"
          isActive={activeItem === 'activity'}
          onClick={() => {
            selectOption('activity');
            setActiveItem('activity');
          }}
        />

        <NavItem
          label="Clip"
          iconPath="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"
          isActive={activeItem === 'clip'}
          onClick={() =>{
            selectOption('clip');
            setActiveItem('clip');
          }}
        />
      </div>

      {/* User profile moved up from the bottom */}
      <div className="mt-auto mb-6">
        {user && (
          <div
            className="cursor-pointer relative flex justify-center"
            onClick={() => handleNavigation('/profile')}
          >

            <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold overflow-hidden">
              <img
                src={userIcon}
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-0 right-1/3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        )}
      </div>
    </div>
  );
};

// Navigation item component
const NavItem = ({ label, iconPath, isActive, onClick }) => {
  return (
    <div
      className={`flex flex-col items-center cursor-pointer w-full px-4 py-2 ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
      onClick={onClick}
    >
      <div className="w-8 h-8 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d={iconPath} />
        </svg>
      </div>
      <span className="text-xs mt-1">{label}</span>
    </div>
  );
};

export default NavigationBar;