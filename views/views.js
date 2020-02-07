var path = require("path");

const viewsDir = path.join(__dirname, "/");

const views = {
    index: {
      home: viewsDir + "index/home",
      index: viewsDir + "index/index",
      newPlant: viewDir + "index/newPlant",
      updatePlant: viewDir + "index/updatePlant",
    }
};

module.exports = views;
