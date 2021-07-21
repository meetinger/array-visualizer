import React from "react";
import {objLength} from "../utils/utils";
import styles from "./ArrayWindow.module.scss";

export class ArrayWindow extends React.PureComponent {
    array
    mainArray
    height
    visualProps
    borderEnabled
    visualStyle
    arrayLen
    sizeStyle
    updateInterval
    updateAnimFrame
    updateCounter


    constructor(props) {
        super(props);
        this.array = props.array
        this.mainArray = props.mainArray
        this.height = props.height
        this.visualProps = props.visualProps
        this.borderEnabled = this.visualProps.barsStroke
        this.visualStyle = this.visualProps.style
        this.arrayLen = this.array.length
        this.sizeStyle = {width: "100%", height: this.height + "%"};
        this.updateCounter = 1
        this.state = {
            renderedArray: this.renderArray()
        }
    }
    componentDidMount() {
        this.updateInterval = setInterval(()=>{
            this.cancelAndUpdate()
        }, 25)
    }

    componentWillUnmount() {
        cancelAnimationFrame(this.updateAnimFrame)
    }

    cancelAndUpdate(){
        cancelAnimationFrame(this.updateAnimFrame)
        this.updateAnimFrame = requestAnimationFrame(this.updateState.bind(this))
    }


    updateState(){
        this.setState({
            renderedArray: this.renderArray()
        })
    }
    componentWillReceiveProps(nextProps, nextContext){
        this.array = nextProps.array
        this.mainArray = nextProps.mainArray
        this.height = nextProps.height
        this.visualProps = nextProps.visualProps
        this.borderEnabled = this.visualProps.barsStroke
        this.visualStyle = this.visualProps.style
        this.sizeStyle = {width: "100%", height: this.height + "%"};
        let len = this.array.length
        if(len !== this.arrayLen){
            this.arrayLen = len
            this.cancelAndUpdate()
        }
        if(++this.updateCounter%100===0){
            this.updateState()
            this.updateCounter=1
        }
        // this.updateState()
    }

    renderArray() {
        let tmp = []
        if (this.visualStyle === "bars") {
            let border = this.borderEnabled ? {} : {border: "none"}
            let offset = 2
            if(window.innerWidth / this.mainArray.length < 5){
                border = {border: "none"}
                offset = 0
            }
            let width = {
                width: window.innerWidth/this.mainArray.length - offset + "px"
            }
            for (let i = 0; i < this.arrayLen; ++i) {
                let styleSheet = {
                    height: this.array[i].getValue() / this.mainArray.length * 100 + "%",
                    backgroundColor: "rgb(" + this.array[i].getColorForRender() + ")",
                    ...border,
                    ...width
                }
                tmp.push(<div key={i} style={styleSheet} className={styles.bar}/>);
            }
            let styleSheet = {
                height: "0%",
                backgroundColor: "rgb(255,255,255)",
                ...border
            }
            for (let i = this.arrayLen; i < this.mainArray.length; ++i) {
                tmp.push(<div key={i} style={styleSheet} className={styles.bar}/>);
            }
        } else if (this.visualStyle === "dots") {
            for (let i = 0; i < this.arrayLen; ++i) {
                let value = this.array[i].getValue()
                let height = (value === -1) ? {height: 0} : {}
                let styleSheet = {
                    bottom: "calc(" + value / this.mainArray.length * 100 + "% - 0.25rem)",
                    backgroundColor: "rgb(" + this.array[i].getColorForRender() + ")",
                    ...height
                }
                tmp.push(<div className={styles.dotContainer}>
                    <div key={i} style={styleSheet} className={styles.dot}/>
                </div>);
            }
            let styleSheet = {
                bottom: 0,
                backgroundColor: "rgb(0, 0, 0)",
            }
            for (let i = this.arrayLen; i < this.mainArray.length; ++i) {
                tmp.push(<div className={styles.dotContainer}>
                    <div key={i} style={styleSheet} className={styles.dot}/>
                </div>);
            }
        }
        return tmp
    }

    render() {
        if (this.arrayLen === 0) {
            return <div style={this.sizeStyle}/>
        }else{
            return <div style={this.sizeStyle}>
                <div className={styles.arrayContainer}>
                    {this.state.renderedArray}
                </div>
            </div>
        }
    }
}