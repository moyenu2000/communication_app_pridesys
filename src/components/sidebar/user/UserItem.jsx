// import React, { useState, useEffect } from 'react';
// import { useWebSocket } from '../../../contexts/WebSocketContext';
// import { useChatState } from '../../../contexts/ChatStateContext';
// import { fetchChannel, fetchDMChannel } from '../../../services/userServices';
// import { useInformation } from '../../../contexts/InformationContext';

// const UserItem = ({ user }) => {
//   const { changeViewStat } = useWebSocket();
//   const { selectChat } = useChatState();
//   const { activeUsers } = useInformation();
//   const [isActive, setIsActive] = useState(false);

//   // Update active status whenever activeUsers list changes
//   useEffect(() => {
//     const userIsActive = activeUsers.some(activeUser => activeUser === user.id);
//     setIsActive(userIsActive);
//   }, [activeUsers, user.id]);

//   const handleClick = async () => {
//     try {
//       const response = await fetchDMChannel(user.id);
//       const channelId = response.data.id;
      
//       const channelResponse = await fetchChannel(channelId);
//       const channel = channelResponse.data;
      
//       console.log('Channel:', channel);

//       changeViewStat(channel.id, 'monitoring');
//       channel.offset = 0;
//       selectChat(channel);
//     } catch (error) {
//       console.error('Error fetching DM channel:', error);
//     }
//   };

//   return (
//     <div 
//       onClick={handleClick} 
//       style={{ 
//         display: 'flex', 
//         alignItems: 'center', 
//         cursor: 'pointer',
//         padding: '8px'
//       }}
//     >
//       <div style={{ flex: 1 }}>
//         <div>{user.name}</div>
//         <div style={{ fontSize: '0.85em', color: '#666' }}>{user.displayname}</div>
//       </div>
//       {isActive && (
//         <div 
//           style={{ 
//             width: '10px', 
//             height: '10px', 
//             borderRadius: '50%', 
//             backgroundColor: '#2ecc71', 
//             marginLeft: '8px' 
//           }} 
//           title="Online"
//         />
//       )}
//     </div>
//   );
// };

// export default UserItem;


import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../../contexts/WebSocketContext';
import { useChatState } from '../../../contexts/ChatStateContext';
import { fetchChannel, fetchDMChannel } from '../../../services/userServices';
import { useInformation } from '../../../contexts/InformationContext';

const UserItem = ({ user }) => {
  const { changeViewStat } = useWebSocket();
  const { selectChat } = useChatState();
  const { activeUsers } = useInformation();
  const [isActive, setIsActive] = useState(false);

  // Update active status whenever activeUsers list changes
  useEffect(() => {
    const userIsActive = activeUsers.some(activeUser => activeUser === user.id);
    setIsActive(userIsActive);
  }, [activeUsers, user.id]);

  const handleClick = async () => {
    try {
      const response = await fetchDMChannel(user.id);
      const channelId = response.data.id;
      
      const channelResponse = await fetchChannel(channelId);
      const channel = channelResponse.data;
      
      console.log('Channel:', channel);

      changeViewStat(channel.id, 'monitoring');
      channel.offset = 0;
      selectChat(channel);
    } catch (error) {
      console.error('Error fetching DM channel:', error);
    }
  };

  return (
    <div 
      onClick={handleClick} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        cursor: 'pointer',
        padding: '8px'
      }}
    >
      {isActive && (
        <div 
          style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: '#2ecc71', 
            marginRight: '4px' 
          }} 
          title="Online"
        />
      )}
      <div>
        <div>{user.name}</div>
        <div style={{ fontSize: '0.85em', color: '#666' }}>{user.displayname}</div>
      </div>
    </div>
  );
};

export default UserItem;