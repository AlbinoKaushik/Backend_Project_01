import { Schema, model } from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber:{
            type:Schema.Types.ObjectId,
            reff:"User"
        },
        channel:{
            type:Schema.Types.ObjectId,
            reff:"User"
        }
    },
    {timestamps:true}
)

export const Subscription = model("Subscription", subscriptionSchema)