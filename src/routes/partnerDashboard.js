const express = require("express");
const router = express.Router();
const partnerDashboardController = require("../controllers/partnerDashboard-controller");

router.get("/total-bookings/:partnerId", partnerDashboardController.getTotalBookings);
router.get("/available-rooms/:partnerId", partnerDashboardController.getAvailableRooms);
router.get("/booking-trends/:partnerId", partnerDashboardController.getBookingTrends);
router.get("/revenue/:partnerId", partnerDashboardController.getRevenue);
router.get("/average-rating/:partnerId", partnerDashboardController.getAverageRating);
router.get("/occupancy-rate/:partnerId", partnerDashboardController.getOccupancyRate);
router.get("/popular-room-types/:partnerId", partnerDashboardController.getPopularRoomTypes);
router.get("/promotion-usage/:partnerId", partnerDashboardController.getPromotionUsage);
router.get("/monthly-average-rating/:partnerId", partnerDashboardController.getMonthlyAverageRating);

module.exports = router;
