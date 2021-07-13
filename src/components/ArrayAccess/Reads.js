export class Reads{
    arrayVisualizer;
    Sounds
    constructor(arrayVisualizer){
        this.arrayVisualizer = arrayVisualizer
        this.Sounds = arrayVisualizer.getSounds()
    }
    read(index, arr = this.arrayVisualizer.getPseudoArray()) {
        return arr[index].getValue()
    }

    compare(a, b, sign = "<", arr = this.arrayVisualizer.getPseudoArray()) {
        if (sign === "<") {
            return arr[a].getValue() < arr[b].getValue()
        } else if (sign === "<=") {
            return arr[a].getValue() <= arr[b].getValue()
        } else if (sign === ">") {
            return arr[a].getValue() > arr[b].getValue()
        } else if (sign === ">=") {
            return arr[a].getValue() >= arr[b].getValue()
        } else {
            return arr[a].getValue() === arr[b].getValue()
        }
    }

    auxRead(index, arrIndex, isPseudo = true){
        if(isPseudo){
            return this.arrayVisualizer.getPseudoAuxArrays()[arrIndex][index].getValue()
        }else {
            return this.arrayVisualizer.getAuxArrays()[arrIndex][index].getValue()
        }
    }

}