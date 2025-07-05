const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/auth", authController.getAuthUrl);
router.get("/oauth2callback", authController.oauthCallback);

module.exports = router;
