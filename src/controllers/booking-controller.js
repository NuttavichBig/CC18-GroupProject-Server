const prisma = require("../configs/prisma")
const createError = require("../utility/createError")

exports.getAllBookings = async (req, res, next) => {
    const { search, page = 1, limit = 10, orderBy = 'createdAt', sortBy = 'desc' } = req.query;
    const skip = (page - 1) * limit;
    // const userId = req.user.id
  
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          // userId: userId,
          ...(search && { OR: [
            { hotels: { name: { contains: search } } }, 
            { UUID: { contains: search } } 
          ] })
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { [orderBy]: sortBy },
        include: {
          hotels: true,
          users: true,
        }
      });

      const totalBookings = await prisma.booking.count({
        // where: { userId: userId }
      });
      
      res.json({
        total: totalBookings,
        page: parseInt(page),
        limit: parseInt(limit),
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  };
  exports.getBookingByUUID = async (req, res, next) => {
    const { UUID } = req.params;
  
    try {
      const booking = await prisma.booking.findUnique({
        where: { UUID },
        include: {
          hotels: true,
          users: true,
        }
      });
  
      if (!booking) {
        throw createError(404, "Booking not found")
      }
  
      res.json(booking)
    } catch (error) {
      next(error);
    }
  };
  exports.createBooking = async (req, res, next) => {
    const { userId, promotionId, totalPrice, checkInDate, checkOutDate, hotelId } = req.body
  
    try {

      let userHavePromotionId = null;
      if (promotionId) {
        const userPromotion = await prisma.userHavePromotion.findFirst({
          where: {
            userId: userId,
            promotionId: promotionId,
            isUsed: false
          }
        });
  
        if (!userPromotion) {
          throw createError(400, "Invalid or already used promotion")
        }
  
        userHavePromotionId = userPromotion.id;
      }
  
      const newBooking = await prisma.booking.create({
        data: {
          UUID: generateUUID(), 
          userId: userId,
          hotelId: hotelId,
          userHavePromotionId,
          totalPrice,
          checkinDate: new Date(checkInDate),
          checkoutDate: new Date(checkOutDate),
        }
      });
  
      if (userHavePromotionId) {
        await prisma.userHavePromotion.update({
          where: { id: userHavePromotionId },
          data: { isUsed: true }
        });
      }
  
      res.json(newBooking)
    } catch (error) {
      next(error)
    }
  };
  