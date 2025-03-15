// src/components/users/UserList.jsx
import React from 'react';
// import { useInformation } from '../../context/InformationContext';
import UserItem from './UserItem';
import { useInformation } from '../../../contexts/InformationContext';

const UserList = () => {
  const { users, loading } = useInformation();

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      {users.map((user) => (
        <UserItem key={user.id} user={user} />
      ))}
    </div>
  );
};

export default UserList;
