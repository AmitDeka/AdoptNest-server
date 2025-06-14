const express = require("express");
const passport = require("passport");
const User = require("../models/UserModel");
const router = express.Router();

// Register (local)
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({
        message:
          "This email is already registered. Please log in or try a different email address.",
      });

    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Duplicate field", key: err.keyPattern });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login (local)
// router.post("/login", passport.authenticate("local"), (req, res) => {
//   res.json({ message: "Logged in", user: req.user });
// });
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err)
      return res.status(500).json({ message: "Server error", error: err });
    if (!user) return res.status(401).json({ message: "Unauthorized", info });

    req.login(user, (err) => {
      if (err)
        return res.status(500).json({ message: "Login error", error: err });
      res.json({ message: "Logged in successfully", user });
    });
  })(req, res, next);
});

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "/auth/success",
  })
);

// Auth success check
router.get("/success", (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  res.json({ message: "Logged in via Google", user: req.user });
});

// Logout
// router.get("/logout", (req, res) => {
//   req.logout((err) => {
//     if (err) return res.status(500).json({ message: "Logout error" });
//     res.json({ message: "Logged out" });
//   });
// });
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout error" });
    req.session.destroy((err) => {
      if (err)
        return res.status(500).json({ message: "Session destroy error" });
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      return res.json({ message: "Logged out and session destroyed" });
    });
  });
});

module.exports = router;
