

import React, { useState } from 'react';
import { useInformation } from '../../../contexts/InformationContext';
import UserItem from './UserItem';

const UserList = () => {
  const { users, loading } = useInformation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  // console.log(users);

  if (loading) return <div className="p-2">Loading users...</div>;

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.displayName.toLowerCase().includes(searchLower)
    );
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="p-4 text-xl font-medium text-gray-700">
        User
      </div>
      
   
      
      {/* Search Bar */}
      <div className="px-4 pb-2">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full py-2 pl-8 pr-2 text-sm border border-gray-200 rounded bg-white"
          />
        </div>
      </div>

      <div 
        className="flex justify-between items-center px-3 py-2 border-b border-gray-200 cursor-pointer"
        onClick={toggleCollapse}
      >
        <div className="text-gray-700 font-medium">
          User List ({filteredUsers.length})
        </div>
        <div>
          {isCollapsed ? '▼' : '▲'}
        </div>
      </div>

      {/* Users List */}
      {!isCollapsed && (
        <div className="overflow-y-auto">
          {filteredUsers.map((user) => (
            <UserItem key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserList;