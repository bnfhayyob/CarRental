import Car from "../models/Car.js"
import Booking from "../models/Booking.js"
import User from "../models/User.js" // Needed for populate to work

// Get all cars (public) - with filters and pagination
export const getAllCars = async (req, res) => {
    try {
        const {
            category,
            transmission,
            fuel_type,
            location,
            minPrice,
            maxPrice,
            page = 1,
            limit = 20,
            sortBy = 'createdAt'
        } = req.query

        const query = { isAvailable: true } // Temporarily removed isApproved filter for testing

        // Apply filters
        if (category) query.category = category
        if (transmission) query.transmission = transmission
        if (fuel_type) query.fuel_type = fuel_type
        if (location) query.location = { $regex: location, $options: 'i' }
        if (minPrice || maxPrice) {
            query.pricePerDay = {}
            if (minPrice) query.pricePerDay.$gte = Number(minPrice)
            if (maxPrice) query.pricePerDay.$lte = Number(maxPrice)
        }

        // Pagination
        const skip = (Number(page) - 1) * Number(limit)

        // Sort options
        const sortOptions = {}
        if (sortBy === 'price_low') sortOptions.pricePerDay = 1
        else if (sortBy === 'price_high') sortOptions.pricePerDay = -1
        else if (sortBy === 'year') sortOptions.year = -1
        else sortOptions.createdAt = -1

        const cars = await Car.find(query)
            .populate('owner', 'name')
            .sort(sortOptions)
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

// Search cars (public)
export const searchCars = async (req, res) => {
    try {
        const { q, page = 1, limit = 20 } = req.query

        if (!q) {
            return res.status(400).json({ success: false, message: 'Search query required' })
        }

        const searchQuery = {
            isApproved: true,
            $or: [
                { brand: { $regex: q, $options: 'i' } },
                { model: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } },
                { location: { $regex: q, $options: 'i' } }
            ]
        }

        const skip = (Number(page) - 1) * Number(limit)

        const cars = await Car.find(searchQuery)
            .populate('owner', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))

        const total = await Car.countDocuments(searchQuery)

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

// Get car by ID (public)
export const getCarById = async (req, res) => {
    try {
        const { id } = req.params

        const car = await Car.findById(id).populate('owner', 'name email phone')

        if (!car) {
            return res.status(404).json({ success: false, message: 'Car not found' })
        }

        // Allow viewing if car is approved OR user is owner/admin
        if (!car.isApproved) {
            if (!req.user || (req.user._id.toString() !== car.owner._id.toString() && req.user.role !== 'admin')) {
                return res.status(403).json({ success: false, message: 'Car not approved yet' })
            }
        }

        res.status(200).json({ success: true, car })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Get owner's cars (protected - owner only)
export const getOwnerCars = async (req, res) => {
    try {
        const { _id } = req.user

        const cars = await Car.find({ owner: _id }).sort({ createdAt: -1 })

        res.status(200).json({ success: true, cars })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Update car (protected - owner only)
export const updateCar = async (req, res) => {
    try {
        const { id } = req.params
        const { _id, role } = req.user

        const car = await Car.findById(id)

        if (!car) {
            return res.status(404).json({ success: false, message: 'Car not found' })
        }

        // Only owner or admin can update
        if (car.owner.toString() !== _id.toString() && role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this car' })
        }

        // Prevent updating certain fields
        const allowedUpdates = [
            'brand', 'model', 'year', 'category', 'seating_capacity',
            'fuel_type', 'transmission', 'pricePerDay', 'location',
            'description', 'isAvailable', 'features', 'mileage',
            'registrationNumber', 'insuranceExpiry'
        ]

        const updates = {}
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key]
            }
        })

        const updatedCar = await Car.findByIdAndUpdate(id, updates, { new: true })

        res.status(200).json({ success: true, message: 'Car updated successfully', car: updatedCar })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Delete car (protected - owner/admin only)
export const deleteCar = async (req, res) => {
    try {
        const { id } = req.params
        const { _id, role } = req.user

        const car = await Car.findById(id)

        if (!car) {
            return res.status(404).json({ success: false, message: 'Car not found' })
        }

        // Only owner or admin can delete
        if (car.owner.toString() !== _id.toString() && role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this car' })
        }

        // Check for active bookings
        const activeBookings = await Booking.find({
            car: id,
            status: { $in: ['confirmed', 'active'] }
        })

        if (activeBookings.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete car with active bookings'
            })
        }

        await Car.findByIdAndDelete(id)

        res.status(200).json({ success: true, message: 'Car deleted successfully' })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Search available cars by location and date range (public)
export const searchAvailableCars = async (req, res) => {
    try {
        const { location, startDate, endDate } = req.query

        if (!location || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Location, start date and end date are required'
            })
        }

        const start = new Date(startDate)
        const end = new Date(endDate)

        // Validate dates
        if (start >= end) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            })
        }

        // Find cars in the specified location
        const carsInLocation = await Car.find({
            location: { $regex: location, $options: 'i' },
            isAvailable: true,
            isApproved: true
        }).populate('owner', 'name')

        // Filter out cars with overlapping bookings
        const availableCars = []

        for (const car of carsInLocation) {
            const overlappingBookings = await Booking.find({
                car: car._id,
                status: { $in: ['confirmed', 'active'] },
                $or: [
                    { startDate: { $lte: end }, endDate: { $gte: start } }
                ]
            })

            if (overlappingBookings.length === 0) {
                availableCars.push(car)
            }
        }

        res.status(200).json({
            success: true,
            cars: availableCars,
            searchCriteria: {
                location,
                startDate,
                endDate
            },
            total: availableCars.length
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Check car availability for date range
export const checkAvailability = async (req, res) => {
    try {
        const { carId, startDate, endDate } = req.query

        if (!carId || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Car ID, start date and end date are required'
            })
        }

        const start = new Date(startDate)
        const end = new Date(endDate)

        // Check for overlapping bookings
        const overlappingBookings = await Booking.find({
            car: carId,
            status: { $in: ['confirmed', 'active'] },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } }
            ]
        })

        const available = overlappingBookings.length === 0

        res.status(200).json({ success: true, available })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}
