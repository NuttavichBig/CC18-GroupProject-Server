const express = require("express");
const router = express.Router();
const adminDashboardController = require("../controllers/adminDashboard-controller");

router.get("/total-users", adminDashboardController.getTotalUsers);
router.get("/total-partners", adminDashboardController.getTotalPartners);
router.get("/total-bookings", adminDashboardController.getTotalBookings);
router.get("/booking-trends", adminDashboardController.getBookingTrends);
router.get("/revenue", adminDashboardController.getRevenue);
router.get("/average-rating", adminDashboardController.getAverageRating);
router.get("/new-users-by-month", adminDashboardController.getNewUsersByMonth);
router.get("/new-partners-by-month", adminDashboardController.getNewPartnersByMonth);
router.get("/popular-booking-types", adminDashboardController.getPopularBookingTypes);
router.get("/monthly-sales", adminDashboardController.getMonthlySales);

module.exports = router;
