// Email validation
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Password strength validation
export const isStrongPassword = (password) => {
    return password && password.length >= 8
}

// Validate user registration
export const validateRegistration = (req, res, next) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Name, email and password are required'
        })
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email format'
        })
    }

    if (!isStrongPassword(password)) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 8 characters long'
        })
    }

    next()
}

// Validate car creation
export const validateCarCreation = (req, res, next) => {
    const requiredFields = [
        'brand',
        'model',
        'year',
        'category',
        'seating_capacity',
        'fuel_type',
        'transmission',
        'pricePerDay',
        'location',
        'description'
    ]

    const missingFields = requiredFields.filter(field => !req.body[field])

    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Missing required fields: ${missingFields.join(', ')}`
        })
    }

    // Validate data types
    if (isNaN(req.body.year) || isNaN(req.body.seating_capacity) || isNaN(req.body.pricePerDay)) {
        return res.status(400).json({
            success: false,
            message: 'Year, seating capacity and price per day must be numbers'
        })
    }

    // Validate year range
    const currentYear = new Date().getFullYear()
    if (req.body.year < 1900 || req.body.year > currentYear + 1) {
        return res.status(400).json({
            success: false,
            message: 'Invalid year'
        })
    }

    // Validate positive numbers
    if (req.body.seating_capacity <= 0 || req.body.pricePerDay <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Seating capacity and price must be positive numbers'
        })
    }

    next()
}

// Validate booking creation
export const validateBookingCreation = (req, res, next) => {
    const { carId, startDate, endDate } = req.body

    if (!carId || !startDate || !endDate) {
        return res.status(400).json({
            success: false,
            message: 'Car ID, start date and end date are required'
        })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid date format'
        })
    }

    if (start >= end) {
        return res.status(400).json({
            success: false,
            message: 'End date must be after start date'
        })
    }

    if (start < new Date()) {
        return res.status(400).json({
            success: false,
            message: 'Start date cannot be in the past'
        })
    }

    next()
}
