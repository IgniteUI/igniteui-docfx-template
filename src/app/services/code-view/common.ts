import { AngularCodeService, CodeService, XplatCodeService } from ".";
import { XHRService } from '../jqXHR-tasks';


export function createCodeService(): CodeService | undefined {
    let $platformMeta: JQuery<HTMLElement>, platform: string, codeService: CodeService | undefined;

    $platformMeta = $("meta[property='docfx:platform']");
    if (!$platformMeta) {
        return undefined;
    }

    platform = $platformMeta.attr("content")!;

    if (platform === 'react' || platform === 'web-components') {
        let main = $('#main');
        main.css('padding-top', '124px');
    }

    if (platform === "angular") {
        codeService = new AngularCodeService(XHRService.getInstance());
    } else {
        codeService = new XplatCodeService(platform, XHRService.getInstance());
    }

    return codeService;
}