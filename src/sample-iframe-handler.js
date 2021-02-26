var onSampleIframeContentLoaded = function (iframe) {
    iframe.parentElement.classList.remove("loading");
    if (!$(iframe).hasClass("no-theming")) {

        var isIE = !(window.ActiveXObject) && "ActiveXObject" in window;
        var theme = window.sessionStorage.getItem(isIE ? "theme" : "themeStyle");
        var targetOrigin = document.body.getAttribute("data-demos-base-url");
        var data = { origin: window.location.origin };
        if (isIE) {
            data.theme = theme;
        } else {
            data.themeStyle = theme;
        }
        var themingWidget = $('igniteui-theming-widget');
        if (themingWidget.length > 0) {
            data.themeName = themingWidget[0].theme.globalTheme;
            iframe.contentWindow.postMessage(data, targetOrigin);
        }
    }

}

var onXPlatSampleIframeContentLoaded = function (iframe) {
    iframe.parentElement.classList.remove("loading");
}