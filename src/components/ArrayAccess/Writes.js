import {Element} from "../classes/Element";
import {objLength} from "../utils/utils";

export class Writes{
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



    swapWithDelay(a, b, arr = this.arrayVisualizer.getPseudoArray(), mark, delay = this.Delays.getDelayInc(), playSound) {
        this.Delays.push(setTimeout(this.swapInArr.bind(this), this.Delays.incDelay("Write", delay), a, b, arr, mark, playSound))
    }


    swapInArr(a, b, arr = this.arrayVisualizer.getPseudoArray(), mark = true, playSound = false) {
        if(playSound) {
            this.Sounds.playSound(arr[b].getValue());
        }
        let tmpArr = arr
        // let tmp = tmpArr[a]
        // tmpArr[a] = tmpArr[b]
        // tmpArr[b] = tmp
        let tmp = tmpArr[a]
        tmpArr[a] = tmpArr[b].copy(true)
        tmpArr[b] = tmp.copy(true)
        if (mark) {
            this.Marks.markUnmarkMany([a, b], {type: "Default"})
        }
        let curWrites = this.arrayVisualizer.getState().writes;
        this.arrayVisualizer.setState({
            writes: curWrites + 2
        })
    }

    swap(a, b, arr = this.arrayVisualizer.getPseudoArray()) {
        this.swapInArr(a, b, arr, false, false)
        this.swapWithDelay(a, b, this.arrayVisualizer.getMainArray(), true, this.Delays.getDelayInc(), true)
    }

    // writeInArr(index, value, arr = this.arrayVisualizer.getPseudoArray(), mark = true, playSound = false) {
    //     if(playSound) {
    //         this.Sounds.playSound(value)
    //     }
    //     arr[index].setValue(value)
    //     if (mark) {
    //         this.Marks.markUnmarkMany([index], {type: "Default"})
    //     }
    //     let curWrites = this.arrayVisualizer.getState().writes;
    //     this.arrayVisualizer.setState({
    //         writes: curWrites + 1
    //     })
    // }


    writeInArr(index, toWrite, arr = this.arrayVisualizer.getPseudoArray(), mark = true, playSound = false) {
        if(playSound) {
            this.Sounds.playSound(toWrite.getValue())
        }
        arr[index] = toWrite.copy(true)
        if (mark) {
            this.Marks.markUnmarkMany([index], {type: "Default"})
        }
        let curWrites = this.arrayVisualizer.getState().writes;
        this.arrayVisualizer.setState({
            writes: curWrites + 1
        })
    }

    writeWithDelay(index, toWrite, arr = this.arrayVisualizer.getPseudoArray(), mark, delay = this.Delays.getDelayInc(), playSound = true) {
        this.Delays.push(setTimeout(this.writeInArr.bind(this), this.Delays.incDelay("Write", delay), index, toWrite, arr, mark, playSound))
    }

    write(index, toWrite, arr = this.arrayVisualizer.getPseudoArray()) {
        this.writeInArr(index, toWrite, arr, false, false)
        this.writeWithDelay(index, toWrite, this.arrayVisualizer.getMainArray(), true, this.Delays.getDelayInc(), true)
    }

    createAuxArray(len, isPseudo = true){
        if(isPseudo) {
            let pseudoAuxArrays = this.arrayVisualizer.getPseudoAuxArrays()
            let auxArrIndex = objLength(pseudoAuxArrays)
            pseudoAuxArrays[auxArrIndex]=(this.arrayVisualizer.initArray(() => -1, len, false))
            this.createAuxArrayWithDelay(len, this.Delays.getDelayInc(), false)
            return auxArrIndex
        }else{
            let tmpArr = this.arrayVisualizer.getAuxArrays()
            let auxArrIndex = objLength(tmpArr)

            tmpArr[auxArrIndex]=(this.arrayVisualizer.initArray(() => -1, len, false))
            this.arrayVisualizer.setState({
                    auxArrays: tmpArr
                }
            )
        }
    }

    createAuxArrayWithDelay(len, delay, isPseudo = false){
        this.Delays.push(setTimeout(this.createAuxArray.bind(this), this.Delays.incDelay("Write", delay), len, isPseudo))
    }

    removeAuxArray(index, isPseudo = true){
        if(isPseudo) {
            // this.arrayVisualizer.getPseudoAuxArrays().splice(index, 1)
            delete this.arrayVisualizer.getPseudoAuxArrays()[index]
            this.removeAuxArrayWithDelay(index, this.Delays.getDelayInc(), false)
        }else{
            let tmp = this.arrayVisualizer.getAuxArrays()
            // tmp.splice(index, 1)
            delete tmp[index]
            this.arrayVisualizer.setState({
                auxArrays: tmp
            })
        }
    }

    removeAuxArrayWithDelay(index, delay, isPseudo = false){
        this.Delays.push(setTimeout(this.removeAuxArray.bind(this), this.Delays.incDelay("Write", delay), index, isPseudo))
    }


    auxWrite(index, toWrite, arrIndex, isPseudo = true, playSound = false){
        if(playSound){
            this.Sounds.playSound(toWrite.getValue())
        }
        if(isPseudo){
            this.arrayVisualizer.getPseudoAuxArrays()[arrIndex][index] = toWrite.copy()
            this.auxWriteWithDelay(index, toWrite, arrIndex, this.Delays.getDelayInc(), false, true)
        }else{
            this.arrayVisualizer.getAuxArrays()[arrIndex][index] = toWrite.copy()
            let tmp = this.arrayVisualizer.getAuxArrays()
            this.arrayVisualizer.setState({
                auxArrays: tmp
            })
        }
    }

    auxWriteWithDelay(index, value, arrIndex, delay, isPseudo = false, playSound = true, ){
        this.Delays.push(setTimeout(this.auxWrite.bind(this), this.Delays.incDelay("Write", delay), index, value, arrIndex, isPseudo, playSound))
    }

}