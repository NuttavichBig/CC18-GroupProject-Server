const prisma = require("../configs/prisma")
const createError = require("../utility/createError")

exports.getAllBookings = async (req, res, next) => {
  try {
    const { search, page, limit, orderBy, sortBy } = req.input
    const skip = (page - 1) * limit;


    // initial condition
    const condition = {
      skip,
      take: limit,
      orderBy: { [sortBy]: orderBy },
      include: {
        hotels: {
          select: {
            name: true,
            partnerId: true
          }
        },
        users: {
          select: {
            email: true,
          }
        }
      }
    }

    // check search
    if(search){
      condition.where = {OR: [
        { hotels: { name: { contains: search } } },
        { UUID: { contains: search } }
      ]}
    }
    // check role
    if(req.user.role === 'USER'){
      condition.where = {...condition.where,userId : req.user.id}
    }else if(req.user.role === 'PARTNER'){
      condition.where = {...condition.where,hotels : {partner : {userId : req.user.id}}}
    }

    const bookings = await prisma.booking.findMany(condition);
    const {skip:s , take , orderBy:o ,include , ...checkingTotal} = condition
  const totalBookings = await prisma.booking.count(checkingTotal);

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
        userId,
        hotelId,
        userHavePromotionId,
        totalPrice,
        checkinDate: checkInDate,
        checkoutDate: checkOutDate
      },include :{
        userHavePromotions : {
          include : {
            promotion : true
          }
        }
      }
    });

    if (userHavePromotionId) {
      await prisma.userHavePromotion.update({
        where: { id: userHavePromotionId },
        data: { isUsed: true }
      });
    }

    res.json({message : "Booking success",booking : newBooking})
  } catch (error) {
    next(error)
  }
};
