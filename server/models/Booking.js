import mongoose from "mongoose"
const {ObjectId} = mongoose.Schema.Types

const bookingSchema = new mongoose.Schema({
    user: {type:ObjectId, ref:'user', required:true},
    car: {type:ObjectId, ref:'Car', required:true},
    owner: {type:ObjectId, ref:'user', required:true},
    startDate: {type:Date, required:true},
    endDate: {type:Date, required:true},
    totalDays: {type:Number, required:true},
    pricePerDay: {type:Number, required:true},
    totalAmount: {type:Number, required:true},
    status: {
        type:String,
        enum: ["pending", "confirmed", "active", "completed", "cancelled"],
        default:"pending"
    },
    paymentStatus: {
        type:String,
        enum: ["pending", "paid"],
        default:"pending"
    },
    paymentMethod: {type:String, default:"cash"},
    pickupLocation: {type:String},
    dropoffLocation: {type:String},
    specialRequests: {type:String}
}, {timestamps:true})

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking
