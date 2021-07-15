import React from 'react';
import styles from "./ArrayWindow.module.scss";
import {objLength} from "../utils/utils";

export function ArrayWindow(props) {
    let array = props.array
    let mainArray = props.mainArray
    let height = props.height
    let visualProps = props.visualProps
    let borderEnabled = visualProps.barsStroke
    let visualStyle = visualProps.style
    // console.log(array)
    let arr = []

    let len = objLength(array)

    const sizeStyle = {width: "100%", height: height + "%"};

    if (len === 0) {
        return <div style={sizeStyle}/>
    }

    if (visualStyle === "bars") {
        let border = borderEnabled ? {} : {border: "none"}
        for (let i = 0; i < len; ++i) {
            let styleSheet = {
                height: array[i].getValue() / mainArray.length * 100 + "%",
                backgroundColor: "rgb(" + array[i].getColorForRender() + ")",
                ...border
            }
            arr.push(<div key={i} style={styleSheet} className={styles.bar}/>);
        }
        let styleSheet = {
            height: "0%",
            backgroundColor: "rgb(255,255,255)",
        }
        for (let i = len; i < mainArray.length; ++i) {
            arr.push(<div key={i} style={styleSheet} className={styles.bar}/>);
        }
    } else if (visualStyle === "dots") {
        for (let i = 0; i < len; ++i) {
            let value = array[i].getValue()
            let height = (value===-1) ? {height: 0} : {}
            let styleSheet = {
                bottom: "calc(" + value / mainArray.length * 100 + "% - 0.25rem)",
                backgroundColor: "rgb(" + array[i].getColorForRender() + ")",
                ...height
            }
            arr.push(<div className={styles.dotContainer}>
                <div key={i} style={styleSheet} className={styles.dot}/>
            </div>);
        }
        let styleSheet = {
            bottom: 0,
            backgroundColor: "rgb(0, 0, 0)",
        }
        for (let i = len; i < mainArray.length; ++i) {
            arr.push(<div className={styles.dotContainer}>
                <div key={i} style={styleSheet} className={styles.dot}/>
            </div>);
        }
    }
    return (
        <div style={sizeStyle}>
            <div className={styles.arrayContainer}>
                {arr}
            </div>
        </div>
    )
}

