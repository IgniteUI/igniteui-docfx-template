import util from './utils';

export function initNavigation() {

    if (util.isLocalhost) {
        igNavigation.init();
    } else {
        let navBaseUrl = $('body').data('nav-base-url');
        let navUrl = navBaseUrl + '/navigation';

        $.ajax({
            url: navUrl,
            type: 'get',
            xhrFields: {
                withCredentials: false
            }
        }).done(function (data) {
            let nav = $(data);
            nav.find("#hello-bar").remove();
            let header = nav.find('#header')[0].outerHTML;
            $('#header').replaceWith(header);

            let logOutLink = $('#logOutLink');
            if (logOutLink.length !== 0) {
                // Removing query string. It might contain bad ReturnUrl.
                let newLink = logOutLink.attr('href')!.split('?')[0];
                logOutLink.attr('href', newLink);
            }

            let footer = nav.find('footer.ui-footer')[0].outerHTML;
            $('footer.ui-footer').replaceWith(footer);

            let copyrightFooter = nav.find('#footer')[0].outerHTML;
            $('#footer').replaceWith(copyrightFooter);

            igNavigation.init();
        }).fail(() => {
            igNavigation.init();
        });
    }
}
