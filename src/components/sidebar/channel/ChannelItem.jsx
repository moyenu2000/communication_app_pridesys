// // src/components/channels/ChannelItem.jsx
// import React from 'react';
// import { useWebSocket } from '../../../contexts/WebSocketContext';
// import { useChatState } from '../../../contexts/ChatStateContext';


// const ChannelItem = ({ channel}) => {
//   const {changeViewStat} = useWebSocket(); 
//   const {selectChat, selectedChat} = useChatState();

//   const handleClick = () => {
//     if(selectedChat && selectedChat.id === channel.id) return;

//     changeViewStat(channel.id, 'monitoring');
//     channel.offset = 0;
//     console.log("Channel offset:", channel);
//     selectChat(channel);

//     console.log("Channel selected:",  selectedChat);
//   };

//   return (
//     <div onClick={handleClick}>
//       <span>{channel.name}</span>
//     </div>
//   );
// };

// export default ChannelItem;


// src/components/channels/ChannelItem.jsx
import React, { useEffect } from 'react';
import { useWebSocket } from '../../../contexts/WebSocketContext';
import { useChatState } from '../../../contexts/ChatStateContext';

const ChannelItem = ({ channel }) => {
  const { changeViewStat } = useWebSocket();
  const { selectChat, selectedChat } = useChatState();

  const handleClick = () => {
    if (selectedChat && selectedChat.id === channel.id) return;

    changeViewStat(channel.id, 'monitoring');
    channel.offset = 0;
    console.log("Channel offset:", channel);
    selectChat(channel); // This will update selectedChat, but it'll be asynchronous

    // You can log it inside useEffect instead of immediately after calling selectChat
  };

  // Log the selectedChat whenever it changes
  useEffect(() => {
    console.log("Selected chat has changed:", selectedChat);
  }, [selectedChat]); // This effect will run whenever selectedChat is updated

  return (
    <div onClick={handleClick}>
      <span>{channel.name}</span>
    </div>
  );
};

export default ChannelItem;
