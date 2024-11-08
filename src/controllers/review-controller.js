const prisma = require("../configs/prisma")
const createError = require("../utility/createError")
const cloudinary = require("../configs/cloudinary")
const fs = require("fs/promises")
const path = require("path")
const getPublicId = require("../utility/getPublicId")

exports.getAllReviews = async (req, res, next) => {
    const { page, limit } = req.input
    const skip = (page - 1) * limit
    try {
        const where = {}
        if(req.user.role !== 'ADMIN'){
            where.userId = req.user.id
        }
        console.log(where)
        const reviews = await prisma.review.findMany({
            where,
            skip,
            take: limit,
            include: {
                user: true,
                hotel: true,
                booking: true
            }
        })
        console.log(reviews)
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
    try {
        const { content, bookingId, rating } = req.input
        const userId = Number(req.user.id)

        // for bullying
        // if(!userId){
        //     throw createError(404, "User not found")
        // }

        // check for booking exist
        const booking = await prisma.booking.findUnique({
            where: {
                id: bookingId
            }
        })
        if (!booking) {
            return createError(404, "This booking does not exist")
        }
        if (booking.status !== "CONFIRMED") {
            return createError(400, "Your booking are not completed")
        }
        const hotelId = booking.hotelId

        // check already review
        const review = await prisma.review.findUnique({
            where: {
                bookingId
            }
        })
        if (review) {
            return createError(400, "You already review with this booking")
        }

        // image handle
        let uploadedImg = null

        if (req.file) {
            const uploadedFile = await cloudinary.uploader.upload(req.file.path, {
                overwrite: true,
                public_id: path.parse(req.file.path).name
            })
            uploadedImg = uploadedFile.secure_url
            fs.unlink(req.file.path)
        }

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
        res.json({message : "create complete" , review : newReview})

    } catch (error) {
        next(error)
    }
}
exports.editReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params

        // check permit
        const review = await prisma.review.findUnique({
            where: {
                id: Number(reviewId)
            }
        })
        if (!review) {
            throw createError(404, "Review not found")
        }
        if (review.userId !== req.user.id) {
            return createError(401, "You are not permitted")
        }

        // image handle
        if(req.input.deleteImg){
            if (review.img) {
                cloudinary.uploader.destroy(getPublicId(review.img))
            }
            req.input.img = null
        }
        if (req.file) {
            const uploadedFile = await cloudinary.uploader.upload(req.file.path, {
                overwrite: true,
                public_id: path.parse(req.file.path).name
            })
            req.input.img = uploadedFile.secure_url
            fs.unlink(req.file.path)
            if (review.img) {
                cloudinary.uploader.destroy(getPublicId(review.img))
            }
        }

        const {deleteImg,...data} = req.input
        const updatedReview = await prisma.review.update({
            where: {
                id: Number(reviewId)
            },
            data: data
            ,include : {
                hotel : true
            }
        })
        res.json({message : "update success" , review : updatedReview})

    } catch (error) {
        console.log(error)
        next(error)
    }
}
exports.deleteReview = async (req, res, next) => {
    const { reviewId } = req.params
    const userId = req.user ? req.user.id : null
    try {
        const review = await prisma.review.findUnique({
            where: {
                id: Number(reviewId)
            },
        })
        if (!review) {
            throw createError(404, "Review not found")
        }
        const userRole = req.user ? req.user.role : null
        if (userRole !== "ADMIN") {
            // const deletedReview = await prisma.review.delete({
            //     where: {
            //         id: Number(reviewId)
            //     }
            // })
            // res.json(deletedReview)
            if (review.userId !== userId) {
                return createError(403, "You can only delete your own reviews")
            }
        }
        if(review.img){
            cloudinary.uploader.destroy(getPublicId(review.img))
        }
        const deletedReview = await prisma.review.delete({
            where: {
                id: Number(reviewId)
            }
        })
        res.json({message : "delete complete" , review :deletedReview})


    } catch (error) {
        console.log(error)
        next(error)
    }
}