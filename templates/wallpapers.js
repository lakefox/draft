// Take an input of serval images show them full screened then show them cropped
// upload to site????

let wallpapersArgs = {
    videoBackground: {
        value: "#000",
        name: "Video Background",
        type: "color"
    },
    images: {
        value: "",
        name: "Images",
        type: "textarea"
    },
    slideDuration: {
        value: 6,
        name: "Slide Duration in Seconds",
        type: "number"
    },
    saveName: {
        value: "wallpaper",
        name: "Save As",
        type: "text"
    },
};

function wallpapers(args, download, cb) {
    let d = new draft();

    let canvas = document.querySelector("canvas");
    let ctx = canvas.getContext("2d");
    let r = new recorder(canvas);


    d.init(canvas, ctx, 1080, 1920, args.videoBackground.value);
    let images = args.images.value.split(",");
    r.start();
    d.step("slide-loop", (i) => {
        d.text("link", "", 70, 1700, "70px monospace", "#fff", "#000");
        drawImage(d, "wallpaper", images[i], 550, 1920);
        setTimeout(() => {
            fetch('https://api-ssl.bitly.com/v4/shorten', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer 746e6e92d6907a36803a8881854e58bfc3f8a9d5',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "long_url": images[i], "domain": "bit.ly" })
            }).then(res => res.json()).then((data) => {
                console.log(data);
                let url = "low.sh/w/" + data.id.split("/")[1];
                drawImage(d, "wallpaper", images[i], 500, 1000);
                d.text("link", url, 70, 1600, "70px monospace", "#fff", "#000");
            });
        }, args.slideDuration.value * 500);
        setTimeout(() => {
            if (i >= images.length - 1) {
                r.stop((url) => {
                    console.log(url);
                    if (download) {
                        r.download(args.saveName.value)
                    }
                    cb();
                });
            } else {
                d.next("slide-loop");
            }
        }, args.slideDuration.value * 1000);
    });
}

let wallpapersAutoFillArgs = {

};

function wallpapersAutoFill(args, inputArgs) {

}

