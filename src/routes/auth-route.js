const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-controller");
const { loginValidator, registerValidator, updateUserValidator, resetPasswordValidator, forgotPasswordValidator } = require("../middlewares/validator")
const authenticate = require("../middlewares/authenticate")

router.post("/login", loginValidator, authController.login);
router.post("/register", registerValidator, authController.register);
router.get("/user", authenticate, authController.currentUser);
router.patch("/user", authenticate, updateUserValidator, authController.updateUser);
router.patch('/forgot-password', forgotPasswordValidator, authController.forgetPassword)
router.patch("/reset-password", authenticate, resetPasswordValidator, authController.resetPassword);
router.post("/google", authController.googleLogin);

module.exports = router;
