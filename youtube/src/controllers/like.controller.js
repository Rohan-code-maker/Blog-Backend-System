import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }
  //TODO: toggle like on video
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, "User not authenticated");
  }

  try {
    const findLike = await Like.findOne({
      $and: [{ video: videoId }, { likedBy: userId }],
    });
  
    if (!findLike) {
      const liked = await Like.create({
        video: videoId,
        likedBy: userId,
      });
      if (!liked) {
        throw new ApiError(500, "Failed to like video");
      }
  
      return res.status(200).json(new ApiResponse(200, liked, "Liked Video"));
    } else {
      const unliked = await Like.findByIdAndDelete(findLike?._id);
      if (!unliked) {
        throw new ApiError(500, "Failed to unlike video");
      }
  
      return res.status(200).json(new ApiResponse(200, unliked, "Unliked Video"));
    }
  } catch (error) {
    throw new ApiError(500, "Something went wrong")
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if(!commentId){
    throw new ApiError(400,"Comment Id is required")
  }
  //TODO: toggle like on comment
  const userId = req.user?._id
  if(!userId){
    throw new ApiError(400,"User is not authenticated")
  }

  const comment = await Like.findOne({
    $and:[
        {comment: commentId, likedBy:userId},
    ]
  })

  if(!comment){
    const commentLiked = await Like.create({
        comment: commentId,
        likedBy: userId
    })
    if(!commentLiked){
        throw new ApiError(500,"Failed to like comment")
    }

    return res
    .status(200)
    .json(200,commentLiked,"Comment liked successfully")
  }else{
    const unlikeComment = await Like.findByIdAndDelete(comment?._id)
    if(!unlikeComment){
        throw new ApiError(500,"Failed to unlike comment")
    }

    return res  
    .status(200)
    .json(200,unlikeComment,"Unlike comment successfully")
  }

});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if(!tweetId){
    throw new ApiError(401,"Tweet id is required")
  }
  //TODO: toggle like on tweet
  const userId = req.user?._id
  if(!userId){
    throw new ApiError(401,"User is not authenticated")
  }

  const tweet = await Like.findOne({
    $and:[
        {tweet:tweetId},
        {likedBy:userId}
    ]
  })

  if(!tweet){
    const likeTweet = await Like.create({
        tweet:tweetId,
        likedBy:userId
    })

    if(!likeTweet){
        throw new ApiError(500,"Unable to like the tweet")
    }

    return res
    .status(200)
    .json(200,likeTweet,"Liked tweet successfully")
  }else{
    const unlikeTweet = await Like.findByIdAndDelete(tweet._id)
    if(!unlikeTweet){
        throw new ApiError(500,"Unable to unlike the tweet")
    }

    return res
    .status(200)
    .json(200,unlikeTweet,"Unliked tweet successfully")
  }

});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, "User not authenticated");
  }

  const likedVideos = await Like.aggregate([
    {
        $match: {
            likedBy: new mongoose.Types.ObjectId(userId),
            video:{$exists: true, $ne:null}
        }
    },
    {
        $lookup: {
            from: "videos",
            localField: "video",
            foreignField: "_id",
            as: "videoData",
            pipeline:[
                {
                    $lookup:{
                        from: "users",
                        localField:"owner",
                        foreignField: "_id",
                        as:"owner",
                        pipeline:[
                            {
                                $project:{
                                    fullname:1,
                                    username:1,
                                    avatar:1
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields:{
                        owner:{
                            $first:"$owner"
                        }
                    }
                },
                {
                    $project:{
                        videoFile:1,
                        thumbnail:1,
                        title:1,
                        duration:1,
                        description:1,
                        owner:1
                    }
                }
            ]
        }
    },
    {
        $unwind: "$videoData"
    },
    {
        $project:{
            video:1,
            likedBy:1
        }
    }
  ])

  return res.status(200)
 .json(new ApiResponse(200, likedVideos, "Fetching Liked Videos Successfully"))
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };