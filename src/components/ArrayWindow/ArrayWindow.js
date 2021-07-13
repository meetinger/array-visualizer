import React from 'react';
import styles from "./ArrayWindow.module.scss";

export function ArrayWindow(props){
    let array = props.array
    let mainArray = props.mainArray
    let height = props.height
    let borderEnabled = props.enableBarsStroke
    // let style = props.style
    // console.log(array)
    let arr = []

    // let border = borderEnabled ? {} : {border: "none"}

    if(borderEnabled) {
        for (let i = 0; i < array.length; ++i) {
            let styleSheet = {
                height: array[i].getValue() / mainArray.length * 100 + "%",
                backgroundColor: "rgb(" + array[i].getColor() + ")",
            }
            arr.push(<div key={i} style={styleSheet} className={styles.bar}/>);
        }
    }else{
        for (let i = 0; i < array.length; ++i) {
            let styleSheet = {
                height: array[i].getValue() / mainArray.length * 100 + "%",
                backgroundColor: "rgb(" + array[i].getColor() + ")",
                border: "none"
            }
            arr.push(<div key={i} style={styleSheet} className={styles.bar}/>);
        }
    }
    for(let i = array.length;i < mainArray.length;++i){
        let styleSheet = {
            height: "0%",
            backgroundColor: "rgb(255,255,255)",
        }
        arr.push(<div key={i} style={styleSheet} className={styles.bar}/>);
    }
    if(array.length===0){
        return <div/>
    }
    return (
        <div style={{width: "100%", height: height+"%"}}>
            <div className={styles.arrayContainer}>
                {arr}
            </div>
        </div>
    )
}
