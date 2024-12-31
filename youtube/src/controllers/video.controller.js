import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
  } = req.query;

  const videos = await Video.aggregate([
    {
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    {
      $unwind: "$createdBy",
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        createdBy: {
          fullname: 1,
          username: 1,
          avatar: 1,
        },
      },
    },
    {
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    },
    {
      $skip: (parseInt(page) - 1) * parseInt(limit),
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, { videos }, "Videos fetched successfully"));
});

const getMyVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
  } = req.query;

  const userId = req.user?._id;

  const myVideos = await Video.aggregate([
    {
      $match: {
        owner: userId, // Filter videos by the logged-in user's ID
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    {
      $unwind: "$createdBy",
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        createdBy: {
          fullname: 1,
          username: 1,
          avatar: 1,
        },
      },
    },
    {
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    },
    {
      $skip: (parseInt(page) - 1) * parseInt(limit),
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, { myVideos }, "Your videos fetched successfully"));
});


const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (!title || !description) {
    throw new ApiError(404, "Please fill the Title and Description");
  }

  const userID = req.user?._id;
  if (!userID) {
    throw new ApiError(401, "Unauthorized User");
  }

  const videoLocalPath = req?.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req?.files?.thumbnail[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(404, "Please upload Video and Thumbnail");
  }

  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!video.url || !thumbnail.url) {
    throw new ApiError(404, "Failed to upload Video and Thumbnail");
  }

  const savedVideo = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: video.duration,
    owner: userID,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { savedVideo }, "Video uploaded"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!isValidObjectId(videoId)) {
    throw new ApiError(404, "Video id is not valid");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video File is not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { video }, "Video fetched Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiError(400, "Please fill the Title and Description");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video id is not valid");
  }

  const oldVideo = await Video.findById(videoId);
  if (!(oldVideo?.owner).equals(req.user?._id)) {
    throw new ApiError(404, "You Cannot Update the Video");
  }

  const oldVideoFile = oldVideo?.videoFile;
  const oldThumbnail = oldVideo?.thumbnail;

  const newVideo = req.files?.videoFile?.[0]?.path;
  const newThumbnail = req.files?.thumbnail?.[0]?.path;

  if (!newVideo || !newThumbnail) {
    throw new ApiError(404, "Please upload new Video and Thumbnail");
  }

  const video = await uploadOnCloudinary(newVideo);
  const thumbnail = await uploadOnCloudinary(newThumbnail);
  if (!video || !thumbnail) {
    throw new ApiError(
      404,
      "Failed to upload new Video and Thumbnail on Cloudinary"
    );
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        videoFile: video.url,
        thumbnail: thumbnail.url,
        title,
        description,
      },
    },
    {
      new: true,
    }
  );

  const deleteOldVideo = await deleteFromCloudinary(oldVideoFile);
  const deleteOldThumbnail = await deleteFromCloudinary(oldThumbnail);

  if (deleteOldVideo.result !== "ok" || deleteOldThumbnail.result !== "ok") {
    throw new ApiError(
      404,
      "Failed to delete old video and thumbnail from cloudinary"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updatedVideo },
        "Video details Updated successfully"
      )
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video id is not valid");
  }

  const oldVideo = await Video.findById(videoId);
  if (!(oldVideo?.owner).equals(req.user?._id)) {
    throw new ApiError(404, "You Cannot Delete the Video");
  }

  const oldVideoFile = oldVideo?.videoFile;
  const oldThumbnail = oldVideo?.thumbnail;

  const deletedVideo = await Video.findByIdAndDelete(videoId);
  if (!deletedVideo) {
    throw new ApiError(404, "Video File is not found");
  }

  const deleteOldVideo = await deleteFromCloudinary(oldVideoFile);
  const deleteOldThumbnail = await deleteFromCloudinary(oldThumbnail);

  if (deleteOldVideo.result !== "ok" || deleteOldThumbnail.result !== "ok") {
    throw new ApiError(
      404,
      "Failed to delete old video and thumbnail from cloudinary"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video Deleted Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video id is not valid");
  }

  const video = await Video.findById(videoId);
  if (!(video?.owner).equals(req.user?._id)) {
    throw new ApiError(404, "You Cannot Toggle the Publish Status");
  }

  const toggleStatus = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { toggleStatus },
        "Video publish status is toggled successfully"
      )
    );
});

export {
  getAllVideos,
  getMyVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
