const Banner = require("../models/BannerModel");
const Category = require("../models/CategoryModel");
const Pet = require("../models/PetModel");
const User = require("../models/UserModel");
const mongoose = require("mongoose");

// Get Banner
exports.getBanner = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.status(200).json(banners);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get Categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Category info by ID
exports.getCategoryById = async (req, res) => {
  const categoryId = req.params.id;
  try {
    const category = await Category.findById(categoryId).sort({
      createdAt: -1,
    });
    res.status(200).json({ data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Pet details
exports.getPetDetails = async (req, res) => {
  const petId = req.params.id;

  try {
    const pet = await Pet.findById(petId).populate("category", "name icon");

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    const petData = pet.toObject();

    // Only include creator info if user is logged in
    if (req.user) {
      const creator = await User.findById(pet.createdBy).select(
        "name email phoneNumber whatsapp"
      );
      petData.creator = creator;
    }

    // Always remove personal fields if they exist
    delete petData.contactPhone;
    delete petData.contactEmail;
    delete petData.contactWhatsApp;
    delete petData.creatorName;

    res.status(200).json({ pet: petData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Pet by category
exports.getPetsByCategory = async (req, res) => {
  const { id: categoryId } = req.params;

  try {
    const pets = await Pet.find({
      category: new mongoose.Types.ObjectId(categoryId),
      status: "accepted",
    })
      .select("-description -contactPhone -contactEmail -contactWhatsApp")
      .populate("createdBy", "name")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ pets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET grouped by category
exports.getAcceptedPetsGroupedByCategory = async (req, res) => {
  try {
    const categories = await Category.find();

    const data = await Promise.all(
      categories.map(async (cat) => {
        const pets = await Pet.find({ category: cat._id, status: "accepted" });

        if (pets.length === 0) return null;

        return {
          category: {
            id: cat._id,
            name: cat.name,
            icon: cat.icon,
          },
          pets,
        };
      })
    );

    const filteredData = data.filter((item) => item !== null);
    res.status(200).json({ data: filteredData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
