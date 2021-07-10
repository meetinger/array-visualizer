import React from 'react';
import styles from "./ArrayWindow.module.scss";

export function ArrayWindow(props){
    let array = props.array
    // let style = props.style
    // console.log(array)
    let arr = []

    for (let i = 0; i < array.length; ++i) {
        let styleSheet = {
            height: array[i].getValue() / array.length * 100 + "%",
            backgroundColor: "rgb(" + array[i].getColor() + ")"
        }
        arr.push(<div key={i} style={styleSheet} className={styles.bar}/>);
    }
    if(array.length===0){
        return <div/>
    }
    return (
        <div style={{width: "100%"}}>
            <div className={styles.arrayContainer}>
                {arr}
            </div>
        </div>
    )
}
