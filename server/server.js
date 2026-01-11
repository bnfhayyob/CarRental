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
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL // Add your Vercel URL here
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
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