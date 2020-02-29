const express = require("express"),
      router  = express.Router({mergeParams: true});

const callbacks       = require("./callbacks.js");

// GET
router.get("/log/:id/:time", callbacks.data.get.log);
router.get("/plant/:id/:type", callbacks.data.get.plant);
router.get("/message/:id/:type", callbacks.data.get.message);
router.get("/default/:type", callbacks.data.get.default);

// DELETE
router.delete("/message/:id/:type", callbacks.data.delete.message);

module.exports = router;
