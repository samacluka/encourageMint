var path = require("path");

const viewsDir = path.join(__dirname, "/");

const views = {
    index: {
      landing: viewsDir + "index/landing",
      index: viewsDir + "index/index-d3"
    }
};

module.exports = views;
