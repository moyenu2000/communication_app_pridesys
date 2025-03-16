import React, { useEffect, useState } from 'react';
import MessageItem from './MessageItem';
import { useChatState } from '../../contexts/ChatStateContext';
import { useAuth } from '../../contexts/AuthContext'; // Assuming you have an AuthContext

const MessageList = () => {
    // const { messages, editMessage, deleteMessage } = useChatState();
    const { user } = useAuth();
    const { messages } = useChatState();
    const [groupedMessages, setGroupedMessages] = useState({});
    

    // Function to format date for grouping
    const formatDateHeader = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const messageDate = new Date(date);
        messageDate.setHours(0, 0, 0, 0);

        if (messageDate.getTime() === today.getTime()) {
            return "Today";
        } else if (messageDate.getTime() === yesterday.getTime()) {
            return "Yesterday";
        } else {
            return `${messageDate.getFullYear()}/${String(messageDate.getMonth() + 1).padStart(2, '0')}/${String(messageDate.getDate()).padStart(2, '0')}`;
        }
    };

    // Group messages by date
    useEffect(() => {
        if (!messages || messages.length === 0) return;

        // Sort messages by creation time (oldest first)
        const sortedMessages = [...messages].sort((a, b) =>
            new Date(a.createdAt) - new Date(b.createdAt)
        );

        // Group by date
        const groups = {};
        sortedMessages.forEach(message => {
            if (!message.createdAt) return;

            const dateKey = formatDateHeader(message.createdAt);
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(message);
        });

        setGroupedMessages(groups);
    }, [messages]);


    return (
        <div>
            <div>
                {Object.entries(groupedMessages).map(([date, messagesGroup]) => (
                    <div key={date} className="mb-4">
                        {/* Date header */}
                        <div className="px-6 flex items-center justify-center my-3">
                            <div className="bg-gray-300 h-px flex-grow mr-3"></div>
                            <div className="inline-flex items-center bg-white px-3 py-1 text-sm text-gray-500 rounded-full shadow-sm border">
                                {date}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            <div className="bg-gray-300 h-px flex-grow ml-3"></div>
                        </div>

                        {/* Messages for this date */}
                        {messagesGroup.map(message => (
                            <MessageItem
                                key={message.id}
                                message={message}
                                canEdit={message.userId === user?.data?.id}
                                canDelete={message.userId === user?.data?.id}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MessageList;
//                 {/* {messages.map((message) => (


//                     <MessageItem
//                         key={message.id}
//                         message={message}
//                         canEdit={message.userId === user?.data?.id}
//                         canDelete={message.userId === user?.data?.id}

//                     />
//                 ))} */}
//             </div>
//         </div>
//     );
// };

// export default MessageList;


// import React, { useEffect, useState } from 'react';
// import MessageItem from './MessageItem';
// import { useChatState } from '../../contexts/ChatStateContext';
// import { useAuth } from '../../contexts/AuthContext';

// const MessageList = () => {
//     const { user } = useAuth();
//     const { messages } = useChatState();
//     const [groupedMessages, setGroupedMessages] = useState({});

//     // Function to format date for grouping
//     const formatDateHeader = (date) => {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         const yesterday = new Date(today);
//         yesterday.setDate(yesterday.getDate() - 1);

//         const messageDate = new Date(date);
//         messageDate.setHours(0, 0, 0, 0);

//         if (messageDate.getTime() === today.getTime()) {
//             return "Today";
//         } else if (messageDate.getTime() === yesterday.getTime()) {
//             return "Yesterday";
//         } else {
//             return `${messageDate.getFullYear()}/${String(messageDate.getMonth() + 1).padStart(2, '0')}/${String(messageDate.getDate()).padStart(2, '0')}`;
//         }
//     };

//     // Group messages by date
//     useEffect(() => {
//         if (!messages || messages.length === 0) return;

//         // Sort messages by creation time (oldest first)
//         const sortedMessages = [...messages].sort((a, b) =>
//             new Date(a.createdAt) - new Date(b.createdAt)
//         );

//         // Group by date
//         const groups = {};
//         sortedMessages.forEach(message => {
//             if (!message.createdAt) return;

//             const dateKey = formatDateHeader(message.createdAt);
//             if (!groups[dateKey]) {
//                 groups[dateKey] = [];
//             }
//             groups[dateKey].push(message);
//         });

//         setGroupedMessages(groups);
//     }, [messages]);

//     return (
//         <div className="flex flex-col h-full">
//             {Object.entries(groupedMessages).map(([date, messagesGroup]) => (
//                 <div key={date} className="mb-4">
//                     {/* Date header */}
//                     <div className="text-center my-3 sticky top-0 z-10">
//                         <div className="inline-block bg-white px-3 py-1 text-sm text-gray-500 rounded-full shadow-sm border">
//                             {date}
//                         </div>
//                     </div>

//                     {/* Messages for this date */}
//                     {messagesGroup.map(message => (
//                         <MessageItem
//                             key={message.id}
//                             message={message}
//                             canEdit={message.userId === user?.data?.id}
//                             canDelete={message.userId === user?.data?.id}
//                         />
//                     ))}
//                 </div>
//             ))}

//             {/* Empty state when no messages */}
//             {Object.keys(groupedMessages).length === 0 && (
//                 <div className="flex flex-grow items-center justify-center text-gray-500">
//                     No messages yet
//                 </div>
//             )}
//         </div>
//     );
// };

// export default MessageList;