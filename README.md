# Atom Sweet Projects Package

(Extendable) project management for atom.

This is package still under development.

![screenshot](https://www.moontec.de/atomimages/sweetprojects_img01.png)
![screenshot](https://www.moontec.de/atomimages/sweetprojects_img02.png | width=200)

## Features

* Based on atoms project history
* Projects overview in center or side pane
* Preview image when set an url
* Set project name
* Settings are saved in project-folder
* Works well with pinned-tabs package
* **NEW**: Third-party packages can use the sweetprojects api to offer project dependent settings

## Planned features

* Categories
* Search functionality
* Support for multiple paths

## Open Sweet Project Pane

In atom goto `View > Toggle Sweet Projects View` or press `ctrl + alt + p`.
To open a project *double click* the project tile. The project will load in a new window.
Right-click a project tile and select `Project Settings` to enter a project name and an url.

## What to ignore?

The settings are stored in a `.sweetproject` file at the projects root.
You can ignore them in your .gitignore or keep them to share project settings.

## How to use the API in your own package?

First of all you have to register a json definition like shown below under an unique namespace.
Always use your **package name** as namespace.

The following code will register a json for the package `your-package-name`.
The settings dialog of each project will now display a new section with the title `Your Package Name To Be Displayed` and a simple text input field with the label `My Input` and a default value `hi`.

```
atom.sweetprojects.setInputs('your-package-name', {
    package: 'your-package-name',
    label: 'Your Package Name To Be Displayed',
    inputs: [
      {name: 'myInput', label: 'My Input', value: 'hi', type: 'text', placeholder: 'Insert text here'}
    ]
  });
```

You can also have the following types: `checkbox`, `number`, `password`, `select`.

Inputs with the type `select` can have an additional property `options`:
```
{name: 'mySelect', label: 'My Select', value: '', type: 'select', options: [
  {value: 'option1', label: 'Option1'},
  {value: 'option2', label: 'Option2'},
  {value: 'option3', label: 'Option3'}
]}
```

You can get the value the user set for the active project by calling the `getValue` method:
The first parameter is the namespace (your package name). The second one is the name of the input field, like defined above.
```
if(atom.sweetprojects.isActive('your-package-name')){
  var text = atom.sweetprojects.getValue('your-package-name', 'myInput');
  // the value of the variable text is the text the user set for this field on the project loaded when this code is executed
}
```
The `isActive` method returns true, if your projects section is turned on for this project. False if not. The `getValue` method will always return the value set for the *active project*.

## Authors

**Leonard Nürnberg** - *Initial work* - [LennyN95](https://github.com/LennyN95)

## Built With

* [Atom](https://atom.io/) - Atom Editor

## Used Node Packages

* Website-Previews are done with the `node-webshot` package.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

Donation is welcome :)
<a class="bmc-button" href="https://www.buymeacoffee.com/5R7pfc9"><img src="https://www.buymeacoffee.com/assets/img/BMC-btn-logo.svg" alt="BMC logo"><span style="margin-left:5px">Buy me a coffee</span></a>
