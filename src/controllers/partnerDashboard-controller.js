const prisma = require("../configs/prisma");
const createError = require("../utility/createError");

module.exports = {
  async getTotalBookings(req, res) {
    const { partnerId } = req.params;
    const totalBookings = await prisma.booking.count({
      where: { hotels: { partnerId: parseInt(partnerId) } },
    });
    res.json({ totalBookings });
  },

  async getAvailableRooms(req, res) {
    const { partnerId } = req.params;
    const availableRooms = await prisma.room.count({
      where: {
        hotel: { partnerId: parseInt(partnerId) },
        status: "AVAILABLE",
      },
    });
    res.json({ availableRooms });
  },

  async getBookingTrends(req, res) {
    const { partnerId } = req.params;
    const bookingTrends = await prisma.booking.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where: { hotels: { partnerId: parseInt(partnerId) } },
    });
    res.json({ bookingTrends });
  },

  async getRevenue(req, res) {
    const { partnerId } = req.params;
    const totalRevenue = await prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { hotels: { partnerId: parseInt(partnerId) } },
    });
    res.json({ totalRevenue: totalRevenue._sum.totalPrice });
  },

  async getAverageRating(req, res) {
    const { partnerId } = req.params;
    const averageRating = await prisma.review.aggregate({
      _avg: { rating: true },
      where: { hotel: { partnerId: parseInt(partnerId) } },
    });
    res.json({ averageRating: averageRating._avg.rating });
  },
  async getOccupancyRate(req, res) {
    const { partnerId } = req.params;
    const totalRooms = await prisma.room.count({
      where: { hotel: { partnerId: parseInt(partnerId) } },
    });
    const bookedRooms = await prisma.bookingRoom.count({
      where: { booking: { hotels: { partnerId: parseInt(partnerId) } } },
    });
    const occupancyRate = (bookedRooms / totalRooms) * 100;
    res.json({ occupancyRate });
  },

  // ประเภทห้องที่ได้รับความนิยม
  async getPopularRoomTypes(req, res) {
    const { partnerId } = req.params;
    const popularRoomTypes = await prisma.room.groupBy({
      by: ["type"],
      _count: { id: true },
      where: { hotel: { partnerId: parseInt(partnerId) } },
    });
    res.json({ popularRoomTypes });
  },

  // รายงานการใช้โปรโมชั่น
  async getPromotionUsage(req, res) {
    const { partnerId } = req.params;
    const promotionUsage = await prisma.userHavePromotion.groupBy({
      by: ["promotionId"],
      _count: { id: true },
      where: {
        booking: { some: { hotels: { partnerId: parseInt(partnerId) } } },
      },
    });
    res.json({ promotionUsage });
  },

  // รีวิวเฉลี่ยตามเดือน
  async getMonthlyAverageRating(req, res) {
    const { partnerId } = req.params;
    const monthlyAverageRating = await prisma.review.groupBy({
      by: ["createdAt"],
      _avg: { rating: true },
      where: { hotel: { partnerId: parseInt(partnerId) } },
    });
    res.json({ monthlyAverageRating });
  },
};
