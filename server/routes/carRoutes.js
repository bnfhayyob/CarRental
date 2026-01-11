import express from "express"
import { protect } from "../middleware/auth.js"
import { requireRole } from "../middleware/roleCheck.js"
import {
    getAllCars,
    searchCars,
    searchAvailableCars,
    getCarById,
    getOwnerCars,
    updateCar,
    deleteCar,
    checkAvailability,
    toggleAvailability
} from "../controllers/carController.js"

const carRouter = express.Router()

// Public routes (specific routes must come before dynamic :id route)
carRouter.get('/', getAllCars)
carRouter.get('/search', searchCars)
carRouter.get('/test', (req, res) => res.json({success: true, message: 'Test route works!'}))
carRouter.get('/find-available', searchAvailableCars)
carRouter.get('/check-availability', checkAvailability)

// Protected routes - Owner only
carRouter.get('/owner/my-cars', protect, requireRole('owner'), getOwnerCars)
carRouter.patch('/:id/toggle-availability', protect, requireRole('owner', 'admin'), toggleAvailability)
carRouter.patch('/:id', protect, requireRole('owner', 'admin'), updateCar)
carRouter.delete('/:id', protect, requireRole('owner', 'admin'), deleteCar)

// Dynamic route - MUST BE ABSOLUTELY LAST
carRouter.get('/:id', getCarById)

export default carRouter
