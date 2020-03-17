const express = require("express"),
      router  = express.Router({mergeParams: true});

const callbacks       = require("./callbacks.js");

// GET
router.get("/", callbacks.index.get.landing);
router.get("/index", callbacks.index.get.index);

module.exports = router;
