const express = require("express")
const router = express.Router()
const adminController = require("../controllers/admin-controller")

// user
router.get('/user',adminController.getAllUsers) // query
router.patch('/user/:userId',adminController.updateUser) 
router.delete('/user/:userId',adminController.deleteUser) 

//partner
router.get('/partner',adminController.getAllPartners) // query
router.patch('/partner/:partnerId',adminController.updatePartnerStatus)

// promotion
router.post('/promotion',adminController.createPromotion)
router.patch('/promotion/:promotionId',adminController.updatePromotion)
router.delete('/promotion/:promotionId',adminController.deletePromotion)

// booking
router.patch('/booking/:bookingId',adminController.updateBookingStatus)


module.exports = router