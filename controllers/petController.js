const Pet = require("../models/PetModel");
const Category = require("../models/CategoryModel");
const fs = require("fs");
const cloudinary = require("../utils/cloudinary");

// Add new pet
exports.createPet = async (req, res) => {
  const user = req.user;

  if (!user.phone || !user.whatsapp) {
    if (req.files) {
      req.files.forEach((file) => fs.unlink(file.path, (err) => {}));
    }
    return res.status(400).json({
      message:
        "Please update your profile with a Phone number and WhatsApp number before posting a pet.",
    });
  }

  try {
    const { name, age, breed, gender, description, location } = req.body;

    if (!name || !age || !gender || !description || !location) {
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => fs.unlink(file.path, (err) => {}));
      }
      return res.status(400).json({
        message: "Missing required fields.",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required." });
    }

    if (req.files.length > 5) {
      req.files.forEach((file) => fs.unlink(file.path, (err) => {}));
      return res
        .status(400)
        .json({ message: "You can upload a maximum of 5 images." });
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    for (const file of req.files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        req.files.forEach((file) => fs.unlink(file.path, (err) => {}));
        return res.status(400).json({
          message: "Only image files (jpg, jpeg, png, webp, gif) are allowed.",
        });
      }

      const fileSizeInMB = file.size / (1024 * 1024); // bytes to MB
      if (fileSizeInMB > 5) {
        req.files.forEach((file) => fs.unlink(file.path, (err) => {}));
        return res.status(400).json({
          message: "Each image must be less than 5MB.",
        });
      }
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "AdoptNest/Pets",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
        transformation: [{ width: 800, height: 800, crop: "limit" }],
      });
      uploadedImages.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
      fs.unlink(file.path, (err) => {});
    }

    const newPet = new Pet({
      name,
      age,
      breed,
      gender,
      description,
      images: uploadedImages,
      location,
      creatorName: user.name,
      contactPhone: user.phone,
      contactEmail: user.email,
      contactWhatsApp: user.whatsapp,
      createdBy: user._id,
    });

    await newPet.save();
    res.status(201).json({ message: "Pet submitted for review", pet: newPet });
  } catch (error) {
    if (req.files) {
      req.files.forEach((file) => fs.unlink(file.path, (err) => {}));
    }
    res.status(400).json({ message: error.message });
  }
};

// Get all pets
exports.getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(pets);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all pending pets
exports.getPendingPets = async (req, res) => {
  try {
    const pets = await Pet.find({ status: "pending" })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(pets);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all declined pets
exports.getDeclinedPets = async (req, res) => {
  try {
    const pets = await Pet.find({ status: "declined" })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(pets);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all accepted pets
exports.getAcceptedPets = async (req, res) => {
  try {
    const pets = await Pet.find({ status: "accepted" })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(pets);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get 10 most recent accepted pets with category name
exports.getRecentPets = async (req, res) => {
  try {
    const pets = await Pet.find({ status: "accepted" })
      .select("-description -contactPhone -contactEmail -contactWhatsApp")
      .populate("createdBy", "name email")
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json(pets);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin validates pet submission (accept or decline)
exports.validatePet = async (req, res) => {
  const status = req.body.status?.toLowerCase();
  const petId = req.params.id;
  const { categoryId } = req.body;

  if (!["accepted", "declined"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    if (pet.status === status) {
      return res.status(200).json({ message: `Pet is already ${status}` });
    }

    // If status is 'accepted', a categoryId must be provided
    if (status === "accepted") {
      if (!categoryId) {
        return res
          .status(400)
          .json({ message: "categoryId is required for accepted pets" });
      }

      // Optional: validate the categoryId
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      pet.category = categoryId;
    } else {
      pet.category = undefined;
    }

    pet.status = status;
    await pet.save();

    res.status(200).json({ message: `Pet ${status}`, pet });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
