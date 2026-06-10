class WebSocketService {
  constructor() {
    this.socket = null;
    this.onMessageCallback = null;
  }

  connect(examId, role, userId) {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const protocol = API_URL.startsWith('https') ? 'wss' : 'ws';
    const host = API_URL.replace(/^https?:\/\//, '');
    this.socket = new WebSocket(`${protocol}://${host}/ws/exam/${examId}/${role}/${userId}`);

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