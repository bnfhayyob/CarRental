import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import User from './models/User.js'
import Car from './models/Car.js'
import Booking from './models/Booking.js'

dotenv.config()

// Sample data based on your assets file
const seedData = {
  users: [
    {
      _id: new mongoose.Types.ObjectId("6847f7cab3d8daecdb517095"),
      name: "Ayyoub",
      email: "admin@example.com",
      password: "admin123", // Will be hashed
      role: "owner",
      image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=300"
    },
    {
      _id: new mongoose.Types.ObjectId("67fe3467ed8a8fe17d0ba6e2"),
      name: "John Doe",
      email: "owner@example.com",
      password: "owner123", // Will be hashed
      role: "owner",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300"
    },
    {
      _id: new mongoose.Types.ObjectId("67fe3467ed8a8fe17d0ba6e3"),
      name: "Jane Smith",
      email: "user@example.com",
      password: "user123", // Will be hashed
      role: "user",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300"
    }
  ],

  cars: [
    {
      _id: new mongoose.Types.ObjectId("67ff5bc069c03d4e45f30b77"),
      owner: new mongoose.Types.ObjectId("67fe3467ed8a8fe17d0ba6e2"),
      brand: "BMW",
      model: "X5",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800",
      year: 2006,
      category: "SUV",
      seating_capacity: 4,
      fuel_type: "Hybrid",
      transmission: "Semi-Automatic",
      pricePerDay: 300,
      location: "New York",
      description: "The BMW X5 is a mid-size luxury SUV produced by BMW. The X5 made its debut in 1999 as the first SUV ever produced by BMW.",
      isAvailable: true,
      isApproved: true,
      features: ["360 Camera", "Bluetooth", "GPS", "Heated Seats", "Rear View Mirror"]
    },
    {
      _id: new mongoose.Types.ObjectId("67ff6b758f1b3684286a2a65"),
      owner: new mongoose.Types.ObjectId("67fe3467ed8a8fe17d0ba6e2"),
      brand: "Toyota",
      model: "Corolla",
      image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=800",
      year: 2021,
      category: "Sedan",
      seating_capacity: 4,
      fuel_type: "Diesel",
      transmission: "Manual",
      pricePerDay: 130,
      location: "Chicago",
      description: "The Toyota Corolla is a mid-size luxury sedan produced by Toyota. The Corolla made its debut in 2008 as the first sedan ever produced by Toyota.",
      isAvailable: true,
      isApproved: true,
      features: ["Bluetooth", "GPS", "Rear View Mirror"]
    },
    {
      _id: new mongoose.Types.ObjectId("67ff6b9f8f1b3684286a2a68"),
      owner: new mongoose.Types.ObjectId("67fe3467ed8a8fe17d0ba6e2"),
      brand: "Jeep",
      model: "Wrangler",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800",
      year: 2023,
      category: "SUV",
      seating_capacity: 4,
      fuel_type: "Hybrid",
      transmission: "Automatic",
      pricePerDay: 200,
      location: "Los Angeles",
      description: "The Jeep Wrangler is a mid-size luxury SUV produced by Jeep. The Wrangler made its debut in 2003 as the first SUV ever produced by Jeep.",
      isAvailable: true,
      isApproved: true,
      features: ["360 Camera", "GPS", "Heated Seats"]
    },
    {
      _id: new mongoose.Types.ObjectId("68009c93a3f5fc6338ea7e34"),
      owner: new mongoose.Types.ObjectId("67fe3467ed8a8fe17d0ba6e2"),
      brand: "Ford",
      model: "Neo 6",
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800",
      year: 2022,
      category: "Sedan",
      seating_capacity: 2,
      fuel_type: "Diesel",
      transmission: "Semi-Automatic",
      pricePerDay: 209,
      location: "Houston",
      description: "This is a mid-size luxury sedan produced by Toyota. The Corolla made its debut in 2008 as the first sedan ever produced by Toyota.",
      isAvailable: true,
      isApproved: true,
      features: ["Bluetooth", "GPS", "Rear View Mirror"]
    }
  ],

  bookings: [
    {
      _id: new mongoose.Types.ObjectId("68482bcc98eb9722b7751f70"),
      car: new mongoose.Types.ObjectId("67ff5bc069c03d4e45f30b77"),
      user: new mongoose.Types.ObjectId("6847f7cab3d8daecdb517095"),
      owner: new mongoose.Types.ObjectId("6847f7cab3d8daecdb517095"),
      startDate: new Date("2025-06-13T00:00:00.000Z"),
      endDate: new Date("2025-06-14T00:00:00.000Z"),
      totalDays: 1,
      pricePerDay: 300,
      totalAmount: 440,
      status: "confirmed",
      paymentStatus: "pending",
      paymentMethod: "cash",
      pickupLocation: "New York"
    },
    {
      _id: new mongoose.Types.ObjectId("68482bb598eb9722b7751f60"),
      car: new mongoose.Types.ObjectId("67ff6b758f1b3684286a2a65"),
      user: new mongoose.Types.ObjectId("6847f7cab3d8daecdb517095"),
      owner: new mongoose.Types.ObjectId("67fe3467ed8a8fe17d0ba6e2"),
      startDate: new Date("2025-06-12T00:00:00.000Z"),
      endDate: new Date("2025-06-12T00:00:00.000Z"),
      totalDays: 1,
      pricePerDay: 130,
      totalAmount: 130,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: "cash",
      pickupLocation: "Chicago"
    },
    {
      _id: new mongoose.Types.ObjectId("684800fa0fb481c5cfd92e56"),
      car: new mongoose.Types.ObjectId("67ff6b9f8f1b3684286a2a68"),
      user: new mongoose.Types.ObjectId("6847f7cab3d8daecdb517095"),
      owner: new mongoose.Types.ObjectId("67fe3467ed8a8fe17d0ba6e2"),
      startDate: new Date("2025-06-11T00:00:00.000Z"),
      endDate: new Date("2025-06-12T00:00:00.000Z"),
      totalDays: 1,
      pricePerDay: 200,
      totalAmount: 600,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: "cash",
      pickupLocation: "Los Angeles"
    },
    {
      _id: new mongoose.Types.ObjectId("6847fe790fb481c5cfd92d94"),
      car: new mongoose.Types.ObjectId("68009c93a3f5fc6338ea7e34"),
      user: new mongoose.Types.ObjectId("6847f7cab3d8daecdb517095"),
      owner: new mongoose.Types.ObjectId("6847f7cab3d8daecdb517095"),
      startDate: new Date("2025-06-11T00:00:00.000Z"),
      endDate: new Date("2025-06-12T00:00:00.000Z"),
      totalDays: 1,
      pricePerDay: 209,
      totalAmount: 440,
      status: "confirmed",
      paymentStatus: "pending",
      paymentMethod: "cash",
      pickupLocation: "Houston"
    }
  ]
}

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(`${process.env.MONGODB_URI}/car-rental`)
    console.log('✅ Connected to MongoDB (car-rental database)')

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...')
    await User.deleteMany({})
    await Car.deleteMany({})
    await Booking.deleteMany({})
    console.log('✅ Existing data cleared')

    // Hash passwords for users
    console.log('\n🔐 Hashing passwords...')
    const usersWithHashedPasswords = await Promise.all(
      seedData.users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10)
        return { ...user, password: hashedPassword }
      })
    )

    // Insert users
    console.log('\n👥 Inserting users...')
    const insertedUsers = await User.insertMany(usersWithHashedPasswords)
    console.log(`✅ Inserted ${insertedUsers.length} users:`)
    insertedUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`)
    })

    // Insert cars
    console.log('\n🚗 Inserting cars...')
    const insertedCars = await Car.insertMany(seedData.cars)
    console.log(`✅ Inserted ${insertedCars.length} cars:`)
    insertedCars.forEach(car => {
      console.log(`   - ${car.brand} ${car.model} ($${car.pricePerDay}/day)`)
    })

    // Insert bookings
    console.log('\n📅 Inserting bookings...')
    const insertedBookings = await Booking.insertMany(seedData.bookings)
    console.log(`✅ Inserted ${insertedBookings.length} bookings:`)
    insertedBookings.forEach(booking => {
      console.log(`   - Booking ${booking._id} - Status: ${booking.status}`)
    })

    console.log('\n✨ Database seeded successfully!')
    console.log('\n📊 Summary:')
    console.log(`   Users: ${insertedUsers.length}`)
    console.log(`   Cars: ${insertedCars.length}`)
    console.log(`   Bookings: ${insertedBookings.length}`)

    console.log('\n🔑 Test Credentials:')
    console.log('   Admin/Owner: admin@example.com / admin123')
    console.log('   Owner: owner@example.com / owner123')
    console.log('   User: user@example.com / user123')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run the seed function
seedDatabase()
