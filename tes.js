const path = require("path");
const fs = require("fs");
const moment = require("moment");

var dir = path.join(__dirname, "/history/ziatogel/deposit/bca");

try {
    var time = moment().format('Y-M-D')+".json";
    console.log(time);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
    var dirFile = path.join(dir,time);
    if (fs.existsSync(dirFile)) {
      console.log("file ada");
    }else{
        console.log("create");
        const newData = JSON.stringify([]);
		    fs.writeFileSync(dirFile, newData);
    }
  } catch(err) {
    console.error(err)
  }