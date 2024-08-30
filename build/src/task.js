const {ChapterDownloader} = require('./mantaku');
const {EventEmitter} = require('events');
class DownloadTask extends ChapterDownloader{
    constructor(url, title, path) {
        super();
        this.url = url;
        this.path = path;
        this.title = title;
        this.status = 'pending';
        // this.downloader = new ChapterDownloader();
    }

    async start(page) {
        this.status = 'downloading';
        try {
            await this.download(page, this.url, this.title, this.path);
        }catch(e) {
            this.emit('error', e);
            this.stop();
        }
    }
    pause() {
        this.status = 'paused';
    }
    stop() {
        this.status = 'stopped';
    }
    cancel() {
        this.status = 'canceled';
    }
}

class TaskManager extends EventEmitter {
    constructor(opts) {
        super();
        this.tasks = [];
        this.concurrency = opts.concurrency || 2;
        this.pages = opts.pages;
        this.path = opts.path;
        if (this.pages.length < this.concurrency) {
            this.concurrency = this.pages.length;
            console.error('concurrency is larger than page size, set to', this.concurrency);
        }
    }

    list() { // formated infomation
        return this.tasks;
    }

    addChapter(chapters) {
        for(let chapter of chapters) {
            let task = new DownloadTask(chapter.url, chapter.title, this.path);
            this.addTask(task);
        }
    }

    addTask(task) {
        this.tasks.push(task);
    }

    cancelTask(task) {
        // this.tasks = this.tasks.filter(t => t !== task);
    }

    start() {
        if (this.tasks.length <=0) return;
        let con = this.concurrency;
        if (this.tasks.length < con) con = this.tasks.length;
        let worker = new Array(con).fill(0);
        let index = 0;
        worker.map(async (_, i) => {
            this.emit('worker_start', i);
            while(index < this.tasks.length) {
                let task = this.tasks[index++];
                try {
                    task.on('progress', (current, total) => {
                        this.emit('worker_progress', i, task, current, total);
                    });
                    this.emit('worker_progress', i, task, 0, 100);
                    await task.start(this.pages[i]);
                }catch(e) {
                    console.error(`Worker ${i} on ${task.title} Failed, `, e.toString());
                }
            }
            this.emit('worker_done', i);
        });
    }
    // stop(index) {
    // }
}

module.exports = {DownloadTask, TaskManager};