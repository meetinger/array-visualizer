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
    canvasRef
    containerRef

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
        this.canvasRef = React.createRef()
        this.containerRef = React.createRef()
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

        let canvas = this.canvasRef.current
        let container = this.containerRef.current

        let containerWidth = container.clientWidth
        let containerHeight = container.clientHeight
        canvas.width = containerWidth
        canvas.height = containerHeight
        let ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, containerWidth, containerHeight);

    }

    cancelAndUpdate(){
        cancelAnimationFrame(this.updateAnimFrame)
        this.updateAnimFrame = requestAnimationFrame(this.renderArray.bind(this))
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
        //workaround for firefox
        if(++this.updateCounter%5===0){
            this.cancelAndUpdate()
            this.updateCounter=1
        }

    }

    renderArray() {
        const rem = parseInt(getComputedStyle(document.documentElement).fontSize)

        let canvas = this.canvasRef.current
        let container = this.containerRef.current

        if(canvas==null){
            return
        }
        let containerWidth = container.clientWidth
        let containerHeight = container.clientHeight
        canvas.width = containerWidth
        canvas.height = containerHeight
        let ctx = canvas.getContext('2d')
        // ctx.clearRect(0, 0, containerWidth, containerHeight);
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
        else if(this.visualStyle === "dots"){
            for (let i = 0; i < this.arrayLen; ++i) {
                let height = this.array[i].getValue() / (this.mainArray.length - 1) * containerHeight

                let x = offset * i
                let y = containerHeight - height
                let w = 0.5*rem
                let h = 0.5*rem

                ctx.fillStyle = "rgb(" + this.array[i].getColorForRender() + ")"
                ctx.fillRect(x, y, w, h)
            }
        }
    }

    render() {
            return <div style={this.sizeStyle}>
                <div ref={this.containerRef} className={styles.arrayContainer}>
                    <canvas ref={this.canvasRef} className={styles.canvas}/>
                </div>
            </div>
    }
}