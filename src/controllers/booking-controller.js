const prisma = require("../configs/prisma")
const createError = require("../utility/createError")
const { v4: uuidv4 } = require('uuid')

function generateUUID() {
  return uuidv4()
}

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
        review : true,
        hotels: true,
        bookingRooms: {
          select: {
            amountRoom: true,
            rooms: {
              include :{
                images : true
              },
            }
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
    if (search) {
      condition.where = {
        OR: [
          { hotels: { name: { contains: search } } },
          { UUID: { contains: search } }
        ]
      }
    }
    // check role
    if (req.user.role === 'USER') {
      condition.where = { ...condition.where, userId: req.user.id }
    } else if (req.user.role === 'PARTNER') {
      condition.where = { ...condition.where, hotels: { partner: { userId: req.user.id } } }
    }

    const bookings = await prisma.booking.findMany(condition);
    const { skip: s, take, orderBy: o, include, ...checkingTotal } = condition
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
        bookingRooms : {
          include : {
            rooms : true
          }
        }
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
  const { userId, promotionId, totalPrice, checkinDate, checkoutDate, hotelId, roomId, amount, firstName, lastName, email, phone } = req.input;

  try {
    let userHavePromotionId = null;
    console.log(req.input)
    // Check if a promotion is being applied and validate it
    if (promotionId) {
      if (!userId) {
        throw createError(400, "Guests cannot use promotions");
      }

      console.log(`Checking or creating promotion for userId: ${userId}, promotionId: ${promotionId}`);

      // Find promotion details in the promotion table
      const promotion = await prisma.promotion.findFirst({
        where: {
          id: promotionId,
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      });

      // Check if the promotion is valid and available
      if (!promotion) {
        throw createError(400, "Invalid or expired promotion");
      }

      // Check if a record exists in userHavePromotion for this user and promotion
      let userPromotion = await prisma.userHavePromotion.findFirst({
        where: {
          userId: userId,
          promotionId: promotionId,
          isUsed: false,
        },
      });

      // If no record exists, create a new entry in userHavePromotion
      if (!userPromotion) {
        userPromotion = await prisma.userHavePromotion.create({
          data: {
            userId: userId,
            promotionId: promotionId,
            isUsed: false, // New record is not used yet
          },
        });
        console.log("Created new userHavePromotion record:", userPromotion);
      }

      userHavePromotionId = userPromotion.id;
    }

    // Create the booking record
    const newBooking = await prisma.booking.create({
      data: {
        UUID: generateUUID(),
        userId: userId || null,
        hotelId,
        userHavePromotionId,
        totalPrice,
        checkinDate,
        checkoutDate,
        firstName,
        lastName,
        email,
        phone,
        bookingRooms: {
          create: {
            roomId: +roomId,
            amountRoom: +amount
          }
        }
      },
      include: {
        userHavePromotions: {
          include: {
            promotion: true,
          },
        },
      },
    });

    // Mark the promotion as used if applicable
    if (userHavePromotionId) {
      await prisma.userHavePromotion.update({
        where: { id: +userHavePromotionId },
        data: { isUsed: true },
      });
    }

    res.json({ message: "Booking success", booking: newBooking });
  } catch (error) {
    console.error("Error creating booking:", error);
    next(error);
  }
};
