function load(req, pb) {
    return new Promise((resolve, reject) => {
        pb.authStore.loadFromCookie(req.headers.authorization);
        pb.collection('templates').getList(1, 30, {
            filter: `username = "${req.body.username}" && name = "${req.body.name}"`
        }).then((list) => {
            console.log(list);
            if (list.items.length > 0) {
                pb.collection('templates').delete(list.items[0].id).then(() => {
                    pb.authStore.clear();
                    resolve({ error: false })
                }).catch((error) => {
                    resolve({ error: true, errorMsg: error });
                });
            }
        }).catch((error) => {
            pb.authStore.clear();
            resolve({ error: true, errorMsg: error });
        });;
    });
}
module.exports.POST = load;