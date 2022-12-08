function load(req, pb) {
    return new Promise((resolve, reject) => {
        fetch(`http://127.0.0.1:8090/api/files/${req.params.collection}/${req.params.record}/${req.params.filename}`)
            .then(r => r.blob()).then(async (file) => {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                resolve(buffer);
            }).catch((e) => {
                resolve(e);
            })
    })
}

module.exports.GET = load;