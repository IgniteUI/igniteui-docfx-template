import { ICodeViewCSS, ICodeViewElements, ICodeViewEvents, ICodeViewFilesData, ICodeViewMembers, ICodeViewOptions } from '../shared/types';

export class CodeView implements ICodeViewEvents, ICodeViewMembers {
   
    public options: ICodeViewOptions;

    public css: Readonly<ICodeViewCSS> = {
        navbar: "code-view-navbar",
        tab: "code-view-tab",
        viewContainer: "code-views-container",
        tabContent: 'code-view-tab-content',
        footer: "code-view-footer",
        stackblitz: "stackblitz-btn",
        csb: "codesandbox-btn"
    };

    private element: JQuery;
    private _elements: ICodeViewElements;

    _isIE: boolean =  navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0;
    _isEdge: boolean =  navigator.userAgent.indexOf('Edge') !== -1;
    _stackblitzText: string = "StackBlitz";
    _csbText: string =  "Codesandbox";

    _create(): void {
        let self = this, 
            $iframe: JQuery<HTMLIFrameElement>,
            $navbar: JQuery<HTMLElement>,
            $codeViewsContainer: JQuery<HTMLElement>,
            $footer: JQuery<HTMLElement>,
            $sampleContainer: JQuery<HTMLElement>,
            $exampleTab: JQuery<HTMLElement>,
            $fullscreenButton: JQuery<HTMLElement>;

        //Init the main elements
        $iframe = $(this.element.find('iframe'));
        $navbar = $("<div>", { class: this.css.navbar });
        $codeViewsContainer = $('<div>', { class: this.css.viewContainer });
        $footer = $("<div>", { class: this.css.footer });
        $(this.element.attr("class", "code-view"));

        //Wrap the sample container with code a views container
        $sampleContainer = $(this.element.find('.sample-container'));
        $sampleContainer.wrap($codeViewsContainer)
          .attr('id', 'code-view-' + this.options.iframeId + '-' + 'example-tab-content')
          .addClass(this.css.tabContent);
  
        $codeViewsContainer = $sampleContainer.parent();
  
        $exampleTab = $("<div>", {
          class: this.css.tab + "--active",
          text: "EXAMPLE"
        }).attr('tab-content-id', 'code-view-' + self.options.iframeId + '-' + 'example-tab-content');
        $exampleTab.on("click", this._codeViewTabClick.bind(this) as any);
  
        //Add initial selected tab for the Example view
        $navbar.prepend($exampleTab);
  
        //Create fullscreen button and add it to the code view navbar
        $fullscreenButton = $((this._isIE ? "<span class='fs-button-container' style='width: 35px'><i class='material-icons code-view-fullscreen'>open_in_full</i></span>" : "<span class='fs-button-container' title='Expand to fullscreen'></span>"));
        $fullscreenButton.on('click', function () { window.open($iframe.attr("src") || $iframe.attr("data-src")) });
        $fullscreenButton.appendTo($navbar);
  
        //Render the code view widget
        $(this.element).prepend($navbar);
  
        this._elements = {
          $navbar: $navbar,
          $codeViewsContainer: $codeViewsContainer,
          $activeTab: $exampleTab,
          $activeView: $sampleContainer,
          $footer: $footer
        }
    }
    _codeViewTabClick(event: MouseEvent): void {
        let $tab: JQuery<EventTarget> = $(event.target!);

        if (!$tab.hasClass("." + this.css.tab + "--active")) {
          this._elements.$activeTab.switchClass(this.css.tab + "--active", this.css.tab, 0)
          $tab.switchClass(this.css.tab, this.css.tab + "--active", 0);
          this._elements.$activeTab = $tab as JQuery<HTMLElement>;
          $tab.is('[tab-content-id=' + 'code-view-' + this.options.iframeId + '-' + 'example-tab-content]') ? $tab.siblings('.fs-button-container').css('visibility', 'visible') :
            $tab.siblings('.fs-button-container').css('visibility', 'hidden')
          this._elements.$activeView.css('display', 'none');
          this._elements.$activeView = $('#' + $tab.attr('tab-content-id'))
          this._elements.$activeView.css('display', 'block');
        }
    }
    createTabsWithCodeViews(filesData: ICodeViewFilesData): void {
        throw new Error('Method not implemented.');
    }
    renderFooter(liveEditingButtonsClickHandler: Function, explicitEditor: string): void {
        throw new Error('Method not implemented.');
    }
} 
