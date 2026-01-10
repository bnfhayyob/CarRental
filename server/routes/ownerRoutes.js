import express from "express"
import { protect } from "../middleware/auth.js"
import { addCar, changeRoleOwner } from "../controllers/ownerController.js"
import upload from "../middleware/multer.js"

const ownerRouter = express.Router()

ownerRouter.post("/change-role",protect,changeRoleOwner)
ownerRouter.post("/add-car",protect,upload.single("image"),addCar)

export default ownerRouter