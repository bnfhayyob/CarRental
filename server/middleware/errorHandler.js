const errorHandler = (err, req, res, _next) => {
    console.error(`[${new Date().toISOString()}] Error:`, err.message)
    console.error(err.stack)

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message)
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors
        })
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        })
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0]
        return res.status(409).json({
            success: false,
            message: `${field} already exists`
        })
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        })
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        })
    }

    // Multer errors
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum 5MB allowed'
            })
        }
        return res.status(400).json({
            success: false,
            message: err.message
        })
    }

    // Default server error
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    })
}

export default errorHandler
