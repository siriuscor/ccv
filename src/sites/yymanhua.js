if(typeof __mantaku == 'undefined') var __mantaku = {};
__mantaku = Object.assign(__mantaku, {
    id: 'yymanhua',
    name: 'YY漫画',
    home: 'https://www.yymanhua.com/',
    canHandle: function canHandle(url) {
        return (url.match('www.yymanhua.com'));
    },
    searchUrl : function searchUrl(query) {
        return `https://www.yymanhua.com/search?title=${query}`;
    },
    search: async function search() {
        let list = document.querySelectorAll('.mh-item');
        return Array.from(list).map(i => {
            return {
                title: i.querySelector('.title').innerText,
                url: i.querySelector('a').href,
                intro: '',
                author: '',
            };
        });
    },
    mangaInfo: async function mangaInfo() {
        return {
            title: document.querySelector('.detail-info .detail-info-title').innerText,
            author: document.querySelector('.detail-info .detail-info-tip span').innerText,
            intro: document.querySelector('.detail-info-content').innerText,
            cover: document.querySelector('.detail-info img:nth-child(2)').src,
            status: document.querySelector('.detail-info .detail-info-tip span:nth-child(2)').innerText,
            chapters: Array.from(document.querySelectorAll('.detail-list-form-item')).map(a => {
                return { url: a.href, title: a.innerText.replace(/ *（.+）/g, '').trim()};
            })
        };
    },
    totalPage: async function totalPage() {
        let pages = document.querySelectorAll('.reader-bottom-page-list a');
        return pages.length;
    },
    nextPage: async function nextPage() {
        ShowNext();
        await __mantaku.waitFor('#imgloading', false);
    },
    getImage: async function getImage() {
        await __mantaku.waitFor('#imgloading', false);
        return document.querySelector('#cp_image').src;
    }
});

if (typeof module !== 'undefined') module.exports = __mantaku; // for server use
