import Message from "../models/message.model.js";
import User from "../models/user.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io, userActiveChatMap, userSocketMap } from "../lib/socket.js";

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    await Message.updateMany(
      {
        senderId: userToChatId,
        receiverId: myId,
        isSeen: false
      },
      { $set: { isSeen: true } }
    );

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      deletedBy: { $ne: myId }
    })
      .sort({ createdAt: 1 })
      .select("-__v");

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const senderSocketId = userSocketMap[senderId];

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const receiverSocketId = getReceiverSocketId(receiverId);

    const isReceiverInSenderChat =
      userActiveChatMap[receiverId] === String(senderId);

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      isDelivered: !!receiverSocketId,
      isSeen: isReceiverInSenderChat,
    });

    if (newMessage) {
      await User.findByIdAndUpdate(senderId, {
        $addToSet: { contactUsers: receiverId },
      });

      await User.findByIdAndUpdate(receiverId, {
        $addToSet: { contactUsers: senderId },
      });
    }

    await newMessage.save();

    if (senderSocketId) {
      io.to(senderSocketId).emit("sidebarUpdate", {
        senderId: receiverId,
        latestMessage: text || "Image",
        latestMessageType: image ? "image" : "text",
        latestMessageTime: newMessage.createdAt,
        unreadCount: 0,
        latestMessageSenderId: senderId,
        isDelivered: !!receiverSocketId,
        isSeen: isReceiverInSenderChat,
      });
    }

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);

      io.to(receiverSocketId).emit("sidebarUpdate", {
        senderId,
        latestMessage: text || "Image",
        latestMessageType: image ? "image" : "text",
        latestMessageTime: newMessage.createdAt,
        unreadCount: await Message.countDocuments({
          senderId,
          receiverId,
          isSeen: false,
        }),
        latestMessageSenderId: senderId,
        isDelivered: true,
        isSeen: false,
      });

      if (isReceiverInSenderChat) {
        io.to(senderId).emit("messagesSeen", { senderId: receiverId });
      }
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    let { id: messageIds } = req.params;
    const { type } = req.query;
    const userId = req.user._id;

    messageIds = messageIds.split(",");

    const messages = await Message.find({ _id: { $in: messageIds } });

    if (messages.length === 0) {
      return res.status(404).json({ message: "Message(s) not found" });
    }

    for (const message of messages) {
      const senderId = message.senderId.toString();
      const receiverId = message.receiverId.toString();

      if (type === "everyone") {
        if (senderId !== userId.toString()) {
          return res
            .status(403)
            .json({ message: "Only sender can delete for everyone" });
        }

        message.text = "";
        message.image = "";
        message.isDeleted = true;
        await message.save();

        // 🔄 Emit updated latest message to both users’ sidebars
        const [senderSocketId, receiverSocketId] = [
          getReceiverSocketId(senderId),
          getReceiverSocketId(receiverId),
        ];

        const updateSidebarForUser = async (ownerId, targetId, socketId) => {
          const latestVisible = await Message.findOne({
            $or: [
              { senderId: ownerId, receiverId: targetId },
              { senderId: targetId, receiverId: ownerId },
            ],
            $or: [
              { isDeleted: { $ne: true } },
              { isDeleted: true, deletedBy: { $ne: ownerId } },
            ],
            deletedBy: { $ne: ownerId },
          }).sort({ createdAt: -1 });

          const payload = {
            senderId: targetId,
            latestMessage: latestVisible?.isDeleted
              ? "__deleted__"
              : latestVisible?.image
                ? "📷 Photo"
                : latestVisible?.text || "",
            latestMessageType: latestVisible?.image ? "image" : "text",
            latestMessageTime: latestVisible?.createdAt || null,
            latestMessageSenderId: latestVisible?.senderId.toString() || null,
            isDelivered: latestVisible?.isDelivered ?? false,
            isSeen: latestVisible?.isSeen ?? false,
          };


          if (socketId) {
            io.to(socketId).emit("sidebarUpdate", payload);
          }
        };

        await updateSidebarForUser(senderId, receiverId, senderSocketId);
        await updateSidebarForUser(receiverId, senderId, receiverSocketId);
      }

      // Delete for me only
      else if (type === "me") {
        if (!message.deletedBy.includes(userId)) {
          message.deletedBy.push(userId);
          await message.save();
        }

        const mySocketId = getReceiverSocketId(userId.toString());

        const targetId =
          message.senderId.toString() === userId.toString()
            ? message.receiverId
            : message.senderId;

        const latestVisible = await Message.findOne({
          $or: [
            { senderId: userId, receiverId: targetId },
            { senderId: targetId, receiverId: userId },
          ],
          $or: [
            { isDeleted: { $ne: true } },
            { isDeleted: true, deletedBy: { $ne: userId } },
          ],
          deletedBy: { $ne: userId },
        }).sort({ createdAt: -1 });

        const payload = {
          senderId: targetId,
          latestMessage: latestVisible?.isDeleted
            ? "__deleted__"
            : latestVisible?.image
              ? "📷 Photo"
              : latestVisible?.text || "",
          latestMessageType: latestVisible?.image ? "image" : "text",
          latestMessageTime: latestVisible?.createdAt || null,
          latestMessageSenderId: latestVisible?.senderId.toString() || null,
          isDelivered: latestVisible?.isDelivered ?? false,
          isSeen: latestVisible?.isSeen ?? false,
        };


        if (mySocketId) {
          io.to(mySocketId).emit("sidebarUpdate", payload);
        }
      } else {
        return res.status(400).json({ message: "Invalid delete type" });
      }
    }

    res.status(200).json({
      message: `Message(s) deleted for ${type === "everyone" ? "everyone" : "you"}`,
    });
  } catch (error) {
    console.error("Error in deleteMessage:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const clearChat = async (req, res) => {
  try {
    const myId = req.user._id;
    const { contactUserId } = req.params;

    if (!contactUserId) {
      return res.status(400).json({ message: "contactUserId is required" });
    }

    // Clear chat for current user (soft delete)
    await Message.updateMany(
      {
        $or: [
          { senderId: myId, receiverId: contactUserId },
          { senderId: contactUserId, receiverId: myId },
        ],
      },
      {
        $addToSet: { deletedBy: myId },
      }
    );

    // No need to emit socket event since it's local only.
    // But if you want to clear sidebar preview locally:
    const socketId = getReceiverSocketId(myId);
    if (socketId) {
      io.to(socketId).emit("sidebarUpdate", {
        senderId: contactUserId,
        latestMessage: "",
        latestMessageType: "text",
        latestMessageTime: null,
        latestMessageSenderId: null,
        isDelivered: true,
        isSeen: true,
      });
    }

    res.status(200).json({ message: "Chat cleared successfully" });

  } catch (error) {
    console.error("Error in clearChat:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
