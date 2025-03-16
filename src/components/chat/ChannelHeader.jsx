// import React from 'react';
// import { useChatState } from '../../contexts/ChatStateContext';
// import {
//   addChannelToStars,
//   removeChannelFromStars,
//   setChannelSubscriptionLevel
// } from '../../services/channelServices';
// import { useInformation } from '../../contexts/InformationContext';
// import ChannelViewers from './ChannelViewers';

// const ChannelHeader = () => {
//   const { selectedChat, setSelectedChat, pinnedMessages, userOrChannel, selectedUser } = useChatState();
//   const { starredChannels, setStarredChannels, subscribedChannels, setSubscribedChannels, users,currentChannelViewers } = useInformation();
//   let channelName = 'Select a channel/User';

//   if (userOrChannel === 'channel' && selectedChat) {
//     channelName = selectedChat.name;
//   } else if (userOrChannel === 'user' && selectedUser) {
//     channelName = selectedUser.displayName;
//   }

//   const isStarred = starredChannels.some(channelId => channelId === selectedChat?.id);

//   const subscriptionInfo = selectedChat ? subscribedChannels.find(channel => channel.channelId === selectedChat.id) : null;
//   const isSubscribed = subscriptionInfo ? subscriptionInfo.level > 0 : false;

//   const handleToggleStar = () => {
//     if (!selectedChat) return;

//     if (isStarred) {
//       removeChannelFromStars(selectedChat.id);
//       setStarredChannels(starredChannels.filter(channelId => channelId !== selectedChat.id));
//     } else {
//       addChannelToStars(selectedChat.id);
//       setStarredChannels([...starredChannels, selectedChat.id]);
//     }
//   };

//   const handleBellClick = () => {
//     if (!selectedChat) return;

//     if (isSubscribed) {
//       setChannelSubscriptionLevel(selectedChat.id, 0);
//       setSubscribedChannels(subscribedChannels.filter(channel => channel.channelId !== selectedChat.id));
//     } else {
//       setChannelSubscriptionLevel(selectedChat.id, 1);
//       const newSubscription = {
//         channelId: selectedChat.id,
//         level: 1
//       };
//       setSubscribedChannels([...subscribedChannels, newSubscription]);
//     }
//   };



//   return (
//     <div className="flex items-center justify-between pl-6 pr-20 py-3 bg-white z-10 w-full h-20 border-t border-l border-r border-gray-200 rounded-t-lg border-b">
//       <div className="flex items-center">
//         <span className="text-gray-900 mr-2 text-xl font-bold">#</span>
//         <h2 className="font-bold text-gray-900 text-xl">{channelName}</h2>
//         <svg
//           className="ml-2 text-gray-900"
//           width="16"
//           height="16"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2.5"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         >
//           <polyline points="6 9 12 15 18 9"></polyline>
//         </svg>

//         {currentChannelViewers && currentChannelViewers.length > 0 && (
//           <div className="ml-4 text-sm text-gray-500">
//             {currentChannelViewers.length} {currentChannelViewers.length === 1 ? 'viewer' : 'viewers'}
//           </div>
//         )}
//       </div>

//       <div className="flex items-center space-x-10">
//         <button
//           className="text-gray-500 hover:text-gray-700"
//           onClick={handleBellClick}
//           disabled={!selectedChat}
//         >
//           {/* Bell icon */}
//           <svg
//             width="18"
//             height="18"
//             viewBox="0 0 24 24"
//             fill={isSubscribed ? "currentColor" : "none"}
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           >
//             <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
//             <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
//           </svg>
//         </button>

//         <button
//           className={`text-gray-500 hover:text-amber-400 ${isStarred ? 'text-amber-400' : ''}`}
//           onClick={handleToggleStar}
//           disabled={!selectedChat}
//         >
//           {/* Star icon */}
//           <svg
//             width="18"
//             height="18"
//             viewBox="0 0 24 24"
//             fill={isStarred ? "currentColor" : "none"}
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           >
//             <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
//           </svg>
//         </button>

     
//       </div>
//     </div>
//   );
// };

// export default ChannelHeader;


import React from 'react';
import { useChatState } from '../../contexts/ChatStateContext';
import {
  addChannelToStars,
  removeChannelFromStars,
  setChannelSubscriptionLevel
} from '../../services/channelServices';
import { useInformation } from '../../contexts/InformationContext';
import ChannelViewers from './ChannelViewers'; // Fix import - no curly braces

const ChannelHeader = () => {
  const { selectedChat, setSelectedChat, pinnedMessages, userOrChannel, selectedUser,currentChannelViewers } = useChatState();
  const { starredChannels, setStarredChannels, subscribedChannels, setSubscribedChannels, users } = useInformation();
  let channelName = 'Select a channel/User';

  console.log(currentChannelViewers);

  if (userOrChannel === 'channel' && selectedChat) {
    channelName = selectedChat.name;
  } else if (userOrChannel === 'user' && selectedUser) {
    channelName = selectedUser.displayName;
  }

  const isStarred = starredChannels.some(channelId => channelId === selectedChat?.id);

  const subscriptionInfo = selectedChat ? subscribedChannels.find(channel => channel.channelId === selectedChat.id) : null;
  const isSubscribed = subscriptionInfo ? subscriptionInfo.level > 0 : false;

  const handleToggleStar = () => {
    if (!selectedChat) return;

    if (isStarred) {
      removeChannelFromStars(selectedChat.id);
      setStarredChannels(starredChannels.filter(channelId => channelId !== selectedChat.id));
    } else {
      addChannelToStars(selectedChat.id);
      setStarredChannels([...starredChannels, selectedChat.id]);
    }
  };

  const handleBellClick = () => {
    if (!selectedChat) return;

    if (isSubscribed) {
      setChannelSubscriptionLevel(selectedChat.id, 0);
      setSubscribedChannels(subscribedChannels.filter(channel => channel.channelId !== selectedChat.id));
    } else {
      setChannelSubscriptionLevel(selectedChat.id, 1);
      const newSubscription = {
        channelId: selectedChat.id,
        level: 1
      };
      setSubscribedChannels([...subscribedChannels, newSubscription]);
    }
  };

  return (
    <div className="flex items-center justify-between pl-6 pr-20 py-3 bg-white z-10 w-full h-20 border-t border-l border-r border-gray-200 rounded-t-lg border-b">
      <div className="flex items-center">
        <span className="text-gray-900 mr-2 text-xl font-bold">#</span>
        <h2 className="font-bold text-gray-900 text-xl">{channelName}</h2>
        <svg
          className="ml-2 text-gray-900"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>

        {currentChannelViewers && currentChannelViewers.length > 0 && (
          <div className="ml-4 flex items-center">
            <ChannelViewers /> {/* Add the component here */}
            <span className="ml-2 text-sm text-gray-500">
              {currentChannelViewers.length} {currentChannelViewers.length === 1 ? 'viewer' : 'viewers'}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-10">
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={handleBellClick}
          disabled={!selectedChat}
        >
          {/* Bell icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isSubscribed ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>

        <button
          className={`text-gray-500 hover:text-amber-400 ${isStarred ? 'text-amber-400' : ''}`}
          onClick={handleToggleStar}
          disabled={!selectedChat}
        >
          {/* Star icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isStarred ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChannelHeader;