
function getRandomUppercaseChar() {
    return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}

export default (count = 7) => {
    let prefix = new Array(count).fill(null).map(() => getRandomUppercaseChar()).join(""),
        integer = Math.floor((Math.random() * 9999) * 7);
    return prefix + integer;
}