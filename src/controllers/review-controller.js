const prisma = require("../configs/prisma")
const createError = require("../utility/createError")

exports.getAllReviews = async (req, res, next) => {
    const {page = 1, limit = 10} = req.query
    const skip = (page - 1) * limit
    try {
        const reviews = await prisma.review.findMany({
            skip: Number(skip),
            take: Number(limit),
            include: {
                user: true,
                hotel: true,
                booking: true
            }
        })
        const totalReviews = await prisma.review.count()
        res.json({
            total: totalReviews,
            page: Number(page),
            limit: Number(limit),
            data: reviews
        })
        
    } catch (error) {
        next(error)
        
    }
}

exports.createReview = async (req, res, next) => {
    const {content,bookingId,hotelId,rating,img} = req.body
    try {
        const newReview = await prisma.review.create({
            data: {
                content,
                bookingId,
                hotelId,
                rating,
                img,
                // userId: req.userId
            }
        })
        res.json(newReview)
        
    } catch (error) {
        next(error)
    }
}


exports.editReview = async (req, res, next) => {
    const {reviewId} = req.params
    const {content,rating} = req.body

    try {
        const review = await prisma.review.findUnique({
            where: {
                id: Number(reviewId)
            }
        })
        if(!review){
            throw createError(404, "Review not found")
        }
        // if(review.userId !== req.userId){
        //     throw createError(403, "You are not allowed to edit this review")
        // }
        const updatedReview = await prisma.review.update({
            where: {
                id: Number(reviewId)
            },
            data: {
                content,
                rating
            }
        })
        res.json(updatedReview)
        
    } catch (error) {
        next(error)
    }
}
exports.deleteReview = async (req, res, next) => {
    const {reviewId} = req.params
    try {
        const review = await prisma.review.findUnique({
            where: {
                id: Number(reviewId)
            }
        })
        if(!review){
            throw createError(404, "Review not found")
        }
        // if(review.userId !== req.userId){
        //     throw createError(403, "You are not allowed to delete this review")
        // }
        const deletedReview = await prisma.review.delete({
            where: {
                id: Number(reviewId)
            }
        })
        res.json(deletedReview)
        
    } catch (error) {
        next(error)
    }
}