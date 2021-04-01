## In this topic
 ### 1. [Manual testing of the docfx-template](#manual-testing)

**Test Plan:**

1. Scroll down the whole page and observe the TOC on the left and side-bar on the right - Scrollbars should appear and all list items should be visible/scrollable.
2. Observe the right side-bar, click any list item and check if the relevant header part of the topic content is positioned at the top most position.
3. Check that all code-views are loaded correctly
    a. Live-editing buttons should work
    b. Full screen button
    c. Code tabs should be present
4. Open a topic that has more than one sample - the first one should be loaded instantly, the latter should be lazy loaded when reaches through page scrolling.
5. Check if the topic has a CTA banner loaded at the end of the first H2 element.
6. Test everything with Firefox, Edge and IE11 (live-editing buttons should not be present, and the Theming widget should be replaced by only two buttons for light and dark theme).


**Note:** npm link the docfx-template to docfx, run angular-samples and igniteui-theming-widget-api