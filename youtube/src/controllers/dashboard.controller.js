import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = new mongoose.Types.ObjectId(req.user?._id)
    if(!userId)
    {
        throw new ApiError(401, "User not authenticated")
    }

    const videoCount = await Video.aggregate([
        {
            $match:{
                owner:userId
            }
        },
        {
            $group:{
                _id:"$views",
                totalViews:{
                    $sum:"$views"
                },
                totalVideos:{
                    $sum:1
                }
            }
        },
        {
            $project:{
                _id:0,
                totalViews:1,
                totalVideos:1
            }
        }
    ])

    if(!videoCount)
    {
        throw new ApiError(500, "Failed to fetch video count")
    }

    const subscriberCount = await Subscription.aggregate([
        {
            $match:{
                channel:userId
            }
        },
        {
            $group:{
                _id:null,
                totalSubscribers:{
                    $sum:1
                }
            }
        },
        {
            $project:{
                _id:0,
                totalSubscribers:1
            }
        }
    ])

    if(!subscriberCount)
    {
        throw new ApiError(500, "Failed to fetch subscriber count")
    }

    const likeCount = await Like.aggregate([
        {
            $lookup:{
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoInfo"
            }
        },
        {
            $lookup:{
                from:"tweets",
                localField: "tweet",
                foreignField: "_id",
                as: "tweetInfo"
            }
        },
        {
            $lookup:{
                from: "comments",
                localField: "comment",
                foreignField: "_id",
                as: "commentInfo"
            }
        },
        {
            $match:{
                $or:[
                    {"videoInfo.owner":userId},
                    {"tweetInfo.owner":userId},
                    {"commentInfo.owner":userId},
                ]
            }
        },
        {
            $group:{
                _id:null,
                totalLikes:{
                    $sum:1
                }
            }
        },
        {
            $project:{
                _id:0,
                totalLikes:1
            }
        }
    ])

    if(!likeCount){
        throw new ApiError(500, "Failed to fetch likes count")
    }

    const info = {
        views:videoCount[0].totalViews,
        videos:videoCount[0].totalVideos,
        subscribers:subscriberCount[0].totalSubscribers,
        likes:likeCount[0].totalLikes
    }

    return res
    .status(200)
    .json(new ApiResponse(200, info, "Channel stats fetched successfully"))

})

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