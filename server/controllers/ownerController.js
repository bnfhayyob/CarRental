import imagekit from "../configs/imageKit.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import fs from "fs";
import mongoose from "mongoose";

//API to change the role user
export const changeRoleOwner = async (req, res) => {
  try {
    const { _id, role } = req.user;

    // Check if already owner or admin
    if (role === "owner") {
      return res.status(400).json({ success: false, message: "You are already an owner" });
    }

    if (role === "admin") {
      return res.status(400).json({ success: false, message: "Admins cannot become owners" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { role: "owner" },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Now you can list cars!",
      user: updatedUser
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

//API to list car

export const addCar = async (req, res) => {
  try {
    const { _id, role } = req.user;

    console.log('Add Car - User ID:', _id, 'Role:', role);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    // Verify user has owner role
    if (role !== "owner" && role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only owners can add cars"
      });
    }

    // Validate image file
    if (!req.file) {
      console.log('Error: No image file provided');
      return res.status(400).json({
        success: false,
        message: "Car image is required"
      });
    }

    let car;
    try {
      car = JSON.parse(req.body.carData);
      console.log('Parsed car data:', car);
    } catch (parseError) {
      console.log('Error parsing car data:', parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid car data format"
      });
    }

    const imageFile = req.file;

    try {
      //upload image to imageKit
      const fileBuffer = fs.readFileSync(imageFile.path);
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: imageFile.originalname,
        folder: "/cars",
      });

      // For URL Generation, works for both images and videos
      const optimazedImageUrl = imagekit.url({
        path: response.filePath,
        transformation: [
          { width: "1280" },
          { quality: "auto" },
          { format: "webp" }
        ],
      });

      const image = optimazedImageUrl;

      // Create car with isApproved false by default (requires admin approval)
      const newCar = await Car.create({
        ...car,
        owner: _id,
        image,
        isApproved: false
      });

      // Clean up uploaded file
      if (imageFile.path) {
        fs.unlinkSync(imageFile.path);
      }

      res.status(201).json({
        success: true,
        message: "Car added successfully. Waiting for admin approval",
        car: newCar
      });
    } catch (uploadError) {
      // Clean up file on error
      if (imageFile.path) {
        fs.unlinkSync(imageFile.path);
      }
      throw uploadError;
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get owner dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const { _id } = req.user;

    console.log('Dashboard Stats - Owner ID:', _id);

    // Get total cars in the database (all cars, not just owner's)
    const totalCars = await Car.countDocuments();
    console.log('Total cars found:', totalCars);

    // Get all bookings in the database
    const allBookings = await Booking.find();
    const totalBookings = allBookings.length;
    console.log('Total bookings found:', totalBookings);

    // Count bookings by status (all bookings)
    const pendingBookings = await Booking.countDocuments({
      status: 'pending'
    });

    const confirmedBookings = await Booking.countDocuments({
      status: { $in: ['confirmed', 'active'] }
    });

    const completedBookings = await Booking.countDocuments({
      status: 'completed'
    });

    // Calculate monthly revenue (from all completed bookings)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: currentMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Get recent bookings (last 5 from all bookings)
    const recentBookings = await Booking.find()
      .populate('car', 'brand model image')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get all cars in the database
    const allCars = await Car.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    console.log('All cars count:', allCars.length);
    console.log('Dashboard stats prepared successfully');

    res.status(200).json({
      success: true,
      data: {
        totalCars,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0,
        recentBookings,
        allCars
      }
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
