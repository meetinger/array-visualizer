import React from 'react';
import {Element} from "../classes/Element";
import {randomInt, sleep} from "../utils/utils";

// import {ArrayVisualizer} from "../ArrayVisualizer/ArrayVisualizer";
const colors = {
    "Unmarked": [255, 255, 255],
    "Default": [255, 0, 0],
    "Additional": [randomInt(0, 256), randomInt(0, 256), randomInt(0, 256)],
    "Sorted": [0, 255, 0],
    "Analysis": [0, 0, 255]
}

export class ArrayManager {
    array = []
    arrayVisualizer
    delay = 50


    constructor(arrayVisualizer) {
        this.arrayVisualizer = arrayVisualizer
        console.log("ID Manager:" + randomInt(0, 100))
    }

    setArray(isDirectly) {
        if (isDirectly) {
            this.arrayVisualizer.state = {array: this.array}
        } else {
            this.arrayVisualizer.setState(
                {array: this.array}
            )
        }
    }

    mark(index, args) {
        let type = "Default"
        let color = colors["Default"]

        //Additional
        if (args.type === "Additional" || (!args.type || args.color)) {
            type = "Additional"
            color = args.color
        }
        //Default
        else if (!args.type) {
            type = "Default"
            color = colors["Default"]
        } else {
            type = args.type
            color = args.color
        }

        this.array[index].setType(type)
        this.array[index].setColor(color)
    }


    unmark(index) {
        this.array[index].setColor(colors["Default"])
    }

    swap(a, b) {
        let tmp = this.array[a]
        this.array[a] = this.array[b]
        this.array[b] = tmp
        this.mark(a, b, {type: "Default"})
        this.setArray(true)
        sleep(this.delay);
    }

    getArray() {
        return this.array
    }

    shuffleArray() {
        for (let i = 0; i < this.array.length; ++i) {
            this.swap(i, randomInt(0, this.array.length))
        }
    }


    initArray(func, length) {
        for (let i = 0; i < length; ++i) {
            let element = new Element(func(i, length), 0, [255, 255, 255])
            this.array.push(element)
        }
        this.setArray(true)
    }


    render() {
        return (<div>ArrayManager</div>
        )
    }
}