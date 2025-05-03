const express = require("express");
const router = express.Router();
const uiController = require("../controllers/uiController");

router.get("/banners", uiController.getBanner);

router.get("/category", uiController.getCategories);

router.get("/pet/:id", uiController.getPetDetails);

router.get("/pet/category/:id", uiController.getPetsByCategory);

router.get(
  "/pets/grouped-by-category",
  uiController.getAcceptedPetsGroupedByCategory
);

module.exports = router;
