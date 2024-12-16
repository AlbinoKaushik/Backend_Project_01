// require('dotenv').config({path: './.env'})
import dotenv from "dotenv";
 
// import mongoose, { connect } from "mongoose";
// import {DB_NAME} from "./constants";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path:'./.env'
});




connectDB()
.then(()=>{
    app.listen(process.env.PORT || 7000, ()=>{
        console.log(`Server is Running at port : ${process.env.PORT}`);
    })
})
.catch((ERR)=>{
    console.log("MongoDB connection Failed: !!! ",ERR);    
})























/*
import express from "express"
const app = express()
;(async ()=>{
    try {
        mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERR: ",error);
            throw error
        })
        
        app.listen(process.env.PORT,()=>{
            console.log(`App is listening at port ${process.env.PORT}`);
        })


    } catch (error) {
        console.error("ERROR: ",error)
        throw error        
    }
})()
*/