function draft() {
    this.canvas = {
        width: 500,
        height: 500,
        color: "#000",
        stepLoops: {},
        state: {}
    };
    this.init = function (canvas, ctx, width = 500, height = 500, color = "#000", pad = 100) {
        this.canvas.canvas = canvas;
        this.canvas.ctx = ctx;
        this.canvas.color = color;
        let scaledV = scale(canvas, width, height, pad);
        this.canvas.canvas.width = width;
        this.canvas.canvas.height = height;
        this.canvas.ctx.width = width;
        this.canvas.ctx.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.canvas.style.width = scaledV.width;
        this.canvas.canvas.style.height = scaledV.height;
    }
    function scale(element, width, height, padding) {
        let maxWidth = element.parentNode.clientWidth + padding;
        let maxHeight = element.parentNode.clientHeight + padding;
        if (width > maxWidth) {
            let ratio = maxWidth / width;
            return {
                width: width * ratio,
                height: height * ratio
            }
        } else if (height > maxHeight) {
            let ratio = maxHeight / height;
            return {
                width: width * ratio,
                height: height * ratio
            }
        }
    }
    this.rect = function (id, x, y, width, height, color) {
        this.canvas.state[id] = {};
        this.canvas.state[id].type = "rectangle";
        this.canvas.state[id].y = y;
        this.canvas.state[id].x = x;
        this.canvas.state[id].width = width;
        this.canvas.state[id].height = height;
        this.canvas.state[id].color = color;
    }
    this.oval = function (id, x, y, width, height, color) {
        this.canvas.state[id] = {};
        this.canvas.state[id].type = "oval";
        this.canvas.state[id].y = y;
        this.canvas.state[id].x = x;
        this.canvas.state[id].width = width;
        this.canvas.state[id].height = height;
        this.canvas.state[id].color = color;
    }
    this.image = function (id, image, x, y, width, height) {
        this.canvas.state[id] = {};
        this.canvas.state[id].type = "image";
        this.canvas.state[id].src = image;
        this.canvas.state[id].y = y;
        this.canvas.state[id].x = x;
        this.canvas.state[id].width = width;
        this.canvas.state[id].height = height;
    }
    this.text = function (id, text, x, y, font = '50px sans-serif', color = "#000", stroke = false) {
        this.canvas.state[id] = {};
        this.canvas.state[id].type = "text";
        this.canvas.state[id].y = y;
        this.canvas.state[id].x = x;
        this.canvas.state[id].font = font;
        this.canvas.state[id].color = color;
        this.canvas.state[id].text = text;
        this.canvas.state[id].stroke = stroke;
    }
    this.video = function (id, video, x, y, width, height, fps = 30) {
        this.canvas.state[id] = {};
        this.canvas.state[id].type = "video";
        this.canvas.state[id].video = video;
        this.canvas.state[id].y = y;
        this.canvas.state[id].x = x;
        this.canvas.state[id].width = width;
        this.canvas.state[id].height = height;
        this.canvas.state[id].stop = false;
        let canvas = this.canvas;
        return new Promise((resolve, reject) => {
            function videoLoop() {
                if (!canvas.state[id].video.ended && !canvas.state[id].stop) {
                    canvas.ctx.drawImage(canvas.state[id].video, 0, 0, canvas.state[id].video.videoWidth, canvas.state[id].video.videoHeight, x, y, width, height);
                    setTimeout(videoLoop, 1000 / fps);
                } else {
                    resolve();
                }
            }
            videoLoop();
        });
    }
    this.pause = function (id) {
        this.canvas.state[id].stop = true;
        this.canvas.state[id].video.pause();
    }
    this.object = function (id, cb) {
        if (cb) {
            window[id] = cb;
        } else {
            return window[id];
        }
    }
    this.move = function (id, x, y) {
        var i = this.canvas.state[id];
        if (!isNaN(x) && !isNaN(y)) {
            i.y = y;
            i.x = x;
        } else {
            var xy = {
                x: i.x,
                y: i.y
            }
            return xy;
        }
    }
    this.moveTo = function (id, time, x1, y1, x2, y2, cb) {
        var i = this.canvas.state[id];
        var m = (y2 - y1) / (x2 - x1);
        var b = y1 - (x1 * m);
        var c = 0;
        var lp = setInterval(() => {
            c += ((x2 - x1) / time) * 10;
            i.y = ((m * (x1 + c)) + b);
            i.x = (x1 + c);
            if ((x1 + c) >= x2) {
                clearInterval(lp);
                cb();
            }
            this.draw();
        }, 10);
    }
    this.size = function (id, width, height) {
        var i = this.canvas.state[id];
        if (width && height) {
            i.width = width;
            i.height = height;
        } else {
            var size = {
                width: i.width,
                height: i.height
            };
            return size;
        }
    }
    this.color = function (id, color) {
        var i = this.canvas.state[id];
        if (color) {
            i.color = color;
        } else {
            return i.color;
        }
    }
    this.rotate = function (id, deg) {
        var i = this.canvas.state[id];
        if (deg) {
            i.rotate = deg;
        } else {
            return i.rotate || 0;
        }
    }
    this.remove = function (id) {
        delete this.canvas.state[id];
    }
    this.loop = function (amt, delay, cb) {
        var c = 0;
        var lp = setInterval(() => {
            c++
            if (c >= amt) {
                clearInterval(lp);
                cb(c, true);
            } else {
                cb(c, false);
            }
        }, delay);
    }
    this.step = function (name, cb) {
        this.canvas.stepLoops[name] = {
            function: cb,
            i: 0,
            args: {}
        }
        this.canvas.stepLoops[name].function(this.canvas.stepLoops[name].i, this.canvas.stepLoops[name].args);
    }
    this.next = (name, args = {}) => {
        this.canvas.stepLoops[name].i++;
        this.canvas.stepLoops[name].args = args;
        this.canvas.stepLoops[name].function(this.canvas.stepLoops[name].i, this.canvas.stepLoops[name].args);
    }
    // Helps keep scenes inline
    this.done = function (que, func) {
        if (func) {
            window[que] = func;
        } else {
            window[que]();
        }
    }
    this.measureText = function (text, font = '50px sans-serif') {
        this.canvas.ctx.font = font;
        return this.canvas.ctx.measureText(text);
    }
    this.draw = function () {
        this.canvas.ctx.fillStyle = this.canvas.color;
        this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < Object.keys(this.canvas.state).length; i++) {
            const element = this.canvas.state[Object.keys(this.canvas.state)[i]];
            if (element.type == "rectangle") {
                // this.canvas.state[id].y = y;
                // this.canvas.state[id].x = x;
                // this.canvas.state[id].width = width;
                // this.canvas.state[id].height = height;
                // this.canvas.state[id].color = color;
                this.canvas.ctx.fillStyle = element.color;
                this.canvas.ctx.fillRect(element.x, element.y, element.width, element.height);
            } else if (element.type == "oval") {
                // this.canvas.state[id].type = "oval";
                // this.canvas.state[id].y = y;
                // this.canvas.state[id].x = x;
                // this.canvas.state[id].width = width;
                // this.canvas.state[id].height = height;
                // this.canvas.state[id].color = color;
                this.canvas.ctx.fillStyle = element.color;
                this.canvas.ctx.beginPath();
                this.canvas.ctx.ellipse(element.x, element.y, element.width / 2, element.height / 2, 0, 0, 2 * Math.PI);
                this.canvas.ctx.fill();
            } else if (element.type == "image") {
                // this.canvas.state[id].src = d;
                // this.canvas.state[id].y = y;
                // this.canvas.state[id].x = x;
                // this.canvas.state[id].width = width;
                // this.canvas.state[id].height = height;
                this.canvas.ctx.drawImage(element.src, 0, 0, element.src.width, element.src.height, element.x, element.y, element.width, element.height);
            } else if (element.type == "text") {
                // this.canvas.state[id].y = y;
                // this.canvas.state[id].x = x;
                // this.canvas.state[id].font = font;
                // this.canvas.state[id].color = color;
                // this.canvas.state[id].text = text;
                // this.canvas.state[id].stroke = stroke;
                this.canvas.ctx.font = element.font;
                this.canvas.ctx.fillStyle = element.color;
                if (element.stroke) {
                    this.canvas.ctx.strokeStyle = element.stroke;
                    this.canvas.ctx.lineWidth = 8;
                    this.canvas.ctx.lineJoin = "round";
                    this.canvas.ctx.miterLimit = 2;
                    this.canvas.ctx.strokeText(element.text, element.x, element.y);
                }
                this.canvas.ctx.fillText(element.text, element.x, element.y);
            }
        }
    }
}