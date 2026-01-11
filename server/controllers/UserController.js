import User from "../models/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

//Generate JWT Token

const generateToken = (userId) =>{
    const payload = userId
    return jwt.sign(payload, process.env.JWT_SECRET)
}

//Register User
export const registerUser = async (req,res) => {
    try {
        const {name,email,password} = req.body

        if(!name || !email || !password || password.length < 8){
            return res.status(400).json({success:false, message:'Fill all the fields!'})
        }

        const userExists = await User.findOne({email})

        if(userExists){
            return res.status(409).json({success:false, message:'User already exists!'})
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await User.create({name,email,password:hashedPassword})

        const token = generateToken(newUser._id.toString())

        // Return user without password
        const userResponse = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            image: newUser.image,
            phone: newUser.phone,
            address: newUser.address
        }

        res.status(201).json({success:true, token, user: userResponse})

    } catch (error) {
        console.log(error.message)
        res.status(500).json({success:false, message:error.message})
    }
}

//Login User
export const loginUser = async (req,res) => {
    try {
        const {email,password} = req.body
        const user = await User.findOne({email})

        if(!user){
            return res.status(404).json({success:false, message:'User not found!'})
        }
        const isMath = await bcrypt.compare(password, user.password)

        if(!isMath){
            return res.status(401).json({success:false, message:'Invalid credentials!'})
        }

        const token = generateToken(user._id.toString())

        // Return user without password
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
            phone: user.phone,
            address: user.address
        }

        res.status(200).json({success:true, token, user: userResponse})
    } catch (error) {
        console.log(error.message)
        res.status(500).json({success:false, message:error.message})
    }
}

//Get USer data using Token (JWT)

export const getUserData = async (req,res) => {
    try {
        const {user} = req
        res.status(200).json({success:true,user})
    } catch (error) {
        console.log(error.message)
        res.status(500).json({success:false, message:error.message})
    }
}