function load(req, pb) {
    return new Promise((resolve, reject) => {
        pb.authStore.loadFromCookie(req.headers.authorization);
        pb.collection('templates').getList(1, 50, {
            filter: `username = "${req.params.username}"`
        }).then((list) => {
            resolve({ error: false, templates: list.items })
        }).catch((error) => {
            resolve({ error: true, errorMsg: error });
        });;
    })
}

module.exports.GET = load;