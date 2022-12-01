function LOW(baseURL) {
    this.email = null;
    this.password = null;
    this.username = null;
    let token = null;
    this.upload = () => {
        let payload = {
            name: "test",
            text: "test1232312321321323"
        }
        return new Promise((resolve, reject) => {
            postData(`${baseURL}/templates/upload`, payload)
                .then((res) => {
                    console.log(res);
                    resolve(res);
                })
        })
    }

    this.createAccount = (username, email, password) => {
        return new Promise((resolve, reject) => {
            postData(`${baseURL}/accounts/create`, {
                "username": username,
                "email": email,
                "emailVisibility": true,
                "password": password,
                "passwordConfirm": password
            }).then((d) => {
                if (!d.error) {
                    token = d.token;
                    resolve(d);
                } else {
                    reject(d);
                }
            }).catch((err) => {
                if (err) {
                    reject(err);
                }
            })
        });
    }

    this.login = (email, password) => {
        this.email = email;
        this.password = password;
        return new Promise((resolve, reject) => {
            postData(`${baseURL}/accounts/login`, {
                // "username": "test_username",
                "email": email,
                "password": password,
            }).then((d) => {
                if (!d.error) {
                    this.username = d.username;
                    token = d.token;
                    resolve(d);
                } else {
                    reject(d);
                }
            }).catch((err) => {
                if (err) {
                    reject(err);
                }
            })
        });
    }

    this.log = () => {
        console.log(this.username);
    }

    this.deleteAccount = () => {
        return new Promise((resolve, reject) => {
            postData(`${baseURL}/accounts/delete`, {
                // "username": "test_username",
                "email": "test@example.com",
                "password": "12345678",
            }).then((d) => {
                if (d.err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    this.get = (template) => {
        return new Promise((resolve, reject) => {
            fetch(`${baseURL}/templates/${this.username}/${template}`, {
                headers: {
                    'Authorization': token
                }
            }).then(r => r.json()).then((d) => {
                if (d.err) {
                    reject(err);
                } else {
                    resolve(d.template);
                }
            });
        });
    }

    this.list = () => {
        return new Promise((resolve, reject) => {
            fetch(`${baseURL}/templates/${this.username}`, {
                headers: {
                    'Authorization': token
                }
            }).then(r => r.json()).then((d) => {
                if (d.err) {
                    reject(err);
                } else {
                    resolve(d.templates)
                }
            });
        });
    }

    async function postData(url = '', data = {}) {
        // Default options are marked with *
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
        return response.json(); // parses JSON response into native JavaScript objects
    }
}