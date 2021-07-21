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
    index

    constructor(props) {
        super(props);
        this.array = props.array
        this.index = props.index
        // console.log(this.index)
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
        }, 17)
    }

    componentWillUnmount() {
        cancelAnimationFrame(this.updateAnimFrame)
    }

    cancelAndUpdate(){
        cancelAnimationFrame(this.updateAnimFrame)
        this.updateAnimFrame = requestAnimationFrame(this.renderArray.bind(this))
    }


    updateState(){
        // this.setState({
        //     renderedArray: this.renderArray()
        // })
    }
    componentWillReceiveProps(nextProps, nextContext){
        this.array = nextProps.array
        // this.index = nextProps.index
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
        //workaround for firefox
        if(++this.updateCounter%5===0){
            this.cancelAndUpdate()
            this.updateCounter=1
        }
        // this.updateState()
        // this.cancelAndUpdate()
    }

    renderArray() {
        // console.log(this.index)
        let canvasArr = document.getElementsByClassName(styles.canvas)
        let containerArr = document.getElementsByClassName(styles.arrayContainer)

        let canvas = canvasArr[canvasArr.length - this.index-1]
        let container = containerArr[containerArr.length - this.index-1]
        // console.log(canvas)
        // console.log(container)
        if(canvas==null){
            return
        }
        let containerWidth = container.clientWidth
        let containerHeight = container.clientHeight
        console.log("INDEX: "+this.index+"\nHEIGHT: "+containerHeight)
        canvas.width = containerWidth
        canvas.height = containerHeight
        let ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled= false
        ctx.filter = "none"
        let offset = containerWidth/this.mainArray.length

        if(this.visualStyle === "bars") {
            for (let i = 0; i < this.arrayLen; ++i) {
                let height = this.array[i].getValue() / (this.mainArray.length - 1) * containerHeight

                let x = offset * i
                let y = containerHeight - height
                let w = offset
                let h = height
                ctx.fillStyle = "rgb(" + this.array[i].getColorForRender() + ")"
                ctx.fillRect(x, y, w, h)
                if (this.borderEnabled && containerWidth / this.mainArray.length > 5) {
                    ctx.strokeStyle = "rgb(0, 0, 0)"
                    ctx.lineWidth = 1
                    ctx.strokeRect(x, y, w, h)
                } else {
                    ctx.strokeStyle = "rgb(" + this.array[i].getColorForRender() + ")"
                    ctx.lineWidth = 1
                    ctx.strokeRect(x, y, w, h)
                }

            }
        }
        // }else if(this.visualStyle === "dots"){
        //
        // }



        // let tmp = []
        // //removed flex-box for optimization
        // if (this.visualStyle === "bars") {
        //     let border = this.borderEnabled ? {} : {border: "none"}
        //     let offset = 2
        //     if(document.documentElement.containerWidth / this.mainArray.length < 5){
        //         border = {border: "none"}
        //         offset = 0
        //     }
        //     let width = {
        //         width: document.documentElement.containerWidth/this.mainArray.length - offset + "px"
        //     }
        //     for (let i = 0; i < this.arrayLen; ++i) {
        //         let styleSheet = {
        //             height: this.array[i].getValue() / (this.mainArray.length-1) * 100 + "%",
        //             backgroundColor: "rgb(" + this.array[i].getColorForRender() + ")",
        //             ...border,
        //             ...width
        //         }
        //         tmp.push(<div key={i} style={styleSheet} className={styles.bar}/>);
        //     }
        //     let styleSheet = {
        //         height: "0%",
        //         backgroundColor: "rgb(255,255,255)",
        //         ...border
        //     }
        //     for (let i = this.arrayLen; i < this.mainArray.length; ++i) {
        //         tmp.push(<div key={i} style={styleSheet} className={styles.bar}/>);
        //     }
        // } else if (this.visualStyle === "dots") {
        //     let width = {
        //         width: document.documentElement.containerWidth/this.mainArray.length + "px"
        //     }
        //     for (let i = 0; i < this.arrayLen; ++i) {
        //         let value = this.array[i].getValue()
        //         let height = (value === -1) ? {height: 0} : {}
        //         let styleSheet = {
        //             bottom: "calc(" + value / this.mainArray.length * 100 + "% - 0.25rem)",
        //             backgroundColor: "rgb(" + this.array[i].getColorForRender() + ")",
        //             ...height
        //         }
        //         tmp.push(<div style={width} className={styles.dotContainer}>
        //             <div key={i} style={styleSheet} className={styles.dot}/>
        //         </div>);
        //     }
        //     let styleSheet = {
        //         bottom: 0,
        //         backgroundColor: "rgb(0, 0, 0)",
        //     }
        //     for (let i = this.arrayLen; i < this.mainArray.length; ++i) {
        //         tmp.push(<div className={styles.dotContainer}>
        //             <div key={i} style={styleSheet} className={styles.dot}/>
        //         </div>);
        //     }
        // }
        // //workaround
        // let workAroundStyle = {
        //     width: 0,
        //     height: 100+"%",
        //     backgroundColor: "black"
        // }
        // tmp.push(<div key={this.mainArray.length+1} style={workAroundStyle} className={styles.bar}/>);
        //
        // return tmp
    }

    render() {
            return <div style={this.sizeStyle}>
                <div className={styles.arrayContainer}>
                    <canvas className={styles.canvas}/>
                </div>
            </div>
    }
}