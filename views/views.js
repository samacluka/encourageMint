var path = require("path");

const viewsDir = path.join(__dirname, "/");

const views = {
    index: {
      home: viewsDir + "index/home"
    },
    controller: {
      getSetpoints: viewsDir + "controller/getSetpoints",
      setLogs: viewsDir + "controller/setLogs",
    }
};

module.exports = views;
