export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.json({success: false, message: "Not authenticated"})
        }
        if (!roles.includes(req.user.role)) {
            return res.json({success: false, message: "Access denied. Insufficient permissions"})
        }
        next()
    }
}
