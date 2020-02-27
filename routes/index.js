const express = require("express"),
      router  = express.Router({mergeParams: true});

const callbacks       = require("./callbacks.js");

const is              = require("../middleware/is.js");

// GET
router.get("/", callbacks.index.get.landing);
router.get("/index", is.LoggedIn, callbacks.index.get.index);

router.post("/newPlant", callbacks.index.post.newPlant);
router.put("/updatePlant", callbacks.index.put.updatePlant);
router.delete("/deletePlant", callbacks.index.delete.plant);

module.exports = router;
