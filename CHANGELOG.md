# Ignite UI Docfx Template Change Log

All notable changes for each version of this project will be documented in this file.

## 3.5.1

### General
- `Ignite UI TaaS`
    - The `Ignite UI TaaS` is now available only for the 'Angular' DocFX instance, enabling the dynamic functionality to change sample themes.
- `Stlyling`
    - Add lighter color for hljs selector - The highlight color for `$hljs-selector` elements has been updated to use the `warning-color` CSS variable, enhancing contrast and readability.
### New Features
- `Open toc topics in a new tab on Ctrl + click`
    - Ctrl + click in the table of contents (TOC) now opens topics in a new tab, replacing the previous behavior of opening the clicked topic in the same tab.
- `Added support for beta and preview labels`
    -The table of content (TOC) topics in each DocFX instance include parameters for name and href, along with an optional label parameter. The supported labels, including 'new,' 'updated,' 'preview,' and 'beta,' can be added by specifying the label name and setting its value to true.

## 3.5.0

### General
- `Build`
    - CI Updates: Updated action step versions and matrix node-version to support a range of [16.x, 18.x].
    - Includes usage of dotnet build for docfx
        - The installation and build process of DocFX now requires a `.NET 6 or higher` environment and the `dotnet tool`, replacing the previous method of installing DocFX via chocolate or brew. This update allows for building and serving DocFX projects on all operating systems without the need for additional customizations or administrator permissions.
    - The `EnvironmentVariable`s post processor has been replaced with a gulp task that sets all the required variables in the generated project based on the environment. This change eliminates the need for the EnvironmentVariables post processor.
- `Side affix`
    - Handle empty hierarchy affix - Articles without h2 or h3 headings will no longer inherit h2(s) or h3(s) from previously opened articles. Instead, the affix will remain empty if no appropriate headings are present.

- `Styling`
    - Implemented support for highlighting `razor` tabs. The highlight library now includes `C#` and `razor` specific syntax, ensuring correct display and highlighting of razor-specific comments and code within code panels.

### New Features
- `Collapsible code snippets`
To generate and display collapsible code snippets on documentation websites, follow these steps:

1. Create a \<div> section with the class "fancy-details".

2. Add a \<summary> element to the created \<div> section.

3. Add the summary text representing the code snippet header to the \<summary> element.

4.  Add a \<code> element to the created \<div> section.

5. Add the code snippet to the \<code> element.

6. Example:
```
<div class="fancy-details">
    <summary>Example of a successful response body: </summary>
    <code>
        {
            "id": "{123456}_repo",
            "modified": "2023-02-03T14:07:34.0000000",
            "created": "2023-02-03T14:07:34.0000000",
            "name": "Marketing",
            "user": {
                "id": "{123456}_u ",
                "name": "Teddy Mitkova"
            },
            "dashboardSections": [
                {
                    "id": "{123456}_f",
                    "name": "May"
                }
            ]
        }
    </code>
</div>
```

## 3.4.1

### General
- `Table of content`
    - Enhanced the TOC and affix resizing observables and calculations to prevent inconsistent sizing behavior during scrolling and expansion. This ensures a more consistent and reliable sizing experience.


## 3.4.0

### General
- `Table of content`
    - Fixed toc resizing - Optimized the layout to ensure the visibility of the last expanded nodes in the Table of Contents (TOC) without overlapping the footer element.
- `Stlyling`
    - Fixed NOTE blocks styling icon and border.
    - Defined default style for images including responsive behavior. Standard Markdown syntax for images is supported without additional customization needed.
