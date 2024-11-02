const prisma = require("../configs/prisma")
const createError = require("../utility/createError")
const cloudinary = require("../configs/cloudinary")
const fs = require("fs")
const path = require("path")

exports.getAllReviews = async (req, res, next) => {
    const {page,limit} = req.input
    const skip = (page - 1) * limit
    try {
        const reviews = await prisma.review.findMany({
            skip,
            take:limit,
            include: {
                user: true,
                hotel: true,
                booking: true
            }
        })
        const totalReviews = await prisma.review.count()
        res.json({
            total: totalReviews,
            page,
            limit,
            data: reviews
        })
        
    } catch (error) {
        next(error)
        
    }
}

exports.createReview = async (req, res, next) => {
    const {content,bookingId,hotelId,rating} = req.input
    const userId = Number(req.user.id)

    if(!userId){
        throw createError(404, "User not found")
    }

    let uploadedImg = null

    if (req.file) {
        const uploadedFile = await cloudinary.uploader.upload(req.file.path, {
            overwrite: true,
            public_id: path.parse(req.file.path).name
        })
        uploadedImg = uploadedFile.secure_url
        fs.unlinkSync(req.file.path)
    }

    try {
        const newReview = await prisma.review.create({
            data: {
                content,
                bookingId,
                hotelId,
                rating,
                img: uploadedImg,
                userId
            }
        })
        res.json(newReview)
        
    } catch (error) {
        next(error)
    }
}
exports.editReview = async (req, res, next) => {
    const {reviewId} = req.params
    const {content,rating} = req.input
    try {
        const review = await prisma.review.findUnique({
            where: {
                id: Number(reviewId)
            }
        })
        if(!review){
            throw createError(404, "Review not found")
        }
        const updatedReview = await prisma.review.update({
            where: {
                id: Number(reviewId)
            },
            data: {
                content,
                rating,
            }
        })
        res.json(updatedReview)
        
    } catch (error) {
        next(error)
    }
}
exports.deleteReview = async (req, res, next) => {
    const {reviewId} = req.params
    const userId = req.user ? req.user.id : null
    try {
        const review = await prisma.review.findUnique({
            where: {
                id: Number(reviewId)
            },
            include:{
                user: true
            }
        })
        if(!review){
            throw createError(404, "Review not found")
        }
        const userRole = req.user ? req.user.role : null
        if (userRole === "ADMIN"){
            const deletedReview = await prisma.review.delete({
                where: {
                    id: Number(reviewId)
                }
            })
            res.json(deletedReview)
        } else if (userRole === "USER"){
            if (review.user.id !== userId){
                return createError(403, "You can only delete your own reviews")
            }
            const deletedReview = await prisma.review.delete({
                where: {
                    id: Number(reviewId)
                }
            })
            res.json(deletedReview)
        } else {
            return createError(401, "Unauthorized")
        }
        
    } catch (error) {
        next(error)
    }
}