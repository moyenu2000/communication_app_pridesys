import axios from "axios";

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


  async handleMessage(data, setMessages, selectedChat) {
    switch (data.type) {
      case "MESSAGE_CREATED":
        console.log("New message:", data.body);
        console.log("Selected chat:", selectedChat);

        if (!selectedChat) {
          console.log("No chat selected. Ignoring message.");
          return;
        }
  
        try {
          const response = await axios.get(`https://traq.duckdns.org/api/v3/messages/${data.body.id}`, {
            withCredentials: true,
          });
  
          const fullMessage = response.data;
          console.log("Full message:", fullMessage);
          console.log("Selected chat ID:", selectedChat.id);
  
          if (fullMessage.channelId !== selectedChat.id) {
            console.log("Message does not belong to selected chat. Ignoring...");
            return;
          }
  
          // Update the messages state with the new message
          setMessages(prevMessages => {
            console.log("Updating messages with new message");
            return [fullMessage, ...prevMessages ];
          });
          // console.log
          
          console.log("Messages updated");
        } catch (error) {
          console.error("Error fetching full message:", error);
        }
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
