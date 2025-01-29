import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video id is not valid");
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

      return res
        .status(200)
        .json(new ApiResponse(200, unliked, "Unliked Video"));
    }
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong"); 
  }
});

const getVideoLikeStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video ID is not valid");
  }

  const userId = req.user?._id; // Get the authenticated user's ID
  if (!userId) {
    throw new ApiError(400, "User not authenticated");
  }

  try {
    // Check if a like exists for the video and user
    const like = await Like.findOne({
      video: videoId,
      likedBy: userId,
    });

    // Respond with the like status
    const isLiked = !!like; // Convert to boolean (true if liked, false otherwise)
    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked }, "Fetched like status successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong");
  }
});

const videoLikeCount = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  
  // Validate if the videoId is valid
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video ID is not valid");
  }

  try {
    // Count the number of likes for the video
    const result = await Like.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $count: "likeCount", // This will count the number of documents
      },
    ]);

    // If no likes are found
    if (result.length === 0) {
      return res
       .status(200)
       .json(new ApiResponse(200, { likeCount: 0 }, "No likes found for the video"));
    }

    // Return the like count as a simple number (not in an array)
    const likeCount = result[0].likeCount;
    return res.status(200).json(new ApiResponse(200, { likeCount }, "Fetched like count successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong");
  }
});


const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Comment Id is required");
  }
  //TODO: toggle like on comment
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, "User is not authenticated");
  }

  const comment = await Like.findOne({
    $and: [{ comment: commentId, likedBy: userId }],
  });

  if (!comment) {
    const commentLiked = await Like.create({
      comment: commentId,
      likedBy: userId,
    });
    if (!commentLiked) {
      throw new ApiError(500, "Failed to like comment");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, commentLiked, "Comment liked successfully"));
  } else {
    const unlikeComment = await Like.findByIdAndDelete(comment?._id);
    if (!unlikeComment) {
      throw new ApiError(500, "Failed to unlike comment");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, unlikeComment, "Unlike comment successfully"));
  }
});

const getCommentLikeStatus = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Comment ID is not valid");
  }

  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, "User not authenticated");
  }

  try {
    // Check if a like exists for the video and user
    const like = await Like.findOne({
      comment: commentId,
      likedBy: userId,
    });

    // Respond with the like status
    const isLiked = !!like; // Convert to boolean (true if liked, false otherwise)
    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked }, "Fetched like status successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong");
  }
});

const commentLikeCount = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Comment ID is not valid");
  }

  try {
    // Count the number of likes for the video
    const result = await Like.aggregate([
      {
        $match: {
          comment: new mongoose.Types.ObjectId(commentId),
        },
      },
      {
        $count: "likeCount", // This will count the number of documents
      },
    ]);

    if(!result){
      throw new ApiError(500, "Failed to fetch like count for comments");
    }

    // If no likes are found
    if (result.length === 0) {
      return res
       .status(200)
       .json(new ApiResponse(200, { likeCount: 0 }, "No likes found for the Comments"));
    }

    // Return the like count as a simple number (not in an array)
    const likeCount = result[0].likeCount;
    return res.status(200).json(new ApiResponse(200, { likeCount }, "Fetched like count successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong");
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(401, "Tweet id is required");
  }
  //TODO: toggle like on tweet
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "User is not authenticated");
  }

  const tweet = await Like.findOne({
    $and: [{ tweet: tweetId }, { likedBy: userId }],
  });

  if (!tweet) {
    const likeTweet = await Like.create({
      tweet: tweetId,
      likedBy: userId,
    });

    if (!likeTweet) {
      throw new ApiError(500, "Unable to like the tweet");
    }

    return res.status(200).json(200, likeTweet, "Liked tweet successfully");
  } else {
    const unlikeTweet = await Like.findByIdAndDelete(tweet._id);
    if (!unlikeTweet) {
      throw new ApiError(500, "Unable to unlike the tweet");
    }

    return res.status(200).json(new ApiResponse(200, unlikeTweet, "Unliked tweet successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  // Check if the user is authenticated
  if (!userId) {
    throw new ApiError(400, "User not authenticated");
  }

  try {
    const likedVideos = await Like.aggregate([
      // Match videos liked by the user
      {
        $match: {
          likedBy: new mongoose.Types.ObjectId(userId),
          video: { $exists: true, $ne: null },
        },
      },
      // Lookup video details
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "videoData",
          pipeline: [
            // Lookup owner details for the video
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                  {
                    $project: {
                      fullname: 1,
                      username: 1,
                      avatar: 1,
                    },
                  },
                ],
              },
            },
            // Flatten owner details
            {
              $addFields: {
                owner: { $first: "$owner" },
              },
            },
            // Project required fields
            {
              $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                duration: 1,
                description: 1,
                owner: 1,
              },
            },
          ],
        },
      },
      // Unwind videoData to flatten the array
      {
        $unwind: "$videoData",
      },
      // Project required fields for the final output
      {
        $project: {
          _id: 0, // Hide the aggregation ID
          videoId: "$videoData._id",
          title: "$videoData.title",
          description: "$videoData.description",
          thumbnail: "$videoData.thumbnail",
          videoFile: "$videoData.videoFile",
          duration: "$videoData.duration",
          owner: "$videoData.owner",
        },
      },
    ]);

    // Respond with the liked videos
    return res
      .status(200)
      .json(
        new ApiResponse(200, likedVideos, "Fetching Liked Videos Successfully")
      );
  } catch (error) {
    console.error("Error fetching liked videos:", error);
    throw new ApiError(500, "An error occurred while fetching liked videos.");
  }
});


export { toggleCommentLike,getCommentLikeStatus,getVideoLikeStatus,videoLikeCount,commentLikeCount, toggleTweetLike, toggleVideoLike, getLikedVideos };
