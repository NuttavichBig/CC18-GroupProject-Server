const prisma = require("../configs/prisma")
const createError = require("../utility/createError")

exports.getAllBookings = async (req, res, next) => {
    const { search, page = 1, limit = 10, orderBy = 'createdAt', sortBy = 'desc' } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.user.id
    const userRole = req.user.role

    try {
      const checkUser = userRole === "ADMIN" ?{} : { userId: userId }
      const bookings = await prisma.booking.findMany({
        where: {
          ...checkUser,
          ...(search && { OR: [
            { hotels: { name: { contains: search } } }, 
            { UUID: { contains: search } } 
          ] })
        },
        skip: Number(skip),
        take: Number(limit),
        orderBy: { [orderBy]: sortBy },
        include: {
          hotels: true,
          users: true,
        }
      });

      const totalBookings = await prisma.booking.count({
        where: checkUser
      });
      
      res.json({
        total: totalBookings,
        page: Number(page),
        limit: Number(limit),
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
  