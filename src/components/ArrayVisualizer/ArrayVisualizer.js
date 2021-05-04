import React from 'react';
import {randomInt, sleep} from "../utils/utils";
import {linear} from "../utils/initFunctions"
import {ArrayWindow} from "../ArrayWindow/ArrayWindow";
import {Element} from "../classes/Element";

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

    constructor(props) {
        super(props);
        this.state = {
            array: this.initArray(linear, 128)
        }
        this.delaySwap = 0;
        this.delayUnmark = 0;
        this.delayInc = 50;
    }

    mark(index, args, saveArr = true) {
        let type = "Default"
        let color = colors["Default"]
        let tmpArr = this.state.array
        // Additional
        if (args.type === "Additional" || (!args.type && args.color)) {
            type = "Additional"
            color = args.color
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

    swap(a, b, mark = true) {
        let tmpArr = this.state.array
        let tmp = tmpArr[a]
        tmpArr[a] = tmpArr[b]
        tmpArr[b] = tmp

        if (mark) {
            this.mark(a, {type: "Default"}, true)
            this.mark(b, {type: "Default"}, true)
            setTimeout(this.unmarkMany.bind(this), this.delayUnmark += this.delayInc/100, [a, b], false, true)
        }
    }

    resetDelay() {
        this.delaySwap = 0
    }

    getArrayVisualizer() {
        return this;
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
        for (let i = 0; i < this.state.array.length; ++i) {
            // this.swap(i, randomInt(0, this.state.array.length))
            if (this.delayInc === 0) {
                this.swap(i, randomInt(0, this.state.array.length))
            } else {
                setTimeout(this.swap.bind(this), this.delaySwap += this.delayInc, i, randomInt(0, this.state.array.length))
            }
            // sleep(50)
        }
    }

    handleClickEvent() {
        this.shuffleArray()
    }

    render() {
        return (
            <div>
                <ArrayWindow array={this.state.array}/>
                <button onClick={this.handleClickEvent.bind(this)}>Shuffle</button>
            </div>

        )
    }
}