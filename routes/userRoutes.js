const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");
const checkRole = require("../middleware/checkRole");
const userController = require("../controllers/userController");

// Get current user profile
router.get(
  "/profile",
  isAuthenticated,
  checkRole(["user", "admin"]),
  userController.getProfile
);

// Update profile
router.put(
  "/profile",
  isAuthenticated,
  checkRole(["user", "admin"]),
  userController.updateProfile
);

// Add favourite pet
router.post(
  "/favourites/:petId",
  isAuthenticated,
  checkRole(["user", "admin"]),
  userController.addFavourite
);

// Delete favourite pet
router.delete(
  "/favourites/:petId",
  isAuthenticated,
  checkRole(["user", "admin"]),
  userController.removeFavourite
);

// View favourite pet per user
router.get(
  "/favourites",
  isAuthenticated,
  checkRole(["user", "admin"]),
  userController.getFavourites
);

module.exports = router;
