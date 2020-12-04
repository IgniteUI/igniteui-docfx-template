(function($){
    $.widget("custom.codeView", {
        options: {
            files: null,
            iframeId: null,
            onLiveEditingButtonClick: null
        },
        css:{
          navbar: "code-view-navbar",
          tab: "code-view-tab",
          viewContainer: "code-views-container",
          tabContent: 'code-view-tab-content',
          footer: "code-view-footer",
        },
        _create: function(){ 
            var self = this, $iframe, $codeView, $navbar, $codeViewsContainer, $footer;

            //Init the main elements
            $iframe  = $(this.element.find('iframe'));
            $codeView = $("<div>", { id: "cv-" + self.options.iframeId, class: "code-view" });
            $navbar = $("<div>", {class: this.css.navbar});
            $codeViewsContainer = $('<div>', {class: this.css.viewContainer});
            $footer = $("<div>", {class: this.css.footer});
            
            //Wrap the sample container with code a views container
            this.element.wrap($codeViewsContainer)
                        .attr('id','code-view-' + self.options.iframeId + '-' + 'example-tab-content')
                        .addClass(this.css.tabContent);
            $codeViewsContainer = $(this.element.parent());

            if(this.options.files && this.options.files.length > 0){
              //Create navbar element with tabs and add code views to the code views container
              this._createTabsWithCodeViews($navbar, $codeViewsContainer);
            }

            //Add initial selected tab for the Example view
            $navbar.prepend($("<div>", {
                class: this.css.tab + "--active",
                text: "EXAMPLE"
            }).attr('tab-content-id', 'code-view-' + self.options.iframeId + '-' + 'example-tab-content'));

            $navbar.children().on('click',$.proxy(self._codeViewTabClick, self));

            
            //Create fullscreen button and add it to the code view navbar
            $fullscreenButton = $("<span class='fs-button-container' title='Expand to fullscreen'><i class='material-icons code-view-fullscreen'>open_in_full</i></span>");
            $fullscreenButton.on('click', function () { window.open($iframe.attr("src") || $iframe.attr("data-src"))});
            $fullscreenButton.appendTo($navbar);

            //Render the code view widget
            $codeViewsContainer.wrap($codeView);
            $codeView = $($codeViewsContainer.parent());
            $codeView.prepend($navbar);

            // Render a footer with CSB and SB buttons (if any !!) 
            this._renderFooter($footer, $codeView);

        },
        _codeViewTabClick: function(event) {
            var $tab = $(event.target);
            if(!$tab.hasClass("." + this.css.tab + "--active")){
                $('#cv-' + this.options.iframeId + " .code-view-tab--active").switchClass(this.css.tab + "--active", this.css.tab,  0);
                $tab.switchClass(this.css.tab, this.css.tab + "--active", 0);
                $tab.is('[tab-content-id=' + 'code-view-' + this.options.iframeId + '-' + 'example-tab-content]') ? $tab.siblings('.fs-button-container').css('visibility', 'visible') :
                                                                                                                    $tab.siblings('.fs-button-container').css('visibility', 'hidden')
                $('#cv-' + this.options.iframeId + ' > .' + this.css.viewContainer + ' > .'+ this.css.tabContent).css('display', 'none');
                $('#' + $tab.attr('tab-content-id')).css('display', 'block');
            }
        },
        _createTabsWithCodeViews: function($navbar, $codeViewsContainer) {
            var self = this;

            var isEmptyFile = new RegExp('^[ \t\r\n]*$');
            this.options.files.filter(function (f)  {return !isEmptyFile.test(f.content)}).forEach(function (f){
                var language = f.fileExtension === 'ts' ? 'typescript' : f.fileExtension;
                var $tab, $tabView, $code, $codeWrapper;

                //Create a tab element
                $tab = $("<div>", {
                    class: self.css.tab,
                    text: f.fileHeader.toUpperCase(),
                }).attr("tab-content-id", 'code-view-' + self.options.iframeId + '-' + f.fileHeader +'-tab-content');
    
                $navbar.append($tab);

                //Create tab view container element
                $codeWrapper = $('<pre>', {class: 'code-wrapper'});
                $code = $("<code>", {class: language}).text(f.content).addClass('hljs');
                hljs.highlightBlock($code[0]);
                $codeWrapper.append($code);

                //Add copy code button
                $codeWrapper
                .append([
                  '<span class="hljs-lang-name">' + language + "</span>",
                  '<button data-localize="hljs.copyCode" class="hljs-code-copy hidden">COPY CODE</button>'
                ])
                .on("mouseenter", function () {
                  $(this)
                    .find(".hljs-code-copy")
                    .removeClass("hidden");
                })
                .on("mouseleave", function () {
                  $(this)
                    .find(".hljs-code-copy")
                    .addClass("hidden");
                });

                $tabView = $("<div>", {
                    id: $tab.attr('tab-content-id'),
                    class: self.css.tabContent
                }).css('display', 'none')
                  .html($codeWrapper);

                $codeViewsContainer.append($tabView);
            });

            //Enable clipboard copy action
            this._copyCode();
        },
        _isIE: navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0,
        _isEdge: navigator.userAgent.indexOf('Edge') !== -1,
        _renderFooter: function ($footer, $codeView){
            var $liveEditingButtons = $("button[data-iframe-id=" + this.options.iframeId + "]");
            if($liveEditingButtons.length === 0) {
              $footer.remove();
              return;
            }

            var $footerContainer = $('<div class="editing-buttons-container"></div>');
            if(!(this._isIE || this._isEdge)) {
                $footerContainer.
                append('<span class="editing-label">Edit in: </span>').
                append($liveEditingButtons).
                appendTo($footer);
                $liveEditingButtons.text(function (i, text) {
                    return text.toLowerCase().indexOf("stackblitz") !== -1 ? "StackBlitz" : "Codesandbox"
                } );
                $liveEditingButtons.on("click", this.options.onLiveEditingButtonClick);
                $liveEditingButtons.removeAttr("disabled");
                $liveEditingButtons.css('visibility', 'visible');
            } else {
              $footerContainer.append("<span>", {class: 'open-new-browser-label'})
                              .css("font-weight", 500)
                              .text('For live-editing capabilities, please open the topic in a browser different than IE11 and Edge (version lower than 79)')
                              .appendTo($footer);
            }
            $codeView.append($footer);
        },
        _copyCode: function (){
            var btn = "#cv-" + this.options.iframeId + " .hljs-code-copy";
            var cpb = new Clipboard(btn, {
              text: function (trigger) {
                var codeSnippet = $(trigger)
                  .prevAll("code")
                  .text();
                return codeSnippet;
              }
            });
        
            cpb.on("success", function (e) {
              e.trigger.innertext = 'COPIED';
              $(e.trigger).addClass('hljs-code-copy--active');
              setTimeout(function () {
                $(e.trigger).text('COPY CODE');
                $(e.trigger).removeClass('hljs-code-copy--active');
              }, 1000);
            });
        }
    });
}(jQuery));