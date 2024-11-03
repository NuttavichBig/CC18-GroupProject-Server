const express = require("express")
const router = express.Router()
const {adminGetUserQueryValidator,adminUpdateUserValidator,
    adminGetPartnerQueryValidator,adminUpdatePartnerValidator,
    adminCreatePromotionValidator,adminUpdatePromotionValidator,
    adminUpdateBookingValidator} = require("../middlewares/validator")
const adminController = require("../controllers/admin-controller")
const upload = require("../middlewares/upload")

// user
router.get('/user',adminGetUserQueryValidator,adminController.getAllUsers) // query
router.patch('/user/:userId',adminUpdateUserValidator,adminController.updateUser)
router.delete('/user/:userId',adminController.deleteUser)

//partner
router.get('/partner',adminGetPartnerQueryValidator,adminController.getAllPartners) // query
router.patch('/partner/:partnerId',adminUpdatePartnerValidator,adminController.updatePartnerStatus)

// promotion
router.post('/promotion',upload.single('img'),adminCreatePromotionValidator,adminController.createPromotion)
router.patch('/promotion/:promotionId',upload.single('img'),adminUpdatePromotionValidator,adminController.updatePromotion)
router.delete('/promotion/:promotionId',adminController.deletePromotion)

// booking
router.patch('/booking/:bookingId',adminUpdateBookingValidator,adminController.updateBookingStatus)


module.exports = router