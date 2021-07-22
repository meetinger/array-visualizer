import {Delays} from "./Delays";
import {Marks} from "./Marks";
import {Sounds} from "./Sounds";

export class Reads{
    arrayVisualizer;
    Sounds
    Delays
    Marks
    constructor(arrayVisualizer){
        this.arrayVisualizer = arrayVisualizer
        this.Sounds = arrayVisualizer.getSounds()
        this.Delays = arrayVisualizer.getDelays()
        this.Marks = arrayVisualizer.getMarks()
    }

    //TODO refactoring

    readValue(index, arrIndex=-1) {
        let arr = this.arrayVisualizer.getArray(arrIndex, true)
        return arr[index].getValue()
    }

    compareInArr(a, b, arrIndex=-1) {
        let arr = this.arrayVisualizer.getArray(arrIndex, true)
        return this.compareValues(arr[a], arr[b])
    }

    get(index, arrIndex=-1){
        let arr = this.arrayVisualizer.getArray(arrIndex, true)
        return arr[index];
    }

    //TODO: add marks
    compareValues(a, b){
        this.Delays.incOperationsCounter(1)
        let toMark = []
        let toSound = []
        let tmpA
        let tmpB
        if(typeof a === "object"){
            tmpA = a.getValue()
            let index = this.arrayVisualizer.getArray(-1, true).findIndex(element => {return element.getValue() === tmpA})
            if(index !== -1){
                toMark.push(index)
            }
        }else{
            tmpA = a
        }

        if(typeof b === "object"){
            tmpB = b.getValue()
            let index = this.arrayVisualizer.getArray(-1, true).findIndex(element => {return element.getValue() === tmpB})
            if(index !== -1) {
                toMark.push(index)
            }
        }else{
            tmpB = b
        }

        toSound = [tmpA, tmpB]

        // let tmpA = typeof a === "object" ? a.getValue() : a
        // let tmpB = typeof b === "object" ? b.getValue() : b

        this.compareWithDelay(toMark, toSound)
        return tmpA - tmpB;
    }

    compareWithDelay(toMark, toSound, delay = this.Delays.getDelayInc()/5){
        this.Delays.push(setTimeout(this.compareStub.bind(this), this.Delays.incDelay("Write", delay), toMark, toSound))
    }

    compareStub(toMark = [], toSound = []){
        let curComparisons = this.arrayVisualizer.getState().comparisons + 1
        this.arrayVisualizer.setState({
            comparisons: curComparisons
        })
        for(let i of toSound){
            this.Sounds.playSound(i)
        }
        this.Delays.updateSortTime()
        // console.log(toMark)
        // this.Marks.markUnmarkMany(toMark,{type: "Additional", color: [0,255,0]})
        this.Marks.markUnmarkMany(toMark,{type: "Default"})
    }

    // auxGet(index, arrIndex, isPseudo = true){
    //     if(isPseudo){
    //         return this.arrayVisualizer.getPseudoAuxArrays()[arrIndex][index]
    //     }else {
    //         return this.arrayVisualizer.getAuxArrays()[arrIndex][index]
    //     }
    // }
    //
    //
    // auxReadValue(index, arrIndex, isPseudo = true){
    //     if(isPseudo){
    //         return this.arrayVisualizer.getPseudoAuxArrays()[arrIndex][index].getValue()
    //     }else {
    //         return this.arrayVisualizer.getAuxArrays()[arrIndex][index].getValue()
    //     }
    // }
}