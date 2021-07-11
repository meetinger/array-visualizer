export class Sort {
    arrayVisualizer;

    compare;
    swap;
    write;
    read;

    createAuxArray
    removeAuxArray

    auxRead
    auxWrite

    arrLength;

    sortName;
    warnLen;
    isDisabled;

    constructor(arrayVisualizer) {
        this.arrayVisualizer = arrayVisualizer
        this.state = this.arrayVisualizer.getState()
        this.compare = this.arrayVisualizer.compare.bind(arrayVisualizer)
        this.swap = this.arrayVisualizer.swap.bind(arrayVisualizer)
        this.read = this.arrayVisualizer.read.bind(arrayVisualizer)
        this.write = this.arrayVisualizer.write.bind(arrayVisualizer)
        this.createAuxArray = this.arrayVisualizer.createAuxArray.bind(arrayVisualizer)
        this.removeAuxArray = this.arrayVisualizer.removeAuxArray.bind(arrayVisualizer)
        this.auxRead = this.arrayVisualizer.auxRead.bind(arrayVisualizer)
        this.auxWrite = this.arrayVisualizer.auxWrite.bind(arrayVisualizer)
        this.arrLength = this.arrayVisualizer.getArrLength();
        this.sortName = ""
        this.warnLen = -1;
        this.isDisabled = false;
    }

    getSortName(){
        return this.sortName
    }

    getWarnLen(){
        return this.warnLen
    }

    runSort(low, high, bucketsNum){
    }
}