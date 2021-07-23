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

    compareValues(a, b){
        let Mark = function (index, value, arrIndex){
            return {index: index, value: value, arrIndex: arrIndex}
        }
        //TODO working marks with aux arrays
        let parseMark = (val) => {
            let elementIndex = -1
            let arrayIndex = -1
            let mainArray = this.arrayVisualizer.getArray(-1, true)
            // let auxArrays = this.arrayVisualizer.getAuxArrays(true)
            // for(let i = 0; i < auxArrays.length;++i){
            //     elementIndex = auxArrays[i].findIndex(element => {return element.getValue() === val})
            //     if(elementIndex!==-1){
            //         arrayIndex = i
            //     }
            // }
            if(arrayIndex === -1){
                elementIndex = mainArray.findIndex(element => {return element.getValue() === val})
            }
            return new Mark(elementIndex, val, arrayIndex)
        }
        let marks = []
        let checkObj = (obj) => {
            let tmpVal
            if(typeof obj === "object"){
                tmpVal = obj.getValue()
                let mark = parseMark(tmpVal)
                if(mark.index !== -1){
                    marks.push(mark)
                }
            }else{
                tmpVal = obj
            }
            return tmpVal
        }

        this.Delays.incOperationsCounter(1)
        let tmpA = checkObj(a)
        let tmpB = checkObj(b)


        // let tmpA = typeof a === "object" ? a.getValue() : a
        // let tmpB = typeof b === "object" ? b.getValue() : b

        this.compareWithDelay(marks)
        return tmpA - tmpB;
    }

    compareWithDelay(marks, delay = this.Delays.getDelayInc()/5){
        this.Delays.push(setTimeout(this.compareStub.bind(this), this.Delays.incDelay("Write", delay), marks))
    }

    compareStub(marks){
        let curComparisons = this.arrayVisualizer.getState().comparisons + 1
        this.arrayVisualizer.setState({
            comparisons: curComparisons
        })
        for(let i of marks){
            this.Sounds.playSound(i.value)
            this.Marks.markUnmarkMany([i.index],{type: "Default"}, i.arrIndex)
        }
        this.Delays.updateSortTime()


        // this.Marks.markUnmarkMany(toMark,{type: "Additional", color: [0,255,0]})
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