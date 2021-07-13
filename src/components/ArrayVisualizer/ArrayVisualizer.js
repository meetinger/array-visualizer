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

    Sorts
    delayIncConst
    showAuxArrays
    enableBarsStroke

    Delays
    Sounds
    Marks
    Reads
    Writes

    visualStyle

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
        this.Delays = new Delays(this)
        this.Sounds = new Sounds(this)
        this.Marks = new Marks(this)
        this.Reads = new Reads(this)

        this.Writes = new Writes(this)
        this.pseudoAuxArrays = []
        this.Sorts = new Sorts(this);
        this.showAuxArrays = true
        this.enableBarsStroke = true
        this.visualStyle = {
            // style: "bars",
            style: "bars",
            barsStroke: true,
        }
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

    setShowAuxArrays(val){
        this.showAuxArrays = val
    }

    setEnableBarsStroke(val){
        this.visualStyle.barsStroke = val;
        this.forceMainArrayUpdate()
    }

    setVisualStyle(val){
        this.visualStyle.style = val;
        this.forceMainArrayUpdate()
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


    stopSort(){
        // this.resetDelay()
        this.Delays.resetDelays()
        this.Marks.unmarkMany(Array.from(Array(this.getArrLength()).keys()), false, true)
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

        let instructions = func(this.getArrLength());
        for(let i of instructions){
            if(i.cmd === "swap"){
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
        this.updateDelayInc(this.delayIncConst)
    }

    genArrayWindows(){
        let tmp = []
        if(this.showAuxArrays) {
            for (let i = this.state.auxArrays.length - 1; i >= 0; i--) {
                tmp.push(
                    <ArrayWindow key={this.state.auxArrays.length - i} array={this.state.auxArrays[i]}
                                 mainArray={this.state.array} height={100 / (1 + this.state.auxArrays.length)} visualProps = {this.visualStyle} />
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
                    <ArrayWindow array={this.state.array} mainArray={this.state.array} height={this.showAuxArrays ? 100/(1+this.state.auxArrays.length) : 100} visualProps={this.visualStyle}/>
                </div>
                <div>
                    <Controls arrayVisualizer={this} sorts={this.Sorts}/>
                </div>
            </div>
        )
    }
}