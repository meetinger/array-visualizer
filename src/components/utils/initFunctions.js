export let initFunctions = {
    linear: function linear(x, length) {
        return x;
    },
    reverse: function reverse(x, length) {
        return length - x;
    },
    pipeOrgan: function pipeOrgan(x, length) {
        if (x < length / 2) {
            return 2 * x;
        } else {
            return 2 * (length - x) - 1;
        }
    }
}