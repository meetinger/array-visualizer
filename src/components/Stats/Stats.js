import React from 'react';
import styles from "./Stats.module.scss";

export function Stats(props){
    return(
        <div className={styles.statsContainer}>
            <div><b>Sort: {props.sortName}</b></div>
            <div>Length: {props.arrLength}</div>
            <div>Comparisons: {props.comparisons}</div>
            <div>Writes to main array: {props.mainWrites}</div>
            <div>Writes to auxiliary arrays: {props.auxWrites}</div>
        </div>
    )
}