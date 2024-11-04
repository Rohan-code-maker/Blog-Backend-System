import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    if(!content){
        throw new ApiError(400, "Content is required")
    }
    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }

    const addTweet = await Tweet.create({
        content,
        owner: userId
    })

    if(!addTweet){
        throw new ApiError(500, "Failed to create tweet")
    }

    return res
   .status(201)
   .json(new ApiResponse(200,addTweet,"Tweet created successfully"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(400, "User not authenticated")
    }
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet ID")
    }

    const userTweets = await Tweet.find({ owner: userId }).populate("content")
    if(!userTweets){
        throw new ApiError(500, "Failed to get user tweets")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,userTweets,"User's tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { content } = req.body
    if(!content){
        throw new ApiError(400, "Content is required")
    }

    const { tweetId } = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet")
    }

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }
    if(!((tweet?.owner).equals(req.user?._id))){
        throw new ApiError(403, "You cannot edit this tweet")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content,
            },
        },
        {new: true}
    )
    if(!updatedTweet){
        throw new ApiError(404, "Tweet not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet,"Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(403, "Tweet ID is not valid")
    }
    const tweet = await Tweet.findById(tweetId)
    if(!(tweet?.owner).equals(req,user?._id)){
        throw new ApiError(403, "You cannot delete the tweet")
    }
    const deletedTweet = await Tweet.findByIdAndDelete(tweet?._id)
    if(!deletedTweet){
        throw new ApiError(500,"Unable to delete the tweet")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}