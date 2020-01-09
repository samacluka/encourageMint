const express = require("express"),
      router  = express.Router({mergeParams: true});

const callbacks       = require("./callbacks.js");

// LOGOUT
router.get("/logout", callbacks.auth.logout);

// GOOGLE
router.get("/google", callbacks.auth.google.index);
router.get("/google/callback", callbacks.auth.google.callback, callbacks.auth.google.success);

module.exports = router;
