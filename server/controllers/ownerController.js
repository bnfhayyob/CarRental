import imagekit from "../configs/imageKit.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import fs from "fs";

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

    // Verify user has owner role
    if (role !== "owner" && role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only owners can add cars"
      });
    }

    // Validate image file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Car image is required"
      });
    }

    let car;
    try {
      car = JSON.parse(req.body.carData);
    } catch (parseError) {
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
