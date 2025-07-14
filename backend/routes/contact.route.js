import express from "express";
import User from "../models/user.model.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { searchUsers, getContactUsers, deleteContactUser} from "../controllers/contact.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getContactUsers);
router.delete("/delete-contact/:id", protectRoute, deleteContactUser);
router.get("/search", protectRoute, searchUsers);
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("userName profilePic");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});


export default router;