const express = require("express")
const router = express.Router()
const bookingRoute = require("../controllers/booking-controller")


router.get('/',bookingRoute.getAllBookings)
router.get('/:UUID',bookingRoute.getBookingByUUID) 
router.post('/',bookingRoute.createBooking) 




module.exports = router