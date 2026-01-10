const logger = (req, res, next) => {
    const start = Date.now()

    // Log when response finishes
    res.on('finish', () => {
        const duration = Date.now() - start
        const timestamp = new Date().toISOString()
        const method = req.method
        const url = req.originalUrl || req.url
        const status = res.statusCode

        console.log(`[${timestamp}] ${method} ${url} ${status} - ${duration}ms`)
    })

    next()
}

export default logger
