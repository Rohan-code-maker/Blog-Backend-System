import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity:{
        type:Number,
        required: true
    }
})

const orderSchema = new mongoose.Schema({
    orderPrice:{
        type:Number,
        required: true
    },
    customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    orderItems:{
        type:[orderItemSchema]
    },
    shippingAddress:{
        address:{ type: String,required:true},
        city:{ type: String,required:true},
        postalCode:{ type: String,required:true},
        country:{ type: String,required:true}
    },
    status:{
        type: String,
        enum: ["Pending", "Shipped", "Delivered"],
        default: "Pending"
    }
},{timestamps:true})

export const Order = mongoose.model("Order",orderSchema)