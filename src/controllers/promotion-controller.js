const prisma = require("../configs/prisma");
const createError = require("../utility/createError");

exports.getAllPromotions = async (req, res, next) => {
    try {
        const promotions = await prisma.promotion.findMany()
        res.json(promotions)
        
    } catch (error) {
        next(error)
    }
}
exports.getPromotionById = async (req, res, next) => {
    const {promotionId} = req.params
    try{
        const promotion = await prisma.promotion.findUnique({
            where:{ id: Number(promotionId) },
        })
        if(!promotion){
            throw createError(404, "Promotion not found")
        }
        res.json(promotion)
    }catch(error){
        next(error)
    }
}
exports.userGetPromotions = async (req, res, next) => {
    const {promotionId} = req.body
    try {
        const currentDate = new Date()
        const promotion = await prisma.promotion.findFirst({
            where: {
                id:Number(promotionId),
                isActive: true,
                startDate: {
                    lte: currentDate,
                },
                endDate: {
                    gte: currentDate,
                },
            },
        })
        if(!promotion){
            throw createError(404, "Promotion not available")
        }
        res.json(promotion)
        
    } catch (error) {
        next(error)
    }
}