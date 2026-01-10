import User from "../models/User.js"
import Car from "../models/Car.js"
import Booking from "../models/Booking.js"

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        // Count users by role
        const totalUsers = await User.countDocuments()
        const regularUsers = await User.countDocuments({ role: 'user' })
        const owners = await User.countDocuments({ role: 'owner' })
        const admins = await User.countDocuments({ role: 'admin' })

        // Count cars by status
        const totalCars = await Car.countDocuments()
        const approvedCars = await Car.countDocuments({ isApproved: true })
        const pendingCars = await Car.countDocuments({ isApproved: false })
        const availableCars = await Car.countDocuments({ isAvailable: true, isApproved: true })

        // Count bookings by status
        const totalBookings = await Booking.countDocuments()
        const pendingBookings = await Booking.countDocuments({ status: 'pending' })
        const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' })
        const activeBookings = await Booking.countDocuments({ status: 'active' })
        const completedBookings = await Booking.countDocuments({ status: 'completed' })
        const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' })

        // Calculate revenue (from completed bookings)
        const revenueData = await Booking.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ])
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0

        // Get recent bookings
        const recentBookings = await Booking.find()
            .populate('user', 'name email')
            .populate('car', 'brand model')
            .sort({ createdAt: -1 })
            .limit(10)

        // Get recent users
        const recentUsers = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(10)

        res.status(200).json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    regular: regularUsers,
                    owners,
                    admins
                },
                cars: {
                    total: totalCars,
                    approved: approvedCars,
                    pending: pendingCars,
                    available: availableCars
                },
                bookings: {
                    total: totalBookings,
                    pending: pendingBookings,
                    confirmed: confirmedBookings,
                    active: activeBookings,
                    completed: completedBookings,
                    cancelled: cancelledBookings
                },
                revenue: {
                    total: totalRevenue
                }
            },
            recentBookings,
            recentUsers
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Get all users with filters and pagination
export const getAllUsers = async (req, res) => {
    try {
        const { role, isBlocked, search, page = 1, limit = 20 } = req.query

        const query = {}
        if (role) query.role = role
        if (isBlocked !== undefined) query.isBlocked = isBlocked === 'true'
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        }

        const skip = (Number(page) - 1) * Number(limit)

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))

        const total = await User.countDocuments(query)

        res.status(200).json({
            success: true,
            users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Update user status (block/unblock)
export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { isBlocked } = req.body

        if (isBlocked === undefined) {
            return res.status(400).json({
                success: false,
                message: 'isBlocked field is required'
            })
        }

        const user = await User.findById(id)

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        // Prevent blocking admins
        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot block admin users'
            })
        }

        user.isBlocked = isBlocked

        // If blocking, cancel all active bookings
        if (isBlocked) {
            await Booking.updateMany(
                { user: id, status: { $in: ['pending', 'confirmed', 'active'] } },
                { status: 'cancelled' }
            )

            // Make cars available again
            const cancelledBookings = await Booking.find({
                user: id,
                status: 'cancelled'
            })

            for (const booking of cancelledBookings) {
                await Car.findByIdAndUpdate(booking.car, { isAvailable: true })
            }
        }

        await user.save()

        res.status(200).json({
            success: true,
            message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
            user: { ...user.toObject(), password: undefined }
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params

        const user = await User.findById(id)

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        // Prevent deleting admins
        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete admin users'
            })
        }

        // Check for active bookings
        const activeBookings = await Booking.find({
            user: id,
            status: { $in: ['confirmed', 'active'] }
        })

        if (activeBookings.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete user with active bookings'
            })
        }

        await User.findByIdAndDelete(id)

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Get all cars (including unapproved) with filters
export const getAllCarsAdmin = async (req, res) => {
    try {
        const { isApproved, isAvailable, search, page = 1, limit = 20 } = req.query

        const query = {}
        if (isApproved !== undefined) query.isApproved = isApproved === 'true'
        if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true'
        if (search) {
            query.$or = [
                { brand: { $regex: search, $options: 'i' } },
                { model: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ]
        }

        const skip = (Number(page) - 1) * Number(limit)

        const cars = await Car.find(query)
            .populate('owner', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))

        const total = await Car.countDocuments(query)

        res.status(200).json({
            success: true,
            cars,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Approve or reject car
export const approveRejectCar = async (req, res) => {
    try {
        const { id } = req.params
        const { isApproved, reason } = req.body

        if (isApproved === undefined) {
            return res.status(400).json({
                success: false,
                message: 'isApproved field is required'
            })
        }

        const car = await Car.findById(id)

        if (!car) {
            return res.status(404).json({ success: false, message: 'Car not found' })
        }

        car.isApproved = isApproved
        await car.save()

        const statusText = isApproved ? 'approved' : 'rejected'
        const message = reason
            ? `Car ${statusText}. Reason: ${reason}`
            : `Car ${statusText} successfully`

        res.status(200).json({
            success: true,
            message,
            car
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Get all bookings with filters
export const getAllBookingsAdmin = async (req, res) => {
    try {
        const { status, startDate, endDate, search, page = 1, limit = 20 } = req.query

        const query = {}
        if (status) query.status = status
        if (startDate && endDate) {
            query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) }
        }

        const skip = (Number(page) - 1) * Number(limit)

        let bookings = await Booking.find(query)
            .populate('user', 'name email')
            .populate('car', 'brand model')
            .populate('owner', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))

        // Apply search filter if provided
        if (search) {
            bookings = bookings.filter(booking =>
                booking.user?.email.toLowerCase().includes(search.toLowerCase()) ||
                booking.user?.name.toLowerCase().includes(search.toLowerCase()) ||
                booking.car?.brand.toLowerCase().includes(search.toLowerCase()) ||
                booking.car?.model.toLowerCase().includes(search.toLowerCase())
            )
        }

        const total = await Booking.countDocuments(query)

        res.status(200).json({
            success: true,
            bookings,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Update booking (admin can override restrictions)
export const updateBookingAdmin = async (req, res) => {
    try {
        const { id } = req.params
        const { status, paymentStatus } = req.body

        const booking = await Booking.findById(id)

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' })
        }

        if (status) {
            const validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled']
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status'
                })
            }
            booking.status = status

            // Update car availability based on status
            if (status === 'cancelled' || status === 'completed') {
                await Car.findByIdAndUpdate(booking.car, { isAvailable: true })
            } else if (status === 'confirmed' || status === 'active') {
                await Car.findByIdAndUpdate(booking.car, { isAvailable: false })
            }
        }

        if (paymentStatus) {
            if (!['pending', 'paid'].includes(paymentStatus)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid payment status'
                })
            }
            booking.paymentStatus = paymentStatus
        }

        await booking.save()

        const updatedBooking = await Booking.findById(id)
            .populate('user', 'name email')
            .populate('car', 'brand model')
            .populate('owner', 'name email')

        res.status(200).json({
            success: true,
            message: 'Booking updated successfully',
            booking: updatedBooking
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}
