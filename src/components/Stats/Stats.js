import React from 'react';
import styles from "./Stats.module.scss";

export function Stats(props){
    return(
        <div className={styles.statsContainer}>
            <div>Sort: {props.sortName}</div>
            <div>Comparisons: {props.comparisons}</div>
            <div>Writes: {props.writes}</div>
        </div>
    )
}