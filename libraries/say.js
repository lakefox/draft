function say(lang = "en-US") {
    const dict = {};
    const audioContext = new AudioContext();
    const mediaStreamAudioDestinationNode = new MediaStreamAudioDestinationNode(audioContext);
    let mediaStreamAudioSourceNode = null;
    this.dict = dict;
    let loaded = () => { };
    this.add = (text) => {
        if (text != "") {
            if (!dict[text]) {
                dict[text] = null;
                fetch(`https://cors.lowsh.workers.dev/?https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${text}`)
                    .then(r => r.blob())
                    .then((blob) => {
                        dict[text] = blob;
                        if (countLoading() == 0) {
                            loaded();
                        }
                    })
            }
        }
    }

    this.run = (text, pad = 0) => {
        return new Promise((resolve, reject) => {
            if (text != "") {
                if (mediaStreamAudioSourceNode != null) {
                    mediaStreamAudioSourceNode.disconnect();
                }
                let aud = new Audio(URL.createObjectURL(dict[text]));
                aud.onloadedmetadata = () => {
                    setTimeout(() => {
                        resolve()
                    }, (aud.duration * 1000) + pad);
                }
                aud.onloadeddata = () => {
                    // aud.onended = resolve;
                    mediaStreamAudioSourceNode = new MediaStreamAudioSourceNode(
                        audioContext,
                        { mediaStream: aud.captureStream() }
                    );
                    aud.play();
                    mediaStreamAudioSourceNode.connect(mediaStreamAudioDestinationNode);
                }
            } else {
                reject();
            }
        })
    }

    this.duration = (text) => {
        return new Promise((resolve, reject) => {
            if (text != "") {
                let aud = new Audio(URL.createObjectURL(dict[text]));
                aud.onloadedmetadata = () => {
                    console.log(aud.duration);
                    resolve(aud.duration * 1000);
                }
            } else {
                reject();
            }
        })
    }

    this.loaded = (cb) => {
        // Store the callback if its ready then start
        loaded = cb;
        if (countLoading() == 0) {
            loaded();
        }
    }

    this.stream = () => {
        return mediaStreamAudioDestinationNode.stream.getAudioTracks()[0];
    }

    function countLoading() {
        return Object.values(dict).filter(word => word == null).length;
    }
}