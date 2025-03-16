// import React, { useState } from 'react';
// import { useInformation } from '../../../contexts/InformationContext';
// import { useChatState } from '../../../contexts/ChatStateContext';
// import { useWebSocket } from '../../../contexts/WebSocketContext';

// const Home = () => {
//   const { changeViewStat } = useWebSocket();
//   const [searchTerm, setSearchTerm] = useState('');
//   const { channels, loading, subscribedChannels, starredChannels, dmChannels, unReadMessages, users } = useInformation();
//   const { selectChat, selectedChat, setUserOrChannel } = useChatState();

//   console.log('Channels:', subscribedChannels);


//   const getChannelPath = (channelId) => {
//     const path = [];
//     let currentChannel = channels.find(c => c.id === channelId);

//     while (currentChannel) {
//       path.unshift(currentChannel.name);
//       currentChannel = currentChannel.parentId ?
//         channels.find(c => c.id === currentChannel.parentId) :
//         null;
//     }
//     return path.join('/');
//   };


//   console.log('public channels:', channels);
//   console.log("dmChannels:", dmChannels);
//   const unReadPublicChannels = unReadMessages.filter(message => message.channelId && channels.find(channel => channel.id === message.channelId));
//   const unReadDMChannels = unReadMessages.filter(message => message.channelId && dmChannels.find(channel => channel.id === message.channelId));

//   console.log('Unread public channels:', unReadPublicChannels);
//   console.log('Unread DM channels:', unReadDMChannels);



//   // const getChannelForUnreadMessages =()
//   // {
//   //   const publicChannels = allChannels.
//   //   // const publicChannelsWithUnreadMessages = [];
//   //   // const userChannelsWithUnreadMessages = [];
//   //   unReadMessages.forEach(message => {
//   //     const channel = allChannels.find(channel => channel.id === message.channelId);
//   //     if (channel) {
//   //       channelsWithUnreadMessages.push(channel);
//   //     }
//   //   });

//   //   return channelsWithUnreadMessages;
//   // }

//   const getFilteredChannels = () => {
//     let filtered = channels.filter(channel => {
//       return subscribedChannels && 
//         subscribedChannels.some(subscription => subscription.channelId === channel.id);
//     });
//     if (searchTerm) {
//       filtered = filtered.filter(channel =>
//         channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         getChannelPath(channel.id).toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }
    
//     return filtered;
//   };

//   const filteredChannels = getFilteredChannels();
//   const handleChannelSelect = (channel) => {
//     if (selectedChat && selectedChat.id === channel.id) return;
//     changeViewStat(channel.id, 'monitoring');
//     channel.offset = 0;
//     selectChat(channel);
//     setUserOrChannel('channel');
//   };

//   if (loading) return <div className="p-4 text-gray-500">Loading subscribed channels...</div>;

//   return (
//     <div className="h-full bg-white flex flex-col">
//       <div className="p-4 border-b border-gray-200">
//         <h2 className="text-xl font-medium text-gray-700 mb-3">Home</h2>
//         <h3 className="text-base text-gray-600 mb-3">Subscribed Channels</h3>


//       </div>

//       <div className="channels-container flex-1 overflow-y-auto">
//         {filteredChannels.length > 0 ? (
//           filteredChannels.map(channel => {
//             const isStarred = starredChannels && starredChannels.includes(channel.id);

//             return (
//               <div
//                 key={channel.id}
//                 className={`flex items-center justify-between py-3 px-4 hover:bg-gray-100 cursor-pointer ${selectedChat && selectedChat.id === channel.id ? 'bg-blue-50' : ''}`}
//                 onClick={() => handleChannelSelect(channel)}
//               >
//                 <div className="flex items-center flex-1">
//                   <span className="mr-2 text-gray-400">#</span>
//                   <div className="flex flex-col">
//                     <span className={`${selectedChat && selectedChat.id === channel.id ? 'font-medium text-gray-700' : 'text-gray-600'}`}>
//                       {getChannelPath(channel.id)}
//                     </span>
//                     {channel.lastMessage && (
//                       <span className="text-sm text-gray-500 truncate max-w-xs">
//                         {channel.lastMessage.substr(0, 50)}{channel.lastMessage.length > 50 ? '...' : ''}
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 {isStarred && (
//                   <span className="text-yellow-500">
//                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
//                     </svg>
//                   </span>
//                 )}
//               </div>
//             );
//           })
//         ) : (
//           <div className="flex flex-col items-center justify-center h-full text-center p-4">
//             <div className="text-gray-400 mb-2">
//               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
//                 <circle cx="12" cy="12" r="10"></circle>
//                 <path d="M8 15h8M9.5 9h.01M14.5 9h.01"></path>
//               </svg>
//             </div>
//             <p className="text-gray-500 mb-1">No subscribed channels found</p>
//             <p className="text-gray-400 text-sm">Subscribe to channels to see them here</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Home;


import React, { useState } from 'react';
import { useInformation } from '../../../contexts/InformationContext';
import { useChatState } from '../../../contexts/ChatStateContext';
import { useWebSocket } from '../../../contexts/WebSocketContext';
import { markChannelAsRead } from '../../../services/userServices';

const Home = () => {
  const { changeViewStat } = useWebSocket();
  const { channels, loading, subscribedChannels, starredChannels, dmChannels, unReadMessages, users, setUnReadMessages } = useInformation();
  const { selectChat, selectedChat, setUserOrChannel } = useChatState();

  const getChannelPath = (channelId) => {
    const path = [];
    let currentChannel = channels.find(c => c.id === channelId);

    while (currentChannel) {
      path.unshift(currentChannel.name);
      currentChannel = currentChannel.parentId ?
        channels.find(c => c.id === currentChannel.parentId) :
        null;
    }
    return path.join('/');
  };

  const unReadPublicChannels = unReadMessages.filter(message => 
    message.channelId && channels.find(channel => channel.id === message.channelId)
  );
  
  const unReadDMChannels = unReadMessages.filter(message => 
    message.channelId && dmChannels.find(channel => channel.id === message.channelId)
  );

  const getFilteredChannels = () => {
    let filtered = channels.filter(channel => {
      return subscribedChannels && 
        subscribedChannels.some(subscription => subscription.channelId === channel.id);
    });
    return filtered;
  };

  // Get the actual channel objects for unread messages
  const getUnreadChannelObjects = (unreadMessages, channelList) => {
    const uniqueChannelIds = [...new Set(unreadMessages.map(msg => msg.channelId))];
    return uniqueChannelIds.map(id => {
      const channel = channelList.find(c => c.id === id);
      const unreadInfo = unreadMessages.find(msg => msg.channelId === id);
      if (channel) {
        return {
          ...channel,
          unreadCount: unreadInfo.count,
          noticeable: unreadInfo.noticeable
        };
      }
      return null;
    }).filter(Boolean);
  };

  const unreadPublicChannelObjects = getUnreadChannelObjects(unReadPublicChannels, channels);
  const unreadDMChannelObjects = getUnreadChannelObjects(unReadDMChannels, dmChannels);

  const filteredChannels = getFilteredChannels();
  
  const handleChannelSelect = (channel) => {
    if (selectedChat && selectedChat.id === channel.id) return;
    changeViewStat(channel.id, 'monitoring');
    channel.offset = 0;
    selectChat(channel);
    setUserOrChannel('channel');
    markChannelAsRead(channel.id);
    // remove from unread channels
    const updatedUnreadMessages = unReadMessages.filter(msg => msg.channelId !== channel.id);
    setUnReadMessages(updatedUnreadMessages);

  };

  const handleDMChannelSelect = (channel) => {
    if (selectedChat && selectedChat.id === channel.id) return;
    changeViewStat(channel.id, 'monitoring');
    channel.offset = 0;
    selectChat(channel);
    setUserOrChannel('user');
    markChannelAsRead(channel.id);
    // remove from unread channels
    const updatedUnreadMessages = unReadMessages.filter(msg => msg.channelId !== channel.id);
    setUnReadMessages(updatedUnreadMessages);
    
  };

  const renderChannelItem = (channel, isUnread = false) => {
    const isStarred = starredChannels && starredChannels.includes(channel.id);
    const isSelected = selectedChat && selectedChat.id === channel.id;

    return (
      <div
        key={channel.id}
        className={`flex items-center justify-between py-3 px-4 hover:bg-gray-100 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
        onClick={() => handleChannelSelect(channel)}
      >
        <div className="flex items-center flex-1">
          <span className="mr-2 text-gray-400">#</span>
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className={`${isSelected ? 'font-medium text-gray-700' : 'text-gray-600'}`}>
                {getChannelPath(channel.id)}
              </span>
              {isUnread && channel.unreadCount > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${channel.noticeable ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  {channel.unreadCount}
                </span>
              )}
            </div>
            {channel.lastMessage && (
              <span className="text-sm text-gray-500 truncate max-w-xs">
                {channel.lastMessage.substr(0, 50)}{channel.lastMessage.length > 50 ? '...' : ''}
              </span>
            )}
          </div>
        </div>

        {isStarred && (
          <span className="text-yellow-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </span>
        )}
      </div>
    );
  };

  const renderDMItem = (channel) => {
    const isSelected = selectedChat && selectedChat.id === channel.id;
    const otherUser = users.find(user => user.id === channel.userId);
    const displayName = otherUser ? otherUser.displayName || otherUser.username : 'Unknown User';

    return (
      <div
        key={channel.id}
        className={`flex items-center justify-between py-3 px-4 hover:bg-gray-100 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
        onClick={() => handleDMChannelSelect(channel)}
      >
        <div className="flex items-center flex-1">
          <span className="mr-2 text-gray-400">@</span>
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className={`${isSelected ? 'font-medium text-gray-700' : 'text-gray-600'}`}>
                {displayName}
              </span>
              {channel.unreadCount > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${channel.noticeable ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  {channel.unreadCount}
                </span>
              )}
            </div>
            {channel.lastMessage && (
              <span className="text-sm text-gray-500 truncate max-w-xs">
                {channel.lastMessage.substr(0, 50)}{channel.lastMessage.length > 50 ? '...' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-4 text-gray-500">Loading subscribed channels...</div>;

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-medium text-gray-700 mb-3">Home</h2>
        <h3 className="text-base text-gray-600 mb-3">Subscribed Channels</h3>
      </div>

      <div className="channels-container flex-1 overflow-y-auto">
        
        {filteredChannels.length > 0 ? (
          filteredChannels.map(channel => renderChannelItem(channel))
        ) : (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-gray-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 15h8M9.5 9h.01M14.5 9h.01"></path>
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No subscribed channels found</p>
          </div>
        )}

        {/* Unread Public Channels Section */}
        {unreadPublicChannelObjects.length > 0 && (
          <>
            <div className="py-2 px-4 bg-gray-100 mt-4 border-t border-gray-200">
              <h3 className="text-base text-gray-600">Unread Public Channels</h3>
            </div>
            {unreadPublicChannelObjects.map(channel => renderChannelItem(channel, true))}
          </>
        )}

        {/* Unread DM Channels Section */}
        {unreadDMChannelObjects.length > 0 && (
          <>
            <div className="py-2 px-4 bg-gray-100 mt-4 border-t border-gray-200">
              <h3 className="text-base text-gray-600">Unread Direct Messages</h3>
            </div>
            {unreadDMChannelObjects.map(channel => renderDMItem(channel))}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;