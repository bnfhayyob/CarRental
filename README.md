# 🚗 Car Rental Platform

A full-stack car rental management system built with React, Node.js, Express, and MongoDB. This platform allows users to browse and book cars, while owners can list and manage their vehicles.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Database Seeding](#database-seeding)
- [Screenshots](#screenshots)
- [Contributing](#contributing)

## ✨ Features

### For Users
- 🔍 Browse and search available cars
- 📅 Book cars for specific dates
- 💳 View booking history
- 🔐 Secure authentication with JWT
- 📱 Responsive design for mobile and desktop

### For Owners
- 🚙 List cars for rental
- 📊 Dashboard with statistics (total cars, bookings, revenue)
- 🔄 Toggle car availability
- ✏️ Update and delete car listings
- 👀 View all bookings
- 📈 Track monthly revenue

### For Admins
- ✅ Approve car listings
- 👥 Manage users
- 📊 System-wide analytics
- 🛠️ Full CRUD operations on all resources

## 🛠️ Tech Stack

### Frontend
- **React** 18+ - UI library
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **ImageKit** - Image hosting and optimization
- **Multer** - File upload handling

## 📁 Project Structure

```
CarRental/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── api/           # API service layer
│   │   ├── assets/        # Static assets
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   │   ├── owner/     # Owner dashboard pages
│   │   │   └── user/      # User pages
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Backend Node.js application
│   ├── configs/          # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── seedDatabase.js   # Database seeding script
│   ├── checkDatabase.js  # Database verification script
│   ├── server.js         # Entry point
│   └── package.json
│
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- ImageKit account (for image uploads)

### Clone the Repository
```bash
git clone <your-repo-url>
cd CarRental
```

### Install Dependencies

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd client
npm install
```

## 🔐 Environment Variables

### Server (.env in `/server`)
Create a `.env` file in the `server` directory:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net

# JWT
JWT_SECRET=your_jwt_secret_key_here

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

# Server
PORT=3000
```

### Client (.env in `/client`)
Create a `.env` file in the `client` directory:

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_CURRENCY=$
```

## 🏃 Running the Application

### Development Mode

#### Start Backend Server
```bash
cd server
npm run server    # Uses nodemon for auto-reload
# or
npm start         # Regular node
```

#### Start Frontend
```bash
cd client
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

### Production Build

#### Build Frontend
```bash
cd client
npm run build
```

#### Run Backend
```bash
cd server
npm start
```

## 🗄️ Database Seeding

To populate the database with sample data:

```bash
cd server
npm run seed
```

This will create:
- 3 users (admin, owner, regular user)
- 4 sample cars
- 4 sample bookings

### Test Credentials
After seeding, you can login with:

**Admin/Owner:**
- Email: admin@example.com
- Password: admin123

**Owner:**
- Email: owner@example.com
- Password: owner123

**User:**
- Email: user@example.com
- Password: user123

### Verify Database
To check what's in your database:

```bash
cd server
node checkDatabase.js
```

## 📡 API Documentation

### Authentication Endpoints
```
POST   /api/user/register          - Register new user
POST   /api/user/login             - User login
GET    /api/user/data              - Get user data (protected)
```

### Car Endpoints
```
GET    /api/cars/                  - Get all cars (public)
GET    /api/cars/search            - Search cars
GET    /api/cars/find-available    - Find available cars by location/date
GET    /api/cars/:id               - Get car by ID
GET    /api/cars/owner/my-cars     - Get all cars (owner)
POST   /api/owner/add-car          - Add new car (owner)
PATCH  /api/cars/:id               - Update car (owner/admin)
PATCH  /api/cars/:id/toggle-availability - Toggle car availability
DELETE /api/cars/:id               - Delete car (owner/admin)
```

### Booking Endpoints
```
POST   /api/booking/create         - Create booking
GET    /api/booking/my-bookings    - Get user bookings
GET    /api/booking/owner-bookings - Get owner bookings
PATCH  /api/booking/:id/status     - Update booking status
DELETE /api/booking/:id            - Cancel booking
```

### Owner Endpoints
```
POST   /api/owner/change-role      - Change user role to owner
GET    /api/owner/dashboard-stats  - Get dashboard statistics
```

## 👥 User Roles

### User (Default)
- Browse and search cars
- Create bookings
- View their own bookings
- Update profile

### Owner
- All user permissions
- Add, update, delete cars
- View dashboard with statistics
- Manage bookings for their cars
- View revenue analytics

### Admin
- All owner permissions
- Approve/reject car listings
- Manage all users
- System-wide analytics

## 📸 Screenshots

### Home Page
Browse available cars with filters and search functionality.

### Car Details
View detailed information about each car including features, pricing, and availability.

### Owner Dashboard
- Total cars, bookings, and revenue statistics
- Recent bookings overview
- Monthly revenue tracking
- Grid view of all cars in the database

### Manage Cars
- List of all cars with owner information
- Toggle availability
- Edit and delete options
- Approval status indicators

## 🔧 Common Issues & Solutions

### Issue: Cars not showing in dashboard
**Solution:** Restart the server after making changes to database queries.

### Issue: 404 on toggle availability
**Solution:** Ensure server is running the latest code with the toggle-availability route.

### Issue: Image upload fails
**Solution:** Check ImageKit credentials in `.env` file.

### Issue: CORS errors
**Solution:** Ensure VITE_BACKEND_URL is correctly set in client `.env`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Your Name - [Your Email/GitHub]

## 🙏 Acknowledgments

- ImageKit for image optimization
- MongoDB for database
- All contributors and testers

---

**Note:** This is a learning/portfolio project. For production use, consider adding:
- Payment integration (Stripe, PayPal)
- Email notifications
- More robust error handling
- Rate limiting
- Input sanitization
- Advanced search filters
- Car reviews and ratings
- Multi-language support
