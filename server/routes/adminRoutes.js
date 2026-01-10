import express from "express"
import { protect } from "../middleware/auth.js"
import { requireRole } from "../middleware/roleCheck.js"
import {
    getDashboardStats,
    getAllUsers,
    updateUserStatus,
    deleteUser,
    getAllCarsAdmin,
    approveRejectCar,
    getAllBookingsAdmin,
    updateBookingAdmin
} from "../controllers/adminController.js"

const adminRouter = express.Router()

// All routes require admin role
adminRouter.use(protect, requireRole('admin'))

// Dashboard
adminRouter.get('/dashboard', getDashboardStats)

// User management
adminRouter.get('/users', getAllUsers)
adminRouter.patch('/users/:id/status', updateUserStatus)
adminRouter.delete('/users/:id', deleteUser)

// Car management
adminRouter.get('/cars', getAllCarsAdmin)
adminRouter.patch('/cars/:id/approve', approveRejectCar)

// Booking management
adminRouter.get('/bookings', getAllBookingsAdmin)
adminRouter.patch('/bookings/:id', updateBookingAdmin)

export default adminRouter
