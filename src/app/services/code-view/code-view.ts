import { ExplicitEditor, ICodeViewCSS, ICodeViewElements, ICodeViewEvents, ICodeViewFilesData, ICodeViewMembers, ICodeViewOptions } from '../../types';
import hljs from "highlight.js";
import util from '../utils';

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

    _stackblitzText: string = "StackBlitz";
    _csbText: string =  "Codesandbox";

    _create(): void {
        let $iframe: JQuery<HTMLIFrameElement>,
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
        }).attr('tab-content-id', 'code-view-' + this.options.iframeId + '-' + 'example-tab-content');
        $exampleTab.on("click", this._codeViewTabClick.bind(this));
  
        //Add initial selected tab for the Example view
        $navbar.prepend($exampleTab);
  
        //Create fullscreen button and add it to the code view navbar
        $fullscreenButton = $((util.isIE ? "<span class='fs-button-container' style='width: 35px'><i class='material-icons code-view-fullscreen'>open_in_full</i></span>" : "<span class='fs-button-container' title='Expand to fullscreen'></span>"));
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
  
    _codeViewTabClick(event: any): void {
        let $tab: JQuery<EventTarget> = $((event as MouseEvent).target!);
        let tabActiveClass = `${this.css.tab}--active`;
        if (!$tab.hasClass(tabActiveClass)) {
          this._elements.$activeTab.removeClass(tabActiveClass).addClass(this.css.tab)
          $tab.addClass(tabActiveClass).removeClass(this.css.tab);
          this._elements.$activeTab = $tab as JQuery<HTMLElement>;
          $tab.is(`[tab-content-id=code-view-${this.options.iframeId}-example-tab-content]`) ? $tab.siblings('.fs-button-container').css('visibility', 'visible') :
                                                                                               $tab.siblings('.fs-button-container').css('visibility', 'hidden')
          this._elements.$activeView.css('display', 'none');
          this._elements.$activeView = this.element.find(`#${$tab.attr('tab-content-id')}`);
          this._elements.$activeView.css('display', 'block');
        }
    }
  
    createTabsWithCodeViews(filesData: ICodeViewFilesData[]): void {
      if (!filesData || filesData.length === 0) {
        return;
      }
      let isEmptyFile = new RegExp('^[ \t\r\n]*$');
      let _filesData = filesData.filter(f => !isEmptyFile.test(f.content));

      if (_filesData.length === 0) {
        return;
      }

      this.options.files = _filesData;
      let headers = _filesData.map(f => f.fileHeader);

      
      _filesData.forEach(f => {
    
        let language;

        switch (f.fileExtension) {
          case "tsx":
            language = 'ts';
            break;
          case "js":
            language = 'javascript';
            break;
          case "razor":
            language = 'csharp';
            break;
          default:
            language = f.fileExtension;
            break;
        }

        let $tab:JQuery<HTMLElement>, 
            $tabView:JQuery<HTMLElement>,
            $code:JQuery<HTMLElement>,
            $codeWrapper:JQuery<HTMLElement>,
            fileNameWithExtension: string | undefined;

        if (headers.indexOf(f.fileHeader) !== headers.lastIndexOf(f.fileHeader)) {
          fileNameWithExtension = f.path.substring(f.path.lastIndexOf("/") + 1);
        }

        //Create a tab element
        $tab = $("<div>", {
          class: this.css.tab,
          text: (fileNameWithExtension ?? f.fileHeader.toUpperCase()),
        }).attr("tab-content-id", `code-view-${this.options.iframeId}-${(fileNameWithExtension?.replace(".", "--") ?? f.fileHeader)}-tab-content`);
        $tab.on('click', this._codeViewTabClick.bind(this));

        $tab.insertBefore(this._elements.$navbar.children().last());

        //Create tab view container element
        $codeWrapper = $('<pre>', { class: 'code-wrapper' })!;
        $code = $("<code>", { class: `language-${language}` }).text(f.content).addClass('hljs');
        hljs.highlightBlock($code[0]);
        $codeWrapper.append($code);

        let hljsLangName = $<HTMLElement>(`<span class="hljs-lang-name">${f.fileExtension}</span>`)
        let copyCodeButton = $<HTMLButtonElement>('<button data-localize="hljs.copyCode" class="cv-hljs-code-copy hidden">COPY CODE</button>')
        //Add copy code button
        $codeWrapper
          .append([
            hljsLangName,
            copyCodeButton
          ])
          .on("mouseenter", () => $codeWrapper.find(".cv-hljs-code-copy").removeClass("hidden"))
          .on("mouseleave", () => $codeWrapper.find(".cv-hljs-code-copy").addClass("hidden"));

        $tabView = $("<div>", {
          id: $tab.attr('tab-content-id'),
          class: this.css.tabContent
        }).css('display', 'none').html($codeWrapper as any);

        this._elements.$codeViewsContainer.append($tabView);
      });
      util.copyCode(".cv-hljs-code-copy", "COPY CODE");
    }

    renderFooter(liveEditingButtonsClickHandler: ($button: JQuery<HTMLButtonElement>, $codeView: JQuery<HTMLElement>) => void, explicitEditor?: ExplicitEditor): void {
      let $footerContainer = $('<div class="editing-buttons-container"></div>');
      if (!(util.isIE || util.isEdge)) {

        if (!explicitEditor) {
          //Create Codesandbox live editing button
          let $csbB = $<HTMLButtonElement>("<button>", { class: this.css.csb });
          $csbB.text(this._csbText);
          $csbB.css("font-weight", 500);

          //Create Stackblizt live editing button
          let $stackblitzB = $<HTMLButtonElement>("<button>", { class: this.css.stackblitz });
          $stackblitzB.text(this._stackblitzText);
          $stackblitzB.css("font-weight", 500);

          $footerContainer.append('<span class="editing-label">Edit in: </span>').
            append([$csbB, $stackblitzB]).
            appendTo(this._elements.$footer);

          $csbB.on("click", () => liveEditingButtonsClickHandler($csbB, $(this.element)));
          $stackblitzB.on("click", () => liveEditingButtonsClickHandler($stackblitzB, $(this.element)));

          //Disable live editing buttons
          $csbB.prop("disabled", true );
          //$stackblitzB.prop("disabled", true );
        } else if (explicitEditor === "stackblitz" || explicitEditor === "csb") {
          let $liveEditingButton = $<HTMLButtonElement>("<button>", {class: this.css[explicitEditor]});
          $liveEditingButton.text((this as any)[`_${explicitEditor}Text`]);
          $liveEditingButton.css("font-weight", 500);

          $footerContainer.append('<span class="editing-label">Edit in: </span>').
          append($liveEditingButton).
          appendTo(this._elements.$footer);
          $liveEditingButton.on("click", () => liveEditingButtonsClickHandler($liveEditingButton, $(this.element)))
        } else {
          console.error(`We do not support an online editor with name: ${explicitEditor}`);
          return;
        }


      } else {
        $footerContainer.append($("<span>", { class: 'open-new-browser-label' }))
          .css("font-weight", 500)
          .text('For live-editing capabilities, please open the topic in a browser different than IE11 and Edge (version lower than 79)')
          .appendTo(this._elements.$footer);
      }
      $(this.element).append(this._elements.$footer);
    }
}
