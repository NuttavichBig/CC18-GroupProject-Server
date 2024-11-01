const checkPromotionByCode = async (code) => {
    const existingPromotion = await prisma.promotion.findFirst({
        where: {
            code
        }
    })
    return existingPromotion
}

module.exports = checkPromotionByCode