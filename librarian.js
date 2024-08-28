const fs = require('fs-extra');
const child_process = require('child_process');
// const json5 = require('json5');
// require('json5/lib/register')
// const setting = require('./setting.json5');

class Librarian {
    constructor(base) {
        this.base = base;
    }
    async findManga(url) {
        return true; // TODO:implement
    }
    async scanManga() {
        let folder = this.base;
        let files = await fs.readdir(folder);
        let books = [];
        for (let file of files) {
            let stat = await fs.stat(file);
            if (stat.isDirectory()) {
                let book = new Manga();
                book.name = file;
                let chapters = await fs.readdir(file);
                for (let chapter of chapters) {
                    let images = await fs.readdir(chapter);
                    book.chapters.push(images);
                }
                books.push(book);
            }
        }
        return books;
    }
}

class Manga {
    constructor(path, mangaInfo) {
    }
}

module.exports = {Librarian, Manga};
