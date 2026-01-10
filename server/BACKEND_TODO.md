# Backend Endpoints To Implement

The frontend is now fully functional and calling these endpoints. Implement them to complete the integration.

---

## 1. Toggle Car Availability

**Route:** `PATCH /api/cars/:id/toggle-availability`

**Location:** Add to `server/routes/carRoutes.js`

```javascript
carRouter.patch('/:id/toggle-availability', protect, requireRole('owner', 'admin'), toggleAvailability)
```

**Controller:** Add to `server/controllers/carController.js`

```javascript
export const toggleAvailability = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)

    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' })
    }

    // Check if user is the owner of the car or admin
    if (car.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    car.isAvaliable = !car.isAvaliable
    await car.save()

    res.json({
      success: true,
      message: 'Car availability updated',
      car
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
```

---

## 2. Dashboard Statistics

**Route:** `GET /api/owner/dashboard-stats`

**Location:** Add to `server/routes/ownerRoutes.js`

```javascript
import { addCar, changeRoleOwner, getDashboardStats } from "../controllers/ownerController.js"

ownerRouter.get("/dashboard-stats", protect, requireRole('owner', 'admin'), getDashboardStats)
```

**Controller:** Add to `server/controllers/ownerController.js`

```javascript
import Booking from "../models/Booking.js"
import Car from "../models/Car.js"

export const getDashboardStats = async (req, res) => {
  try {
    const ownerId = req.user._id

    // Get total cars owned
    const totalCars = await Car.countDocuments({ owner: ownerId })

    // Get all bookings for owner's cars
    const ownerCars = await Car.find({ owner: ownerId }).select('_id')
    const carIds = ownerCars.map(car => car._id)

    const allBookings = await Booking.find({ car: { $in: carIds } })
    const totalBookings = allBookings.length
    const pendingBookings = allBookings.filter(b => b.status === 'pending').length
    const completedBookings = allBookings.filter(b => b.status === 'confirmed').length

    // Calculate monthly revenue (current month)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthlyRevenue = allBookings
      .filter(b => {
        const bookingDate = new Date(b.createdAt)
        return bookingDate.getMonth() === currentMonth &&
               bookingDate.getFullYear() === currentYear &&
               b.status === 'confirmed'
      })
      .reduce((sum, b) => sum + b.price, 0)

    // Get recent bookings (last 5)
    const recentBookings = await Booking.find({ car: { $in: carIds } })
      .populate('car', 'brand model image')
      .sort({ createdAt: -1 })
      .limit(5)

    res.json({
      success: true,
      data: {
        totalCars,
        totalBookings,
        pendingBookings,
        completedBookings,
        monthlyRevenue,
        recentBookings
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
```

---

## 3. Profile Image Upload (Optional)

**Route:** `PATCH /api/user/profile-image`

**Location:** Add to `server/routes/userRoutes.js`

```javascript
import upload from "../middleware/multer.js"

userRouter.patch('/profile-image', protect, upload.single('image'), updateProfileImage)
```

**Controller:** Add to `server/controllers/userController.js`

```javascript
import cloudinary from "../config/cloudinary.js"

export const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' })
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'profile-images'
    })

    // Update user image
    req.user.image = result.secure_url
    await req.user.save()

    res.json({
      success: true,
      message: 'Profile image updated',
      imageUrl: result.secure_url
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
```

---

## Quick Implementation Checklist

- [ ] Add `toggleAvailability` controller to carController.js
- [ ] Add toggle route to carRoutes.js
- [ ] Add `getDashboardStats` controller to ownerController.js
- [ ] Add dashboard stats route to ownerRoutes.js
- [ ] Import `requireRole` middleware in ownerRoutes.js if not already
- [ ] (Optional) Add profile image upload endpoint

---

## Testing After Implementation

### Test Toggle Availability:
```bash
# Requires owner auth token
PATCH http://localhost:3000/api/cars/{carId}/toggle-availability
Authorization: Bearer {token}
```

### Test Dashboard Stats:
```bash
# Requires owner auth token
GET http://localhost:3000/api/owner/dashboard-stats
Authorization: Bearer {token}
```

Expected response structure is documented in FRONTEND_IMPLEMENTATION_SUMMARY.md

---

## Notes

- Frontend is already calling these endpoints
- Frontend handles loading states and errors
- Frontend updates UI in real-time after successful responses
- All error messages are displayed to users via toast notifications
