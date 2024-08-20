var __mantaku = {};
__mantaku.waitFor = function waitFor(dom, visible) {
    return new Promise(resolve => {
        let el = document.querySelector(dom);
        if (!el) return reject('dom not found');
        let interval = setInterval(() => {
            let hidden = getComputedStyle(el).display == 'none';
            console.log('test div hidden', dom, hidden);
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
}