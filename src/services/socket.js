import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isManuallyDisconnected = false;
  }

  connect(
    serverUrl = 'https://nexusserver-laum.onrender.com',
    onConnected = null
  ) {
    // if (!this.socket || this.isManuallyDisconnected) {
    //   this.socket = io(serverUrl, {
    //     withCredentials: true,
    //     autoConnect: true,
    //     transports: ['websocket'],
    //   });

    //   this.isManuallyDisconnected = false;

    //   this.socket.on('connect', () => {
    //     this.isConnected = true;
    //     console.log('✅ Socket connected:', this.socket.id);
    //     if (onConnected) onConnected();
    //   });

    //   this.socket.on('disconnect', (reason) => {
    //     console.warn('❌ Socket disconnected:', reason);
    //     if (!this.isManuallyDisconnected && reason !== 'io client disconnect') {
    //       console.log('🔁 Reconnecting...');
    //       setTimeout(() => this.connect(serverUrl), 3000);
    //     }
    //   });

    //   this.socket.on('connect_error', (err) => {
    //     console.error('⚠️ Socket error:', err.message);
    //   });
    // }

    // 🛡️ Prevent reconnection if already connected
    if (this.socket?.connected) {
      console.log('ℹ️ Socket already connected:', this.socket.id);
      if (onConnected) onConnected();
      return;
    }

    // 🔁 If socket exists but is not connected (e.g., reconnecting), do nothing
    if (this.socket && !this.isManuallyDisconnected) {
      // console.log('⏳ Socket is reconnecting...');
      return;
    }

    // ✅ Setup a new connection
    this.socket = io(serverUrl, {
      withCredentials: true,
      autoConnect: true,
      transports: ['websocket'],
    });

    this.isManuallyDisconnected = false;

    this.socket.on('connect', () => {
      this.isConnected = true;
      // console.log('✅ Socket connected:', this.socket.id);
      if (onConnected) onConnected();
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.warn('❌ Socket disconnected:', reason);
      if (!this.isManuallyDisconnected && reason !== 'io client disconnect') {
        // console.log('🔁 Reconnecting...');
        setTimeout(() => this.connect(serverUrl, onConnected), 3000);
      }
    });

    this.socket.on('connect_error', (err) => {
      console.error('⚠️ Socket error:', err.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.isManuallyDisconnected = true;
      this.socket.disconnect();
      this.socket = null;
      // console.log('🛑 Socket manually disconnected');
    }
  }

  emit(event, data = {}) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Emit skipped. Socket not connected:', event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.removeAllListeners(event);
      }
    }
  }

  // ✅ ADMIN
  joinAdminRoom(adminId) {
    if (!adminId) return console.warn('Admin ID required');
    this.emit('admin-join', { adminId });
  }

  // ✅ USER
  joinGeneralRoom(username) {
    if (!username) return console.warn('Username required');
    this.emit('user-join', { username });
  }

  // ✅ MESSAGING
  sendMessage({ room, sender, content, username, isAdmin }) {
    this.emit('send-chat-message', {
      room,
      sender,
      message: content,
      username,
      isAdmin,
    });
  }

  // ✅ LISTENERS
  onNewMessage(callback) {
    this.on('new-chat-message', callback);
  }

  offNewMessage(callback) {
    this.off('new-chat-message', callback);
  }

  onAdminMessage(callback) {
    this.on('admin-message', callback);
  }

  offAdminMessage(callback) {
    this.off('admin-message', callback);
  }

  onError(callback) {
    this.on('error', callback);
  }

  offError(callback) {
    this.off('error', callback);
  }
}

export default new SocketService();
