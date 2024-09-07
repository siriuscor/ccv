if(typeof __mantaku == 'undefined') var __mantaku = {};
__mantaku = Object.assign(__mantaku, {
    id: 'mangabz',
    name : 'Mangabz(需翻墙)',
    home: 'https://www.mangabz.com',
    canHandle: function canHandle(url) {
        return (url.match('www.mangabz.com') || url.match('www.xmanhua.com'));
    },
    searchUrl : function searchUrl(query) {
        return `https://www.mangabz.com/search?title=${query}`;
    },
    mangaInfo: async function mangaInfo() {
        return {
            title: document.querySelector('.detail-info-title').innerText,
            author: document.querySelector('.detail-info-tip span a').innerText,
            intro: document.querySelector('.detail-info-content').innerText,
            cover: document.querySelector('img.detail-info-cover').src,
            status: document.querySelector('.detail-info-tip span:nth-child(2) span').innerText,
            chapters: Array.from(document.querySelectorAll('#chapterlistload a')).map(a => {
                return { url: a.href, title: a.innerText.replace(/ *（.+）/g, '').trim() };
            }).reverse()
        };
    },
    search: async function() {
        let list = document.querySelectorAll('.mh-item');
        return Array.from(list).map(li => {
            return {
                title: li.querySelector('.title').innerText,
                url: li.querySelector('a').href,
                // intro: li.querySelector('.comic-book-text p').innerText,
            }
        });
    },
    totalPage: async function totalPage() {
        return MANGABZ_IMAGE_COUNT || parseInt(document.querySelector('.bottom-page2').innerText.split('-')[1]);
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
