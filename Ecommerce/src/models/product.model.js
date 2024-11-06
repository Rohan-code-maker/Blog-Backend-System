import mongoose, {Schema} from "mongoose";

const reviewSchema = new Schema({
    customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    rating:{
        type:Number,
        min: 1,
        max: 5,
        required: true
    },
    comment:{
        type: String,
        required: true
    }
})

const productSchema = new Schema({
    name:{
        type:String,
        required: true,
        index:true
    },
    description:{
        type:String,
        required: true,
        index:true
    },
    price:{
        type:Number,
        default:0,
        required: true
    },
    stock:{
        type:Number,
        default:0
    },
    productImage:{
        type:String,
        required: true,
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required:true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    reviews: [reviewSchema],

    rating:{
        type: Number,
        default: 0,
        min: 1,
        max: 5,
        required: true
    }
},{timestamps:true})

export const Product = mongoose.model("Product",productSchema)