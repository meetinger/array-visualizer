import React from 'react';
import {deepArrayCopy, getAllMethods, randomInt} from "../utils/utils";
import {linear} from "../utils/initFunctions"
import {Sorts} from "../Sorts/Sorts"
import {ArrayWindow} from "../ArrayWindow/ArrayWindow";
import {Element} from "../classes/Element";
import {Stats} from "../Stats/Stats";
import {Controls} from "../Controls/Controls";

const colors = {
    "Unmarked": [255, 255, 255],
    "Default": [255, 0, 0],
    "Additional": [randomInt(0, 256), randomInt(0, 256), randomInt(0, 256)],
    "Sorted": [0, 255, 0],
    "Analysis": [0, 0, 255]
}

export class ArrayVisualizer extends React.Component {
    delays;
    delayInc;
    pseudoArray;
    arrLength
    ctx
    timeoutArray
    sorts


    constructor(props) {
        super(props);
        // this.arrLength = 100
        this.state = {
            array: this.initArray(linear, this.arrLength),
            sortName: "",
            comparisons: 0,
            writes: 0
        }
        this.delays = {
            Swap: 0,
            Write: 0,
            Comp: 0,
            Unmark: 0
        }
        this.instruction = [];
        this.timeoutArray = [];
        this.pseudoArray = deepArrayCopy(this.state.array)
        this.sorts = new Sorts(this);
        this.arrLength = this.state.length
        this.delayInc = 3000/this.arrLength;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        // this.updateArrLength(this.arrLength);
    }

    playSound(value) {
        let osc = this.ctx.createOscillator();
        osc.type = 'sine';

        let k = value / this.arrLength
        osc.frequency.value = 2000 * k + 200;


        let addTime = 50

        let gainNode = this.ctx.createGain()
        gainNode.gain.value = 0;
        osc.connect(gainNode)
        gainNode.connect(this.ctx.destination)

        gainNode.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + (this.delayInc + addTime) / 1000 / 2)
        gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + (this.delayInc + addTime) / 1000)

        osc.start();
        osc.stop(this.ctx.currentTime + (this.delayInc + addTime) / 1000);

    }

    resetDelay() {
        this.delays = {
            Swap: 0,
            Write: 0,
            Comp: 0,
            Unmark: 0
        }
        for(let i of this.timeoutArray){
            clearTimeout(i);
        }
        this.timeoutArray = []
    }

    nullify() {
        this.resetDelay()
        this.setState(
            {
                comparisons: 0,
                writes: 0
            }
        )
        // eslint-disable-next-line react/no-direct-mutation-state
        this.state.writes = 0;
        // eslint-disable-next-line react/no-direct-mutation-state
        this.state.comparisons = 0;
    }

    mark(index, args, saveArr = true) {
        let type = "Default"
        let color = colors["Default"]
        let tmpArr = this.state.array
        // Additional
        if (args.type === "Additional") {
            type = "Additional"
            color = args.color
            // console.log(color)
        }
        //Default
        else if (!args.type || args.type === "Default") {
            type = "Default"
            color = colors["Default"]
        } else {
            type = args.type
            color = args.color
        }

        tmpArr[index].setType(type)
        tmpArr[index].setColor(color)
        if (saveArr) {
            this.setState({
                array: tmpArr
            })
        } else {
            return tmpArr
        }
        // console.log(color);
    }

    markMany(indexes, args, saveArr) {
        let tmpArr = this.state.array
        for (let i of indexes) {
            if (saveArr) {
                this.mark(i, args, saveArr)
            } else {
                tmpArr = this.mark(i, args, saveArr)
            }
        }
        if (!saveArr) {
            return tmpArr
        }
    }

    unmark(index, saveArr = true) {
        let tmpArr = this.state.array
        tmpArr[index].setColor(colors["Unmarked"])
        tmpArr[index].setType("Unmarked")
        if (saveArr) {
            this.setState({
                array: tmpArr
            })
        } else {
            return tmpArr
        }
    }

    unmarkMany(indexes, saveArr, saveOnce) {
        let tmpArr = this.state.array
        for (let i of indexes) {
            if (saveArr) {
                this.unmark(i, saveArr)
            } else {
                tmpArr = this.unmark(i, saveArr)
            }
        }
        if (saveOnce) {
            this.setState({
                array: tmpArr
            })
        }
        if (!saveArr) {
            return tmpArr
        }
    }


    markUnmarkMany(markIndexes, markArgs) {
        this.markMany(markIndexes, markArgs, true)
        this.timeoutArray.push(setTimeout(this.unmarkMany.bind(this), this.delays.Unmark += this.delayInc / 100, markIndexes, false, true))
    }

    swapWithDelay(a, b, mark, delay = this.delayInc, arr = this.pseudoArray, playSound) {
        this.timeoutArray.push(setTimeout(this.swapInArr.bind(this), this.delays.Swap += delay, a, b, mark, arr, playSound))
    }


    swapInArr(a, b, mark = true, arr = this.pseudoArray, playSound=false) {
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

    swap(a, b) {
        this.swapInArr(a, b, false, this.pseudoArray, false)
        this.swapWithDelay(a, b, true, this.delayInc, this.state.array, true)
    }

    writeInArr(index, value, mark = true, arr = this.pseudoArray, playSound=false) {
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

    writeWithDelay(index, value, mark, delay = this.delayInc, arr = this.pseudoArray, playSound=true) {
        this.timeoutArray.push(setTimeout(this.writeInArr.bind(this), this.delays.Write += delay, index, value, mark, arr, playSound))
    }

    write(index, value) {
        this.writeInArr(index, value, false, this.pseudoArray, false)
        this.writeWithDelay(index, value, true, this.delayInc, this.state.array, true)
    }

    read(index, arr = this.pseudoArray) {
        // this.markUnmarkMany([index], {type: "Default"})
        return arr[index].getValue()
    }

    compare(a, b, sign = "<", arr = this.pseudoArray) {
        // this.compMainArrWithDelay(a, b, false)
        if (sign === "<") {
            return arr[a].getValue() < arr[b].getValue()
        } else if (sign === "<=") {
            return arr[a].getValue() <= arr[b].getValue()
        } else if (sign === ">") {
            return arr[a].getValue() > arr[b].getValue()
        } else if (sign === ">=") {
            return arr[a].getValue() >= arr[b].getValue()
        } else {
            return arr[a].getValue() === arr[b].getValue()
        }
    }

    compMainArr(a, b, mark = false) {
        let curComparisons = this.state.comparisons;
        this.setState({
            comparisons: curComparisons + 1
        })
        console.log("Comparisons: " + this.state.comparisons + " " + a + " " + b)
        if (mark) {
            this.markUnmarkMany([a, b], {type: "Additional", color: [0, 0, 255]})
        }
    }

    compMainArrWithDelay(a, b, mark = false) {
        // setTimeout(this.compMainArr.bind(this), this.delays.Comp += this.delayInc, a, b, mark)
    }

    getArrayVisualizer() {
        return this;
    }

    getPseudoArray() {
        return this.pseudoArray;
    }

    getState(){
        return this.state
    }

    getArrLength(){
        return this.arrLength;
    }

    stopSort(){
        this.resetDelay()
        this.unmarkMany(Array.from(Array(this.arrLength).keys()), false, true)
    }

    initArray(func, length, setToState=false) {
        let arr = []
        for (let i = 0; i < length; ++i) {
            let element = new Element(func(i, length), 0, [255, 255, 255])
            arr.push(element)
        }
        if(setToState){
            this.setState({
                array: arr
            })
        }else {
            return arr;
        }
    }

    shuffleArray() {
        this.nullify()
        this.setState({
            sortName: "Shuffle"
        })
        for (let i = 0; i < this.arrLength; ++i) {
            let randomIndex = randomInt(i, this.arrLength)
            if (this.delayInc === 0) {
                this.swapWithDelay(i, randomIndex, true, this.delayInc / 5, this.state.array, false)
            } else {
                setTimeout(this.swapInArr.bind(this), this.delays.Swap += this.delayInc / 5, i, randomIndex, true, this.state.array, true)
            }
        }
    }

    shuffleClickEvent() {
        this.shuffleArray()
    }


    sortClickEvent(sort) {
        this.pseudoArray = deepArrayCopy(this.state.array)
        this.nullify()
        this.setState({
            sortName: sort.name
        })
        this.nullify()
        // sort(0, this.state.array.length - 1)

        let sortBind = sort.bind(this.sorts, 0, this.arrLength - 1)
        sortBind()
    }

    genSorts() {
        let tmp = []
        let methods = getAllMethods(this.sorts)
        for (let i of methods) {
            if(i.includes("Sort"))
                tmp.push(
                    <button key={i} onClick={this.sortClickEvent.bind(this, this.sorts[i])}>{i}</button>
                )
        }
        return tmp;
    }

    // updateArrLength(){
    //     let slider = document.getElementById("slider")
    //
    //     if(slider !== null){
    //         this.arrLength = slider.value
    //         this.setState({
    //             array: this.initArray(linear, this.arrLength)
    //         })
    //         this.pseudoArray = deepArrayCopy(this.state.array)
    //     }
    //     this.sorts.arrLength = this.getArrLength()
    //     this.delayInc = 5000/this.arrLength;
    // }

    updateArrLength(len){
        this.arrLength = len
        this.setState({
            array: this.initArray(linear, this.arrLength)
        })
        this.pseudoArray = deepArrayCopy(this.state.array)

        this.sorts.arrLength = this.getArrLength()
        this.delayInc = 3000/this.arrLength;
    }


    render() {
        return (
            <div>
                <Stats sortName={this.state.sortName} comparisons={this.state.comparisons} writes={this.state.writes} arrLength={this.arrLength}/>
                <div style={{display: "flex"}}>
                    <ArrayWindow array={this.state.array}/>
                </div>
                <div>
                    <Controls arrayVisualizer={this} sorts={this.sorts}/>
                </div>
            </div>
        )
    }
}