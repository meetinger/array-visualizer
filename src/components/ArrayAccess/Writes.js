import {Element} from "../classes/Element";

export class Writes{
    arrayVisualizer;
    // pseudoArray
    // pseudoAuxArrays
    // array
    // auxArrays
    Sounds
    Delays
    Marks

    constructor(arrayVisualizer){
        this.arrayVisualizer = arrayVisualizer
        //The object exists
        // this.pseudoArray= arrayVisualizer.getPseudoArray()
        // this.pseudoAuxArrays = arrayVisualizer.getPseudoAuxArrays()
        // this.array = arrayVisualizer.getMainArray()
        // this.auxArrays = arrayVisualizer.getAuxArrays()
        this.Sounds = arrayVisualizer.getSounds()
        this.Delays = arrayVisualizer.getDelays()
        this.Marks = arrayVisualizer.getMarks()
        console.log("IN CONSTRUCTOR")
        console.log(this.arrayVisualizer.getPseudoArray())
    }



    swapWithDelay(a, b, arr = this.arrayVisualizer.getPseudoArray(), mark, delay = this.Delays.getDelayInc(), playSound) {
        // this.Delays.push(setTimeout(this.swapInArr.bind(this), this.delays.Swap += delay, a, b, arr, mark, playSound))
        this.Delays.push(setTimeout(this.swapInArr.bind(this), this.Delays.incDelay("Write", delay), a, b, arr, mark, playSound))
        // this.Delays.push(setTimeout(()=>{this.swapInArr(a, b, arr, mark, playSound)}, this.Delays.incDelay("Write", delay)))
    }


    swapInArr(a, b, arr = this.arrayVisualizer.getPseudoArray(), mark = true, playSound = false) {
        if(playSound) {
            this.Sounds.playSound(arr[b].getValue());
        }
        console.log(arr)
        let tmpArr = arr
        let tmp = tmpArr[a]
        tmpArr[a] = tmpArr[b]
        tmpArr[b] = tmp
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
        // console.log(getVarName(this.state.array.name))
        // this.instructions.push(
        //     {
        //         cmd: "swap",
        //         arr: arr,
        //         a: a,
        //         b: b
        //     }
        // )
        this.swapWithDelay(a, b, this.arrayVisualizer.getMainArray(), true, this.Delays.getDelayInc(), true)
    }

    writeInArr(index, value, arr = this.arrayVisualizer.getPseudoArray(), mark = true, playSound = false) {
        // console.log("WRITING IN ")
        // console.log(this.getNameByArray(arr))
        // console.log("INDEX: "+index)
        // console.log("VALUE: "+value)
        if(playSound) {
            this.Sounds.playSound(value)
        }
        arr[index].setValue(value)
        if (mark) {
            this.Marks.markUnmarkMany([index], {type: "Default"})
        }
        let curWrites = this.arrayVisualizer.getState().writes;
        this.arrayVisualizer.setState({
            writes: curWrites + 1
        })
    }

    writeWithDelay(index, value, arr = this.arrayVisualizer.getPseudoArray(), mark, delay = this.Delays.getDelayInc(), playSound = true) {
        // this.Delays.push(setTimeout(this.writeInArr.bind(this), this.Delays.delays.Write += delay, index, value, arr, mark, playSound))
        this.Delays.push(setTimeout(this.writeInArr.bind(this), this.Delays.incDelay("Write", delay), index, value, arr, mark, playSound))
    }

    write(index, value, arr = this.arrayVisualizer.getPseudoArray()) {
        this.writeInArr(index, value, arr, false, false)
        // this.instructions.push(
        //     {
        //         cmd: "write",
        //         arr: arr,
        //         index: index,
        //         value: value
        //     }
        // )
        this.writeWithDelay(index, value, this.arrayVisualizer.getMainArray(), true, this.Delays.getDelayInc(), true)
    }

    createAuxArray(len, isPseudo = true){
        if(isPseudo) {
            let auxArrIndex = this.arrayVisualizer.getPseudoAuxArrays().length
            this.arrayVisualizer.getPseudoAuxArrays().push(this.arrayVisualizer.initArray(() => 0, len, false))
            // this.instructions.push(
            //     {
            //         cmd: "createAuxArray",
            //         len: len
            //     }
            // )
            return auxArrIndex
        }else{
            let tmpArr = this.arrayVisualizer.getAuxArrays()
            tmpArr.push(this.arrayVisualizer.initArray(() => 0, len, false))
            this.arrayVisualizer.setState({
                    auxArrays: tmpArr
                }
            )
        }
    }

    createAuxArrayWithDelay(len, delay, isPseudo = false){
        // this.timeoutArray.push(setTimeout(this.createAuxArray.bind(this), this.delays.Write += delay, len, isPseudo))
        this.Delays.push(setTimeout(this.createAuxArray.bind(this), this.Delays.incDelay("Write", delay), len, isPseudo))
    }

    removeAuxArray(index, isPseudo = true){
        if(isPseudo) {
            this.arrayVisualizer.getPseudoAuxArrays().splice(index, 1)
            // this.instructions.push(
            //     {
            //         cmd: "removeAuxArray",
            //         index: index
            //     }
            // )
            this.removeAuxArrayWithDelay(index, this.Delays.getDelayInc(), false)
        }else{
            let tmp = this.arrayVisualizer.getAuxArrays()
            tmp.splice(index, 1)
            this.arrayVisualizer.setState({
                auxArrays: tmp
            })
            // this.state.auxArrays.splice(index, 1)
        }
    }

    removeAuxArrayWithDelay(index, delay, isPseudo = false){
        this.Delays.push(setTimeout(this.removeAuxArray.bind(this), this.Delays.incDelay("Write", delay), index, isPseudo))
    }


    auxWrite(index, value, arrIndex, isPseudo = true, playSound = false){
        if(playSound){
            this.Sounds.playSound(value)
        }
        if(isPseudo){
            this.arrayVisualizer.getPseudoAuxArrays()[arrIndex][index].setValue(value)
            // this.instructions.push(
            //     {
            //         cmd: "auxWrite",
            //         index: index,
            //         value: value,
            //         arrIndex: arrIndex
            //     }
            // )
            // )
            this.auxWriteWithDelay(index, value, arrIndex, this.Delays.incDelay("Write", this.Delays.getDelayInc()), false, true)
        }else{
            this.arrayVisualizer.getAuxArrays()[arrIndex][index].setValue(value)
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