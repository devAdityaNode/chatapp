import User from "../models/user.model.js";

export const getContactUsers = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("contactUsers", "userName profilePic");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ contacts: user.contactUsers });
    } catch (error) {
        console.log("Error in getContactUsers:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteContactUser = async (req, res) => {
    try {
        const { id: contactUser } = req.params;

        await User.findByIdAndUpdate(req.user._id, {
            $pull: { contactUsers: contactUser },
        });

        res.status(200).json({ message: "Contact user has been deleted" });
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

    const users = await User.find({
      userName: { $regex: query, $options: "i" },
      _id: { $ne: currentUserId },
    }).select("_id userName email profilePic");

    res.status(200).json(users);
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
