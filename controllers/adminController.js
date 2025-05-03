const Banner = require("../models/BannerModel");
const Category = require("../models/CategoryModel");
const fs = require("fs");
const cloudinary = require("../utils/cloudinary");

// Upload Banner
exports.uploadBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Banner image is required." });
    }

    const { title, link } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "AdoptNest/Banners",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 1200, height: 600, crop: "limit" }],
    });

    const banner = new Banner({
      title,
      link,
      image: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });

    await banner.save();

    fs.unlink(req.file.path, (err) => {});

    res.status(201).json({ message: "Banner uploaded successfully", banner });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {});
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete Banner
exports.deleteBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;
    const banner = await Banner.findById(bannerId);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found." });
    }

    if (banner.image.public_id) {
      await cloudinary.uploader.destroy(banner.image.public_id);
    }

    await Banner.findByIdAndDelete(bannerId);
    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {});
      }
      return res.status(400).json({ message: "Category name is required." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Category icon is required." });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      fs.unlink(req.file.path, (err) => {});
      return res.status(400).json({ message: "Category already exists." });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "AdoptNest/CategoryIcons",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 300, height: 300, crop: "limit" }],
    });

    const category = new Category({
      name,
      icon: {
        url: result.secure_url,
        public_id: result.public_id,
      },
      createdBy: req.user._id,
    });

    await category.save();

    fs.unlink(req.file.path, (err) => {});

    res
      .status(201)
      .json({ message: "Category created successfully.", category });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {});
    }
    res.status(500).json({ message: error.message });
  }
};

// Update category
// exports.updateCategory = async (req, res) => {
//   try {
//     const categoryId = req.params.id;
//     const { name } = req.body;

//     const category = await Category.findById(categoryId);

//     if (!category) {
//       return res.status(404).json({ message: "Category not found." });
//     }

//     let updated = false;

//     if (name && name !== category.name) {
//       category.name = name;
//       updated = true;
//     }

//     if (req.file) {
//       if (category.icon.public_id) {
//         await cloudinary.uploader.destroy(category.icon.public_id);
//       }

//       const result = await cloudinary.uploader.upload(req.file.path, {
//         folder: "AdoptNest/CategoryIcons",
//         allowed_formats: ["jpg", "jpeg", "png", "webp"],
//         transformation: [{ width: 200, height: 200, crop: "limit" }],
//       });

//       category.iconUrl = result.secure_url;
//       category.iconPublicId = result.public_id;
//       updated = true;
//     }

//     if (updated) {
//       await category.save();
//       return res
//         .status(200)
//         .json({ message: "Category updated successfully", category });
//     } else {
//       return res.status(200).json({ message: "No changes detected" });
//     }
//   } catch (error) {
//     if (req.file) {
//       fs.unlink(req.file.path, () => {});
//     }
//     res.status(500).json({ message: error.message });
//   }
// };
exports.updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    let updated = false;

    if (name && name !== category.name) {
      category.name = name;
      updated = true;
    }

    if (req.file) {
      if (category.icon?.public_id) {
        await cloudinary.uploader.destroy(category.icon.public_id);
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "AdoptNest/CategoryIcons",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 200, height: 200, crop: "limit" }],
      });

      category.icon = {
        url: result.secure_url,
        public_id: result.public_id,
      };
      updated = true;
    }

    if (updated) {
      await category.save();
      return res
        .status(200)
        .json({ message: "Category updated successfully", category });
    } else {
      return res.status(200).json({ message: "No changes detected" });
    }
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    if (category.icon.public_id) {
      await cloudinary.uploader.destroy(category.icon.public_id);
    }

    await Category.findByIdAndDelete(categoryId);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
