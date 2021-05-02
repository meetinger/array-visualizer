import React from 'react';
import {ArrayManager} from "../ArrayManager/ArrayManager";
import {linear} from "../utils/initFunctions"
import {randomInt} from "../utils/utils";
import styles from './ArrayVisualizer.module.scss'
export class ArrayVisualizer extends React.Component{
    arrayManager;

    constructor(props) {
        super(props);
        console.log("ID Visualizer:"+randomInt(0, 100))
        this.state = {}
        this.arrayManager = new ArrayManager(this)
        this.arrayManager.initArray(linear, 64)

        // this.arrayManager.shuffleArray();
    }

    componentWillReceiveProps(nextProps)
    {
        this.setState({
            array: nextProps.array
        });
    }

    render() {
        let arr = [];

        for(let i = 0; i < this.state.array.length;++i){
            let style = {

                height: this.state.array[i].getValue()/this.state.array.length*100+"%"
                // height: this.state.array[i].getValue()+"rem"
            }
            arr.push(<div key={i} style={style} className={styles.bar}/>);
        }
        // let str = JSON.stringify(arr)
        // console.log(arr)
        // console.log(styles)

        return(
            <div className={styles.arrayContainer}>
                {arr}
            </div>
        )
    }
}