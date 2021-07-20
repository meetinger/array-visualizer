export class Delays {
    arrayVisualizer
    timeoutArray
    delays
    delayIncFactor
    delayInc
    DELAY_INC_CONST
    sortFinishedTime
    operationsCounter

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
        this.sortFinishedTime = 0
        this.operationsCounter = 0
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

    setSortFinishedTime(time){
        this.sortFinishedTime = time
    }

    incOperationsCounter(val=1){
        this.operationsCounter+=val;
    }

    updateSortTime(){
        let state = this.arrayVisualizer.getState()
        let mainWrites = state.mainWrites
        let auxWrites = state.auxWrites
        let comparisons = state.comparisons
        this.arrayVisualizer.setState({
            sortTime: (mainWrites+auxWrites+comparisons)/this.operationsCounter*this.sortFinishedTime
        })
    }
}