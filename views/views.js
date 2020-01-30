var path = require("path");

const viewsDir = path.join(__dirname, "/");

const views = {
    index: {
      home: viewsDir + "index/home",
      index: viewsDir + "index/index"
    }
};

module.exports = views;
