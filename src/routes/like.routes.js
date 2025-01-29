import { Router } from 'express';
import {
    getLikedVideos,
    getVideoLikeStatus,
    videoLikeCount,
    toggleCommentLike,
    getCommentLikeStatus,
    commentLikeCount,
    toggleVideoLike,
    toggleTweetLike,
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLike).get(getVideoLikeStatus);
router.route("/toggle/c/:commentId").post(toggleCommentLike).get(getCommentLikeStatus);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);
router.route("/count/:videoId").get(videoLikeCount);
router.route("/like-count/:commentId").get(commentLikeCount);

export default router