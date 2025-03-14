// import React, { useState, useEffect } from 'react';
// import { useWebSocket } from '../../contexts/WebSocketContext';
// import { useChatState } from '../../contexts/ChatStateContext';

// const MessageInput = () => {
//     const { changeViewStat } = useWebSocket();
//     const [inputValue, setInputValue] = useState("");
//     const { selectedChat } = useChatState();
//     const [viewState, setViewState] = useState('monitoring');

//     const handleInputChange = (e) => {
//         setInputValue(e.target.value);
//     };

//     useEffect(() => {
//         const typingTimeout = setTimeout(() => {
//             if (selectedChat)
//             {
//                 changeViewStat(selectedChat.id, 'monitoring');
//                 setViewState('monitoring');
//             }
//         }, 3000); 

//         if (inputValue && selectedChat && viewState !== 'editing') {
//             changeViewStat(selectedChat.id, 'editing');
//             setViewState('editing');
//         }

//         return () => clearTimeout(typingTimeout);

//     }, [inputValue, selectedChat, changeViewStat]);

//     return (
//         <div>
//             <span>{selectedChat ? selectedChat.name : 'Select a channel'}</span>
//             <input
//                 type="text"
//                 value={inputValue}
//                 onChange={handleInputChange}
//                 placeholder="Type a message..."
//             />
//         </div>
//     );
// };

// export default MessageInput;


import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useChatState } from '../../contexts/ChatStateContext';
import { postMessage } from '../../services/channelServices';

const MessageInput = () => {
    const { changeViewStat } = useWebSocket();
    const [inputValue, setInputValue] = useState("");
    const { selectedChat } = useChatState();
    const [viewState, setViewState] = useState('monitoring');

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = async () => {
        if (selectedChat && inputValue.trim()) {
            try {
                const response = await postMessage(selectedChat.id, inputValue); // Call the postMessage function
                console.log('Message sent:', response);
                setInputValue(""); // Clear input field after sending
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    useEffect(() => {
        const typingTimeout = setTimeout(() => {
            if (selectedChat) {
                changeViewStat(selectedChat.id, 'monitoring');
                setViewState('monitoring');
            }
        }, 3000);

        if (inputValue && selectedChat && viewState !== 'editing') {
            changeViewStat(selectedChat.id, 'editing');
            setViewState('editing');
        }

        return () => clearTimeout(typingTimeout);
    }, [inputValue, selectedChat, changeViewStat]);

    return (
        <div>
            <span>{selectedChat ? selectedChat.name : 'Select a channel'}</span>
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type a message..."
            />
            <button onClick={handleSubmit}>Send</button>
        </div>
    );
};

export default MessageInput;
