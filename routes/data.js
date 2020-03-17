const express = require("express"),
      router  = express.Router({mergeParams: true});

const callbacks       = require("./callbacks.js");

const is              = require("../middleware/is.js");

// GET
router.get("/log/:id/:time", is.LoggedIn, callbacks.data.get.log);
router.get("/plant", is.LoggedIn, callbacks.data.get.plant);
router.get("/message", is.LoggedIn, callbacks.data.get.message);
router.get("/default", is.LoggedIn, callbacks.data.get.default);

// POST
router.post("/newPlant", is.LoggedIn, callbacks.data.post.newPlant);

// PUT
router.put("/notifications", is.LoggedIn, callbacks.data.put.notifications);
router.put("/updatePlant", is.LoggedIn, callbacks.data.put.updatePlant);

// DELETE
router.delete("/message", is.LoggedIn, callbacks.data.delete.message);
router.delete("/message/all", is.LoggedIn, callbacks.data.delete.messages);
router.delete("/deletePlant", is.LoggedIn, callbacks.data.delete.plant);

module.exports = router;
