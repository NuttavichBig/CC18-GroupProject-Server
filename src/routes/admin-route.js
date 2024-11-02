const express = require("express")
const router = express.Router()
const {adminGetUserQueryValidator,adminUpdateUserValidator,
    adminGetPartnerQueryValidator,adminUpdatePartnerValidator,
    adminCreatePromotion,adminUpdatePromotion,
    adminUpdateBookingValidator} = require("../middlewares/validator")
const adminController = require("../controllers/admin-controller")

// user
router.get('/user',adminGetUserQueryValidator,adminController.getAllUsers) // query
router.patch('/user/:userId',adminUpdateUserValidator,adminController.updateUser)
router.delete('/user/:userId',adminController.deleteUser)

//partner
router.get('/partner',adminGetPartnerQueryValidator,adminController.getAllPartners) // query
router.patch('/partner/:partnerId',adminUpdatePartnerValidator,adminController.updatePartnerStatus)

// promotion
router.post('/promotion',adminCreatePromotion,adminController.createPromotion)
router.patch('/promotion/:promotionId',adminUpdatePromotion,adminController.updatePromotion)
router.delete('/promotion/:promotionId',adminController.deletePromotion)

// booking
router.patch('/booking/:bookingId',adminUpdateBookingValidator,adminController.updateBookingStatus)


module.exports = router