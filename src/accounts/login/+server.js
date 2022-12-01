function load(req, pb) {
    return new Promise(async (resolve, reject) => {
        pb.collection('users').authWithPassword(req.body.username || req.body.email, req.body.password).then((authData) => {
            let token = pb.authStore.exportToCookie();
            pb.authStore.clear();
            resolve({
                email: authData.record.email,
                username: authData.record.username,
                token: token,
                error: false
            });
        }).catch((error) => {
            pb.authStore.clear();
            resolve({ error: true, errorMsg: error });
        });
    });
}
module.exports.POST = load;