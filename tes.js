const path = require("path");
const fs = require("fs");

var dir = path.join(__dirname, "ziatogel/deposit/bca");

try {
    if (fs.ex) {
        
    }
    if (fs.existsSync(dir)) {
      console.log("file ada");
    }else{
        console.log("create");
        const newData = JSON.stringify([]);
		fs.writeFileSync(dir, newData);
    }
  } catch(err) {
    console.error(err)
  }