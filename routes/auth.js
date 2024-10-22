// server/routes/auth.js

import { Router } from "express";
import passport from "passport";

const router = Router();

const client_URL = "https://www.adullamfashion.com";


router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: client_URL,
    failureRedirect: "/login/failed",
  })
);

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
});

router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "successful",
      user: req.user,
      // cookies: req.cookies,
      // token: token,
    });
  }
});

router.get("/logout", (req, res) => {
        req.logout();
        res.redirect(client_URL)
})


export default router;
