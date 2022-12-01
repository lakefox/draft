function load(req, pb) {
    return new Promise((resolve, reject) => {
        pb.collection('users').create(req.body).then((record) => {
            record.error = false;
            resolve(record);
        }).catch((error) => {
            resolve({ error: true, errorMsg: error });
        });
    });
}

module.exports.POST = load;