const express = require("express"),
      router  = express.Router({mergeParams: true});

const callbacks       = require("./callbacks.js");

// GET
router.get("/", callbacks.index.get.landing);
router.get("/index", callbacks.index.get.index);
router.get("/index/data", callbacks.index.get.index_data);

router.get("/newPlant", callbacks.index.get.newPlant);
router.get("/updatePlant", callbacks.index.get.updatePlant);

router.post("/newPlant", callbacks.index.post.newPlant);
router.put("/updatePlant", callbacks.index.put.updatePlant);

module.exports = router;
