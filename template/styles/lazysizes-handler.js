document.addEventListener('lazyloaded', function(e){
    $(e.target).parent().removeClass("loading");
    if (!window.igViewer.common.isDvPage() && !$(e.target).hasClass("no-theming")) {
        var theme = window.localStorage.getItem("theme");
        var targetOrigin = document.body.getAttribute("data-demos-base-url");
        var data = {theme: theme, origin: window.location.origin};
        e.target.contentWindow.postMessage(data, targetOrigin);
    }
});