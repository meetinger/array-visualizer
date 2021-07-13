import React from 'react';
import {arraysEquals, deepArrayCopy, getAllMethods, randomInt} from "../utils/utils";
import {Sorts} from "../Sorts/Sorts"
import {ArrayWindow} from "../ArrayWindow/ArrayWindow";
import {Element} from "../classes/Element";
import {Stats} from "../Stats/Stats";
import {Controls} from "../Controls/Controls";
import {initFunctions} from "../utils/initFunctions";
import {Delays} from "../ArrayAccess/Delays";
import {Sounds} from "../ArrayAccess/Sounds";
import {Marks} from "../ArrayAccess/Marks";
import {Reads} from "../ArrayAccess/Reads";
import {Writes} from "../ArrayAccess/Writes";

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
    ctx
    timeoutArray
    sorts
    delayIncConst
    showAuxArrays

    Delays
    Sounds
    Marks
    Reads
    Writes


    constructor(props) {
        super(props);
        this.DEFAULT_ARR_LEN = 100
        this.state = {
            array: this.initArray(initFunctions.linear, this.DEFAULT_ARR_LEN),
            sortName: "",
            comparisons: 0,
            writes: 0,
            auxArrays: []
        }
        this.pseudoArray = deepArrayCopy(this.state.array)
        console.log("INIT ArrayVisualizer!!!")

        this.Delays = new Delays(this)
        this.Sounds = new Sounds(this)
        this.Marks = new Marks(this)
        this.Reads = new Reads(this)

        this.Writes = new Writes(this)

        // console.log(this)
        this.instructions = [];
        this.timeoutArray = [];
        this.pseudoAuxArrays = []
        this.sorts = new Sorts(this);
        // this.arrLength = this.state.length
        // this.delayInc = this.delayIncConst/this.arrLength;
        this.showAuxArrays = true

        // this.updateArrLength(this.arrLength);
    }

    initArray(func, length, setToState=false) {
        console.log("INIT ARR")
        let arr = []
        for (let i = 0; i < length; ++i) {
            let element = new Element(func(i, length), 0, [255, 255, 255])
            arr.push(element)
        }
        if(setToState){
            this.arrayVisualizer.setState({
                array: arr
            })
        }else {
            return arr;
        }
    }

    nullify() {
        this.Delays.resetDelays()
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
        return this.state.array.length;
    }

    setShowAuxArrays(val){
        this.showAuxArrays = val
    }

    getMainArray(){
        return this.state.array
    }

    getPseudoAuxArrays(){
        return this.pseudoAuxArrays
    }

    getDelays(){
        return this.Delays
    }

    getSounds(){
        return this.Sounds;
    }

    getMarks(){
        return this.Marks;
    }

    getAuxArrays(){
        return this.state.auxArrays
    }

    getReads(){
        return this.Reads;
    }

    getWrites(){
        return this.Writes
    }

    forceUpdateMainArray(array){
        this.setState({
            array: array
        })
    }

    forceUpdateAuxArrays(auxArrays){
        this.setState({
            auxArrays: auxArrays
        })
    }

    forceUpdateState(state){
        this.setState(state)
    }

    stopSort(){
        // this.resetDelay()
        this.Delays.resetDelays()
        this.unmarkMany(Array.from(Array(this.getArrLength()).keys()), false, true)
        this.setState({
                auxArrays: []
            }
        )
    }

    //
    // shuffleClickEvent() {
    //     this.shuffleArray()
    // }

    shuffleArray(func) {
        this.nullify()
        this.setState({
            sortName: "Shuffle"
        })

        let instructions = func(this.getArrLength());
        for(let i of instructions){
            if(i.cmd === "swap"){
                // setTimeout(this.Writes.swapInArr.bind(this), this.delays.Swap += this.delayInc / 5, i.a, i.b, this.state.array, true, true)
                // setTimeout(this.Writes.swapInArr.bind(this), this.Delays.incDelay("Swap", this.Delays.getDelayInc()/5), i.a, i.b, this.state.array, true, true)
                this.Writes.swapWithDelay(i.a, i.b, this.state.array, true, this.Delays.getDelayInc()/5, true)
            }
        }

    }

    setSortName(sortName){
        this.setState({
            sortName: sortName
        })
    }

    initPseudoArray(){
        this.pseudoArray = deepArrayCopy(this.state.array)
    }

    // sortClickEvent(sortName, low, high, bucketsNum) {
    sortClickEvent() {
        // this.nullify()
        // let sortBind = sort.bind(this.sorts, 0, this.arrLength - 1)
        // sortBind()
        // console.log(sort)
        // let sort = this.sorts.getSortObject(sortName)
        //
        // this.setState({
        //     sortName: sort.getSortName()
        // })

        // let warnLen = sort.getWarnLen()
        // if(warnLen!==-1 && this.arrLength > warnLen && !window.confirm("WARNING!!!\nThe array size("+this.arrLength+") " +
        //     "more than recommended("+warnLen+")\nApplication may freeze\nDo you want continue?")){
        //     return
        // }

        // sort.runSort(low, high, bucketsNum)

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
        this.delayInc = val/this.getArrLength();
    }

    updateArrLength(len){
        this.setState({
            array: this.initArray(initFunctions.linear, len)
        })
        this.pseudoArray = deepArrayCopy(this.state.array)

        this.sorts.arrLength = this.getArrLength()
        this.updateDelayInc(this.delayIncConst)
    }

    // componentDidUpdate(prevProps, prevState, snapshot) {
    //     console.log(prevState.array)
    //     console.log(this.state.array)
    //     if(prevState.array.length === 10 && this.state.array.length === 100){
    //         throw "WARNING!!!"
    //     }
    // }

    genArrayWindows(){
        let tmp = []
        if(this.showAuxArrays) {
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
                <Stats sortName={this.state.sortName} comparisons={this.state.comparisons} writes={this.state.writes} arrLength={this.getArrLength()}/>
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