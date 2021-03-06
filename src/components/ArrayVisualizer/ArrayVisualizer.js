import React from 'react';
import {arraysEquals, deepArrayCopy, getAllMethods, objLength, randomInt} from "../utils/utils";
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

    static MAIN_ARRAY = -1

    Sorts
    delayIncConst
    showAuxArrays
    showStats
    enableBarsStroke
    visualStyle
    enableMarks

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
            mainWrites: 0,
            auxWrites: 0,
            sortTime: 0,
            auxArrays: {}
        }
        this.pseudoArray = deepArrayCopy(this.state.array)
        this.Delays = new Delays(this)
        this.Sounds = new Sounds(this)
        this.Marks = new Marks(this)
        this.Reads = new Reads(this)

        this.prevArray = []

        this.Writes = new Writes(this)
        this.pseudoAuxArrays = {}
        this.Sorts = new Sorts(this);
        this.showAuxArrays = true
        this.showStats = true
        this.enableBarsStroke = true
        this.enableMarks = true
        this.visualStyle = {
            // style: "bars",
            style: "bars",
            barsStroke: true,
        }
    }

    initArray(func, length, setToState=false) {
        let arr = []
        for (let i = 0; i < length; ++i) {
            let element = new Element(func(i, length), "Unmarked", [255, 255, 255], [0,0,0,0])
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

    nullify() {
        this.Delays.resetDelays()
        this.setState(
            {
                comparisons: 0,
                mainWrites: 0,
                auxWrites: 0,
                sortTime: 0
            }
        )
        // eslint-disable-next-line react/no-direct-mutation-state
        this.state.writes = 0;
        // eslint-disable-next-line react/no-direct-mutation-state
        this.state.comparisons = 0;
    }

    setShowAuxArrays(val){
        this.showAuxArrays = val
    }

    setShowStats(val){
        this.showStats = val
        this.forceMainArrayUpdate()
    }

    setEnableBarsStroke(val){
        this.visualStyle.barsStroke = val;
        this.forceMainArrayUpdate()
    }

    setVisualStyle(val){
        this.visualStyle.style = val;
        this.forceMainArrayUpdate()
    }

    setEnableMarks(val){
        this.enableMarks = val;
        if(!val){
            this.Marks.clearAllMarks()
        }
    }

    getEnableMarks(){
        return this.enableMarks;
    }

    getArrayVisualizer() {
        return this;
    }

    getState(){
        return this.state
    }

    getArrLength(){
        return this.state.array.length;
    }

    getArray(arrIndex, isPseudo = false){
        if(arrIndex === -1){
            return isPseudo ? this.pseudoArray : this.state.array
        }else{
            if(isPseudo){
                return this.pseudoAuxArrays[arrIndex]
            }else{
                console.log("Non-Pseudo Aux Arrays:")
                console.log(this.state.auxArrays)
                // throw new Error("LOL")
                return this.state.auxArrays[arrIndex]
            }
        }
    }

    getAuxArrays(isPseudo){
        return isPseudo ? this.pseudoAuxArrays : this.state.auxArrays
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

    getReads(){
        return this.Reads;
    }

    getWrites(){
        return this.Writes
    }


    stopSort(){
        // this.resetDelay()
        this.Delays.resetDelays()
        this.Marks.clearAllMarks()
        this.setState({
                auxArrays: []
            }
        )
    }

    shuffleArray(func) {
        this.nullify()
        this.setState({
            sortName: "Shuffle"
        })
        this.backupArray()
        func(this);
        // let instructions = func(this);
        // for(let i of instructions){
        //     if(i.cmd === "swap"){
        //         this.Writes.swapWithDelay(i.a, i.b, this.state.array, true, this.Delays.getDelayInc()/5, true)
        //     }
        // }

    }

    restoreArray(){
        this.setState({
            array: deepArrayCopy(this.prevArray)
        })
    }

    backupArray(){
        this.prevArray = deepArrayCopy(this.state.array)
    }


    setSortName(sortName){
        this.setState({
            sortName: sortName
        })
    }

    initPseudoArray(){
        this.pseudoArray = deepArrayCopy(this.state.array)
    }

    sortClickEvent() {
    }

    forceMainArrayUpdate(){
        let tmp = this.state.array;
        this.setState({
            array: tmp
        })
    }

    updateDelayInc(val){
        this.delayInc = val/this.getArrLength();
    }

    updateArrLength(len){
        this.setState({
            array: this.initArray(initFunctions.linear, len)
        })
        this.pseudoArray = deepArrayCopy(this.state.array)

        this.Sorts.arrLength = this.getArrLength()
        // this.updateDelayInc(this.delayIncConst)
        this.Delays.updateDelayInc();
    }

    genArrayWindows(){
        let tmp = []
        if(this.showAuxArrays) {
            let len = objLength(this.state.auxArrays)
            for (let i = len - 1; i >= 0; i--) {
                // console.log(this.state.auxArrays[i])
                tmp.push(
                    <ArrayWindow key={len - i} array={this.state.auxArrays[i]}
                                 mainArray={this.state.array} height={100 / (1 + len)} visualProps = {this.visualStyle} />
                )
            }
        }
        return tmp
    }

    genStats(){
        if(this.showStats){
            return <Stats sortName={this.state.sortName} comparisons={this.state.comparisons} mainWrites={this.state.mainWrites} auxWrites={this.state.auxWrites} arrLength={this.getArrLength()} sortTime={this.state.sortTime}/>
        }
    }

    render() {
        return (
            <div>
                {this.genStats()}
                <div style={{height: "100vh"}}>
                    {this.genArrayWindows()}
                    <ArrayWindow array={this.state.array} mainArray={this.state.array} height={this.showAuxArrays ? 100/(1+objLength(this.state.auxArrays)) : 100} visualProps={this.visualStyle}/>
                </div>
                <div>
                    <Controls arrayVisualizer={this} sorts={this.Sorts}/>
                </div>
            </div>
        )
    }
}