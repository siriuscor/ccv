class DownloadTask {

}

class TaskManager {
    constructor() {
        this.tasks = [];
    }

    list() { // formated infomation
        return this.tasks;
    }

    addTask(task) {
        this.tasks.push(task);
    }

    cancelTask(task) {
        // this.tasks = this.tasks.filter(t => t !== task);
    }

    start(index) {
        // this.tasks[index].start();
    }
    stop(index) {
        // this.tasks[index].stop();
    }
    

}