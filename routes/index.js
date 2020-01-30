const express = require("express"),
      router  = express.Router({mergeParams: true});

const callbacks       = require("./callbacks.js");

// GET
router.get("/", callbacks.index.get.home);
router.get("/index", callbacks.index.get.index);
router.get("/index/data", callbacks.index.get.index_data);

module.exports = router;
