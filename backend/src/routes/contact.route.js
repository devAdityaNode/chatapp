import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { searchUsers, getContactUsers, deleteContactUser} from "../controllers/contact.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getContactUsers);
router.delete("/delete-contact/:id", protectRoute, deleteContactUser);
router.get("/search", protectRoute, searchUsers);

export default router;