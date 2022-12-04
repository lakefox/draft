async function initVosk() {
    const model = await Vosk.createModel('model.tar.gz');

    const recognizer = new model.KaldiRecognizer();
    recognizer.on("result", (message) => {
        console.log(`Result: ${message.result.text}`);
    });
    recognizer.on("partialresult", (message) => {
        console.log(`Partial result: ${message.result.partial}`);
    });

    const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            channelCount: 1,
            sampleRate: 16000
        },
    });

    const audioContext = new AudioContext();
    const recognizerNode = audioContext.createScriptProcessor(4096, 1, 1)
    recognizerNode.onaudioprocess = (event) => {
        try {
            recognizer.acceptWaveform(event.inputBuffer)
        } catch (error) {
            console.error('acceptWaveform failed', error)
        }
    }
    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(recognizerNode);
}