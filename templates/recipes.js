// Picks a random word gives the meaning and shows it (could add multiple langs)

let recipesArgs = {
    videoBackground: {
        value: "#000",
        name: "Video Background",
        type: "color"
    },
    duration: {
        value: 6,
        name: "Video Duration",
        type: "number"
    },
    saveName: {
        value: "recipe",
        name: "Save As",
        type: "text"
    },
    recipe: {
        value: "",
        name: "Recipe Preview",
        type: "textarea"
    }
};

function recipes(args, download, cb) {
    let d = new draft();

    let canvas = document.querySelector("canvas");
    let ctx = canvas.getContext("2d");
    let r = new recorder(canvas);


    d.init(canvas, ctx, 1080, 1920, args.videoBackground.value);

    r.start();
    d.step("loop", (i) => {

        if (i >= images.length - 1) {
            r.stop((url) => {
                console.log(url);
                if (download) {
                    r.download(args.saveName.value)
                }
                cb();
            });
        } else {
            d.next("loop");
        }

    });
}

let recipesAutoFillArgs = {
    subreddit: {
        value: "recipes",
        name: "Subreddit",
        type: "text"
    },
    sort: {
        value: "new",
        values: ["new", "hot", "top", "rising"],
        name: "Sort By",
        type: "select"
    },
    index: {
        value: 0,
        name: "Select Post",
        type: "number"
    },
    hashtags: {
        value: 100,
        name: "Hashtags",
        type: "number"
    }
};

function recipesAutoFill(args, inputArgs) {

}