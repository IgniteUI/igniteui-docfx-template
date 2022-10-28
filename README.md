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

To build the project

```
npm run build
```

To run the template in dev mode:

```
npm run build:dev
```
## Link and Debug

In order to run the template locally, after it is build, it should be linked to the repo you want to use it.

Go to __dist/__ folder of the template and run:

```
npm link
```

Then go to the repo which you want to use the template and run this command in the main folder:

```
npm link igniteui-docfx-template
```

After these steps are done, you can run your project and it will automatically use the template.