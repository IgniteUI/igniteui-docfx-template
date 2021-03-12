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
            var self = this, $iframe, $navbar, $codeViewsContainer, $footer;
            //Init the main elements
            $iframe  = $(this.element.find('iframe'));
            $navbar = $("<div>", {class: this.css.navbar});
            $codeViewsContainer = $('<div>', {class: this.css.viewContainer});
            $footer = $("<div>", {class: this.css.footer});
            $(this.element.attr("class","code-view"));
            //Wrap the sample container with code a views container
            $sampleContainer  = $(this.element.find('.sample-container'));
            $sampleContainer.wrap($codeViewsContainer)
                        .attr('id','code-view-' + self.options.iframeId + '-' + 'example-tab-content')
                        .addClass(this.css.tabContent);

            $codeViewsContainer = $sampleContainer.parent();

            $exampleTab = $("<div>", {
              class: this.css.tab + "--active",
              text: "EXAMPLE"
             }).attr('tab-content-id', 'code-view-' + self.options.iframeId + '-' + 'example-tab-content');
            $exampleTab.on('click',$.proxy(self._codeViewTabClick, self));

            //Add initial selected tab for the Example view
            $navbar.prepend($exampleTab);

            //Create fullscreen button and add it to the code view navbar
            $fullscreenButton = $((this._isIE ? "<span class='fs-button-container' style='width: 35px'><i class='material-icons code-view-fullscreen'>open_in_full</i></span>": "<span class='fs-button-container' title='Expand to fullscreen'></span>"));
            $fullscreenButton.on('click', function () { window.open($iframe.attr("src") || $iframe.attr("data-src"))});
            $fullscreenButton.appendTo($navbar);

            //Render the code view widget
            $(this.element).prepend($navbar);

            this._options = {
              $navbar: $navbar,
              $codeViewsContainer: $codeViewsContainer,
              $activeTab: $exampleTab,
              $activeView: $sampleContainer,
              $footer: $footer
            }

        },
        _codeViewTabClick: function(event) {
            var $tab = $(event.target);
            if(!$tab.hasClass("." + this.css.tab + "--active")){
                this._options.$activeTab.switchClass(this.css.tab + "--active", this.css.tab,  0)
                $tab.switchClass(this.css.tab, this.css.tab + "--active", 0);
                this._options.$activeTab = $tab;
                $tab.is('[tab-content-id=' + 'code-view-' + this.options.iframeId + '-' + 'example-tab-content]') ? $tab.siblings('.fs-button-container').css('visibility', 'visible') :
                                                                                                                    $tab.siblings('.fs-button-container').css('visibility', 'hidden')
                this._options.$activeView.css('display', 'none');
                this._options.$activeView = $('#' + $tab.attr('tab-content-id'))
                this._options.$activeView.css('display', 'block');
            }
        },
        createTabsWithCodeViews: function(filesData) {
            var self = this;
            if(!filesData || filesData.length === 0){
              return;
            }
            var isEmptyFile = new RegExp('^[ \t\r\n]*$');

            var _filesData = filesData.filter(function (f)  {return !isEmptyFile.test(f.content)});

            if(_filesData.length === 0) {
              return;
            }
            
            this.options.files = _filesData;
            var headers = _filesData.map(function(f) {return f.fileHeader} );

            _filesData.forEach(function (f){
                var language;
                switch(f.fileExtension) {
                  case "ts":
                    language = 'typescript';
                    break;
                  case "js":
                    language = 'javascript';
                    break;
                  case "razor":
                    language = 'html';
                    break;
                  default:
                    language = f.fileExtension;
                    break;
                }
                var $tab, $tabView, $code, $codeWrapper;
                var fileNameWithExtension = undefined;
                if(headers.indexOf(f.fileHeader) !== headers.lastIndexOf(f.fileHeader)) {
                  fileNameWithExtension = f.path.substring(f.path.lastIndexOf("/") + 1);
                }

                //Create a tab element
                $tab = $("<div>", {
                    class: self.css.tab,
                    text: (fileNameWithExtension || f.fileHeader.toUpperCase()),
                }).attr("tab-content-id", 'code-view-' + self.options.iframeId + '-' + (fileNameWithExtension || f.fileHeader).replace(".", "--") +'-tab-content');
                $tab.on('click',$.proxy(self._codeViewTabClick, self));

                $tab.insertBefore(self._options.$navbar.children().last());

                //Create tab view container element
                $codeWrapper = $('<pre>', {class: 'code-wrapper'});
                $code = $("<code>", {class: language}).text(f.content).addClass('hljs');
                hljs.highlightBlock($code[0]);
                $codeWrapper.append($code);

                //Add copy code button
                $codeWrapper
                .append([
                  '<span class="hljs-lang-name">' + f.fileExtension + "</span>",
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

                self._options.$codeViewsContainer.append($tabView);
            });

            //Enable clipboard copy action
            this._copyCode();
        },
        _isIE: navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0,
        _isEdge: navigator.userAgent.indexOf('Edge') !== -1,
        renderFooter: function (liveEditingButtonsClickHandler) { 

            var $footerContainer = $('<div class="editing-buttons-container"></div>');
            if(!(this._isIE || this._isEdge)) {
              //Create Codesandbox live editing button
              var $csbB = $("<button>", {class: 'codesandbox-btn'});
              $csbB.text("Codesandbox");
              $csbB.css("font-weight", 500);

              //Create Stackblizt live editing button
              var $stackblitzB = $("<button>", {class: 'stackblitz-btn'});
              $stackblitzB.text("StackBlitz");
              $stackblitzB.css("font-weight", 500);
              
              $footerContainer.append('<span class="editing-label">Edit in: </span>').
                               append([$csbB, $stackblitzB]).
                               appendTo(this._options.$footer);

              $csbB.on("click", liveEditingButtonsClickHandler.bind($csbB, $(this.element)));
              $stackblitzB.on("click", liveEditingButtonsClickHandler.bind($stackblitzB, $(this.element)));


            } else {
              $footerContainer.append("<span>", {class: 'open-new-browser-label'})
                              .css("font-weight", 500)
                              .text('For live-editing capabilities, please open the topic in a browser different than IE11 and Edge (version lower than 79)')
                              .appendTo(this._options.$footer);
            }
            $(this.element).append(this._options.$footer);
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