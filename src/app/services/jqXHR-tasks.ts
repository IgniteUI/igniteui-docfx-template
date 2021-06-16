/**
 * A singleton, whose purpose is to store all requests and if necessary to abort them.
 * The need for this service is that after a navigation occurs and there are requests, which are not finished
 * there could be unpredicted behavior after these requests are done, 
 * because the handlers for these requestes will be executed in the context of the new page and not the one from which they are invoked
 */
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