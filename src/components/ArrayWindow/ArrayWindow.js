import React from 'react';
import styles from "./ArrayWindow.module.scss";

export function ArrayWindow(props){
    let array = props.array
    // let style = props.style

    let arr = []

    for (let i = 0; i < array.length; ++i) {
        let styleSheet = {
            height: array[i].getValue() / array.length * 100 + "%",
            backgroundColor: "rgb(" + array[i].getColor() + ")"
        }
        arr.push(<div key={i} style={styleSheet} className={styles.bar}/>);
    }
    return (
        <div style={{width: "100%"}}>
            <div className={styles.arrayContainer}>
                {arr}
            </div>
        </div>
    )
}