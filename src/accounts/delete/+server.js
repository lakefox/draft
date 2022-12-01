function load(req, pb) {

    return new Promise((resolve, reject) => {
        let filt = '';
        let sort = '';
        if (req.body.email) {
            filt = `email = "${req.body.email}"`;
            sort = `-email`;
        } else if (req.body.username) {
            filt = `username = "${req.body.username}"`;
            sort = `-username`;
        }
        pb.authStore.loadFromCookie(req.headers.authorization);
        pb.collection('users').getList(1, 30, {
            filter: filt,
            sort: sort
        }).then((list) => {
            if (list.items.length > 0) {
                pb.collection('users').delete(list.items[0].id).then(() => {
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