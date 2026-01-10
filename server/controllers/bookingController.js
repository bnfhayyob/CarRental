import Booking from "../models/Booking.js"
import Car from "../models/Car.js"
import User from "../models/User.js"

// Create new booking
export const createBooking = async (req, res) => {
    try {
        const { _id } = req.user
        const {
            carId,
            startDate,
            endDate,
            pickupLocation,
            dropoffLocation,
            specialRequests
        } = req.body

        // Validation
        if (!carId || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Car ID, start date and end date are required'
            })
        }

        const start = new Date(startDate)
        const end = new Date(endDate)
        const now = new Date()

        // Check dates validity
        if (start < now) {
            return res.status(400).json({
                success: false,
                message: 'Start date cannot be in the past'
            })
        }

        if (end <= start) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            })
        }

        // Get car details
        const car = await Car.findById(carId)

        if (!car) {
            return res.status(404).json({ success: false, message: 'Car not found' })
        }

        if (!car.isApproved) {
            return res.status(400).json({
                success: false,
                message: 'Car is not approved for booking'
            })
        }

        if (!car.isAvailable) {
            return res.status(400).json({
                success: false,
                message: 'Car is currently not available'
            })
        }

        // Check for overlapping bookings
        const overlappingBookings = await Booking.find({
            car: carId,
            status: { $in: ['confirmed', 'active'] },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } }
            ]
        })

        if (overlappingBookings.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Car is not available for selected dates'
            })
        }

        // Calculate total
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        const totalAmount = totalDays * car.pricePerDay

        // Create booking
        const booking = await Booking.create({
            user: _id,
            car: carId,
            owner: car.owner,
            startDate: start,
            endDate: end,
            totalDays,
            pricePerDay: car.pricePerDay,
            totalAmount,
            pickupLocation: pickupLocation || car.location,
            dropoffLocation: dropoffLocation || car.location,
            specialRequests
        })

        // Update car availability
        await Car.findByIdAndUpdate(carId, { isAvailable: false })

        const populatedBooking = await Booking.findById(booking._id)
            .populate('car')
            .populate('owner', 'name email phone')

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: populatedBooking
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Get user's bookings
export const getUserBookings = async (req, res) => {
    try {
        const { _id } = req.user

        const bookings = await Booking.find({ user: _id })
            .populate('car')
            .populate('owner', 'name email phone')
            .sort({ createdAt: -1 })

        res.status(200).json({ success: true, bookings })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Get owner's bookings (for their cars)
export const getOwnerBookings = async (req, res) => {
    try {
        const { _id } = req.user
        const { status } = req.query

        const query = { owner: _id }
        if (status) query.status = status

        const bookings = await Booking.find(query)
            .populate('car')
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })

        res.status(200).json({ success: true, bookings })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Get booking by ID
export const getBookingById = async (req, res) => {
    try {
        const { id } = req.params
        const { _id, role } = req.user

        const booking = await Booking.findById(id)
            .populate('car')
            .populate('user', 'name email phone address')
            .populate('owner', 'name email phone')

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' })
        }

        // Check authorization
        const isUser = booking.user._id.toString() === _id.toString()
        const isOwner = booking.owner._id.toString() === _id.toString()
        const isAdmin = role === 'admin'

        if (!isUser && !isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this booking'
            })
        }

        res.status(200).json({ success: true, booking })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Update booking status (owner/admin only)
export const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body
        const { _id, role } = req.user

        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' })
        }

        const validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled']
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' })
        }

        const booking = await Booking.findById(id)

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' })
        }

        // Check authorization (owner or admin)
        const isOwner = booking.owner.toString() === _id.toString()
        const isAdmin = role === 'admin'

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this booking'
            })
        }

        // Update booking status
        booking.status = status

        // If cancelled or completed, make car available again
        if (status === 'cancelled' || status === 'completed') {
            await Car.findByIdAndUpdate(booking.car, { isAvailable: true })
        }

        await booking.save()

        const updatedBooking = await Booking.findById(id)
            .populate('car')
            .populate('user', 'name email phone')
            .populate('owner', 'name email phone')

        res.status(200).json({
            success: true,
            message: 'Booking status updated',
            booking: updatedBooking
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Cancel booking (user only)
export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params
        const { _id } = req.user

        const booking = await Booking.findById(id)

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' })
        }

        // Check if user owns the booking
        if (booking.user.toString() !== _id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            })
        }

        // Only allow cancellation if pending or confirmed
        if (!['pending', 'confirmed'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel booking with status: ${booking.status}`
            })
        }

        // Update status and make car available
        booking.status = 'cancelled'
        await booking.save()
        await Car.findByIdAndUpdate(booking.car, { isAvailable: true })

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully'
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Update payment status
export const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { paymentStatus } = req.body
        const { _id, role } = req.user

        const booking = await Booking.findById(id)

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' })
        }

        // Owner or admin can update payment status
        const isOwner = booking.owner.toString() === _id.toString()
        const isAdmin = role === 'admin'

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update payment status'
            })
        }

        if (!['pending', 'paid'].includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment status'
            })
        }

        booking.paymentStatus = paymentStatus
        await booking.save()

        res.status(200).json({
            success: true,
            message: 'Payment status updated',
            booking
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}
