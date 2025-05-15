import { Server as SocketIOServer, Socket } from "socket.io";

const onlineUsers = new Map<string, string>()

export const socketHandler = (io: SocketIOServer) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    
    socket.on("userConnected", (userId: string) => {
      onlineUsers.set(userId, socket.id);

      
      io.emit("userOnlineStatus", { userId, isOnline: true });
    });

    socket.on("joinRoom", (roomId: string) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });
    socket.on('startTyping', ({ roomId, userId }) => {
      console.log(`${userId} started typing in room ${roomId}`);
      socket.to(roomId).emit('userTyping', { userId });
    });
    
    socket.on('stopTyping', ({ roomId, userId }) => {
      console.log(`${userId} stopped typing in room ${roomId}`);
      socket.to(roomId).emit('userStopTyping', { userId });
    });
    
    socket.on("disconnect", () => {
      const userId = [...onlineUsers.entries()]
        .find(([_, id]) => id === socket.id)?.[0];

      if (userId) {
        onlineUsers.delete(userId);
        io.emit("userOnlineStatus", { userId, isOnline: false });
      }

      console.log("User disconnected:", socket.id);
    });
  });
};

let io: SocketIOServer;
export const setIO = (server: SocketIOServer) => {
  io = server;
};

export const getIO = () => io;
