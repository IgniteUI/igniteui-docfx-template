(function() {
    function initNavigation() {
        var isLocalhost = Boolean(
            window.location.hostname === 'localhost' ||
            // [::1] is the IPv6 localhost address.
            window.location.hostname === '[::1]' ||
            // 127.0.0.1/8 is considered localhost for IPv4.
            window.location.hostname.match(
                /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
            ));
        if(isLocalhost) {
            window.igViewer.common.footer = $('#footer-container');
            igNavigation.init();
        } else {
            var navBaseUrl = $('body').data('nav-base-url');
            var navUrl = navBaseUrl + '/navigation';
           
            $.ajax({
                url: navUrl,
                type: 'get',
                xhrFields: {
                    withCredentials: false
                }
            }).done(function(data) {
                var nav = $(data);
                var header = nav.find('#header')[0].outerHTML;
                $('#header').replaceWith(header);
   
                var logOutLink = $('#logOutLink');
                if (logOutLink.length !== 0) {
                    // Removing query string. It might contain bad ReturnUrl.
                    var newLink = logOutLink.attr('href').split('?')[0];
                    logOutLink.attr('href', newLink);
                }
   
                var footer = nav.find('footer.ui-footer')[0].outerHTML;
                $('footer.ui-footer').replaceWith(footer);
   
                var copyrightFooter = nav.find('#footer')[0].outerHTML;
                $('#footer').replaceWith(copyrightFooter);
   
                window.igViewer.common.footer = $('#footer-container');
                igNavigation.init();
            }).fail(function(){
               window.igViewer.common.footer = $('#footer-container');
               igNavigation.init();
            });
        }
    }

    initNavigation();

    $(document).ready(function() {
        window.igViewer.common.adjustTopLinkPos();
    });
})();
