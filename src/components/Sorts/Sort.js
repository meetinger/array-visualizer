export class Sort {
    arrayVisualizer;

    Reads
    Writes

    arrLength;

    sortName;
    warnLen;
    isDisabled;
    isNeedBucketsNum;
    isNeedBuffer;




    constructor(arrayVisualizer) {
        this.arrayVisualizer = arrayVisualizer
        this.state = this.arrayVisualizer.getState()

        this.Reads = this.arrayVisualizer.getReads()
        this.Writes = this.arrayVisualizer.getWrites()

        
        this.arrLength = this.arrayVisualizer.getArrLength();
        this.sortName = ""
        this.warnLen = -1;
        this.isDisabled = false;
        this.isNeedBucketsNum = false;
    }

    getSortName(){
        return this.sortName
    }

    getWarnLen(){
        return this.warnLen
    }

    runSort(low, high, bucketsNum, bufferSize){
    }
}