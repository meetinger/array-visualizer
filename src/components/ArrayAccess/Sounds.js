export class Sounds{
    arrayVisualizer
    ctx
    constructor(arrayVisualizer) {
        this.arrayVisualizer = arrayVisualizer
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    playSound(value) {
        let osc = this.ctx.createOscillator();
        osc.type = 'sine';

        let k = value / this.arrayVisualizer.getArrLength()
        osc.frequency.value = 2000 * k + 200;

        let addTime = 50

        let gainNode = this.ctx.createGain()
        gainNode.gain.value = 0;
        osc.connect(gainNode)
        gainNode.connect(this.ctx.destination)

        gainNode.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + (this.arrayVisualizer.getDelayInc() + addTime) / 1000 / 2)
        gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + (this.arrayVisualizer.getDelayInc() + addTime) / 1000)

        osc.start();
        osc.stop(this.ctx.currentTime + (this.arrayVisualizer.getDelayInc() + addTime) / 1000);
    }
}