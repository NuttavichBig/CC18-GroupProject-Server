
const prisma = require("../configs/prisma")
const checkPromotionByCode = require("../services/check-promotion-by-code")
const createError = require("../utility/createError") 
const generatePromotionCode = require("../utility/generatePromotionCode")

//user
exports.getAllUsers = async (req, res, next) => {
    try {
        const {search,limit,page,orderBy,sortBy,role,status} = req.input
        // make condition variable
        const condition = {
            take : limit,
            skip : (page-1)*limit,
            orderBy : {[sortBy] : orderBy}
        }
        
        // check search
        if(search){
            condition.where = {
                OR : [
                    {email : {contains : search}},
                    {firstName : {contains : search}},
                    {lastName : {contains : search}},
                    {phone : {contains : search}}
                ]
            }
        }

        // check have other query?
        if(role){
            condition.where = { ...condition.where,role}
        }
        if(status){
            condition.where = { ...condition.where,status}
        }
        const users = await prisma.user.findMany(condition)
        res.json(users)   
    } catch (error) {
        next(error)
    }
}
exports.updateUser = async (req, res, next) => {
    const { userId } = req.params
    const { role } = req.input
    try {
        const updateUser = await prisma.user.update({
            where: {
                id: Number(userId)
            },
            data: {
                role
            }
        })
        const {resetPasswordToken,password,...user} = updateUser
        res.json({message : "update completed",user})
    } catch (error) {
        next(error)
    }
}
exports.deleteUser = async (req, res, next) => {
    const { userId } = req.params
    try {
        const deletedUser = await prisma.user.update({
            where: {
                id: Number(userId)
            },
            data :{
                status : 'BANNED'
            }
        })
        const {resetPasswordToken,password,...user} = deletedUser
        res.json({message : "User has been terminate" ,user})
    } catch (error) {
        next(error)
    }
}

//partner
exports.getAllPartners = async(req,res,next)=>{
    try {
        const partners = await prisma.partner.findMany({})
        res.json(partners)
        
    } catch (error) {
        next(error)
    }

}
exports.updatePartnerStatus = async(req,res,next)=>{
    try {
        const {partnerId} = req.params
        const {status} = req.body
        const updatePartner = await prisma.partner.update({
            where: {
                id: Number(partnerId)
            },
            data: {
                status
            }
        })
        res.json(updatePartner)
        
    } catch (error) {
        next(error)
    }
}


exports.createPromotion = async (req, res, next) => {
    const {name,img,description,discountPercent,discountValue,minimumSpend,maxDiscount,usageLimit,userLimit,isActive,startDate,endDate} = req.body
    try {
        let newCode 
        do{
            newCode = generatePromotionCode()
        }while(!!(await checkPromotionByCode(newCode)))
        const newPromotion = await prisma.promotion.create({
            data: {
                name,
                img,
                description,
                discountPercent,
                discountValue,
                minimumSpend,
                maxDiscount,
                usageLimit,
                userLimit,
                isActive,
                startDate:new Date(startDate),
                endDate:new Date(endDate),
                code:newCode
            }
        })
        res.json(newPromotion)

    } catch (error) {
        next(error)
    }
}
exports.updatePromotion = async (req, res, next) => {
    const { promotionId } = req.params
    const {name,img,description,discountPercent,discountValue,minimumSpend,maxDiscount,usageLimit,userLimit,isActive,startDate,endDate} = req.body
    try {
        const updatePromotion = await prisma.promotion.update({
            where: {
                id: Number(promotionId)
            },
            data: {
                name,
                img,
                description,
                discountPercent,
                discountValue,
                minimumSpend,
                maxDiscount,
                usageLimit,
                userLimit,
                isActive,
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate && { endDate: new Date(endDate) })
            }
        })
        res.json(updatePromotion)
    } catch (error) {
        next(error)
    }
}
exports.deletePromotion = async (req, res, next) => {
    const { promotionId } = req.params
    try {
        const deletedPromotion = await prisma.promotion.delete({
            where: {
                id: Number(promotionId)
            }
        })
        res.json(deletedPromotion)
    } catch (error) {
        next(error)
    }
}

//booking
exports.updateBookingStatus = async (req, res, next) => {
    try {
        const { bookingId } = req.params
        const { status } = req.body
        const updateBooking = await prisma.booking.update({
            where: {
                id: Number(bookingId)
            },
            data: {
                status
            }
        })
        res.json(updateBooking)
        
    } catch (error) {
        next(error)
    }
}