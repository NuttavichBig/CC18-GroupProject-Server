const express = require("express")
const router = express.Router()
const reviewController = require("../controllers/review-controller")
const {getReviewQueryValidator,createReviewValidator,updateReviewValidator} = require("../middlewares/validator")
const authenticate = require("../middlewares/authenticate")
const checkRole = require("../middlewares/checkRole")
const upload = require("../middlewares/upload")


router.get('/',getReviewQueryValidator,reviewController.getAllReviews) // query
router.post('/',authenticate,checkRole.userCheck,upload.single("img"),createReviewValidator,reviewController.createReview) // authen
router.patch('/:reviewId',authenticate,checkRole.userCheck,updateReviewValidator,reviewController.editReview) // authen
router.delete('/:reviewId',authenticate,checkRole.userCheck,reviewController.deleteReview) // authen

module.exports = router