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

    if (visualStyle === "bars") {
        let border = borderEnabled ? {} : {border: "none"}
        for (let i = 0; i < objLength(array); ++i) {
            let styleSheet = {
                height: array[i].getValue() / mainArray.length * 100 + "%",
                backgroundColor: "rgb(" + array[i].getColorForRender() + ")",
                ...border
            }
            arr.push(<div key={i} style={styleSheet} className={styles.bar}/>);
        }
        for (let i = objLength(array); i < mainArray.length; ++i) {
            let styleSheet = {
                height: "0%",
                backgroundColor: "rgb(255,255,255)",
            }
            arr.push(<div key={i} style={styleSheet} className={styles.bar}/>);
        }
    } else if (visualStyle === "dots") {
        for (let i = 0; i < objLength(array); ++i) {
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
        for (let i = objLength(array); i < mainArray.length; ++i) {
            let styleSheet = {
                bottom: 0,
                backgroundColor: "rgb(0, 0, 0)",
            }
            arr.push(<div className={styles.dotContainer}>
                <div key={i} style={styleSheet} className={styles.dot}/>
            </div>);
        }
    }
    if (objLength(array) === 0) {
        return <div/>
    }
    return (
        <div style={{width: "100%", height: height + "%"}}>
            <div className={styles.arrayContainer}>
                {arr}
            </div>
        </div>
    )
}
