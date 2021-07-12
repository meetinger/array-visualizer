export class Writes{
    arrayVisualizer;

    constructor(arrayVisualizer){
        this.arrayVisualizer = arrayVisualizer
    }


    swapWithDelay(a, b, arr = this.pseudoArray, mark, delay = this.delayInc, playSound) {
        this.timeoutArray.push(setTimeout(this.swapInArr.bind(this), this.delays.Swap += delay, a, b, arr, mark, playSound))
    }


    swapInArr(a, b, arr = this.pseudoArray, mark = true, playSound = false) {
        if(playSound) {
            this.playSound(arr[b].getValue());
        }
        let tmpArr = arr
        // console.log("SWAPPING:" + tmpArr[a].getValue()+"<->"+tmpArr[b].getValue())
        let tmp = tmpArr[a]
        tmpArr[a] = tmpArr[b]
        tmpArr[b] = tmp
        if (mark) {
            this.markUnmarkMany([a, b], {type: "Default"})
        }
        let curWrites = this.state.writes;
        this.setState({
            writes: curWrites + 2
        })
    }

    swap(a, b, arr = this.pseudoArray) {
        this.swapInArr(a, b, arr, false, false)
        // console.log(getVarName(this.state.array.name))
        this.instructions.push(
            {
                cmd: "swap",
                arr: arr,
                a: a,
                b: b
            }
        )
        // this.swapWithDelay(a, b, this.state.array, true, this.delayInc, true)
    }

    writeInArr(index, value, arr = this.pseudoArray, mark = true, playSound = false) {
        // console.log("WRITING IN ")
        // console.log(this.getNameByArray(arr))
        // console.log("INDEX: "+index)
        // console.log("VALUE: "+value)
        if(playSound) {
            this.playSound(value)
        }
        arr[index].setValue(value)
        if (mark) {
            this.markUnmarkMany([index], {type: "Default"})
        }
        let curWrites = this.state.writes;
        this.setState({
            writes: curWrites + 1
        })
    }

    writeWithDelay(index, value, arr = this.pseudoArray, mark, delay = this.delayInc, playSound = true) {
        this.timeoutArray.push(setTimeout(this.writeInArr.bind(this), this.delays.Write += delay, index, value, arr, mark, playSound))
    }

    write(index, value, arr = this.pseudoArray) {
        this.writeInArr(index, value, arr, false, false)
        this.instructions.push(
            {
                cmd: "write",
                arr: arr,
                index: index,
                value: value
            }
        )
        // this.writeWithDelay(index, value, this.state.array, true, this.delayInc, true)
    }
}