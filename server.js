let PocketBase = require("pocketbase/cjs");
let path = require("path");
let express = require("express");
let app = express();
let fs = require("fs");
let cors = require("cors");
const util = require('util');

const dbURL = 'http://127.0.0.1:8090';
const pb = new PocketBase(dbURL);
pb.dbURL = dbURL;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.listen(8080);

const src = "./src";
let devMode = true;

let dir = getFiles(src);
let dirStr = JSON.stringify(dir);
let routes = collapsePaths(dir);

app.get("*", async (req, res) => {
    handle(req, res);
});

app.post("*", async (req, res) => {
    handle(req, res, true);
});

function handle(req, res, isPost) {
    if (devMode) {
        let newDirs = getFiles(src);
        if (JSON.stringify(newDirs) != dirStr) {
            dir = newDirs;
            routes = collapsePaths(dir);
        }
    }
    if (req.path.indexOf("../") > -1) {
        throw new Error('401')
    } else {
        let filePath = path.join(__dirname, src, req.path) + "/+server.js";
        if (!fs.existsSync(filePath)) {
            let route = matchRoute(req.path, routes, dir);
            if (route) {
                let func;
                if (devMode) {
                    func = requireUncached(path.join(__dirname, route.path));
                } else {
                    func = require(path.join(__dirname, route.path));
                }
                exe(func, isPost, route, req, res);

            } else {
                res.sendStatus(404);
            }
        } else {
            // import file get function load execute with params or req
            let func;
            if (devMode) {
                func = requireUncached(filePath);
            } else {
                func = require(filePath);
            }
            exe(func, isPost, {}, req, res);
        }
    }
}

function exe(func, isPost, route, req, res) {
    route.headers = req.headers;
    if (isPost) {
        if (func.POST) {
            route.body = req.body;
            let v = func.POST(route, pb);
            if (util.types.isPromise(v)) {
                v.then((value) => {
                    res.send(value);
                })
            } else {
                res.send(v);
            }
        } else {
            res.sendStatus(404);
        }
    } else {
        if (func.GET) {
            let v = func.GET(route, pb);
            if (util.types.isPromise(v)) {
                v.then((value) => {
                    res.send(value);
                })
            } else {
                res.send(v);
            }
        } else if (func) {
            let v = func(route, pb);
            if (util.types.isPromise(v)) {
                v.then((value) => {
                    res.send(value);
                })
            } else {
                res.send(v);
            }
        }
    }
}

function getFiles(dir) {
    return fs.readdirSync(dir).flatMap((item) => {
        const path = `${dir}/${item}`;
        if (fs.statSync(path).isDirectory()) {
            return getFiles(path);
        }

        return path;
    });
}

function collapsePaths(paths) {
    let collapsed = [];
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        let vals = path.match(/([^[]+(?=]))/g);
        let ast = path.replace("+server.js", "").slice(5);
        if (vals) {
            for (let i = 0; i < vals.length; i++) {
                ast = ast.replace(`[${vals[i]}]`, "*");
            }
        }
        collapsed.push({
            url: ast,
            params: vals
        });
    }
    return collapsed;
}

function matchRoute(route, routes, dir) {
    let routeSplit = route.split("/").filter(e => e != "");
    let poss = [];
    for (let i = 0; i < routes.length; i++) {
        let pathSplit = routes[i].url.split("/").filter(e => e != "");
        let path = {};
        let paramsIndex = 0;
        let good = true;
        for (let a = 0; a < routeSplit.length; a++) {
            if (pathSplit[a] && routeSplit[a]) {
                if (pathSplit[a] == "*") {
                    path[routes[i].params[paramsIndex]] = routeSplit[a];
                    paramsIndex++;
                } else if (pathSplit[a] != routeSplit[a]) {
                    good = false;
                }
            } else {
                good = false;
            }

        }
        if (good) {
            poss.push({
                path: dir[i],
                route: routes[i],
                params: path
            });
        }
    }
    return poss[0];
}

function requireUncached(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
}