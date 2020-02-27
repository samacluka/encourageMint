const express = require("express"),
      router  = express.Router({mergeParams: true});

const callbacks       = require("./callbacks.js");

const is              = require("../middleware/is.js");

router.get("/log/:id/:time", callbacks.data.get.log);
router.get("/plant/:id/:type", callbacks.data.get.plant);

module.exports = router;
