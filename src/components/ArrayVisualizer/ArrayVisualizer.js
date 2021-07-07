import React from 'react';
import {randomInt, sleep} from "../utils/utils";
import {linear} from "../utils/initFunctions"
import {BubbleSort, LLQuickSort, SlowSort} from "../Sorts/Sorts"
import {ArrayWindow} from "../ArrayWindow/ArrayWindow";
import {Element} from "../classes/Element";
import {Stats} from "../Stats/Stats";

const colors = {
    "Unmarked": [255, 255, 255],
    "Default": [255, 0, 0],
    "Additional": [randomInt(0, 256), randomInt(0, 256), randomInt(0, 256)],
    "Sorted": [0, 255, 0],
    "Analysis": [0, 0, 255]
}

export class ArrayVisualizer extends React.Component {
    delaySwap;
    delaySwapUnmark;
    delayCompUnmark;
    delayInc;
    delayComp;
    pseudoArray;
    arrLength
    ctx

    constructor(props) {
        super(props);
        this.arrLength = 128
        this.state = {
            array: this.initArray(linear, this.arrLength),
            sortName: "",
            comparisons: 0,
            writes: 0
        }
        this.delaySwap = 0;
        this.delaySwapUnmark = 0;
        this.delayCompUnmark = 0;
        this.delayInc = 50;
        this.delayComp = 0;
        this.instruction = [];
        this.pseudoArray = Object.assign({}, this.state.array);

        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    playSound(value){
        let osc = this.ctx.createOscillator();
        osc.type = 'sine';
        let k = value/this.arrLength
        osc.frequency.value = 2000*k;

        let gain = this.ctx.createGain()
        osc.connect(gain)
        // gain.gain.exponentialRampToValueAtTime(0.1,this.ctx.currentTime+this.delayInc/1000/2)
        // gain.gain.exponentialRampToValueAtTime(0.1,this.ctx.currentTime+this.delayInc/1000)
        osc.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + this.delayInc/1000);
        // setTimeout(
        //     function() {
        //         osc.stop();
        //     },
        //     this.delayInc
        // );
    }

    resetDelay() {
        this.delaySwap = 0
        this.delayComp = 0
    }

    nullify() {
        this.resetDelay()
        this.setState(
            {
                comparisons: 0,
                writes: 0
            }
        )
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


    swapWithDelay(a, b, mark, delay = this.delayInc, arr = this.pseudoArray) {
        setTimeout(this.swapInArr.bind(this), this.delaySwap += delay, a, b, mark, arr)
    }


    swapInArr(a, b, mark = true, arr = this.pseudoArray) {
        this.playSound(a)
        // this.playSound(b)
        let tmpArr = arr
        // console.log("SWAPPING:" + tmpArr[a].getValue()+"<->"+tmpArr[b].getValue())
        let tmp = tmpArr[a]
        tmpArr[a] = tmpArr[b]
        tmpArr[b] = tmp
        if (mark) {
            this.mark(a, {type: "Default"}, true)
            this.mark(b, {type: "Default"}, true)
            setTimeout(this.unmarkMany.bind(this), this.delayUnmark += this.delayInc / 100, [a, b], false, true)
        }
        let curWrites = this.state.writes;
        this.setState({
            writes: curWrites + 2
        })
    }

    swap(a, b) {
        // this.instruction.push(["swap", a, b])
        this.swapWithDelay(a, b, true, this.delayInc, this.state.array)
        this.swapInArr(a, b, false)
    }

    compare(a, b, sign = "<",arr = this.pseudoArray) {
        // this.markMany([a, b], {type: "Default"})
        // console.log(this.state.array[a] > this.state.array[b])
        // this.instruction.push(["compare", a, b])
        this.compMainArrWithDelay(a, b, false)
        if(sign === "<"){
            return arr[a].getValue() < arr[b].getValue()
        }else if(sign === "<="){
            return arr[a].getValue() <= arr[b].getValue()
        }else if(sign === ">"){
            return arr[a].getValue() > arr[b].getValue()
        }else if(sign === ">="){
            return arr[a].getValue() >= arr[b].getValue()
        }else{
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
            this.mark(a, {type: "Additional", color:[0, 0, 255]}, true)
            this.mark(b, {type: "Additional", color:[0, 0, 255]}, true)
            setTimeout(this.unmarkMany.bind(this), this.delayUnmark += this.delayInc / 100, [a, b], false, true)
        }
    }

    compMainArrWithDelay(a, b, mark = false) {
        setTimeout(this.compMainArr.bind(this), this.delayComp += this.delayInc, a, b, mark)
    }

    getArrayVisualizer() {
        return this;
    }

    getPseudoArray() {
        return this.pseudoArray;
    }

    initArray(func, length) {
        let arr = []
        for (let i = 0; i < length; ++i) {
            let element = new Element(func(i, length), 0, [255, 255, 255])
            arr.push(element)
        }
        return arr;
    }

    shuffleArray() {
        this.nullify()
        this.setState({
            sortName: "Shuffle"
        })
        for (let i = 0; i < this.state.array.length; ++i) {
            // this.swap(i, randomInt(0, this.state.array.length))
            if (this.delayInc === 0) {
                this.swapWithDelay(i, randomInt(0, this.state.array.length), true, this.delayInc / 5, this.state.array)
            } else {
                setTimeout(this.swapInArr.bind(this), this.delaySwap += this.delayInc / 5, i, randomInt(0, this.state.array.length), true, this.state.array)
            }
            // sleep(50)
        }
    }

    shuffleClickEvent() {
        this.shuffleArray()
    }


    sortClickEvent(sort) {
        this.pseudoArray = Object.assign({}, this.state.array);
        this.instruction = []
        this.nullify()
        this.setState({
            sortName: sort.name
        })
        this.nullify()
        sort(this, 0, this.state.array.length - 1)
    }


    render() {
        return (
            <div>
                <Stats sortName={this.state.sortName} comparisons={this.state.comparisons} writes={this.state.writes}/>
                <ArrayWindow array={this.state.array}/>
                <button onClick={this.shuffleClickEvent.bind(this)}>Shuffle</button>
                <button onClick={this.sortClickEvent.bind(this, BubbleSort)}>BubbleSort</button>
                <button onClick={this.sortClickEvent.bind(this, LLQuickSort)}>LLQuickSort</button>
                <button onClick={this.sortClickEvent.bind(this, SlowSort)}>SlowSort</button>
            </div>

        )
    }
}