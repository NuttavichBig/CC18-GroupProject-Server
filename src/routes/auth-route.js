const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-controller");
const{loginValidator,registerValidator,updateUserValidator,forgetPasswordValidator} = require("../middlewares/validator")

router.post("/login",loginValidator,authController.login);
router.post("/register",registerValidator,authController.register);
router.get("/user", () => console.log("Hello getMe"));
router.patch("/user",updateUserValidator,() => console.log("Hello Edit Profile"));
router.patch("/forgot-password",forgetPasswordValidator,() => console.log("Hello Forgot Password"));
router.post("/google", () => console.log("Hello google login"));

module.exports = router;
