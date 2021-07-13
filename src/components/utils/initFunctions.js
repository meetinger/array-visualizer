export let initFunctions = {
    linear: function (x, length) {
        return x;
    },
    reverse: function (x, length) {
        return length - x;
    },
    pipeOrgan: function (x, length) {
        if (x < length / 2) {
            return 2 * x;
        } else {
            return 2 * (length - x) - 1;
        }
    },
    inversedPipeOrgan: function (x, length){
        if (x < length / 2) {
            return (length - 2*x) - 1;
        } else {
            return x*2-length;
        }
    },
    manySimular: function (x, length){
        let divider = Math.trunc(length/10)
        return Math.trunc(x/divider)*divider
    }
}