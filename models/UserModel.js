const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return v && v.trim().split(/\s+/).length >= 2;
      },
      message:
        "Please enter your full name. It must contain at least two words (e.g., John Doe).",
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email address.",
    ],
  },
  password: {
    type: String,
    minlength: [8, "Password must be at least 8 characters long."],
    validate: {
      validator: function (v) {
        return (
          /[A-Z]/.test(v) &&
          /[a-z]/.test(v) &&
          /\d/.test(v) &&
          /[!@#$%^&*(),.?":{}|<>]/.test(v)
        );
      },
      message:
        "Password must contain an uppercase letter, a lowercase letter, a number, and a special character (e.g., @, #, $, %).",
    },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  favourites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
    },
  ],
  phone: { type: String },
  whatsapp: { type: String },
  whatsappVerified: { type: Boolean, default: false },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare method
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
