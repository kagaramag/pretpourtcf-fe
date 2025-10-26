import { io, Socket } from "socket.io-client";
import { config } from "@/config";

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Initialize socket connection with authentication token
   */
  connect(token: string): Socket {
    if (this.socket?.connected) {
      console.log("[SOCKET] Already connected");
      return this.socket;
    }

    console.log("[SOCKET] Connecting to:", config.socketUrl);

    this.socket = io(config.socketUrl, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();

    return this.socket;
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("[SOCKET] Connected successfully, ID:", this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[SOCKET] Disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("[SOCKET] Connection error:", error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("[SOCKET] Max reconnection attempts reached");
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("[SOCKET] Reconnected after", attemptNumber, "attempts");
      this.reconnectAttempts = 0;
    });

    this.socket.on("reconnect_failed", () => {
      console.error("[SOCKET] Reconnection failed");
    });
  }

  /**
   * Disconnect from socket server
   */
  disconnect() {
    if (this.socket) {
      console.log("[SOCKET] Disconnecting...");
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Subscribe to an event
   */
  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  /**
   * Emit an event
   */
  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  /**
   * Join a room
   */
  joinRoom(roomId: string) {
    console.log("[SOCKET] Joining room:", roomId);
    this.socket?.emit("join-room", roomId);
  }

  /**
   * Leave a room
   */
  leaveRoom(roomId: string) {
    console.log("[SOCKET] Leaving room:", roomId);
    this.socket?.emit("leave-room", roomId);
  }
}

export const socketService = new SocketService();
