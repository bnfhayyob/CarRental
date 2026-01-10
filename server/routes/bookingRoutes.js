import express from "express"
import { protect } from "../middleware/auth.js"
import { requireRole } from "../middleware/roleCheck.js"
import {
    createBooking,
    getUserBookings,
    getOwnerBookings,
    getBookingById,
    updateBookingStatus,
    cancelBooking,
    updatePaymentStatus
} from "../controllers/bookingController.js"

const bookingRouter = express.Router()

// All routes are protected
bookingRouter.post('/create', protect, createBooking)
bookingRouter.get('/my-bookings', protect, getUserBookings)
bookingRouter.get('/owner-bookings', protect, requireRole('owner', 'admin'), getOwnerBookings)
bookingRouter.get('/:id', protect, getBookingById)
bookingRouter.patch('/:id/status', protect, requireRole('owner', 'admin'), updateBookingStatus)
bookingRouter.patch('/:id/payment', protect, requireRole('owner', 'admin'), updatePaymentStatus)
bookingRouter.delete('/:id/cancel', protect, cancelBooking)

export default bookingRouter
