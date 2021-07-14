const types = {

}

const colors = {

}

export class Element{

    value;
    type;
    color;
    markColor;

    // constructor(args){
    //     this.value = args.value;
    //     this.type = args.type;
    //     this.color = args.color || colors[args.type];
    // }

    constructor(value, type, color, markColor) {
        this.value = value;
        this.type = type;
        this.color = color;
        this.markColor = markColor;
    }


    getValue(){
        return this.value;
    }
    setValue(value){
        this.value = value;
    }

    getColor(){
        return this.color;
    }

    setColor(color){
        this.color = color;
    }

    getMarkColor(){
        return this.markColor;
    }
    setMarkColor(markColor){
        this.markColor = markColor;
    }

    getColorForRender(){
        if(this.type === "Default"){
            return this.markColor
        }else{
            return this.color
        }
    }

    getType(){
        return this.type;
    }
    setType(type){
        this.type = type;
    }

    copy(unMark = true){
        if(unMark){
            return new Element(this.value, "Unmarked", this.color, [0,0,0])
        }else{
            return new Element(this.value, this.type, this.color, this.markColor)
        }
    }

    toString(){
        return this.value.toString()
    }
}