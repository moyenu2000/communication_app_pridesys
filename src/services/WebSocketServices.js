import axios from "axios";
import { fetchUser } from "./userServices";

class WebSocketService {
  constructor() {
    this.socket = null;
    this.subscribedChannel = null;
    this.wsUrl = "wss://traq.duckdns.org/api/v3/ws";
    this.reconnectInterval = 5000;
    this.retryCount = 0;
  }

  connect() {
    if (this.socket) {
      console.log("WebSocket already connected.");
      return;
    }

    console.log("Connecting to WebSocket...");
    this.socket = new WebSocket(this.wsUrl);

    this.socket.onopen = () => {
      console.log("WebSocket connected.");
      this.retryCount = 0;
    };



    this.socket.onclose = () => {
      console.log("WebSocket disconnected.");
      this.retryConnection();
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };
  }


  async handleMessage(data, setMessages, selectedChat, setTypingUsers, setChannels, setUsers, setActiveUsers, setCurrentChannelViewers) {
    switch (data.type) {
      case "MESSAGE_CREATED":
        // console.log("New message:", data.body);
        // console.log("Selected chat:", selectedChat);

        if (!selectedChat) {
          console.log("No chat selected. Ignoring message.");
          return;
        }

        try {
          const response = await axios.get(`https://traq.duckdns.org/api/v3/messages/${data.body.id}`, {
            withCredentials: true,
          });

          const fullMessage = response.data;
          // console.log("Full message:", fullMessage);
          // console.log("Selected chat ID:", selectedChat.id);

          if (fullMessage.channelId !== selectedChat.id) {
            // console.log("Message does not belong to selected chat. Ignoring...");
            return;
          }

          // Update the messages state with the new message
          setMessages(prevMessages => {
            // console.log("Updating messages with new message");
            return [fullMessage, ...prevMessages];
          });
          // console.log

          // console.log("Messages updated");/
        } catch (error) {
          console.error("Error fetching full message:", error);
        }
        break;




      case "CHANNEL_VIEWERS_CHANGED":
        if (selectedChat && data.body.id === selectedChat.id) {
          // Extract users currently in 'editing' state, excluding the logged-in user

          setCurrentChannelViewers(data.body.viewers);
          const editingUsers = data.body.viewers
            .filter(viewer => viewer.state === 'editing')  // Make sure logged-in user is excluded
            .map(viewer => viewer.userId);

          try {
            // Use Promise.all to fetch all user information concurrently
            const usersData = await Promise.all(
              editingUsers.map(async (userId) => {
                const response = await fetchUser(userId); // Assuming fetchUser returns user data
                return response.data;
              })
            );


            // Update the state with the users' data
            console.log("Editing users:", usersData);
            setTypingUsers(usersData);
          } catch (error) {
            console.error("Error fetching users' information:", error);
          }
        }
        break;

      case "CHANNEL_CREATED":
        try {
          const response = await axios.get(`https://traq.duckdns.org/api/v3/channels/${data.body.id}`, {
            withCredentials: true,
          });

          const newChannel = response.data;

          setChannels(prevChannels => [newChannel, ...prevChannels]);
          console.log("New channel created:", newChannel);
        } catch (error) {
          console.error("Error fetching new channel information:", error);
        }
        break;

        // USER_JOINED
      case "USER_JOINED":
        try {
          const response = await axios.get(`https://traq.duckdns.org/api/v3/users/${data.body.id}`, {
            withCredentials: true,
          });

          const newUser = response.data;

          setUsers(prevUsers => [newUser, ...prevUsers]);
          console.log("New user joined:", newUser);
        } catch (error) {
          console.error("Error fetching new user information:", error);
        }
        break;


        // MESSAGE_STAMPED
        // MESSAGE_UPDATED
        // MESSAGE_DELETED

       // MESSAGE_STAMPED
    case "MESSAGE_STAMPED":
      if (!selectedChat) {
        console.log("No chat selected. Ignoring message.");
        return;
      }

      try {
        const response = await axios.get(`https://traq.duckdns.org/api/v3/messages/${data.body.id}`, {
          withCredentials: true,
        });

        const fullMessage = response.data;

        if (fullMessage.channelId !== selectedChat.id) {
          return;
        }

        // Update the message stamps
        setMessages(prevMessages => {
          return prevMessages.map(message => {
            if (message.id === fullMessage.id) {
              message.stamps = fullMessage.stamps; // Update the stamps
            }
            return message;
          });
        });
      } catch (error) {
        console.error("Error fetching full message:", error);
      }
      break;

    // MESSAGE_UPDATED
    case "MESSAGE_UPDATED":
      if (!selectedChat) {
        console.log("No chat selected. Ignoring message.");
        return;
      }

      try {
        const response = await axios.get(`https://traq.duckdns.org/api/v3/messages/${data.body.id}`, {
          withCredentials: true,
        });

        const fullMessage = response.data;

        if (fullMessage.channelId !== selectedChat.id) {
          return;
        }

        // Update the message content
        setMessages(prevMessages => {
          return prevMessages.map(message => {
            if (message.id === fullMessage.id) {
              return fullMessage; // Replace the old message with the updated one
            }
            return message;
          });
        });
      } catch (error) {
        console.error("Error fetching full message:", error);
      }
      break;

    // MESSAGE_DELETED
    case "MESSAGE_DELETED":
      if (!selectedChat) {
        console.log("No chat selected. Ignoring message.");
        return;
      }

      // Remove the deleted message from the message list
      setMessages(prevMessages => {
        return prevMessages.filter(message => message.id !== data.body.id); // Remove message by ID
      });
      console.log(`Message with ID ${data.body.id} was deleted.`);
      break;


      // USER_ONLINE
      case "USER_ONLINE":
        try {
          const response = await axios.get(`https://traq.duckdns.org/api/v3/users/${data.body.id}`, {
            withCredentials: true,
          });
          const onlineUser = response.data;
          
          setActiveUsers(prevActiveUsers => {
            // Check if the user is already in the active users list
            const userExists = prevActiveUsers.some(user => user.id === onlineUser.id);
            if (!userExists) {
              console.log(`User ${onlineUser.name} is now online.`);
              return [...prevActiveUsers, onlineUser];
            }
            return prevActiveUsers;
          });
        } catch (error) {
          console.error("Error fetching online user information:", error);
        }
        break;

      case "USER_OFFLINE":
        setActiveUsers(prevActiveUsers => {
          console.log(`User with ID ${data.body.id} is now offline.`);
          return prevActiveUsers.filter(user => user.id !== data.body.id);
        });
        break;
      






      default:
        console.log("Unhandled data type:", data.type);
        break;



    }
  }

  // Send a message to the WebSocket server
  send(command) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(command);
    } else {
      console.log("WebSocket is not open. Cannot send message.");
    }
  }

  // Retry connection if WebSocket is disconnected
  retryConnection() {
    if (this.retryCount < 5) {
      console.log(`Reconnecting in ${this.reconnectInterval / 1000} seconds...`);
      setTimeout(() => {
        this.connect();
        this.retryCount++;
      }, this.reconnectInterval);
    } else {
      console.log("Max retries reached. Could not reconnect.");
    }
  }

  // Close WebSocket connection
  close() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

export default new WebSocketService();
