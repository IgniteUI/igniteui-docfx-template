(function($){
    $.widget("custom.codeView", {
        _create: function(){ 
            var self = this;
            var $iframe  = $(this.element.find('iframe')),
                $codeView = $("<div>", { 
                    id: "cv-" + $iframe.attr('id'),
                    class: "code-view"
                }),
                $navbar = $("<div>", {class:"code-view-navbar"}),
                $fullscreenButton = $("<span class='fs-button-container' title='Expand to fullscreen'><i class='material-icons code-view-fullscreen'>open_in_full</i></span>");
                ["example", "modules", "ts", "html", "css"].forEach(function(tab, i){
                    var $tab = $("<div>", {
                        class: "code-view-tab",
                        text: tab.toUpperCase(),
                    });
                    $tab.on('click', self._codeViewTabClick)
                    $navbar.append($tab);
                })
                $fullscreenButton.appendTo($navbar);
                this.element.wrap($codeView);
                $codeView = this.element.parent();
                var $lVButtons = $("button[data-iframe-id=" + $iframe.attr("id") + "]");
                var $footer = $("<div>", {class: "code-view-footer"});
                $($codeView).append($footer);
                $('<div class="editing-buttons-container"></div>').
                append('<span class="editing-label">Edit in: </span>').
                append($lVButtons).
                appendTo($footer);
                $codeView.prepend($navbar);
                $lVButtons.css('visibility', 'visible');
                $lVButtons.text(function (i, text) {
                    return text.toLowerCase().indexOf("stackblitz") !== -1 ? "StackBlitz" : "Codesandbox"
                } );
        },
        _codeViewTabClick: function(event) {
            var $tab = $(this); 
            if(!$tab.hasClass("code-view-tab--active")){
                $(".code-view-tab--active").switchClass("code-view-tab--active", "code-view-tab",  0);
                $tab.switchClass("code-view-tab", "code-view-tab--active", 0);
            }

        }
    });
}(jQuery));