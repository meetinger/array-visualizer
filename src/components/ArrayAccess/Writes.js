import {objLength} from "../utils/utils";

export class Writes {
    arrayVisualizer;
    Sounds
    Delays
    Marks
    Reads


    constructor(arrayVisualizer) {
        this.arrayVisualizer = arrayVisualizer
        this.Sounds = arrayVisualizer.getSounds()
        this.Delays = arrayVisualizer.getDelays()
        this.Marks = arrayVisualizer.getMarks()
        this.Reads = arrayVisualizer.getReads()
    }

    //TODO refactoring
    //-1 is main array

    swapWithDelay(a, b, arr, mark, delay = this.Delays.getDelayInc(), playSound) {
        // this.Delays.push(setTimeout(this.swapInArr.bind(this), this.Delays.incDelay("Write", delay), a, b, arr, mark, playSound))
        this.Delays.push(setTimeout(() => {
            this.swapInArr(a, b, arr, mark, playSound)
            this.Delays.updateSortTime()
            let curWrites = this.arrayVisualizer.getState().mainWrites + 2;
            this.arrayVisualizer.setState({
                mainWrites: curWrites
            })
        }, this.Delays.incDelay("Write", delay)))
    }


    swapInArr(a, b, arr, mark = true, playSound = false) {
        if (playSound) {
            this.Sounds.playSound(arr[b].getValue());
        } else {
            this.Delays.incOperationsCounter(2)
        }
        let tmpArr = arr
        let tmp = tmpArr[a]
        tmpArr[a] = tmpArr[b].copy(true)
        tmpArr[b] = tmp.copy(true)
        if (mark) {
            this.Marks.markUnmarkMany([a, b], {type: "Default"})
        }
    }

    swap(a, b, arrIndex = -1) {
        this.swapInArr(a, b, this.arrayVisualizer.getArray(arrIndex, true), false, false)
        this.swapWithDelay(a, b, this.arrayVisualizer.getArray(arrIndex, false), true, this.Delays.getDelayInc(), true)
    }


    writeInArr(index, toWrite, arr = this.arrayVisualizer.getArray(-1, true), mark = true, playSound = false) {
        if (playSound) {
            this.Sounds.playSound(toWrite.getValue())
        } else {
            this.Delays.incOperationsCounter(1)
        }
        arr[index] = toWrite.copy(true)
        if (mark) {
            this.Marks.markUnmarkMany([index], {type: "Default"})
        }
    }

    writeWithDelay(index, toWrite, arrIndex, mark, delay = this.Delays.getDelayInc(), playSound = true) {
        // this.Delays.push(setTimeout(this.writeInArr.bind(this), this.Delays.incDelay("Write", delay), index, toWrite, arr, mark, playSound))
        this.Delays.push(setTimeout(() => {
            let arr = this.arrayVisualizer.getArray(arrIndex, false)
            this.Delays.updateSortTime()
            this.writeInArr(index, toWrite, arr, mark, playSound)
            let curWrites = this.arrayVisualizer.getState().mainWrites + 1;
            this.arrayVisualizer.setState({
                mainWrites: curWrites
            })
        }, this.Delays.incDelay("Write", delay)))
    }

    write(index, toWrite, arrIndex = -1) {
        this.writeInArr(index, toWrite, this.arrayVisualizer.getArray(arrIndex, true), false, false)
        this.writeWithDelay(index, toWrite, arrIndex, arrIndex === -1, this.Delays.getDelayInc(), true)
    }


    arrayCopy(srcArray, srcPos, destArray, destPos, copyLen) {
        for (let i = 0; i < copyLen; i++) {
            this.write(destPos + i, this.Reads.get(srcPos + i, srcArray), destArray)
        }
    }

    reverseArrayCopy(srcArray, srcPos, destArray, destPos, copyLen) {
        for (let i = copyLen - 1; i >= 0; i--) {
            this.write(destPos + i, this.Reads.get(srcPos + i, srcArray), destArray)
        }
    }

    createAuxArray(len, isPseudo = true) {
        if (isPseudo) {
            let pseudoAuxArrays = this.arrayVisualizer.getAuxArrays(true)
            let auxArrIndex = objLength(pseudoAuxArrays)
            pseudoAuxArrays[auxArrIndex] = (this.arrayVisualizer.initArray(() => -1, len, false))
            this.createAuxArrayWithDelay(len, this.Delays.getDelayInc(), false)
            return auxArrIndex
        } else {
            let tmpArr = this.arrayVisualizer.getAuxArrays(false)
            let auxArrIndex = objLength(tmpArr)
            tmpArr[auxArrIndex] = (this.arrayVisualizer.initArray(() => -1, len, false))
            console.log(tmpArr)
            this.arrayVisualizer.setState({
                    auxArrays: tmpArr
                }
            )
            console.log(this.arrayVisualizer.getAuxArrays(false))
        }
    }

    createAuxArrayWithDelay(len, delay, isPseudo = false) {
        this.Delays.push(setTimeout(this.createAuxArray.bind(this), this.Delays.incDelay("Write", delay), len, isPseudo))
    }

    removeAuxArray(index, isPseudo = true) {
        if (isPseudo) {
            // this.arrayVisualizer.getPseudoAuxArrays().splice(index, 1)
            delete this.arrayVisualizer.getAuxArrays(true)[index]
            this.removeAuxArrayWithDelay(index, this.Delays.getDelayInc(), false)
        } else {
            let tmp = this.arrayVisualizer.getAuxArrays(false)
            // tmp.splice(index, 1)
            delete tmp[index]
            this.arrayVisualizer.setState({
                auxArrays: tmp
            })
        }
    }

    removeAuxArrayWithDelay(index, delay, isPseudo = false) {
        this.Delays.push(setTimeout(this.removeAuxArray.bind(this), this.Delays.incDelay("Write", delay), index, isPseudo))
    }

    reversal(start, length, arrIndex = -1) {
        for (let i = start; i < start + Math.trunc((length - start + 1) / 2); i++) {
            this.swap(i, start + length - i, arrIndex);
        }
    }

    multiSwap(pos, to, arrIndex) {
        if (to - pos > 0) {
            for (let i = pos; i < to; i++) {
                this.swap(i, i + 1, arrIndex);
            }
        } else {
            for (let i = pos; i > to; i--) {
                this.swap(i, i - 1, arrIndex);
            }
        }
    }
}
