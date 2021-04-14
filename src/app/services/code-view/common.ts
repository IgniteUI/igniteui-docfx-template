import { AngularCodeService, CodeService, XplatCodeService } from ".";
import { XHRService } from '../jqXHR-tasks';


export function createCodeService(): CodeService | undefined {
    let $platformMeta: JQuery<HTMLElement>, platform: string, codeService: CodeService | undefined;

    $platformMeta = $("meta[property='docfx:platform']");
    if (!$platformMeta) {
        return undefined;
    }
    platform = $platformMeta.attr("content")!;
    if (platform === "angular") {
        codeService = new AngularCodeService(XHRService.getInstance());
    } else {
        codeService = new XplatCodeService(platform);
    }

    return codeService;
}