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
        this.db = JSON.parse(await fs.readFile(DB_PATH));
    }

    async getAllManga() {
        return this.db;
    }

    async findManga(url) {
        for(let title in this.db) {
            let manga = this.db[title];
            if (manga.url === url) {
                manga.downloaded = await this.scanDownloaded(title);
                return manga;
            }
        }
        return false;
    }
    async scanDownloaded(title) {
        let folder = p.resolve(this.base, title);
        let files = await fs.readdir(folder);
        let notDirs = [];
        for (let file of files) {
            let stat = await fs.stat(p.resolve(folder, file));
            if (!stat.isDirectory()) {
                notDirs.push(file);
            }
        }
        return notDirs.map(f => p.parse(f).name);
    }

    async addManga(title, manga) {
        let copy = Object.assign({}, manga);
        delete copy.chapters;
        this.db[title] = copy;
        // manga.path = p.resolve(this.base, title);
        // manga.skip = [];
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
