__mantaku = Object.assign(__mantaku, {
    mangaInfo: function mangaInfo() {
        return {
            title: document.querySelector('.detail-info-title').innerText,
            author: document.querySelector('.detail-info-tip span a').innerText,
            description: document.querySelector('.detail-info-content').innerText,
            cover: document.querySelector('img.detail-info-cover').src,
            status: document.querySelector('.detail-info-tip span:nth-child(2) span').innerText,
            chapters: Array.from(document.querySelectorAll('#chapterlistload a')).map(a => {
                return { url: a.href, name: a.innerText.replace(/ *（.+）/g, '') };
            }).reverse()
        };
    },
    searchInfo: async function() {

    },
    chapterInfo: function chapterInfo() {
        return {

        }
    },
    totalPage: function totalPage() {
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
