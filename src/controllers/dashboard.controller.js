import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = new mongoose.Types.ObjectId(req.user?._id);
    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    // Total views and videos count
    const videoCountResult = await Video.aggregate([
        {
            $match: {
                owner: userId
            }
        },
        {
            $group: {
                _id: null,
                totalViews: {
                    $sum: "$views"
                },
                totalVideos: {
                    $sum: 1
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalViews: { $ifNull: ["$totalViews", 0] },
                totalVideos: { $ifNull: ["$totalVideos", 0] }
            }
        }
    ]);

    const videoCount = videoCountResult[0] || { totalViews: 0, totalVideos: 0 };

    // Total subscribers count
    const subscriberCountResult = await Subscription.aggregate([
        {
            $match: {
                channel: userId
            }
        },
        {
            $group: {
                _id: null,
                totalSubscribers: {
                    $sum: 1
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalSubscribers: { $ifNull: ["$totalSubscribers", 0] }
            }
        }
    ]);

    const subscriberCount = subscriberCountResult[0] || { totalSubscribers: 0 };

    // Total likes count
    const likeCountResult = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoInfo"
            }
        },
        {
            $lookup: {
                from: "tweets",
                localField: "tweet",
                foreignField: "_id",
                as: "tweetInfo"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "comment",
                foreignField: "_id",
                as: "commentInfo"
            }
        },
        {
            $match: {
                $or: [
                    { "videoInfo.owner": userId },
                    { "tweetInfo.owner": userId },
                    { "commentInfo.owner": userId }
                ]
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: {
                    $sum: 1
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalLikes: { $ifNull: ["$totalLikes", 0] }
            }
        }
    ]);

    const likeCount = likeCountResult[0] || { totalLikes: 0 };

    // Prepare the response data
    const info = {
        views: videoCount.totalViews,
        videos: videoCount.totalVideos,
        subscribers: subscriberCount.totalSubscribers,
        likes: likeCount.totalLikes
    };

    return res
        .status(200)
        .json(new ApiResponse(200, info, "Channel stats fetched successfully"));
});


const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userID = new mongoose.Types.ObjectId(req.user?._id)
    if(!userID){
        throw new ApiError(401, "Unauthorized User")
    }

    const videos = await Video.find({owner:userID})

    if(!videos){
        throw new ApiError(404, "No videos found")
    }

    return res
   .status(200)
   .json(new ApiResponse(200, videos, "Videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }