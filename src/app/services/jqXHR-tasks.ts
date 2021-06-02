export class XHRService {
    private static instance: XHRService;
    public static getInstance(): XHRService {
        if(!XHRService.instance) {
            XHRService.instance = new XHRService();
        }
        return this.instance;
    }

    private taskQueue: JQuery.jqXHR[] = [];

    // Empties the taskqueue
    public abortTasks(): void {
        this.taskQueue.forEach(t => {
            t.abort();
        });

        this.taskQueue.splice(0, this.taskQueue.length);
    }

    public pushTask(asyncTask: JQuery.jqXHR): void {
        this.taskQueue.push(asyncTask);
    }

    public isEmpty(){
        return this.taskQueue.length === 0;
    }
}