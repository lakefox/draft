function loadGET(req, pb) {
    return new Promise((resolve, reject) => {
        pb.authStore.loadFromCookie(req.headers.authorization);
        pb.collection('templates').getList(1, 50, {
            filter: `username = "${decodeURIComponent(req.params.username)}" && name = "${decodeURIComponent(req.params.name)}"`
        }).then((list) => {
            let base = { error: false, template: list.items[0] };
            resolve(base);
        }).catch((error) => {
            pb.authStore.clear();
            resolve({ error: true, errorMsg: error });
        });;
    })
}

function loadPOST(req, pb) {
    return new Promise((resolve, reject) => {
        pb.authStore.loadFromCookie(req.headers.authorization);
        pb.collection('templates').getList(1, 50, {
            filter: `username = "${decodeURIComponent(req.params.username)}" && name = "${decodeURIComponent(req.params.name)}"`
        }).then((list) => {
            if (list.items.length > 0) {
                pb.collection('templates').update(list.items[0].id, req.body.data).then(() => {
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
    })
}

module.exports.GET = loadGET;
module.exports.POST = loadPOST;








// id = @request.auth.id