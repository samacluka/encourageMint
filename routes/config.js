const express = require("express"),
      router  = express.Router({mergeParams: true});

const callbacks       = require("./callbacks.js");

// GET
router.get("/success", callbacks.config.get.success);

// POST
router.post("/new", callbacks.config.post.new);

module.exports = router;
