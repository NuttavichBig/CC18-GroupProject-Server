const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-controller");
const {
  loginValidator,
  registerValidator,
  updateUserValidator,
  forgetPasswordValidator,
} = require("../middlewares/validator");
const authenticate = require("../middlewares/authenticate");

router.post("/login", loginValidator, authController.login);
router.post("/register", registerValidator, authController.register);
router.get("/user", authenticate, authController.currentUser);
router.patch("/user",authenticate, updateUserValidator,authController.editProfile);
router.patch("/forgot-password", forgetPasswordValidator, () => console.log("Hello Forgot Password"));
router.post("/google", () => console.log("Hello google login"));

module.exports = router;
