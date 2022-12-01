const fs = require("fs");
const path = require("path");

function load(req) {
    let filePath = path.join(__dirname, `../../../templates/${req.body.name}.js`);
    fs.writeFileSync(filePath, req.body.text);
    return { error: false };
}

module.exports.POST = load;