import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../services/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontEnd
  // validation - not enpty (othres validation as well)
  // check if user already exist: username, email
  // check for imagese, check for avatar
  // upload then cloudinary, avatar
  // creat user object - creat entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { fullname, email, username, password } = req.body;
  // console.log("email", email);
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // check with tradition methode if above methode got error(Cannot read properties of undefined)
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // here we have to check user on basis of username or email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    fs.unlinkSync(avatarLocalPath); // if user exist then why store image data in local storage
    fs.unlinkSync(coverImageLocalPath);
    throw new ApiError(409, "User with email or username already exist");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // use this query to confirm that user data are created, in select use those field which does not required by client in frontend
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Somthing went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registerd Successfully"));
});

export { registerUser };
