const Pet = require("../models/PetModel");
const User = require("../models/UserModel");

// Get Profile
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
};

// Update Profile
exports.updateProfile = async (req, res) => {
  const { name, phone, whatsapp } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }
  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }
  if (!whatsapp) {
    return res.status(400).json({ message: "WhatsApp number is required" });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      name,
      phone,
      whatsapp,
      whatsappVerified: false,
    },
    { new: true }
  ).select("-password");

  // WhatsApp verification here

  res.json({ message: "Profile updated", user });
};

// Add pet to favourites
exports.addFavourite = async (req, res) => {
  const userId = req.user._id;
  const petId = req.params.petId;

  try {
    const pet = await Pet.findOne({ _id: petId, status: "accepted" });
    if (!pet) {
      return res.status(404).json({ message: "Pet not found or not public" });
    }

    const user = await User.findById(userId);

    if (user.favourites.includes(petId)) {
      return res.status(400).json({ message: "Pet already in favourites" });
    }

    user.favourites.push(petId);
    await user.save();

    res.status(200).json({ message: "Added to favourites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove pet from favourites
exports.removeFavourite = async (req, res) => {
  const userId = req.user._id;
  const petId = req.params.petId;

  try {
    const user = await User.findById(userId);

    const isFavourite = user.favourites.some(
      (favId) => favId.toString() === petId
    );

    if (!isFavourite) {
      return res
        .status(400)
        .json({ message: "Pet is not in your favourites list" });
    }

    user.favourites = user.favourites.filter(
      (favId) => favId.toString() !== petId
    );

    await user.save();

    res.status(200).json({ message: "Removed from favourites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all favourite pets for user
exports.getFavourites = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate({
      path: "favourites",
      match: { status: "accepted" },
    });

    res.status(200).json({ favourites: user.favourites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
