// Load the side menu
let templateIndex, templateNames, loadedTemplate;

let low = new LOW("http://localhost:8080");
low.login("mason@lakefox.net", "12345678").then((token) => {
    console.log(token);
    low.list().then(async (templates) => {
        templateIndex = {};
        for (let i = 0; i < templates.length; i++) {
            let tempData = await low.get(templates[i].name);
            console.log(tempData);
            templateIndex[tempData.name] = await getCode(tempData);
            templateIndex[tempData.name].carbonCopy = tempData.file;
        }

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
        if (templateNames.length > 0) {
            loadTemplate({ dataset: { name: templateNames[0] } });
        } else {
            createTemplate();
        }
    });
}).catch((err) => {
    console.log(err);
});

let download = false;

function loadTemplate(e) {
    let key = e.dataset.name;
    loadedTemplate = key;
    document.querySelector("#menu").click();

    editor.session.setValue(templateIndex[key].carbonCopy)

    let templateArgs = templateIndex[key].args;

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
                        <button onclick="autofill()" class="btn btn-wide">Autofill</button>
                    </div>
                </div>
            </div>`
    }

    let html = `${autoFillHTML}<div class="mb-[30px]">
            <h1>Template Settings</h1>
        </div><div class="card bg-base-100 shadow-xl mb-[10px]">
                <div class="card-body py-0">
                    <div class="form-control w-full max-w-xs flex items-center">
                        <button onclick="render()" class="btn btn-wide">Render</button>
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
    let code = await getCode({ id: parseInt(Math.random() * 1000), file: editor.getValue() });
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
        script.onerror = function () {
            reject();
        };
        if (oldScript) {
            console.log("removed")
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
        loadScript(`let f${tempData.id} = ${tempData.file}`, "e" + tempData.id).then(() => {
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
        console.log(e);
    })
}

function updateTemplate() {
    getCode({ id: parseInt(Math.random() * 1000), file: editor.getValue() }).then((e) => {
        low.update(loadedTemplate, e.name, editor.getValue()).then((e) => {
            reload();
        }).catch((e) => {
            console.log(e);
        })
    })

}