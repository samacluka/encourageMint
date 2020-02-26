const express = require("express"),
      router  = express.Router({mergeParams: true});

const callbacks       = require("./callbacks.js");

const is              = require("../middleware/is.js");

// GET
router.get("/", callbacks.index.get.landing);
router.get("/index", is.LoggedIn, callbacks.index.get.index);
router.get("/log/data/:id/:time", callbacks.index.get.data.log);
router.get("/plant/data/:uid", callbacks.index.get.data.plant);

router.post("/newPlant", callbacks.index.post.newPlant);
router.put("/updatePlant", callbacks.index.put.updatePlant);

module.exports = router;
