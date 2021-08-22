import React from 'react';
import styles from "./Controls.module.scss";
import {initFunctions} from "../utils/initFunctions";
import {shuffles} from "../utils/shuffles";


export class Controls extends React.PureComponent {
    isControlShow
    arrayVisualizer
    sorts

    constructor(props) {
        super(props);
        this.isControlShow = true;
        this.arrayVisualizer = props.arrayVisualizer
        this.sorts = props.sorts
        this.arrayVisualizer.updateArrLength(this.arrayVisualizer.DEFAULT_ARR_LEN)
        // this.arrayVisualizer.initArray(initFunctions.linear)
    }

    updateArrLength() {
        this.stopSort()
        let slider = document.getElementById(styles.slider)

        if (slider !== null) {
            let len = slider.value
            this.arrayVisualizer.updateArrLength(len)
        }

    }

    toggleControlShow() {
        // console.log(styles.controls)
        let controlsContainer = document.getElementById(styles.controlsContainer)
        let controls = document.getElementById(styles.controls)
        let btn = document.getElementById(styles.showToggleBtn)
        if (this.isControlShow) {
            controls.style.display = "none"
            controlsContainer.style.width = "0"
            btn.innerHTML = "&gt;&gt;";
        } else {
            controls.style.display = "block"
            controlsContainer.style.width = "20rem"
            btn.innerHTML = "&lt;&lt";
        }
        this.isControlShow = !this.isControlShow
    }

    initArray(func) {
        this.arrayVisualizer.initArray(func, this.arrayVisualizer.getArrLength(), true)
    }

    shuffleArray(func) {
        this.stopSort()
        this.arrayVisualizer.getDelays().setDelayIncFactor(this.arrayVisualizer.getDelays().DELAY_INC_CONST/10)
        this.arrayVisualizer.shuffleArray(func)
        this.arrayVisualizer.getDelays().restoreDelayIncFactor()
        // func(this.arrayVisualizer)
    }

    sortArray(sortName) {
        this.stopSort()
        this.sorts.runSort(sortName, 0, this.arrayVisualizer.getArrLength() - 1)
    }

    stopSort() {
        this.arrayVisualizer.stopSort()
        // this.Delays.resetDelays()
        // this.arrayVisualizer.nullify()
    }

    abortSort() {
        this.stopSort()
        this.initArray(initFunctions.linear)
    }

    genInitFunctions() {
        // console.log(initFunctions)
        let tmp = []
        for (let i in initFunctions) {
            tmp.push(
                <button key={i} onClick={this.initArray.bind(this, initFunctions[i])}>{i}</button>
            )
        }
        return tmp;
    }

    getSorts() {
        let tmp = []
        let sortsNames = this.sorts.getSortsPaths()
        for (let i of sortsNames) {
            tmp.push(
                <button key={i} onClick={this.sortArray.bind(this, i)}>{i}</button>)
        }
        return tmp;
    }

    getShuffles() {
        let tmp = []
        for (let i in shuffles) {
            tmp.push(
                <button key={i} onClick={this.shuffleArray.bind(this, shuffles[i])}>{i}</button>
            )
        }
        return tmp;
    }

    toggleShowAuxArrays() {
        let element = document.getElementById("auxArrShowCB")
        this.arrayVisualizer.setShowAuxArrays(element.checked)
    }

    toggleBarsStroke() {
        let element = document.getElementById("enableStrokeCB")
        this.arrayVisualizer.setEnableBarsStroke(element.checked)
    }

    toggleEnableMarks() {
        let element = document.getElementById("enableMarksCB")
        this.arrayVisualizer.setEnableMarks(element.checked)
    }

    toggleVisualStyle(val) {
        this.arrayVisualizer.setVisualStyle(val)
    }

    toggleRainbow(val){
        this.arrayVisualizer.getMarks().setRainbow(val)
    }

    toggleShowStats(){
        let element = document.getElementById("showStatsCB")
        this.arrayVisualizer.setShowStats(element.checked)
    }

    restoreArray(){
        this.stopSort()
        this.arrayVisualizer.restoreArray()
    }

    render() {
        return (
            <div id={styles.controlsContainer}>
                {/*<div onClick={this.toggleControlShow.bind(this)} id={styles.showToggleBtn}>&lt;&lt;</div>*/}
                <div id={styles.controls}>
                    <div>
                        <div>
                            <div className={styles.sectionHeader}>Array Size</div>
                            <input id={styles.slider} type="range" min="10" max="1000"
                                   defaultValue={this.arrayVisualizer.DEFAULT_ARR_LEN}
                                   step="10"
                                   onChange={this.updateArrLength.bind(this)}/>
                        </div>
                        <div>
                            <div className={styles.sectionHeader}>Visuals</div>
                            <div style={{display: "flex", justifyContent:"center"}}>
                                <div style={{textAlign: "left"}}>
                                    <div className={styles.checkBoxContainer}>
                                        <input onChange={this.toggleShowAuxArrays.bind(this)} type="checkbox"
                                               id="auxArrShowCB"
                                               name="auxArrShowCB" defaultChecked={true}/>
                                        <label htmlFor="auxArrShowCB">Show Aux Arrays</label>
                                    </div>
                                    <div className={styles.checkBoxContainer}>
                                        <input onChange={this.toggleBarsStroke.bind(this)} type="checkbox"
                                               id="enableStrokeCB"
                                               name="enableStrokeCB" defaultChecked={true}/>
                                        <label htmlFor="enableStrokeCB">Enable Bars Stroke</label>
                                    </div>
                                    <div className={styles.checkBoxContainer}>
                                        <input onChange={this.toggleEnableMarks.bind(this)} type="checkbox"
                                               id="enableMarksCB"
                                               name="enableMarksCB" defaultChecked={true}/>
                                        <label htmlFor="enableMarksCB">Enable Marks(Disable to reduce lags)</label>
                                    </div>
                                    <div className={styles.checkBoxContainer}>
                                        <input onChange={this.toggleShowStats.bind(this)} type="checkbox"
                                               id="showStatsCB"
                                               name="showStatsCB" defaultChecked={true}/>
                                        <label htmlFor="showStatsCB">Show stats</label>
                                    </div>
                                    <div className={styles.checkBoxContainer}>
                                        <button onClick={this.toggleRainbow.bind(this, true)}>Paint to Rainbow</button>
                                        <button onClick={this.toggleRainbow.bind(this, false)}>Clear Color</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className={styles.sectionHeader}>Visual Styles</div>
                            <div>
                                <input onChange={this.toggleVisualStyle.bind(this, "bars")} type="radio"
                                       id="barsRadioBtn"
                                       name="visualStyle" value="bars" defaultChecked={true}/>
                                <label htmlFor="barsRadioBtn">Bars</label>

                                <input onChange={this.toggleVisualStyle.bind(this, "dots")} type="radio"
                                       id="dotsRadioBtn"
                                       name="visualStyle" value="dots"/>
                                <label htmlFor="dotsRadioBtn">Dots</label>
                            </div>
                        </div>
                        <div>
                            <div className={styles.sectionHeader}>Init Array</div>
                            <div>{this.genInitFunctions()}</div>
                            <div><button onClick={this.restoreArray.bind(this)}>RESTORE ARRAY</button></div>
                        </div>

                        <div>
                            <div className={styles.sectionHeader}>Shuffle Array</div>
                            <div>
                                {/*<button onClick={this.shuffleArray.bind(this)}>Random</button>*/}
                                <div>{this.getShuffles()}</div>
                            </div>
                        </div>
                        <div>
                            <div className={styles.sectionHeader}>Sort control</div>
                            <div>
                                <button onClick={this.abortSort.bind(this)}>Abort Sort(Recommended)</button>
                                <button onClick={this.stopSort.bind(this)}>Stop Sort(Not Recommended)</button>
                            </div>
                        </div>
                        <div>
                            <div className={styles.sectionHeader}>Sort Array</div>
                            <div>
                                {this.getSorts()}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        )
    }
}