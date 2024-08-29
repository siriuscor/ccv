const fs = require('fs-extra');
const child_process = require('child_process');
const DB_PATH = './library.json';
const p = require('path');

class Librarian {
    constructor(base) {
        this.base = base;
    }

    async init() {
        if (!await fs.exists(DB_PATH)) { // init librarian json
            await fs.writeFile(DB_PATH, '{}');
        }
        this.db = require(DB_PATH);
        await this.scanManga();
    }

    async findManga(url) {
        for(let title in this.db) {
            let manga = this.db[title];
            if (manga.url === url) {
                return manga;
            }
        }
        return false; // TODO:implement
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
    async addManga(title, manga) {
        this.db[title] = manga;
        manga.path = p.resolve(this.base, title);
        manga.skip = [];
        delete manga.chapters;
        await this.saveDB();
        return manga;
    }

    async saveDB() {
        await fs.writeFile(DB_PATH, JSON.stringify(this.db, null, 2));
    }
    async saveSkipChapters(manga, chapters) {
        let set = new Set(chapters, ...manga.skip);
        manga.skip = Array.from(set);
        await this.saveDB();
    }
}

class Manga {
    constructor(mangaInfo) {
    }
}

module.exports = {Librarian, Manga};
