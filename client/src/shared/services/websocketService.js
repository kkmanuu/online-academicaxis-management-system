class WebSocketService {
  constructor() {
    this.socket = null;
    this.onMessageCallback = null;
  }

  connect(examId, role, userId) {
    this.socket = new WebSocket(`ws://localhost:5000/ws/exam/${examId}/${role}/${userId}`);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.socket.onmessage = (event) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(JSON.parse(event.data));
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  setOnMessageCallback(callback) {
    this.onMessageCallback = callback;
  }
}

export default new WebSocketService(); 