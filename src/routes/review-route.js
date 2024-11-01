const express = require("express")
const router = express.Router()
const reviewController = require("../controllers/review-controller")


router.get('/',reviewController.getAllReviews) // query
router.post('/',reviewController.createReview) // authen
router.patch('/:reviewId',reviewController.editReview) // authen
router.delete('/:reviewId',reviewController.deleteReview) // authen

module.exports = router