const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-controller");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/user", () => console.log("Hello getMe"));
router.patch("/user", () => console.log("Hello Edit Profile"));
router.patch("/forgot-password", () => console.log("Hello Forgot Password"));
router.post("/google", () => console.log("Hello google login"));

module.exports = router;
