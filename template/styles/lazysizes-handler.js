document.addEventListener('lazyloaded', function(e){
    $(e.target).parent().removeClass("loading");
    if (!window.igViewer.common.isDvPage() && !$(e.target).hasClass("no-theming")) {
        var themeStyle = window.localStorage.getItem("themeStyle");
        var targetOrigin = document.body.getAttribute("data-demos-base-url");
        var data = { themeStyle: themeStyle, origin: window.location.origin };
        e.target.contentWindow.postMessage(data, targetOrigin);
    }
});