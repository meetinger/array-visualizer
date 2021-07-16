export class Delays {
    arrayVisualizer
    timeoutArray
    delays
    delayIncFactor
    delayInc
    DELAY_INC_CONST

    constructor(arrayVisualizer) {
        this.arrayVisualizer = arrayVisualizer
        this.timeoutArray = []
        this.delays = {
            Swap: 0,
            Write: 0,
            Comp: 0,
            Unmark: 0,
            CreateAuxArray: 0,
            RemoveAuxArray: 0,
            Other: 0
        }
        this.DELAY_INC_CONST = 3000
        this.updateDelayInc()
        // this.delayIncFactor = this.DELAY_INC_CONST-arrayVisualizer.getArrLength()*3
        // this.delayInc = this.delayIncFactor/arrayVisualizer.getArrLength()
    }

    updateDelayInc(){
        this.delayIncFactor = this.DELAY_INC_CONST
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
            RemoveAuxArray: 0,
            Other: 0
        }
        for (let i of this.timeoutArray) {
            clearTimeout(i);
        }
        this.timeoutArray = []
    }

    setDelay(name, value){
        this.delays[name] = value
    }

    incDelay(name, inc=this.delayInc){
        return this.delays[name]+=inc
    }

    getDelayInc(){
        return this.delayInc
    }

    getDelays(){
        return this.delays
    }
}