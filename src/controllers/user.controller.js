import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req,res)=>{
    // res.status(500).json({
    //     message: "Albino You have done it !"
    // })

    // get user details from frontend
    // validation - NOT empty
    // check if user already exist (email and username)
    // check for images, and check for avatar
    // upload them on cloudinary
    // create user object -- create entry in DB
    // remove password and refresh token field from response
    // check for user creation
    // return response

    console.log(req.body);

    const { fullName,email,username,password } = req.body

    // console.log("Email: ",email);

    // if(fullName===""){
    //     throw new ApiError(400,"FullName is required")
    // }

    if(
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ){
        throw ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({ 

        
        $or:[{ username }, { email }]
    })
    console.log(existedUser);

    if (existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)


    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url  || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registring the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
})

export {registerUser}
