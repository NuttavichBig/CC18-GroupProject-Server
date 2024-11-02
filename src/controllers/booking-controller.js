const prisma = require("../configs/prisma")
const createError = require("../utility/createError")

exports.getAllBookings = async (req, res, next) => {
    const { search, page, limit, orderBy, sortBy } = req.input
    const skip = (page - 1) * limit;
    const userId = req.user? req.user.id : null
    const userRole = req.user ? req.user.role : null

    try {
      let checkUser = {}
      if(userRole === 'ADMIN') {
        checkUser = {}
      } else if (userId) {
        checkUser = {
          userId : userId
        }
      } else if (UUID){
        checkUser = {UUID: UUID}
      } else{
        return res.json({total: 0, page, limit, data: []})
      }

      const bookings = await prisma.booking.findMany({
        where: {
          ...checkUser,
          ...(search && { OR: [
            { hotels: { name: { contains: search } } }, 
            { UUID: { contains: search } } 
          ] })
        },
        skip,
        take:limit,
        orderBy: { [sortBy]: orderBy },
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
        page,
        limit,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }
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
    const { userId, promotionId, totalPrice, checkInDate, checkOutDate, hotelId } = req.input
  
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
  