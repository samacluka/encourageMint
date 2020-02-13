const express = require("express"),
      router  = express.Router({mergeParams: true});

const callbacks       = require("./callbacks.js");

// LOGOUT
router.post("/new", callbacks.config.post.new);

module.exports = router;
