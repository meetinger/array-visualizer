import React from 'react';
import {randomInt, sleep} from "../utils/utils";
import {linear} from "../utils/initFunctions"
import {BubbleSort, LLQuickSort} from "../Sorts/Sorts"
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
    delayUnmark;
    delayInc;
    delayComp;
    instruction;
    pseudoArray;


    constructor(props) {
        super(props);
        this.state = {
            array: this.initArray(linear, 32),
            sortName: "",
            comparisons: 0,
            writes: 0
        }
        this.delaySwap = 0;
        this.delayUnmark = 0;
        this.delayInc = 100;
        this.delayComp = 100;
        this.instruction = [];
        this.pseudoArray = Object.assign({}, this.state.array);
    }

    nullify() {
        this.delaySwap = 0;
        this.delayUnmark = 0;
        this.delayComp = 0;
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
        this.instruction.push(["swap", a, b])
        this.swapInArr(a, b, false)
    }

    compare(a, b, arr = this.pseudoArray) {
        // this.markMany([a, b], {type: "Default"})
        // console.log(this.state.array[a] > this.state.array[b])
        this.instruction.push(["compare", a, b])
        return (arr[a].getValue() > arr[b].getValue())
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

    resetDelay() {
        this.delaySwap = 0
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

    play() {
        this.nullify()
        // console.log(this.instruction)
        for (let i of this.instruction) {
            if (i[0] === "swap") {
                this.swapWithDelay(i[1], i[2], true, this.delayInc, this.state.array)
            }
            if (i[0] === "compare") {
                this.compMainArrWithDelay(i[1], i[2], true)
                // console.log(i)
            }
        }
    }

    sortClickEvent(sort) {
        this.pseudoArray = Object.assign({}, this.state.array);
        this.instruction = []
        this.nullify()
        this.setState({
            sortName: sort.name
        })
        sort(this, 0, this.state.array.length - 1)
        this.play()
    }


    render() {
        return (
            <div>
                <Stats sortName={this.state.sortName} comparisons={this.state.comparisons} writes={this.state.writes}/>
                <ArrayWindow array={this.state.array}/>
                <button onClick={this.shuffleClickEvent.bind(this)}>Shuffle</button>
                <button onClick={this.sortClickEvent.bind(this, BubbleSort)}>BubbleSort</button>
                <button onClick={this.sortClickEvent.bind(this, LLQuickSort)}>LLQuickSort</button>
            </div>

        )
    }
}