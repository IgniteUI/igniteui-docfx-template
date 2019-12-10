(function () {
    $(document).ready(function() {
        var themingWidget = document.getElementsByTagName('igniteui-theming-widget')[0];
        if (themingWidget) {
            window.localStorage.setItem('themeStyle', '');
            themingWidget.addEventListener('themeChange', function(event) {
                window.localStorage.setItem('themeStyle', event.detail);
                document.querySelectorAll('iframe').forEach(function (element) {
                    if (!$(element).hasClass("no-theming") && (!$(element).hasClass("lazyload") || $(element).hasClass("lazyloaded"))) {
                        var src = !!element.src ? element.src : element.dataset.src;
                        var data = { themeStyle: event.detail, origin: window.location.origin };
                        element.contentWindow.postMessage(data, src);
                    }
                });
            });
        }
    });
}());