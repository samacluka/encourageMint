const express = require("express"),
      router  = express.Router({mergeParams: true});

const callbacks       = require("./callbacks.js");

// GET
router.get("/getSetpoints", callbacks.controller.get.setpoints);
router.get("/epoch", callbacks.controller.get.epoch);

// POST
router.post("/message", callbacks.controller.post.message);

// PUT
router.put("/setLogs", callbacks.controller.put.logs);


module.exports = router;
