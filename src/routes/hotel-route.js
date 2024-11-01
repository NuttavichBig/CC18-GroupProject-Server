const express = require("express")
const router = express.Router()
const hotelController = require("../controllers/hotel-controller")


router.get('/',hotelController.getHotels) // query
router.get('/:hotelId',hotelController.getHotelById)
router.post('/',hotelController.createHotel) // authen
router.patch('/:hotelId',hotelController.updateHotel) // authen
router.delete('/:hotelId',hotelController.deleteHotel) // authen



module.exports = router
