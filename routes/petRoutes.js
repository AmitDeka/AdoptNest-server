const express = require("express");
const router = express.Router();
const petController = require("../controllers/petController");
const isAuthenticated = require("../middleware/isAuthenticated");
const checkRole = require("../middleware/checkRole");
const upload = require("../middleware/upload");
const multerErrorHandler = require("../middleware/multerErrorHandler");

// POST - Create a new pet
router.post(
  "/add",
  isAuthenticated,
  upload.array("images", 5),
  multerErrorHandler,
  petController.createPet
);

// GET - Get all pets
router.get(
  "/admin/all",
  isAuthenticated,
  checkRole(["admin"]),
  petController.getAllPets
);

// GET - Get all pending pets
router.get(
  "/admin/pending",
  isAuthenticated,
  checkRole(["admin"]),
  petController.getPendingPets
);

// GET - Get all declined pets
router.get(
  "/admin/declined",
  isAuthenticated,
  checkRole(["admin"]),
  petController.getDeclinedPets
);

// GET - Get all accepted pets
router.get("/all", petController.getAcceptedPets);

// GET - Get recent 10 accepted pets
router.get("/home", petController.getRecentPets);

// POST - Admin validate pet submission
router.post("/admin/validate/:id", petController.validatePet);

module.exports = router;
