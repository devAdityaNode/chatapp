import User from "../models/user.model.js";
import Message from "../models/message.model.js";

export const getContactUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("contactUsers", "userName profilePic");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const contactsWithExtras = await Promise.all(
      user.contactUsers.map(async (contact) => {
        const latest = await Message.findOne({
          $or: [
            { senderId: req.user._id, receiverId: contact._id },
            { senderId: contact._id, receiverId: req.user._id },
          ],
          deletedBy: { $ne: req.user._id },
        }).sort({ createdAt: -1 });

        let latestMessageText = "";
        let latestMessageType = "";

        if (latest) {
          if (latest.isDeleted) {
            latestMessageText = "__deleted__";
            latestMessageType = "text";
          } else if (latest.image) {
            latestMessageText = "";
            latestMessageType = "image";
          } else {
            latestMessageText = latest.text;
            latestMessageType = "text";
          }
        }

        const unreadCount = await Message.countDocuments({
          senderId: contact._id,
          receiverId: req.user._id,
          isSeen: false,
        });

        return {
          _id: contact._id,
          userName: contact.userName,
          profilePic: contact.profilePic,
          latestMessage: latestMessageText,
          latestMessageType,
          latestMessageTime: latest?.createdAt || null,
          unreadCount,
          latestMessageSenderId: latest?.senderId.toString(),
          isDelivered: latest?.isDelivered ?? false,
          isSeen: latest?.isSeen ?? false,
        };
      })
    );

    contactsWithExtras.sort((a, b) => {
      const timeA = new Date(a.latestMessageTime || 0);
      const timeB = new Date(b.latestMessageTime || 0);
      return timeB - timeA;
    });

    res.status(200).json({ contacts: contactsWithExtras });
  } catch (error) {
    console.log("Error in getContactUsers:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteContactUser = async (req, res) => {
  try {
    const { id: contactUserId } = req.params;
    const myId = req.user._id;

    await User.findByIdAndUpdate(myId, {
      $pull: { contactUsers: contactUserId },
    });

    await Message.deleteMessagesForUser(myId, contactUserId);

    res.status(200).json({ message: "Contact user deleted and chat cleared" });
  } catch (error) {
    console.log("Error in getContactUsers:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const searchUsers = async (req, res) => {
  const { query } = req.query;
  const currentUserId = req.user._id;

  try {
    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }
    if (!query || query.length < 3) return res.json([]);

    const users = await User.find({
      userName: { $regex: query, $options: "i" },
      _id: { $ne: currentUserId },
    }).select("_id userName profilePic");

    res.status(200).json(users);
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
