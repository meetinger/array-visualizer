import React from 'react';
import {arraysEquals, deepArrayCopy, getAllMethods, randomInt} from "../utils/utils";
import {Sorts} from "../Sorts/Sorts"
import {ArrayWindow} from "../ArrayWindow/ArrayWindow";
import {Element} from "../classes/Element";
import {Stats} from "../Stats/Stats";
import {Controls} from "../Controls/Controls";
import {initFunctions} from "../utils/initFunctions";

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
    pseudoAuxArrays;
    arrLength
    ctx
    timeoutArray
    sorts
    delayIncConst
    showAuxArrays

    constructor(props) {
        super(props);
        // this.arrLength = 100
        this.state = {
            array: this.initArray(initFunctions.linear, this.arrLength),
            sortName: "",
            comparisons: 0,
            writes: 0,
            auxArrays: []
        }
        this.delays = {
            Swap: 0,
            Write: 0,
            Comp: 0,
            Unmark: 0,
            CreateAuxArray: 0,
            RemoveAuxArray: 0
        }
        this.delayIncConst = 3000
        this.instructions = [];
        this.timeoutArray = [];
        this.pseudoArray = deepArrayCopy(this.state.array)
        this.pseudoAuxArrays = []
        this.sorts = new Sorts(this);
        this.arrLength = this.state.length
        this.delayInc = this.delayIncConst/this.arrLength;
        this.showAuxArrays = true
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
            Unmark: 0,
            CreateAuxArray: 0,
            RemoveAuxArray: 0
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

    read(index, arr = this.pseudoArray) {
        // this.markUnmarkMany([index], {type: "Default"})
        this.instructions.push(
            {
             cmd: "read",
             arr: arr,
             index: index
            }
        )
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

    createAuxArray(len, isPseudo = true){
        if(isPseudo) {
            let auxArrIndex = this.pseudoAuxArrays.length
            this.pseudoAuxArrays.push(this.initArray(() => 0, len, false))
            this.instructions.push(
                {
                    cmd: "createAuxArray",
                    len: len
                }
            )
            return auxArrIndex
        }else{
            let tmpArr = this.state.auxArrays
            tmpArr.push(this.initArray(() => 0, len, false))
            this.setState({
                auxArrays: tmpArr
                }
            )
        }
    }

    createAuxArrayWithDelay(len, delay, isPseudo = false){
        this.timeoutArray.push(setTimeout(this.createAuxArray.bind(this), this.delays.Write += delay, len, isPseudo))
    }

    removeAuxArray(index, isPseudo = true){
        if(isPseudo) {
            this.pseudoAuxArrays.splice(index, 1)
            this.instructions.push(
                {
                    cmd: "removeAuxArray",
                    index: index
                }
            )
        }else{
            console.log("REMOVING AUX ARRAY: " + index)
            let tmp = this.state.auxArrays
            tmp.splice(index, 1)
            this.setState({
                auxArrays: tmp
            })
            console.log("LEN: " + this.state.auxArrays.length)
            // this.state.auxArrays.splice(index, 1)
        }
    }

    removeAuxArrayWithDelay(index, delay, isPseudo = false){
        this.timeoutArray.push(setTimeout(this.removeAuxArray.bind(this), this.delays.Write += delay, index, isPseudo))
    }

    auxRead(index, arrIndex, isPseudo = true){
        if(isPseudo){
            return this.pseudoAuxArrays[arrIndex][index].getValue()
        }else {
            return this.state.auxArrays[arrIndex][index].getValue()
        }
    }

    auxWrite(index, value, arrIndex, isPseudo = true, playSound = false){
        if(playSound){
            this.playSound(value)
        }
        if(isPseudo){
            this.pseudoAuxArrays[arrIndex][index].setValue(value)
            this.instructions.push(
                {
                    cmd: "auxWrite",
                    index: index,
                    value: value,
                    arrIndex: arrIndex
                }
            )
        }else{
            this.state.auxArrays[arrIndex][index].setValue(value)
            let tmp = this.state.auxArrays
            this.setState({
                auxArrays: tmp
            })
        }
    }

    auxWriteWithDelay(index, value, arrIndex, delay, isPseudo = false, playSound = true, ){
        this.timeoutArray.push(setTimeout(this.auxWrite.bind(this), this.delays.Write += delay, index, value, arrIndex, isPseudo, playSound))
    }

    getNameByArray(arr){
        // console.log(arr)
        if(arraysEquals(arr, this.state.array)){
            return {name:"mainArray"}
        }
        if(arraysEquals(arr, this.pseudoArray)){
            return {name:"pseudoArray"}
        }
        for(let i = 0; i < this.pseudoAuxArrays.length;++i){
            if (arraysEquals(arr, this.pseudoAuxArrays[i])){
                return {name:"pseudoAuxArray", index:i}
            }
        }
        for(let i = 0; i < this.state.auxArrays.length;++i){
            if (arraysEquals(arr, this.state.auxArrays[i])){
                return {name:"auxArray", index:i}
            }
        }
        return "NotFound"
    }

    getArrayByName(args){
        let name = args.name
        let index = args.index
        if (name==="mainArray"){
            return this.state.array
        }
        if(name==="pseudoArray"){
            return this.pseudoArray
        }
        if(name==="auxArray"){
            console.log(args)
            return this.state.auxArrays[index]
        }
        if(name==="pseudoAuxArray"){
            console.log(args)
            return this.pseudoAuxArrays[index]
        }
        return []
    }

    inverseArrayName(args){
        let name = args.name
        let index = args.index
        if(name==="pseudoArray") {
            return {name:"mainArray"}
        }else if(name==="pseudoAuxArray"){
            return {name: "auxArray", index: index}
        }
        return args
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

    setShowAuxArrays(val){
        this.showAuxArrays = val
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

    shuffleArray(func) {
        this.nullify()
        this.setState({
            sortName: "Shuffle"
        })

        let instructions = func(this.arrLength);
        for(let i of instructions){
            if(i.cmd === "swap"){
                setTimeout(this.swapInArr.bind(this), this.delays.Swap += this.delayInc / 5, i.a, i.b, this.state.array, true, true)
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

        let sortBind = sort.bind(this.sorts, 0, this.arrLength - 1)
        sortBind()
        console.log("SORTED ARRAY:")
        console.log(this.pseudoArray)

        console.log("START INTERPRETATION!!")
        for(let i of this.instructions){
            let cmd = i.cmd
            if(["swap", "read", "write"].includes(cmd)) {
                let arrName = this.getNameByArray(i.arr)
                let arrNameInv = this.inverseArrayName(arrName)
                let arr = this.getArrayByName(arrNameInv)
                // console.log(arrName)
                if (cmd === "swap") {
                    this.swapWithDelay(i.a, i.b, arr, true, this.delayInc, true)
                } else if (cmd === "write") {
                    // console.log(arrName)
                    // console.log("WRITE FROM INTERPRETER!")
                    // console.log(arr)
                    // console.log(this.getNameByArray(arr))
                    this.writeWithDelay(i.index, i.value, arr, true, this.delayInc, true)
                } else {}
            }
            if(cmd==="auxWrite"){
                this.auxWriteWithDelay(i.index, i.value, i.arrIndex, this.delayInc, false, true)
            }
            if(cmd==="createAuxArray"){
                this.createAuxArrayWithDelay(i.len, this.delayInc, false)
            }
            if(cmd==="removeAuxArray"){
                this.removeAuxArrayWithDelay(i.index, this.delayInc, false)
            }
        }
        this.pseudoAuxArrays = []
        this.instructions = []
    }


    updateDelayInc(val){
        this.delayInc = val/this.arrLength;
    }

    updateArrLength(len){
        this.arrLength = len
        this.setState({
            array: this.initArray(initFunctions.linear, this.arrLength)
        })
        this.pseudoArray = deepArrayCopy(this.state.array)

        this.sorts.arrLength = this.getArrLength()
        this.updateDelayInc(this.delayIncConst)
    }

    genArrayWindows(){
        let tmp = []
        if(this.showAuxArrays) {
            console.log(this.state.auxArrays)
            for (let i = this.state.auxArrays.length - 1; i >= 0; i--) {
                tmp.push(
                    <ArrayWindow key={this.state.auxArrays.length - i} array={this.state.auxArrays[i]}
                                 mainArray={this.state.array} height={100 / (1 + this.state.auxArrays.length)}/>
                )
            }
        }
        return tmp
    }

    render() {
        return (
            <div>
                <Stats sortName={this.state.sortName} comparisons={this.state.comparisons} writes={this.state.writes} arrLength={this.arrLength}/>
                <div style={{height: "100vh"}}>
                {/*<div>*/}
                    {this.genArrayWindows()}
                    <ArrayWindow array={this.state.array} mainArray={this.state.array} height={this.showAuxArrays ? 100/(1+this.state.auxArrays.length) : 100}/>
                </div>
                <div>
                    <Controls arrayVisualizer={this} sorts={this.sorts}/>
                </div>
            </div>
        )
    }
}