function load(req, pb) {
    return new Promise((resolve, reject) => {
        pb.authStore.loadFromCookie(req.headers.authorization);
        pb.collection('templates').getList(1, 50, {
            filter: `username = "${req.params.username}" && name = "${req.params.name}"`
        }).then((list) => {
            let base = { error: false, template: list.items[0] };
            fetch(`${pb.dbURL}/api/files/${base.template.collectionId}/${base.template.id}/${base.template.file}`)
                .then(r => r.text()).then((res) => {
                    base.template.data = res;
                    resolve(base);
                });
        }).catch((error) => {
            resolve({ error: true, errorMsg: error });
        });;
    })
}

module.exports.GET = load;








// id = @request.auth.id