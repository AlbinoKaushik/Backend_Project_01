import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"


const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId) 
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        // {validateBeforeSave:false} this will make sure that the user will be updated with the new information in the database given to user without asking the required feature

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access and Refresh token")        
    }
}

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

    // console.log(req.body);

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
    // console.log(existedUser);

    if (existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    // console.log(req.files);

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

const loginUser = asyncHandler(async (req,res)=>{
    // req.body -> data
    // username or email 
    // find the user 
    // password check
    // access refresh token 
    // send cookies

    const { email, username, password } = req.body

    if(!email && !username){
        throw new ApiError(400, "username or email is required")
    }

    /* here is an alternative of above code based on logic discussion
    
        if(!(email && username)){
            throw new ApiError(400, "username or email is required")
        }   
    
    */

    const user = await User.findOne({
        $or: [{ username },{ email }]           
    })

    if(!user){
        throw new ApiError(404, "user does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user Credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    console.log(loggedInUser)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken ,refreshToken
            },
            "user logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler( async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                 refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refeshToken", options)
    .json(new ApiResponse(200,{},"user logged Out"))
})

export {registerUser,
    loginUser,
    logoutUser}
