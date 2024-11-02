const express = require("express")
const router = express.Router()
const bookingRoute = require("../controllers/booking-controller")
const {getBookingQueryValidator,createBookingValidator} = require("../middlewares/validator")
const authenticate = require("../middlewares/authenticate")


router.get('/',getBookingQueryValidator,bookingRoute.getAllBookings)
router.get('/:UUID',bookingRoute.getBookingByUUID) 
router.post('/',createBookingValidator,bookingRoute.createBooking) 


module.exports = router