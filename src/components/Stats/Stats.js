import React from 'react';
import styles from "./Stats.module.scss";

export function Stats(props){
    return(
        <div className={styles.statsContainer}>
            <div><b>Sort: {props.sortName}</b></div>
            <div>Length: {props.arrLength}</div>
            {/*<div>Comparisons: {props.comparisons}</div>*/}
            <div>Writes: {props.writes}</div>
        </div>
    )
}