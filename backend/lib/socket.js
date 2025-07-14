import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

const userSocketMap = {};

const userActiveChatMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  
  if (userId) {
    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  socket.on("joinChat", ({ withUserId }) => {
    if (userId) {
      userActiveChatMap[userId] = withUserId;
    }
  });

  socket.on("leaveChat", () => {
    if (userId) {
      delete userActiveChatMap[userId];
    }
  });

  Message.updateMany(
    { receiverId: userId, isDelivered: false },
    { $set: { isDelivered: true } }
  ).then(async () => {
    const undeliveredMsgs = await Message.find({
      receiverId: userId,
      isDelivered: true,
      isSeen: false,
    });

    const notifyMap = {};
    undeliveredMsgs.forEach((msg) => {
      if (!notifyMap[msg.senderId]) {
        notifyMap[msg.senderId] = [];
      }
      notifyMap[msg.senderId].push(msg._id);
    });

    for (const senderId in notifyMap) {
      const socketId = getReceiverSocketId(senderId);
      if (socketId) {
        io.to(socketId).emit("messagesDelivered", {
          messageIds: notifyMap[senderId],
        });

        io.to(socketId).emit("sidebarUpdate", {
          senderId: userId,
          isDelivered: true,
        });
      }
    }
  });

  socket.on("messageSeen", async ({ senderId }) => {
    try {
      await Message.updateMany(
        { senderId, receiverId: userId, isSeen: false },
        { $set: { isSeen: true } }
      );

      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesSeen", { senderId: userId });
      }

      io.to(senderSocketId).emit("sidebarUpdate", {
        senderId: userId,
        isSeen: true,
      });
    } catch (err) {
      console.log("Error updating isSeen:", err.message);
    }
  });

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    delete userActiveChatMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server, userActiveChatMap, userSocketMap };