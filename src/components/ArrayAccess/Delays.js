export class Delays {
    arrayVisualizer
    timeoutArray
    delays
    delayIncFactor
    delayInc


    constructor(arrayVisualizer) {
        this.arrayVisualizer = arrayVisualizer
        this.timeoutArray = []
        this.delays = {
            Swap: 0,
            Write: 0,
            Comp: 0,
            Unmark: 0,
            CreateAuxArray: 0,
            RemoveAuxArray: 0
        }
        this.delayIncFactor = 3000-arrayVisualizer.getArrLength()*3
        // console.log(arrayVisualizer.getArrLength())
        this.delayInc = this.delayIncFactor/arrayVisualizer.getArrLength()
    }

    updateDelayInc(){
        this.delayIncFactor = 3000-this.arrayVisualizer.getArrLength()*3
        this.delayInc = this.delayIncFactor/this.arrayVisualizer.getArrLength()
    }

    push(timeout){
        this.timeoutArray.push(timeout)
    }

    pushFunc(func, obj, delayName, delay, args) {
        this.timeoutArray.push(setTimeout(func.bind(obj), this.delays[delayName] += delay, args))
    }

    resetDelays() {
        this.delays = {
            Swap: 0,
            Write: 0,
            Comp: 0,
            Unmark: 0,
            CreateAuxArray: 0,
            RemoveAuxArray: 0
        }
        for (let i of this.timeoutArray) {
            clearTimeout(i);
        }
        this.timeoutArray = []
    }

    setDelay(name, value){
        this.delays[name] = value
    }

    incDelay(name, inc=this.delayIncFactor){
        return this.delays[name]+=inc
    }

    getDelayInc(){
        return this.delayInc
    }
}