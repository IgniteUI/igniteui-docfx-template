## In this topic
 ### 1. [Manual testing of the docfx-template](#manual-testing)
 ### 2. [Adding responsive containers](#responsive-containers)


## <a name='#manual-testing'>Test Plan:</a>

1. Scroll down the whole page and observe the TOC on the left and side-bar on the right - Scrollbars should appear and all list items should be visible/scrollable.
2. Observe the right side-bar, click any list item and check if the relevant header part of the topic content is positioned at the top most position.
3. Check that all code-views are loaded correctly
    a. Live-editing buttons should work
    b. Full screen button
    c. Code tabs should be present
4. Open a topic that has more than one sample - the first one should be loaded instantly, the latter should be lazy loaded when reaches through page scrolling.
5. Check if the topic has a CTA banner loaded at the end of the first H2 element.
6. Test everything with Firefox, Edge and IE11 (live-editing buttons should not be present, and the Theming widget should be replaced by only two buttons for light and dark theme).
7. Execute `npm run build-staging` and host the Docfx application under IIS (angular-samples should not be running)


**Notes:** 
- npm link the docfx-template to docfx, run angular-samples and [igniteui-theming-widget-api](https://infragistics.visualstudio.com/Ignite%20UI%20Theming%20Tools/_git/igniteui-theming-widget-api)
- both regular `app` and `app-lob` should be tested


## <a name='#responsive-containers'>Responsive containers:</a>
To add  a single responsive embedded video use the following markup:
```HTML
    <section class="video-container">
        <div class="video-container__item">
            <iframe src=""></iframe>
        </div>
    </section>
```

To add a single responsive embedded video with a title use the following markup:
```HTML
    <section class="video-container">
        <div>
            <div class="video-container__item">
                <iframe src=""></iframe>
            </div>
            <p>Video 1</p>
        </div>
    </section>
```

To add multiple responsive embedded videos use the following markup:
```HTML
    <section class="video-container">
        <div>
            <div class="video-container__item">
                <iframe src=""></iframe>
            </div>
            <p>Video 1</p>
        </div>
        <div>
            <div class="video-container__item">
                <iframe src=""></iframe>
            </div>
            <p>Video 2</p>
        </div>
    </section>
```

If you want to change the aspect ratio of a video or set of videos you can do it by changing the --ratio variable, keep in mind that the value should be in %.

Change the ratio for multiple videos
```HTML
    <section class="video-container" style="--ratio: 55%">
        <div class="video-container__item">
            <iframe src=""></iframe>
        </div>
    </section>
```

Change the ratio for single video.
```HTML
    <section class="video-container">
        <div class="video-container__item" style="--ratio: 40%">
            <iframe src=""></iframe>
        </div>
    </section>
```
