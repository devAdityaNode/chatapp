import Message from "../models/message.model.js";
import User from "../models/user.model.js";

import cloudinary from "../lib/cloudinary.js";
// import { getReceiverSocketId, io } from "../lib/socket.js";

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

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
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

        // const receiverSocketId = getReceiverSocketId(receiverId);
        // if (receiverSocketId) {
        //   io.to(receiverSocketId).emit("newMessage", newMessage);
        // }

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
      if (type === "everyone") {
        if (message.senderId.toString() !== userId.toString()) {
          return res.status(403).json({ message: "Only sender can delete for everyone" });
        }

        message.text = "";
        message.image = "";
        message.isDeleted = true;
        await message.save();

      } else if (type === "me") {
        if (!message.deletedBy.includes(userId)) {
          message.deletedBy.push(userId);
          await message.save();
        }

      } else {
        return res.status(400).json({ message: "Invalid delete type" });
      }
    }

    res.status(200).json({ message: `Message(s) deleted for ${type === "everyone" ? "everyone" : "you"}` });

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

    await Message.deleteMessagesForUser(myId, contactUserId);

    res.status(200).json({ message: "Chat cleared successfully" });
  } catch (error) {
    console.error("Error in deleteMessage:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}