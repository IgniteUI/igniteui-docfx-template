export class XHRCallbackService {
    private static instance: XHRCallbackService;
    public static getInstance(): XHRCallbackService {
        if(!XHRCallbackService.instance) {
            XHRCallbackService.instance = new XHRCallbackService();
        }
        return this.instance;
    }

    public taskQueue: JQuery.jqXHR[] = [];
}