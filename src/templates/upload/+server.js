function load(req, pb) {
    return new Promise((resolve, reject) => {
        console.log(req.body);
        pb.authStore.loadFromCookie(req.headers.authorization);
        pb.collection('templates').create(req.body).then((record) => {
            pb.authStore.clear();
            record.error = false;
            console.log(record);
            resolve(record);
        }).catch((error) => {
            pb.authStore.clear();
            console.log(error);
            resolve({ error: true, errorMsg: error });
        });
    });
}

module.exports.POST = load;