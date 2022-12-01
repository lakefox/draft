let slideShowArgs = {
    logo: {
        value: [],
        name: "Logo",
        type: "file"
    },
    logoWidth: {
        value: 50,
        name: "Logo Width",
        type: "number"
    },
    logoHeight: {
        value: 150,
        name: "Logo Height",
        type: "number"
    },
    saveName: {
        value: "slides",
        name: "Save As",
        type: "text"
    },
    videoBackground: {
        value: "#000",
        name: "Video Background",
        type: "color"
    },
    mainImg: {
        value: [],
        name: "Main Image",
        type: "file"
    },
    mainImgWidth: {
        value: 1000,
        name: "Main Image Width",
        type: "number"
    },
    mainImgHeight: {
        value: 1000,
        name: "Main Image Height",
        type: "number"
    },
    slideDuration: {
        value: 3,
        name: "Slide Duration in Seconds",
        type: "number"
    },
    images: {
        value: [],
        name: "Images",
        type: "files",
        autofilled: false
    }
}

let slideShowAutoFillArgs = {
    subreddit: {
        value: "nocontextpics",
        name: "Subreddit",
        type: "text"
    },
    sort: {
        value: "new",
        values: ["new", "hot", "top", "rising"],
        name: "Sort By",
        type: "select"
    },
    amount: {
        value: 10,
        name: "Image Amount",
        type: "number"
    }
}

function slideShow(args, download, cb) {
    let d = new draft();

    let canvas = document.querySelector("canvas");
    let ctx = canvas.getContext("2d");
    let r = new recorder(canvas);


    d.init(canvas, ctx, 1080, 1920, args.videoBackground.value);

    let logo = new Image();
    logo.onload = () => {
        let mainImg = new Image();
        mainImg.onload = () => {
            r.start();
            d.step("slide-loop", (i) => {
                if (args.images.value[i]) {
                    let slide = new Image();
                    slide.onload = () => {
                        let adjHeight = 1920;
                        let adjWidth = 1080;
                        let adjX = 0;
                        let adjY = 0;
                        if (slide.width > slide.height) {
                            adjHeight = 1920 * (1080 / slide.width);
                            adjY += (1920 - adjHeight) / 2;
                        } else if (slide.height > slide.width) {
                            adjWidth = 1080 * (1920 / slide.height);
                            adjX += (1080 - adjWidth) / 2;
                        }
                        if (adjWidth > 1080) {
                            adjHeight = 1920 * (1080 / slide.width);
                            adjWidth = 1080;
                            adjX = (1080 - adjWidth) / 2;
                            adjY = (1920 - adjHeight) / 2;

                        }
                        if (adjHeight > 1920) {
                            adjWidth = 1080 * (1920 / slide.height);
                            adjHeight = 1920;
                            adjX = (1080 - adjWidth) / 2;
                            adjY = (1920 - adjHeight) / 2;

                        }
                        d.image("slide", slide, adjX, adjY, adjWidth, adjHeight);
                        d.image("image", logo, 0, 0, args.logoWidth.value, args.logoHeight.value);
                        d.image("mainImg", mainImg, (1080 - args.mainImgWidth.value) / 2, (1920 - args.mainImgHeight.value) / 2, args.mainImgWidth.value, args.mainImgHeight.value);
                        d.draw();
                    }
                    slide.src = args.images.value[i];
                    setTimeout(() => {
                        if (i >= args.images.value.length - 1) {
                            r.stop((url) => {
                                if (download) {
                                    r.download(args.saveName.value)
                                }
                                cb();
                            });
                        } else {
                            d.next("slide-loop");
                        }
                    }, args.slideDuration.value * 1000);
                }
            });
        }
        mainImg.src = args.mainImg.value[0];
    }
    logo.src = args.logo.value[0];

}

function slideShowAutoFill(args, inputArgs) {
    return new Promise((resolve, reject) => {
        fetch(`https://cors.lowsh.workers.dev/?https://reddit.com/r/${args.subreddit.value}/${args.sort.value}.json`)
            .then(res => res.json())
            .then(async (data) => {
                let posts = data.data.children.slice(0, args.amount.value);
                let images = [];
                for (let i = 0; i < posts.length; i++) {
                    const url = posts[i].data.url;
                    fetch(url)
                        .then((res) => res.blob())
                        .then((data) => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                images.push(reader.result);
                                if (images.length == args.amount.value - 1) {
                                    inputArgs.images.values = images;
                                    inputArgs.images.autofilled = true;
                                    console.log(inputArgs);
                                    resolve(inputArgs)
                                }
                            };
                            reader.onerror = () => {
                                console.log('reader error');
                            };
                            reader.readAsDataURL(data);
                        })
                }
                resolve(inputArgs);
            });
    });
}