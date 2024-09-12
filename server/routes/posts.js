import express from "express";
import { getFeedPosts, getUserPosts, likePost } from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
//What Happens Behind the Scenes
//When you define a route like router.get("/", ...) in postRoutes, Express doesn't automatically know where this route should be accessed from.
//By using app.use("/posts", postRoutes);, you tell Express that all routes in postRoutes should be accessible under /posts.
//Result: If you have a route defined as router.get("/", ...) in postRoutes, it will now be accessible as GET /posts/.


/* READ */
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId/posts", verifyToken, getUserPosts);

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);

export default router;