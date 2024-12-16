const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
    }    
}

// this is done by promise method

export {asyncHandler}

// this is higher order function

// const asyncHandler = () => {}
// const asyncHandler = (function) => {() => {}}
// const asyncHandler = (function) => (() => {})
// const asyncHandler = (function) => async() => {}

// it is been made by try and catch method

// const asyncHandler = (fn) => async(req,res,next) =>{
//     try {
//         await fn(req,res,next)        
//     } catch (error) {
//         res.status(err.code  || 500).json({
//             sucess:false,
//             message: err.message
//         })
        
//     }
// }