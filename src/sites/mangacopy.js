if(typeof __mantaku == 'undefined') var __mantaku = {};
__mantaku = Object.assign(__mantaku, {
    id: 'mangacopy',
    name: '拷贝漫画',
    home: 'https://www.mangacopy.com',
    canHandle: function canHandle(url) {
        return (url.match('www.mangacopy.com'));
    },
    searchUrl : function searchUrl(query) {
        return `https://www.mangacopy.com/search?q=${query}&q_type=`;
    },
    mangaInfo: async function mangaInfo() {
        await __mantaku.waitUntil(function() {
            return document.querySelector('.wargin') == null;
        });
        return {
            title: document.querySelector('.comicParticulars-title-right h6').innerText,
            alias: '',
            author: document.querySelector('.comicParticulars-title-right li:nth-child(3) .comicParticulars-right-txt').innerText,
            intro: document.querySelector('.intro').innerText,
            cover: document.querySelector('.comicParticulars-left-img img').src,
            status: document.querySelector('.comicParticulars-title-right li:nth-child(6) .comicParticulars-right-txt').innerText,
            chapters: Array.from(document.querySelectorAll('.tab-pane.show ul:not(.page-all) a')).map(a => {
                return { url: a.href, title: a.title};
            })
        };
    },
    search: async function search() {
        let list = document.querySelectorAll('.exemptComic_Item');
        return Array.from(list).map(li => {
            return {
                title: li.querySelector('.exemptComicItem-txt p').innerText,
                url: li.querySelector('.exemptComic_Item a').href,
                intro: '',
                author: li.querySelector('.exemptComicItem-txt-span').innerText
            };
        });
    },
    totalPage: async function totalPage() {
        document.querySelector('.upMember').scrollIntoView({behavior: "smooth"});
        await __mantaku.wait(2000);
        return parseInt(document.querySelector('.comicCount').innerText);
    },
    nextPage: async function nextPage(index) {
        // if (index % 5 == 0)
        // document.querySelector('.upMember').scrollIntoView({behavior: "smooth"});
        window.clientY = window.innerHeight;
        window.onscroll(); // fake scroll
        let dom = document.querySelector('.comicContent-list li:nth-child('+(index+1)+')');
        if (dom) dom.scrollIntoView({behavior: "smooth"});
        return await __mantaku.randomPause();
    },
    getImage: async function getImage(index) {
        let dom = '.comicContent-list li:nth-child('+index+') img';
        await __mantaku.waitUntil(function() {
            return document.querySelector(dom) != null;
        });
        lazySizes.loader.unveil(document.querySelector(dom));
        await __mantaku.waitForClass(dom, 'lazyloaded');
        return document.querySelector(dom).src;
    }
});

if (typeof module !== 'undefined') module.exports = __mantaku; // for server use
