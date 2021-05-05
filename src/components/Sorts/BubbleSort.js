export function BubbleSort(arrayVisualizer) {
    let len = arrayVisualizer.state.array.length

    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len - i - 1; j++) {
            if (arrayVisualizer.compare(j, j + 1)) {
                arrayVisualizer.swap(j, j + 1)
            }
        }
    }
}