import express from "express"
import "dotenv/config"
import cors from "cors"
import connectDB from "./configs/db.js"
// Import all models first to ensure they're registered
import User from "./models/User.js"
import Car from "./models/Car.js"
import Booking from "./models/Booking.js"
import userRouter from "./routes/userRoutes.js"
import ownerRouter from "./routes/ownerRoutes.js" // Updated v3 - dashboard stats
import carRouter from "./routes/carRoutes.js" // Updated routes v2
import bookingRouter from "./routes/bookingRoutes.js"
import adminRouter from "./routes/adminRoutes.js"
import logger from "./middleware/logger.js"
import errorHandler from "./middleware/errorHandler.js"

const app = express()

await connectDB()

//middleware
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}))
app.use(express.json())
app.use(logger)

app.get('/', (req,res)=> res.send('server is running'))

// Routes
app.use('/api/user', userRouter)
app.use('/api/owner', ownerRouter)
app.use('/api/cars', carRouter)
app.use('/api/booking', bookingRouter)
app.use('/api/admin', adminRouter)

// Error handler (must be last)
app.use(errorHandler)

const PORT = process.env.PORT || 3000

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`))