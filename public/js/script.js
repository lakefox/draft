// Load the side menu
let templateIndex, templateNames, loadedTemplate;

let low = new LOW("https://draft.low.sh");
load(localStorage.email, localStorage.password);
function load(email, password) {
    low.login(email, password).then((token) => {
        low.list().then(async (templates) => {
            templateIndex = {};
            for (let i = 0; i < templates.length; i++) {
                let tempData = await low.get(templates[i].name);
                templateIndex[tempData.name] = await getCode(tempData);
                templateIndex[tempData.name].carbonCopy = tempData.file;
            }

            templateNames = Object.keys(templateIndex);

            loadSidebar();

            loadedTemplate = "";
            document.querySelector("#menu").click();
            if (templateNames.length > 0) {
                loadTemplate({ dataset: { name: templateNames[0] } });
            } else {
                createTemplate();
            }
        });
    }).catch((err) => {
        localStorage.email = undefined;
        localStorage.password = undefined;
        document.querySelector("#login-modal").click();
    });
}

let download = false;

function loadSidebar() {
    document.querySelector("#sideBar").innerHTML = `<div id="createTemplate" onclick="createTemplate()">
                    <i class='bx bxs-file'></i> Create Template
                </div><div id="addAssets" onclick="addAssets()">
                    <i class='bx bxs-image'></i> Add/View Assets
                </div>`;
    for (let i = 0; i < templateNames.length; i++) {
        const name = templateNames[i];
        document.querySelector("#sideBar").innerHTML += `<li onclick="loadTemplate(this)" class="border-2 mb-[10px] border-slate-50 rounded-[5px]" data-name="${name}"><a>${templateIndex[name].name}</a></li>`;
    }
}

function loadTemplate(e) {
    let key = e.dataset.name;
    loadedTemplate = key;
    document.querySelector("#menu").click();

    editor.session.setValue(templateIndex[key].carbonCopy)

    let templateArgs = templateIndex[key].args;
    if (templateIndex[key].fonts) {
        for (let i = 0; i < templateIndex[key].fonts.length; i++) {
            loadFont(templateIndex[key].fonts[i]);
        }
    }
    let autoFillHTML = ``;
    if (templateIndex[key].autofill) {
        autoFillHTML += `<div class="mb-[30px]">
            <h1>Autofill Settings</h1>
        </div>`
        let autofillArgs = templateIndex[key].autofillArgs;
        for (let i = 0; i < Object.keys(autofillArgs).length; i++) {
            const arg = autofillArgs[Object.keys(autofillArgs)[i]];
            let input = "";
            if (arg.type == "text") {
                input = `<input type="text" value="${arg.value}" data-template="${key}" data-property="${Object.keys(autofillArgs)[i]}" data-type="text" data-autofill="true" onchange="editValue(this)" class="input input-bordered w-full max-w-xs" />`;
            } else if (arg.type == "color") {
                input = `<input type="color" value="${arg.value}" data-template="${key}" data-property="${Object.keys(autofillArgs)[i]}" data-type="text" data-autofill="true" onchange="editValue(this)" class="input input-bordered w-full h-[30px]" />`;
            } else if (arg.type == "number") {
                input = `<input type="number" value="${arg.value}" data-template="${key}" data-property="${Object.keys(autofillArgs)[i]}" data-type="text" data-autofill="true" onchange="editValue(this)" class="input input-bordered w-full max-w-xs" />`;
            } else if (arg.type == "file") {
                input = `<input type="file" data-template="${key}" data-property="${Object.keys(autofillArgs)[i]}" data-type="file" data-autofill="true" onchange="editValue(this)" class="input input-bordered w-full max-w-xs" />`;
            } else if (arg.type == "files") {
                input = `<input type="file" multiple data-template="${key}" data-property="${Object.keys(autofillArgs)[i]}" data-type="file" data-autofill="true" onchange="editValue(this)" class="input input-bordered w-full max-w-xs" />`;
            } else if (arg.type == "select") {
                input = `<select data-template="${key}" data-property="${Object.keys(autofillArgs)[i]}" data-type="text" data-autofill="true" onchange="editValue(this)" class="input input-bordered w-full max-w-xs">`;
                for (let b = 0; b < arg.values.length; b++) {
                    const element = arg.values[b];
                    input += `<option value="${element}">${element}</option>`;
                }
                input += `</select>`;
            } else if (arg.type == "textarea") {
                input = `<textarea data-template="${key}" data-property="${Object.keys(autofillArgs)[i]}" data-type="file" data-autofill="true" onchange="editValue(this)" class="input input-bordered w-full max-w-xs"></textarea>`;
            }
            autoFillHTML += `<div class="card bg-base-100 shadow-xl mb-[10px]">
                <div class="card-body py-0">
                    <div class="form-control w-full max-w-xs">
                        <label class="label">
                            <span class="label-text">${arg.name}</span>
                        </label>
                        ${input}
                    </div>
                </div>
            </div>`
        }
        autoFillHTML += `<div class="card bg-base-100 shadow-xl mb-[50px]">
                <div class="card-body py-0">
                    <div class="form-control w-full max-w-xs flex items-center">
                        <button onclick="autofill()" class="btn btn-wide button">Autofill</button>
                    </div>
                </div>
            </div>`
    }

    let html = `${autoFillHTML}<div class="mb-[30px]">
            <h1>Template Settings</h1>
        </div><div class="card bg-base-100 shadow-xl mb-[10px]">
                <div class="card-body py-0">
                    <div class="form-control w-full max-w-xs flex items-center">
                        <button onclick="render()" class="btn btn-wide button">Render</button>
                    </div>
                </div>
            </div>
            <div class="card bg-base-100 shadow-xl mb-[10px]">
                <div class="card-body py-0">
                    <div class="form-control">
                        <label class="label cursor-pointer">
                            <span class="label-text">Download</span>
                            <input type="checkbox"  onchange="checkDownload(this)" class="checkbox" />
                        </label>
                    </div>
                </div>
            </div>`;
    for (let i = 0; i < Object.keys(templateArgs).length; i++) {
        const arg = templateArgs[Object.keys(templateArgs)[i]];
        let input = "";
        if (arg.type == "text") {
            input = `<input type="text" value="${arg.value}" data-template="${key}" data-property="${Object.keys(templateArgs)[i]}" data-type="text" onchange="editValue(this)" class="input input-bordered w-full max-w-xs" />`;
        } else if (arg.type == "color") {
            input = `<input type="color" value="${arg.value}" data-template="${key}" data-property="${Object.keys(templateArgs)[i]}" data-type="text" onchange="editValue(this)" class="input input-bordered w-full h-[30px]" />`;
        } else if (arg.type == "number") {
            input = `<input type="number" value="${arg.value}" data-template="${key}" data-property="${Object.keys(templateArgs)[i]}" data-type="text" onchange="editValue(this)" class="input input-bordered w-full max-w-xs" />`;
        } else if (arg.type == "file") {
            input = `<input type="file" data-template="${key}" data-property="${Object.keys(templateArgs)[i]}" data-type="file" onchange="editValue(this)" class="input input-bordered w-full max-w-xs" />`;
        } else if (arg.type == "files") {
            input = `<input type="file" multiple data-template="${key}" data-property="${Object.keys(templateArgs)[i]}" data-type="file" onchange="editValue(this)" class="input input-bordered w-full max-w-xs" />`;
        } else if (arg.type == "textarea") {
            input = `<textarea data-template="${key}" data-property="${Object.keys(templateArgs)[i]}" data-type="text" onchange="editValue(this)" class="input input-bordered w-full max-w-xs"></textarea>`;
        }
        html += `<div class="card bg-base-100 shadow-xl">
                <div class="card-body py-0">
                    <div class="form-control w-full max-w-xs">
                        <label class="label">
                            <span class="label-text">${arg.name}</span>
                        </label>
                        ${input}
                    </div>
                </div>
            </div>`
    }
    html += `
            <div class="card bg-base-100 shadow-xl mb-[10px] mt-[50px]">
                <div class="card-body py-0">
                    <div class="form-control w-full max-w-xs flex items-center">
                        <button onclick="deleteTemplate()" class="btn btn-wide button-red uppercase">Delete</button>
                    </div>
                </div>
            </div>`;
    document.querySelector("#controls").innerHTML = html;
}

function editValue(e) {
    let templateName = e.dataset.template;
    let propertyName = e.dataset.property;
    let type = e.dataset.type;
    if (e.dataset.autofill) {
        if (type == "text" || type == "select") {
            templateIndex[templateName].autofillArgs[propertyName].value = e.value;
        } else if (type == "number") {
            templateIndex[templateName].autofillArgs[propertyName].value = parseFloat(e.value);
        }
    } else {
        if (type == "text" || type == "select") {
            templateIndex[templateName].args[propertyName].value = e.value;
        } else if (type == "number") {
            templateIndex[templateName].args[propertyName].value = parseFloat(e.value);
        } else if (type == "file") {
            for (let i = 0; i < e.files.length; i++) {
                const file = e.files[i];
                const reader = new FileReader();

                reader.addEventListener("load", () => {
                    // convert image file to base64 string
                    templateIndex[templateName].args[propertyName].value.push(reader.result);
                }, false);

                if (file) {
                    reader.readAsDataURL(file);
                }
            }
        }
    }
}


function checkDownload(e) {
    download = e.checked;
}

window.onload = () => {
    document.querySelector("canvas").style.width = 1080 * ((window.innerHeight - 300) / 1920) + "px";
    document.querySelector("canvas").style.height = (window.innerHeight - 300) + "px";
}

function render() {
    templateIndex[loadedTemplate].function(templateIndex[loadedTemplate].args, download, () => {
        document.querySelector("#my-modal-4").checked = true;
    });
}

function autofill() {
    templateIndex[loadedTemplate].autofill(templateIndex[loadedTemplate].autofillArgs, templateIndex[loadedTemplate].args).then((data) => {
        templateIndex[loadedTemplate].args = data;
        document.querySelector("#menu").click();
        loadTemplate({ dataset: { name: loadedTemplate } });
    });
}

async function reload(newTemplate = false) {
    let code = await getCode({ id: "e" + loadedTemplate.replace(/[^a-z0-9]/gi, ''), file: editor.getValue() });
    if (!newTemplate) {
        delete templateIndex[loadedTemplate];
    }
    templateIndex[code.name] = code;
    templateIndex[code.name].carbonCopy = editor.getValue();

    templateNames = Object.keys(templateIndex);
    document.querySelector("#sideBar").innerHTML = `<div id="createTemplate" onclick="createTemplate()">
                    <i class='bx bxs-file'></i> Create Template
                </div>`;
    for (let i = 0; i < templateNames.length; i++) {
        const name = templateNames[i];
        document.querySelector("#sideBar").innerHTML += `<li onclick="loadTemplate(this)" class="border-2 mb-[10px] border-slate-50" data-name="${name}"><a>${templateIndex[name].name}</a></li>`;
    }

    loadedTemplate = "";
    document.querySelector("#menu").click();
    loadTemplate({ dataset: { name: code.name } });
}


let editorOpen = true;
let editorFullScreen = false;

function toggleCode() {
    if (editorOpen) {
        document.querySelector("#editorOpen").style.display = "block";
        document.querySelector("#editorClose").style.display = "none";
        document.querySelector("#editorCont").style.height = "38px";
        document.querySelector("#editorCont").style.bottom = "0";
        editorOpen = false;
    } else {
        document.querySelector("#editorOpen").style.display = "none";
        document.querySelector("#editorClose").style.display = "block";
        document.querySelector("#editorCont").style.height = "30%";
        document.querySelector("#editorCont").style.bottom = "8px";
        editorOpen = true;
    }
    editor.resize()
}

function toggleCodeFullScreen() {
    if (editorFullScreen) {
        document.querySelector("#fullScreen").style.display = "block";
        document.querySelector("#smallScreen").style.display = "none";

        if (!editorOpen) {
            document.querySelector("#editorOpen").style.display = "block";
            document.querySelector("#editorClose").style.display = "none";
            document.querySelector("#editorCont").style.height = "38px";
            document.querySelector("#editorCont").style.bottom = "0";
        } else {
            document.querySelector("#editorOpen").style.display = "none";
            document.querySelector("#editorClose").style.display = "block";
            document.querySelector("#editorCont").style.height = "30%";
            document.querySelector("#editorCont").style.bottom = "8px";
        }
        editorFullScreen = false;
    } else {
        document.querySelector("#smallScreen").style.display = "block";
        document.querySelector("#fullScreen").style.display = "none";
        document.querySelector("#editorOpen").style.display = "none";
        document.querySelector("#editorClose").style.display = "block";
        document.querySelector("#editorCont").style.height = "100%";
        document.querySelector("#editorCont").style.bottom = "8px";
        editorFullScreen = true;
    }
    editor.resize()
}

function loadScript(text, id) {
    return new Promise((resolve, reject) => {
        let script = document.createElement("script");
        let oldScript = document.querySelector(`#${id}`);
        // script.onerror = function () {
        //     reject();
        // };
        if (oldScript) {
            oldScript.parentNode.removeChild(oldScript);
        }
        script.id = id
        script.text = text;
        document.body.appendChild(script);
        resolve();
    })
}

function getCode(tempData) {
    return new Promise((resolve, reject) => {
        loadScript(`var f${tempData.id} = ${tempData.file}`, "e" + tempData.id).then(() => {
            resolve(eval(`f${tempData.id}`));
        }).catch(reject);
    });
}

function createTemplate() {
    editor.session.setValue(`{
    name: "Video",
    args: {
        videoBackground: {
            value: "#fff",
                name: "Video Background",
                    type: "color"
        }
    },

    autoFillArgs: {
        hashtags: {
            value: 100,
                name: "Hashtags",
                    type: "number"
        }
    },

    function: function (args, download, cb) {
        let d = new draft();

        let canvas = document.querySelector("canvas");
        let ctx = canvas.getContext("2d");
        let r = new recorder(canvas, s.stream());

        d.init(canvas, ctx, 1080, 1920, args.videoBackground.value);
        r.start();

        r.stop((url) => {
            if (download) {
                r.download(args.saveName.value)
            }
            cb();
        });
    },

    autoFill: function (AutoFillArgs, renderArgs) {
        renderArgs.videoBackground.value = "#000";
    }
}`);
    reload(true);
    low.upload("Video", editor.getValue()).then((e) => {
    })
}

function updateTemplate() {
    getCode({ id: "e" + loadedTemplate.replace(/[^a-z0-9]/gi, ''), file: editor.getValue() }).then((e) => {
        low.update(loadedTemplate, e.name, editor.getValue()).then((e) => {
            reload();
        }).catch((e) => {
        })
    })

}

function deleteTemplate() {
    low.deleteTemplate(loadedTemplate).then(() => {
        window.location.reload();
    })
}

function login() {
    let email = document.querySelector("#login-email").value;
    let password = document.querySelector("#login-password").value;
    localStorage.email = email;
    localStorage.password = password;
    load(localStorage.email, localStorage.password);
}

function logout() {
    localStorage.email = undefined;
    localStorage.password = undefined;
    window.location.reload();
}

function showSignUp() {
    document.querySelector("#signup-modal").click();
}

function signup() {
    let email = document.querySelector("#signup-email").value;
    let username = document.querySelector("#signup-username").value;
    let password = document.querySelector("#signup-password").value;
    let password2 = document.querySelector("#signup-password2").value;

    if (password == password2) {
        low.createAccount(username, email, password).then(() => {
            localStorage.email = email;
            localStorage.password = password;
            window.location.reload();
        }).catch((e) => {
            alert("An Account With This Email or Username Has Already Been Registered");
        })
    }
}

function loadFont(fontName) {
    if (document.querySelector(`link[href="https://fonts.googleapis.com/css?family=${fontName.replace(/\s/g, "+")}"]`) == null) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css?family=${fontName.replace(/\s/g, "+")}`;
        document.head.appendChild(link);
    }
}

function addAssets() {
    low.assets().then((assets) => {
        document.querySelector("#sideBar").innerHTML = `<div class="button-red p-[4px] w-min cursor-pointer" onclick="loadSidebar()">
            BACK
        </div><div class="text-[30px] font-bold">Assets</div>
        <div class="text-[20px] font-bold">New File</div>
        <div>
            <div class="form-control w-full max-w-xs mb-[10px]">
                <label class="label">
                    <span class="label-text">File Name</span>
                </label>
                <input type="text" placeholder="Type here" id="fileName" class="input input-bordered w-full max-w-xs" />
            </div>
            <input type="file" id="assets" class="input w-full max-w-xs" />
            <div class="button p-[10px] mb-[20px] text-center font-bold cursor-pointer" onclick="uploadFile()">
                UPLOAD
            </div>
        </div>`;
        let imgs = ``;
        for (let i = 0; i < assets.length; i++) {
            const img = assets[i];
            imgs += `<div><div class="text-[20px] font-bold">${img.name}</div><img src="/assets/${img.collectionId}/${img.id}/${img.file}"></div>`;
        }
        document.querySelector("#sideBar").innerHTML += `<div>
            ${imgs}
        </div>`
    });
}

function uploadFile() {
    low.uploadAsset(document.querySelector("#fileName").value, document.querySelector("#assets")).then(() => {
        addAssets();
    })
}