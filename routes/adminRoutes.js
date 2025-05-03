const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const isAuthenticated = require("../middleware/isAuthenticated");
const checkRole = require("../middleware/checkRole");
const upload = require("../middleware/upload");

router.post(
  "/add-banner",
  isAuthenticated,
  checkRole(["admin"]),
  upload.single("image"),
  adminController.uploadBanner
);

router.delete(
  "/delete-banner/:id",
  isAuthenticated,
  checkRole(["admin"]),
  adminController.deleteBanner
);

router.post(
  "/add-category",
  isAuthenticated,
  checkRole(["admin"]),
  upload.single("icon"),
  adminController.createCategory
);

router.put(
  "/update-category/:id",
  isAuthenticated,
  checkRole(["admin"]),
  upload.single("icon"),
  adminController.updateCategory
);

router.delete(
  "/delete-category/:id",
  isAuthenticated,
  checkRole(["admin"]),
  adminController.deleteCategory
);

module.exports = router;
