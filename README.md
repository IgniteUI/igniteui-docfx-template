[![npm version](https://badge.fury.io/js/igniteui-docfx-template.svg)](https://badge.fury.io/js/igniteui-docfx-template)

# Ignite UI DocFX Template
This is a [DocFX](https://github.com/dotnet/docfx) template which is used for [Ignite UI](https://github.com/igniteui) documentation websites.

## Contributing
Check out the [Contributing page](.github/CONTRIBUTING.md) for more.

## Setup
To setup the project run:

```
npm install
```

## Bundling and minification
We provide bundling and minification for JS and CSS files in the template. To run bundling and minification execute:

```
npm run bundle-and-minify
```

To run the bundling and minification watcher execute:


```
npm run bundle-and-minify:watch
```

### Debugging
To disable minification for debugging purposes run:

```
npm run bundle-and-minify -- --debugMode=true
```

or with watcher:

```
npm run bundle-and-minify:watch -- --debugMode=true
```

### Browser Cache Invalidation
The browser caching invalidation is implemented by appending a query string with the bundle checksum to each bundle URL. Each checksum is a MD5-sum of the content of the bundle. The checksums are generated along with the bundling and minification. They are located in the `bundling.global.json` file which is used as a global metadata by the docFX engine. `bundling.global.json` has an additional `timestamp` variable which is used to invalidate the browser caching for files which are included in the bundling and minification. If you want to generate just the `bundling.global.json`, run:

```
npm run generate-bundling-global-metadata
```
