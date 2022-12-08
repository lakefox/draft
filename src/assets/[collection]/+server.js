function load(req, pb) {
    return new Promise((resolve, reject) => {
        pb.authStore.loadFromCookie(req.headers.authorization);
        pb.collection('assets').getList(1, 50, {
            filter: `username = "${req.params.collection}"`
        }).then((list) => {
            pb.authStore.clear();
            resolve({ error: false, assets: list.items });
        }).catch((error) => {
            pb.authStore.clear();
            resolve({ error: true, errorMsg: error });
        });;
    })
}

module.exports.GET = load;