var __mantaku = {};
__mantaku.waitFor = function waitFor(dom, visible) {
    return new Promise(resolve => {
        let el = document.querySelector(dom);
        if (!el) return reject('dom not found');
        let interval = setInterval(() => {
            el = document.querySelector(dom);
            if (!el) return;
            let hidden = getComputedStyle(el).display == 'none';
            // console.log('test div hidden', dom, getComputedStyle(el).display);
            if (visible ? !hidden : hidden) {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
};
__mantaku.randomPause = function randomPause() {
    return new Promise(resolve => {
        setTimeout(resolve, Math.random() * 100);
    });
};
__mantaku.wait = function(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
};
__mantaku.findNextPageA = function findNextPageA() {
    let list = document.querySelectorAll('a');
    for(let i of list) {
        if (i.innerText.match('下一页') || i.innerText.match('下一頁')) return i;
    }
    return null;
}