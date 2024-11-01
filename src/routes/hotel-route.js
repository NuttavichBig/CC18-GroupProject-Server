const express = require("express")
const router = express.Router()
const hotelController = require("../controllers/hotel-controller")
const authenticate = require("../middlewares/authenticate")
const checkRole = require("../middlewares/checkRole")
const upload = require("../middlewares/upload")


router.get('/',hotelController.getHotels) // query
router.get('/:hotelId',hotelController.getHotelById)
router.post('/',authenticate,checkRole.partnerCheck,upload.single("img"),hotelController.createHotel) // authen
router.patch('/:hotelId',authenticate,checkRole.partnerCheck,upload.single("img"),hotelController.updateHotel) // authen
router.delete('/:hotelId',authenticate,checkRole.partnerCheck,hotelController.deleteHotel) // authen



module.exports = router
