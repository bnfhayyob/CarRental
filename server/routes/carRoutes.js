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
    checkAvailability
} from "../controllers/carController.js"

const carRouter = express.Router()

// Public routes
carRouter.get('/', getAllCars)
carRouter.get('/search', searchCars)
carRouter.get('/search-available', searchAvailableCars)
carRouter.get('/check-availability', checkAvailability)
carRouter.get('/:id', getCarById)

// Protected routes - Owner only
carRouter.get('/owner/my-cars', protect, requireRole('owner'), getOwnerCars)
carRouter.patch('/:id', protect, requireRole('owner', 'admin'), updateCar)
carRouter.delete('/:id', protect, requireRole('owner', 'admin'), deleteCar)

export default carRouter
