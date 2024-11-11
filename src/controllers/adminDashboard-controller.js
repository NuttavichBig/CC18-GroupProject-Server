const prisma = require("../configs/prisma");
const createError = require("../utility/createError");

module.exports = {
  async getTotalUsers(req, res) {
    const totalUsers = await prisma.user.count();
    res.json({ totalUsers });
  },

  async getTotalPartners(req, res) {
    const totalPartners = await prisma.partner.count();
    res.json({ totalPartners });
  },

  async getTotalBookings(req, res) {
    const totalBookings = await prisma.booking.count();
    res.json({ totalBookings });
  },

  async getBookingTrends(req, res) {
    const bookingTrends = await prisma.booking.groupBy({
      by: ["createdAt"],
      _count: { id: true },
    });
    res.json({ bookingTrends });
  },

  async getRevenue(req, res) {
    const totalRevenue = await prisma.booking.aggregate({
      _sum: { totalPrice: true },
    });
    res.json({ totalRevenue: totalRevenue._sum.totalPrice });
  },

  async getAverageRating(req, res) {
    const averageRating = await prisma.review.aggregate({
      _avg: { rating: true },
    });
    res.json({ averageRating: averageRating._avg.rating });
  },
  async getNewUsersByMonth(req, res) {
    const newUsers = await prisma.user.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where: { role: "USER" },
    });
    res.json({ newUsers });
  },

  async getNewPartnersByMonth(req, res) {
    const newPartners = await prisma.partner.groupBy({
      by: ["createdAt"],
      _count: { id: true },
    });
    res.json({ newPartners });
  },

  // ประเภทการจองที่ได้รับความนิยม
  async getPopularBookingTypes(req, res) {
    const popularBookingTypes = await prisma.booking.groupBy({
      by: ["status"],
      _count: { id: true },
    });
    res.json({ popularBookingTypes });
  },

  // ข้อมูลยอดขายและจำนวนจองในแต่ละเดือน
  async getMonthlySales(req, res) {
    const monthlySales = await prisma.booking.groupBy({
      by: ["createdAt"],
      _sum: { totalPrice: true },
    });
    res.json({ monthlySales });
  },
};

