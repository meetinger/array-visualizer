import React from 'react';
import styles from "./Controls.module.scss";
import {initFunctions} from "../utils/initFunctions";
import {getAllMethods} from "../utils/utils";
import {shuffles} from "../utils/shuffles";


export class Controls extends React.Component {
    isControlShow
    arrayVisualizer
    sorts

    constructor(props) {
        super(props);
        this.isControlShow = true;
        this.arrayVisualizer = props.arrayVisualizer
        this.sorts = props.sorts
        this.arrayVisualizer.updateArrLength(100)
        this.arrayVisualizer.initArray(initFunctions.linear)
    }

    updateArrLength() {
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

    initArray(func){
        this.arrayVisualizer.initArray(func, this.arrayVisualizer.arrLength, true)
    }

    shuffleArray(func){
        this.arrayVisualizer.shuffleArray(func)
    }

    sortArray(sort){
        this.arrayVisualizer.sortClickEvent(sort)
    }

    stopSort(){
        this.arrayVisualizer.stopSort()
    }

    abortSort(){
        this.stopSort()
        this.initArray(initFunctions.linear)
    }

    genInitFunctions(){
        // console.log(initFunctions)
        let tmp = []
        for (let i in initFunctions) {
            tmp.push(
                <button key={i} onClick={this.initArray.bind(this, initFunctions[i])}>{i}</button>
            )
        }
        return tmp;
    }

    getSorts(){
        let tmp = []
        let methods = getAllMethods(this.sorts)
        for (let i of methods) {
            if(i.includes("Sort"))
                tmp.push(
                    <button key={i} onClick={this.sortArray.bind(this, this.sorts[i])}>{i}</button>
                )
        }
        return tmp;
    }

    getShuffles(){
        let tmp = []
        for(let i in shuffles){
            tmp.push(
                <button key={i} onClick={this.shuffleArray.bind(this, shuffles[i])}>{i}</button>
            )
        }
        return tmp;
    }

    render() {
        return (
            <div id={styles.controlsContainer}>
                {/*<div onClick={this.toggleControlShow.bind(this)} id={styles.showToggleBtn}>&lt;&lt;</div>*/}
                <div id={styles.controls}>
                    <div>
                        <div className={styles.textCenter}>Array Size</div>
                        <input id={styles.slider} type="range" min="10" max="300" defaultValue={this.arrLength}
                               step="10"
                               onChange={this.updateArrLength.bind(this)}/>

                        <div className={styles.textCenter}>
                            <div>Init Array</div>
                            <div>{this.genInitFunctions()}</div>
                        </div>

                        <div className={styles.textCenter}>
                            <div>Shuffle Array</div>
                            <div>
                                {/*<button onClick={this.shuffleArray.bind(this)}>Random</button>*/}
                                <div>{this.getShuffles()}</div>
                            </div>
                        </div>
                        <div className={styles.textCenter}>
                            <div>Sort control</div>
                            <div>
                                <button onClick={this.abortSort.bind(this)}>Abort Sort(Recommended)</button>
                                <button onClick={this.stopSort.bind(this)}>Stop Sort(Not Recommended)</button>
                            </div>
                        </div>
                        <div className={styles.textCenter}>
                            <div>Sort Array</div>
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