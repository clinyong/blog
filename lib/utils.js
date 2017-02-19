function fillZero(num) {
    return num > 10 ? '' + num : '0' + num;
}

exports.formatTime = t => {
    const month = fillZero(t.getMonth()+1);
    const date = fillZero(t.getDate());

    return `${t.getFullYear()}.${month}.${date}`;
};
