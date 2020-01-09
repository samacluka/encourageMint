var path = require("path");

const viewsDir = path.join(__dirname, "/");

const views = {
    controller: {
      getSetpoints: viewsDir + "controller/getSetpoints",
      setLogs: viewsDir + "controller/setLogs",
    }
};

module.exports = views;
