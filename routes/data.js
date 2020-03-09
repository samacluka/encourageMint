const express = require("express"),
      router  = express.Router({mergeParams: true});

const callbacks       = require("./callbacks.js");

// GET
router.get("/log/:id/:time", callbacks.data.get.log);
router.get("/log/:id/:lower/:upper", callbacks.data.get.log2);
router.get("/plant", callbacks.data.get.plant);
router.get("/message", callbacks.data.get.message);
router.get("/default", callbacks.data.get.default);

// POST
router.post("/newPlant", callbacks.data.post.newPlant);

// PUT
router.put("/notifications", callbacks.data.put.notifications);
router.put("/updatePlant", callbacks.data.put.updatePlant);

// DELETE
router.delete("/message", callbacks.data.delete.message);
router.delete("/deletePlant", callbacks.data.delete.plant);

module.exports = router;
