export const sharedFiles = {
    "angular.json": `
    {
        "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
        "version": 1,
        "newProjectRoot": "projects",
        "projects": {
          "example-app": {
            "projectType": "application",
            "schematics": {
              "@schematics/angular:component": {
                "style": "scss"
              },
              "@schematics/angular:application": {
                "strict": true
              }
            },
            "root": "",
            "sourceRoot": "src",
            "prefix": "app",
            "architect": {
              "build": {
                "builder": "@angular-devkit/build-angular:browser",
                "options": {
                  "outputPath": "dist/example-app",
                  "index": "src/index.html",
                  "main": "src/main.ts",
                  "polyfills": "src/polyfills.ts",
                  "tsConfig": "tsconfig.app.json",
                  "inlineStyleLanguage": "scss",
                  "assets": ["src/favicon.ico", "src/assets"],
                  "styles": ["src/styles.scss"],
                  "stylePreprocessorOptions": {
                    "includePaths": ["node_modules/"]
                  },
                  "scripts": []
                },
                "configurations": {
                  "production": {
                    "budgets": [
                      {
                        "type": "initial",
                        "maximumWarning": "500kb",
                        "maximumError": "1mb"
                      },
                      {
                        "type": "anyComponentStyle",
                        "maximumWarning": "2kb",
                        "maximumError": "4kb"
                      }
                    ],
                    "fileReplacements": [
                      {
                        "replace": "src/environments/environment.ts",
                        "with": "src/environments/environment.prod.ts"
                      }
                    ],
                    "outputHashing": "all"
                  },
                  "development": {
                    "buildOptimizer": false,
                    "optimization": false,
                    "vendorChunk": true,
                    "extractLicenses": false,
                    "sourceMap": true,
                    "namedChunks": true
                  }
                },
                "defaultConfiguration": "production"
              },
              "serve": {
                "builder": "@angular-devkit/build-angular:dev-server",
                "configurations": {
                  "production": {
                    "browserTarget": "example-app:build:production"
                  },
                  "development": {
                    "browserTarget": "example-app:build:development"
                  }
                },
                "defaultConfiguration": "development"
              },
              "extract-i18n": {
                "builder": "@angular-devkit/build-angular:extract-i18n",
                "options": {
                  "browserTarget": "example-app:build"
                }
              },
              "test": {
                "builder": "@angular-devkit/build-angular:karma",
                "options": {
                  "main": "src/test.ts",
                  "polyfills": "src/polyfills.ts",
                  "tsConfig": "tsconfig.spec.json",
                  "karmaConfig": "karma.conf.js",
                  "inlineStyleLanguage": "scss",
                  "assets": ["src/favicon.ico", "src/assets"],
                  "stylePreprocessorOptions": {
                    "includePaths": ["node_modules/"]
                  },
                  "styles": ["src/styles.scss", "src/theme.scss"],
                  "scripts": []
                }
              }
            }
          }
        },
        "defaultProject": "example-app",
        "cli": {
          "analytics": false
        }
      }
      `,
    "environments/environment.ts": `
        export const environment = {
            production: true,
        };
    `,
    "environments/environment.prod.ts": `
        export const environment = {
            production: true,
        };      
    `,
    "src/index.html": `
        <!doctype html>
        <html lang="en">

        <head>
        <meta charset="utf-8">
        <title>Angular Demos</title>
        <base href="/">

        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" type="image/x-icon" href="favicon.ico">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css?family=Titillium+Web:300,400,600,700" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700" rel="stylesheet">
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
        </head>

        <body class="ig-typography ig-scrollbar">
        <app-root></app-root>
        </body>

        </html>
    `,
    "src/main.ts": `
        import 'zone.js/dist/zone';
        import { bootstrapApplication } from '@angular/platform-browser';
        import { enableProdMode } from '@angular/core';
        import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

        import { AppModule } from './app.module';

        platformBrowserDynamic().bootstrapModule(AppModule).then(ref => {
        // Ensure Angular destroys itself on hot reloads.
        if (window['ngRef']) {
            window['ngRef'].destroy();
        }
        window['ngRef'] = ref;

        // Otherwise, log the boot error
        }).catch(err => console.error(err));
    `,
    "package.json": `
      {
        "name": "example-app",
        "version": "0.0.0",
        "scripts": {
          "ng": "ng",
          "start": "ng serve",
          "build": "ng build",
          "watch": "ng build --watch --configuration development",
          "test": "ng test"
        },
        "private": true,
        "dependencies": {
          "@angular/animations": "^16.0.0",
          "@angular/cdk": "^16.0.0",
          "@angular/common": "^16.0.0",
          "@angular/compiler": "^16.0.0",
          "@angular/core": "^16.0.0",
          "@angular/forms": "^16.0.0",
          "@angular/platform-browser": "^16.0.0",
          "@angular/platform-browser-dynamic": "^16.0.0",
          "@angular/router": "^16.0.0",
          "@juggle/resize-observer": "^3.3.1",
          "@types/hammerjs": "^2.0.39",
          "@microsoft/signalr": "^5.0.11",
          "core-js": "2.6.2",
          "hammerjs": "^2.0.8",
          "igniteui-angular": "^16.0.0",
          "igniteui-theming": "^1.2.0",
          "igniteui-angular-charts": "^16.0.0",
          "igniteui-angular-core": "^16.0.0",
          "igniteui-angular-excel": "^16.0.0",
          "igniteui-angular-gauges": "^16.0.0",
          "igniteui-angular-maps": "^16.0.0",
          "igniteui-angular-spreadsheet": "^16.0.0",
          "igniteui-angular-spreadsheet-chart-adapter": "^16.0.0",
          "igniteui-dockmanager": "^1.12.4",
          "immediate": "^3.2.3",
          "intl": "^1.2.5",
          "rxjs": "^6.6.7",
          "tslib": "^2.3.1",
          "zone.js": "~0.13.0"
        },
        "devDependencies": {
          "@angular-devkit/build-angular": "^16.0.0",
          "@angular/cli": "^16.0.0",
          "@angular/compiler-cli": "^16.0.0",
          "@types/jasmine": "^4.3.1",
          "@types/node": "^13.13.52",
          "jasmine-core": "~4.2.0",
          "karma": "^6.4.2",
          "karma-chrome-launcher": "~3.2.0",
          "karma-coverage": "~2.0.3",
          "karma-jasmine": "~5.1.0",
          "karma-jasmine-html-reporter": "^2.0.0",
          "typescript": "4.9.5"
        }
      }      
    `,
    "src/polyfills.ts": `
        /**
     * This file includes polyfills needed by Angular and is loaded before the app.
     * You can add your own extra polyfills to this file.
     *
     * This file is divided into 2 sections:
     *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
     *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
     *      file.
     *
     * The current setup is for so-called 'evergreen' browsers; the last versions of browsers that
     * automatically update themselves. This includes Safari >= 10, Chrome >= 55 (including Opera),
     * Edge >= 13 on the desktop, and iOS 10 and Chrome on mobile.
     *
     * Learn more in https://angular.io/guide/browser-support
     */

    /***************************************************************************************************
    * BROWSER POLYFILLS
    */

    //import 'core-js/es7/object';

    //import 'core-js/es7/array'; // for Array.includes()  // Run 'npm install --save classlist.js'.

    /** IE10 and IE11 requires the following for the Reflect API. */
    //import 'core-js/es6/reflect';

    /* Evergreen browsers require these. */
    // Used for reflect-metadata in JIT. If you use AOT (and only Angular decorators), you can remove.
    //import 'core-js/es7/reflect';  // Run 'npm install --save web-animations-js'.

    /***************************************************************************************************
     * Zone JS is required by Angular itself.
     */
    import 'hammerjs/hammer';
    import 'zone.js';  // Included with Angular CLI.

    /***************************************************************************************************
     * @angular/animations polyfill
     */
    // if (!Element.prototype.matches) {
    //     Element.prototype.matches = (Element.prototype as any).msMatchesSelector;
    // }

    /***************************************************************************************************
     * APPLICATION IMPORTS
     */

    /**
     * Date, currency, decimal and percent pipes.
     * Needed for: All but Chrome, Firefox, Edge, IE11 and Safari 10
     */
    // import 'intl';  // Run 'npm install --save intl'.
    // import 'intl/locale-data/jsonp/de';
    /**
     * Need to import at least one locale-data with intl.
     */
    // import 'intl/locale-data/jsonp/en';
    `,
    "tsconfig.app.json": `
        /* To learn more about this file see: https://angular.io/config/tsconfig. */
        {
        "extends": "./tsconfig.json",
        "compilerOptions": {
            "outDir": "./out-tsc/app",
            "types": []
        },
        "files": ["src/main.ts", "src/polyfills.ts"],
        "include": ["src/**/*.d.ts"]
        }
    `,
    "tsconfig.json": `
        {
        "compileOnSave": false,
        "compilerOptions": {
          "baseUrl": "./",
          "outDir": "./dist/out-tsc",
          "sourceMap": true,
          "declaration": false,
          "downlevelIteration": true,
          "experimentalDecorators": true,
          "module": "esnext",
          "moduleResolution": "node",
          "importHelpers": true,
          "target": "es2015",
          "typeRoots": [
            "node_modules/@types"
          ],
          "lib": [
            "es2018",
            "dom"
          ]
        },
        "angularCompilerOptions": {
          "enableIvy": true
        }
      }
    `
}
