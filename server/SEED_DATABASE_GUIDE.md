# Database Seeding Guide

This guide explains how to populate your MongoDB database with sample data for testing and development.

---

## 📦 What Gets Seeded

The seed script populates your database with:

### Users (3 accounts)
| Name | Email | Password | Role |
|------|-------|----------|------|
| Ayyoub | admin@example.com | admin123 | owner |
| John Doe | owner@example.com | owner123 | owner |
| Jane Smith | user@example.com | user123 | user |

### Cars (4 vehicles)
1. **BMW X5** - SUV, $300/day, New York
2. **Toyota Corolla** - Sedan, $130/day, Chicago
3. **Jeep Wrangler** - SUV, $200/day, Los Angeles
4. **Ford Neo 6** - Sedan, $209/day, Houston

### Bookings (4 sample bookings)
- Various confirmed and pending bookings
- Connected to the users and cars above

---

## 🚀 How to Run the Seed Script

### Step 1: Ensure Your Server is NOT Running
Stop your development server if it's running:
```bash
# Press Ctrl+C if server is running
```

### Step 2: Run the Seed Command
```bash
cd server
npm run seed
```

### Step 3: Wait for Completion
You should see output like:
```
✅ Connected to MongoDB
🗑️  Clearing existing data...
✅ Existing data cleared
🔐 Hashing passwords...
👥 Inserting users...
✅ Inserted 3 users:
   - Ayyoub (admin@example.com) - Role: owner
   - John Doe (owner@example.com) - Role: owner
   - Jane Smith (user@example.com) - Role: user
🚗 Inserting cars...
✅ Inserted 4 cars:
   - BMW X5 ($300/day)
   - Toyota Corolla ($130/day)
   - Jeep Wrangler ($200/day)
   - Ford Neo 6 ($209/day)
📅 Inserting bookings...
✅ Inserted 4 bookings
✨ Database seeded successfully!
```

---

## ⚠️ Important Notes

### 1. This Will Clear Your Database
**WARNING:** The seed script will **DELETE ALL EXISTING DATA** from:
- Users collection
- Cars collection
- Bookings collection

Only use this in **development environments**!

### 2. IDs Are Preserved
The script uses the same MongoDB ObjectIDs from your dummy data, so references between collections work correctly.

### 3. Passwords Are Hashed
All user passwords are properly hashed with bcrypt before insertion.

### 4. Real Images
The script uses real Unsplash URLs for car images instead of local assets.

---

## 🧪 Testing After Seeding

### 1. Test Login (Frontend)
Open your frontend and try logging in:
```
Email: admin@example.com
Password: admin123
```

### 2. Test API Endpoints (Postman/Thunder Client)

**Get All Cars:**
```
GET http://localhost:3000/api/cars/
```

**Login and Get Token:**
```
POST http://localhost:3000/api/user/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Get User's Bookings (with token):**
```
GET http://localhost:3000/api/booking/my-bookings
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 🔧 Customizing the Seed Data

Edit [seedDatabase.js](seedDatabase.js) to modify:

### Add More Users
```javascript
{
  _id: new mongoose.Types.ObjectId(),
  name: "Your Name",
  email: "your@email.com",
  password: "yourpassword",
  role: "user",
  image: "https://your-image-url.com"
}
```

### Add More Cars
```javascript
{
  _id: new mongoose.Types.ObjectId(),
  owner: new mongoose.Types.ObjectId("OWNER_ID_HERE"),
  brand: "Mercedes",
  model: "C-Class",
  image: "https://car-image-url.com",
  year: 2023,
  category: "Sedan",
  seating_capacity: 5,
  fuel_type: "Petrol",
  transmission: "Automatic",
  pricePerDay: 250,
  location: "Miami",
  description: "Luxury sedan with premium features",
  isAvailable: true,
  isApproved: true,
  features: ["GPS", "Bluetooth", "Leather Seats"]
}
```

### Add More Bookings
```javascript
{
  _id: new mongoose.Types.ObjectId(),
  car: new mongoose.Types.ObjectId("CAR_ID_HERE"),
  user: new mongoose.Types.ObjectId("USER_ID_HERE"),
  owner: new mongoose.Types.ObjectId("OWNER_ID_HERE"),
  startDate: new Date("2025-06-15"),
  endDate: new Date("2025-06-17"),
  totalDays: 2,
  pricePerDay: 250,
  totalAmount: 500,
  status: "pending",
  paymentStatus: "pending",
  paymentMethod: "cash",
  pickupLocation: "Miami"
}
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to MongoDB"
**Solution:**
1. Check your `.env` file has correct `MONGO_URI`
2. Ensure MongoDB is running
3. Check your internet connection (if using MongoDB Atlas)

### Error: "Duplicate key error"
**Solution:**
- The script tries to clear data first
- If you manually deleted some data, ObjectIDs might conflict
- Change the `_id` values in the seed script to new ones

### Error: "Validation failed"
**Solution:**
- Check that all required fields in your models match the seed data
- Ensure field names match (e.g., `isAvailable` vs `isAvaliable`)

---

## 📊 Verifying Seed Success

### Using MongoDB Compass
1. Open MongoDB Compass
2. Connect to your database
3. Check collections:
   - `users` should have 3 documents
   - `cars` should have 4 documents
   - `bookings` should have 4 documents

### Using Mongo Shell
```bash
mongosh

use your_database_name
db.users.countDocuments()    # Should return 3
db.cars.countDocuments()     # Should return 4
db.bookings.countDocuments() # Should return 4
```

---

## 🔄 Re-seeding

To re-seed the database (clear and repopulate):
```bash
npm run seed
```

This is safe to run multiple times - it always clears before inserting.

---

## 🎯 Quick Test Flow

After seeding, test the complete flow:

1. **Start your server:**
   ```bash
   npm run server
   ```

2. **Start your frontend:**
   ```bash
   cd ../client
   npm run dev
   ```

3. **Test the application:**
   - Login with `admin@example.com / admin123`
   - Browse cars (should see 4 cars)
   - View car details
   - Create a booking
   - Check "My Bookings" (should see previous bookings)
   - Go to Dashboard (should see stats)
   - Add a new car
   - Manage existing cars

---

## 📝 Notes

- All seeded data is for **development/testing only**
- Profile images use Unsplash placeholder URLs
- Car images use generic car photos from Unsplash
- Booking dates are set in the future (June 2025)
- All cars are marked as "approved" and "available"

---

## 🎨 Customizing Images

To use your actual car images, replace the Unsplash URLs with:
- Your uploaded image URLs (from ImageKit or similar)
- Local image paths (if serving static files)
- Your own image CDN URLs

---

## ✅ Success Checklist

After running the seed script, verify:
- [ ] Script completed without errors
- [ ] Can login with test credentials
- [ ] Frontend shows 4 cars
- [ ] Can view car details
- [ ] Bookings appear in "My Bookings"
- [ ] Owner dashboard shows statistics
- [ ] Can add new cars as owner

---

**Happy Testing! 🚗✨**
