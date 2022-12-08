function load(req, pb) {
    return new Promise((resolve, reject) => {
        pb.authStore.loadFromCookie(req.headers.authorization);
        let fileBuffer = Buffer.from(req.body.data, "binary");
        let form = new FormData();
        form.append("username", req.body.username);
        form.append("name", req.body.name);
        form.append("file", new Blob([fileBuffer]), req.body.name);
        pb.collection('assets').create(form).then((e) => {
            pb.authStore.clear();
            resolve({ err: false, data: e });
        }).catch((e) => {
            pb.authStore.clear();
            resolve({ err: true, data: e });
        })
    });
}

module.exports.POST = load;