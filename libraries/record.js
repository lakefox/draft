
function recorder(canvas, audioTrack = false) {
    this.chunks = [];
    this.recorder = null;
    this.url = "";

    // The nested try blocks will be simplified when Chrome 47 moves to Stable
    this.start = () => {
        this.stream = canvas.captureStream(); // frames per second
        if (audioTrack) {
            this.stream.addTrack(audioTrack);
        }
        console.log('Started stream capture from canvas element: ', this.stream);
        this.recorder = new MediaRecorder(this.stream, { mimeType: 'video/webm; codecs=vp8' });
        this.recorder.ondataavailable = (e) => {
            this.chunks.push(e.data);
        }
        this.recorder.start();
        console.log(this.recorder);
        this.recorder.onstop = e => {
            const completeBlob = new Blob(this.chunks, { type: 'video/webm' });
            console.log(completeBlob, this.chunks);
            this.url = URL.createObjectURL(completeBlob);
            this.stopCB(this.url);
        };
    }

    this.stop = (cb) => {
        this.stopCB = cb;
        this.recorder.stop();
    }

    this.download = (name) => {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = this.url;
        a.download = name + ".webm";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(this.url);
        }, 100);
    }
}