function drawImage(d, name, path, width, height) {
    let slide = new Image();
    slide.onload = () => {
        let adjHeight = height;
        let adjWidth = width;
        let adjX = 0;
        let adjY = 0;
        if (slide.width > slide.height) {
            adjHeight = height * (width / slide.width);
            adjWidth = width * (height / slide.height);
            adjX += (1080 - adjWidth) / 2;
            adjY += (1920 - adjHeight) / 2;
        } else if (slide.height > slide.width) {
            adjHeight = height * (width / slide.width);
            adjWidth = width * (height / slide.height);
            adjX += (1080 - adjWidth) / 2;
            adjY += (1920 - adjHeight) / 2;
        }
        d.image(name, slide, adjX, adjY, adjWidth, adjHeight);
        d.draw();
    }
    slide.crossOrigin = "anonymous";
    slide.src = "https://cors.lowsh.workers.dev/?" + path;
}