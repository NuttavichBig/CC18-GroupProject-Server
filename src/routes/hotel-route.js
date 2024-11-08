const express = require("express")
const router = express.Router()
const hotelController = require("../controllers/hotel-controller")
const authenticate = require("../middlewares/authenticate")
const checkRole = require("../middlewares/checkRole")
const upload = require("../middlewares/upload")
const queryArrayMaker =require("../middlewares/queryArrayMaker")
const {getHotelQueryValidator,createHotelValidator,updateHotelValidator} = require("../middlewares/validator")


router.get('/',getHotelQueryValidator,hotelController.getHotels) // query
router.get('/:hotelId',hotelController.getHotelById)
router.post('/',authenticate,upload.single("img"),createHotelValidator,hotelController.createHotel) // authen
router.patch('/:hotelId',authenticate,checkRole.partnerCheck,upload.single("img"),updateHotelValidator,hotelController.updateHotel) // authen
router.delete('/:hotelId',authenticate,checkRole.partnerCheck,hotelController.deleteHotel) // authen



module.exports = router
