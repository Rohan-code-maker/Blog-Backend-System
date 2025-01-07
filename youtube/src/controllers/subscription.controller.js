import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, "User not authenticated");
  }

  if (userId.equals(channelId)) {
    throw new ApiError(400, "Cannot subscribe to your own channel");
  }

  try {
    const user = await Subscription.findOne({
      $and: [{ channel: channelId }, { subscriber: userId }],
    });

    if (!user) {
      const newSubscription = await Subscription.create({
        channel: channelId,
        subscriber: userId,
      });
      if (!newSubscription) {
        throw new ApiError(500, "Failed to create subscription");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, newSubscription, "Subscription created"));
    } else {
      const deleteSubscription = await Subscription.findByIdAndDelete(
        user?._id
      );
      if (!deleteSubscription) {
        throw new ApiError(500, "Failed to delete subscription");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, deleteSubscription, "Subscription deleted"));
    }
  } catch (error) {
    throw new ApiError(500, "Couldn't find subscription");
  }
});

const getSubscribeStatus = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }
  const userId = req.user._id;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "User not authenticated");
  }
  try {
    const subscribe = Subscription.findOne({
      $and: [{ channel: channelId }, { subscriber: userId }],
    });
    const isSubscribed = !!subscribe;
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {isSubscribed},
          "Fetched Subscribe status successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong");
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, "User not authenticated");
  }

  const userChannelSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscribers",
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
    {
      $unwind: "$subscribers",
    },
    {
      $group: {
        _id: null,
        subscriberCount: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        subscriberCount: 1,
      },
    },
  ]);
  if (!userChannelSubscribers) {
    throw new ApiError(500, "Failed to fetch subscriber list");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, userChannelSubscribers, "Subscriber list fetched")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  const subscribedChannel = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channels",
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$channels",
    },
    {
      $project: {
        channels: 1,
      },
    },
  ]);

  if (!subscribedChannel) {
    throw new ApiError(500, "Failed to fetch subscribed channels");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribedChannel, "Subscribed channels fetched")
    );
});

export { toggleSubscription,getSubscribeStatus, getUserChannelSubscribers, getSubscribedChannels };
