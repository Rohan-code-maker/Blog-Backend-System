import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getMyVideos,
    getVideoById,
    publishAVideo,
    viewsCount,
    togglePublishStatus,
    updateVideo,
    getUserVideos
} from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );
router.get('/my-video',getMyVideos);
router.get('/views/:videoId',viewsCount);

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
        
    ]), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

router.route("/user/:userId").get(getUserVideos);

export default router