export class Sort {
    arrayVisualizer;
    array;
    pseudoArray;

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

    constructor(arrayVisualizer) {
        // super(arrayVisualizer)
        this.arrayVisualizer = arrayVisualizer
        this.pseudoArray = this.arrayVisualizer.getPseudoArray()
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
    }

    getSortName(){
        return this.sortName
    }

    runSort(low, high, bucketsNum){
    }
}