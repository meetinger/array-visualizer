import {HSL2RGB, randomInt} from "../utils/utils";

export const colors = {
    "Unmarked": [255, 255, 255],
    "Default": [255, 0, 0],
    "Additional": [randomInt(0, 256), randomInt(0, 256), randomInt(0, 256)],
    "Sorted": [0, 255, 0],
    "Analysis": [0, 0, 255]
}
export class Marks{
    arrayVisualizer
    Delays

    constructor(arrayVisualizer) {
        this.arrayVisualizer = arrayVisualizer
        this.Delays = arrayVisualizer.getDelays()
    }

    mark(index, args, saveArr = true) {
        if(!this.arrayVisualizer.getEnableMarks()){
            return;
        }
        let type = "Default"
        let color = colors["Default"]
        let tmpArr = this.arrayVisualizer.getMainArray()
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
        tmpArr[index].setMarkColor(color)
        if (saveArr) {
            this.arrayVisualizer.setState({
                array: tmpArr
            })
        } else {
            return tmpArr
        }
        // console.log(color);
    }

    markMany(indexes, args, saveArr) {
        let tmpArr = this.arrayVisualizer.getMainArray()
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
        let tmpArr = this.arrayVisualizer.getMainArray()
        // tmpArr[index].setMarkColor(colors["Unmarked"])
        tmpArr[index].setType("Unmarked")
        if (saveArr) {
            this.arrayVisualizer.setState({
                array: tmpArr
            })
        } else {
            return tmpArr
        }
    }

    unmarkMany(indexes, saveArr, saveOnce) {
        let tmpArr = this.arrayVisualizer.getMainArray()
        for (let i of indexes) {
            if (saveArr) {
                this.unmark(i, saveArr)
            } else {
                tmpArr = this.unmark(i, saveArr)
            }
        }
        if (saveOnce) {
            this.arrayVisualizer.setState({
                array: tmpArr
            })
        }
        if (!saveArr) {
            return tmpArr
        }
    }

    setRainbow(val){
        let tmpArr = this.arrayVisualizer.getMainArray()
        if(val){
            for(let i = 0; i < tmpArr.length; ++i){
                let hsl = [i / tmpArr.length, 0.8, 0.5]
                let rgb = HSL2RGB(hsl[0], hsl[1], hsl[2])
                tmpArr[i].setColor(rgb)
            }
        }else{
            for(let i of tmpArr){
                i.setColor([255, 255, 255])
            }
        }
        this.arrayVisualizer.setState({
            array: tmpArr
        })
    }

    markUnmarkMany(markIndexes, markArgs) {
        this.markMany(markIndexes, markArgs, true)
        this.Delays.push(setTimeout(this.unmarkMany.bind(this), this.Delays.incDelay("Unmark", this.Delays.getDelayInc() / 100), markIndexes, false, true))
    }

    clearAllMarks(){
        this.markUnmarkMany(Array.from(Array(this.arrayVisualizer.getArrLength()).keys()), false, true)
    }

}