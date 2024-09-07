if(typeof __mantaku == 'undefined') var __mantaku = {};
__mantaku = Object.assign(__mantaku, {
    id: 'dm5',
    name: 'dm5漫画人',
    home: 'https://www.dm5.com/',
    canHandle: function canHandle(url) {
        return (url.match('dm5.com') || url.match('www.dm5.com') || url.match('m.dm5.com'));
    },
    searchUrl : function searchUrl(query) {
        return `https://www.dm5.com/search.ashx?d=${Date.now()}&t=${query}&language=1`;
    },
    search: async function search() {
        let list = document.querySelectorAll('a');
        return Array.from(list).map(i => {
            return {
                title: i.querySelector('span.left').innerText,
                url: i.href,
                intro: i.querySelector('span:nth-child(2)').innerText,
                author: '',
            };
        });
    },
    mangaInfo: async function mangaInfo() {
        return {
            title: document.querySelector('.banner_detail_form .title').childNodes[0].textContent.trim(),
            author: document.querySelector('.banner_detail_form .subtitle').innerText,
            intro: document.querySelector('.banner_detail_form .content').innerText,
            cover: document.querySelector('.banner_detail_form .cover img').src,
            status: document.querySelector('.banner_detail_form .tip .block').innerText,
            chapters: Array.from(document.querySelectorAll('.detail-list-select a')).map(a => {
                return { url: a.href, title: a.innerText.replace(/ *（.+）/g, '').trim()};
            })
        };
    },
    totalPage: async function totalPage() {
        let pages = document.querySelectorAll('#chapterpager a');
        return pages[pages.length - 1].innerText;
    },
    nextPage: async function nextPage() {
        __mantaku.findNextPageA().click();
        await __mantaku.waitFor('#imgloading', false);
    },
    getImage: async function getImage() {
        await __mantaku.waitFor('#imgloading', false);
        return document.querySelector('#cp_image').src;
    }
});

if (typeof module !== 'undefined') module.exports = __mantaku; // for server use
