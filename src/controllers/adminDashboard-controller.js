const prisma = require("../configs/prisma");
const createError = require("../utility/createError");

module.exports = {
  async getTotalUsers(req, res, next) {
    try {
      const totalUsers = await prisma.user.count();
      res.json({ totalUsers });
    } catch (error) {
      next(createError(500, "Error retrieving total users"));
    }
  },

  async getTotalPartners(req, res, next) {
    try {
      const totalPartners = await prisma.partner.count();
      res.json({ totalPartners });
    } catch (error) {
      next(createError(500, "Error retrieving total partners"));
    }
  },

  async getTotalBookings(req, res, next) {
    try {
      const totalBookings = await prisma.booking.count();
      res.json({ totalBookings });
    } catch (error) {
      next(createError(500, "Error retrieving total bookings"));
    }
  },

  async getBookingTrends(req, res, next) {
    try {
      const bookingTrends = await prisma.booking.groupBy({
        by: ["createdAt"],
        _count: { id: true },
      });
      res.json({ bookingTrends });
    } catch (error) {
      next(createError(500, "Error retrieving booking trends"));
    }
  },

  async getRevenue(req, res, next) {
    try {
      const totalRevenue = await prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { status: "CONFIRMED" },
      });
      res.json({ totalRevenue: totalRevenue._sum.totalPrice });
    } catch (error) {
      next(createError(500, "Error retrieving revenue"));
    }
  },

  async getAverageRating(req, res, next) {
    try {
      const averageRating = await prisma.review.aggregate({
        _avg: { rating: true },
      });
      res.json({ averageRating: averageRating._avg.rating });
    } catch (error) {
      next(createError(500, "Error retrieving average rating"));
    }
  },

  async getNewUsersByMonth(req, res, next) {
    try {
      const newUsers = await prisma.user.groupBy({
        by: ["createdAt"],
        _count: { id: true },
        where: { role: "USER" },
      });
      res.json({ newUsers });
    } catch (error) {
      next(createError(500, "Error retrieving new users by month"));
    }
  },

  async getNewPartnersByMonth(req, res, next) {
    try {
      const newPartners = await prisma.partner.groupBy({
        by: ["createdAt"],
        _count: { id: true },
      });
      res.json({ newPartners });
    } catch (error) {
      next(createError(500, "Error retrieving new partners by month"));
    }
  },

  async getPopularBookingTypes(req, res, next) { 
    try {
      const bookingCounts = await prisma.booking.groupBy({
        by: ["hotelId"],
        where: {
          status: "CONFIRMED",
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
      });
  
      const hotelIds = bookingCounts.map((booking) => booking.hotelId);
      const hotels = await prisma.hotel.findMany({
        where: {
          id: { in: hotelIds },
        },
        select: {
          id: true,
          name: true,         
        },
      });
  
      const popularBookingTypes = bookingCounts.map((booking) => ({
        ...booking,
        hotel: hotels.find((hotel) => hotel.id === booking.hotelId),  
      }));
  
      res.json({ popularBookingTypes });
    } catch (error) {
      next(createError(500, "Error retrieving popular booking types"));
    }
  },

  async getMonthlySales(req, res, next) {
    try {
      const monthlySales = await prisma.booking.groupBy({
        by: ["createdAt"],
        where: { status: "CONFIRMED" },
        _sum: { totalPrice: true },
      });
      res.json({ monthlySales });
    } catch (error) {
      next(createError(500, "Error retrieving monthly sales"));
    }
  },
};
