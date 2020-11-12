(function($){
    $.widget("custom.codeView", {
        _this:this,
        options: {
            files: null,
            iframeId: null
        },
        _create: function(){ 
            var self = this;
            var $iframe  = $(this.element.find('iframe')),
            $codeView = $("<div>", { 
                    id: "cv-" + $iframe.attr('id'),
                    class: "code-view"
                }),
                $navbar = $("<div>", {class:"code-view-navbar"}),
                $fullscreenButton = $("<span class='fs-button-container' title='Expand to fullscreen'><i class='material-icons code-view-fullscreen'>open_in_full</i></span>");
                $fullscreenButton.on('click', function () { window.open($iframe.attr("src") || $iframe.attr("data-src"))});
                var $footer = $("<div>", {class: "code-view-footer"});
                this._setOption('iframeId', $iframe.attr('id'));
                
                this.element.attr('id','code-view-' + this.options.iframeId + '-' + 'example-tab-content');
                this.element.addClass('code-view-tab-content');

                this.element.wrap($codeView);
                $codeView = this.element.parent();

                ["example", "modules", "ts", "html", "scss"].forEach(function(tab, i){
                    var $tab = $("<div>", {
                        class: i === 0 ? "code-view-tab--active" : 'code-view-tab',
                        text: tab.toUpperCase(),
                    });

                    $tab.attr("tab-content-id", 'code-view-' + self.options.iframeId + '-' + tab +'-tab-content');
                    $tab.on('click',$.proxy(self._codeViewTabClick, self))
                    $navbar.append($tab);

                    if(i > 0){
                        var $tabContent = $("<div>", {
                            id: 'code-view-' + self.options.iframeId + '-' + tab +'-tab-content',
                            class: 'code-view-tab-content'
                        }).css('display', 'none');
                        $codeView.append($tabContent)
                    }
                });
                $fullscreenButton.appendTo($navbar);

                var $lVButtons = $("button[data-iframe-id=" + $iframe.attr("id") + "]");
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
        _setOption: function( key, value ) {
            this.options[ key ] = value;
        },
        _codeViewTabClick: function(event) {
            var $tab = $(event.target);
            if(!$tab.hasClass("code-view-tab--active")){
                $(".code-view-tab--active").switchClass("code-view-tab--active", "code-view-tab",  0);
                $tab.switchClass("code-view-tab", "code-view-tab--active", 0);
                $('#cv-' + this.options.iframeId + '>.code-view-tab-content').css('display', 'none');
                $('#' + $tab.attr('tab-content-id')).css('display', 'block');
            }

        },
        files: function(files){
            var self = this;
            if(!files){
                return this.options.files;
            }
            this.options.files = files.filter(function (f) {
                return (f.path.indexOf(".component") !== -1 && f.path.indexOf("app.") === -1) || f.path.indexOf('app.module.ts') !== -1;
            });

            this.options.files.forEach(function (f){
                var contentId,
                    ext;
                if(f.path.indexOf('app.module.ts') !== -1){
                    contentId = '#code-view-' + self.options.iframeId + '-' +'modules-tab-content';
                } else {
                    ext = f.path.slice(f.path.lastIndexOf('.') + 1);
                    contentId = '#code-view-' + self.options.iframeId + '-' + ext + '-tab-content';
                }
                $(contentId).html($('<pre>').text(f.content));
            })

        }
    });
}(jQuery));