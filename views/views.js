var path = require("path");

const viewsDir = path.join(__dirname, "/");

const views = {
    index: {
      home: viewsDir + "index/home"
    }
};

module.exports = views;
