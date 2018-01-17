# Atom Sweet Projects Package

(Extendable) project management for atom.

This is package still under development.

![screenshot](https://www.moontec.de/atomimages/sweetprojects_img01.png)
 <img src="https://www.moontec.de/atomimages/sweetprojects_img02.png" width="500"/>

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

### Define inputs

The following code will register a json for the package `your-package-name`.
The settings dialog of each project will now display a new section with the title `Your Package Name To Be Displayed` and a simple text input field with the label `My Input` and a default value `hi`.

```
if(atom.sweetprojects){
  atom.sweetprojects.setInputs('your-package-name', {
      package: 'your-package-name',
      label: 'Your Package Name To Be Displayed',
      inputs: [
        {name: 'myInput', label: 'My Input', value: 'hi', type: 'text', placeholder: 'Insert text here'}
      ]
    });
}
```

You can also have the following types: `checkbox`, `number`, `password`, `select`.

Inputs with the type `select` must have an additional property `options`:
```
{name: 'mySelect', label: 'My Select', value: '', type: 'select', options: [
  {value: 'option1', label: 'Option1'},
  {value: 'option2', label: 'Option2'},
  {value: 'option3', label: 'Option3'}
]}
```

### Get values

You can get the value the user set for the active project by calling the `getValue` method:
The first parameter is the namespace (your package name). The second one is the name of the input field, like defined above.
```
if(atom.sweetprojects){
  if(atom.sweetprojects.isActive('your-package-name')){
    var text = atom.sweetprojects.getValue('your-package-name', 'myInput');
    // the value of the variable text is the text the user set for this field on
    // the project loaded when this code is executed
  }
}
```
The `isActive` method returns true, if your projects section is turned on for this project. False if not. The `getValue` method will always return the value set for the *active project*.

Don't forget to check the availability of the sweetprojects api. Simply check if the *sweetprojects* property exists in the *atom* object by doing `if(atom.sweetprojects)`.

### Conditions

Sometimes input fields depend on the value of other fields. For example, you may only want the user to enter a password if he selected use password in your selectbox before. You can do that with conditions. Each input field can have an optional `condition` property where you can define under which condition the field is displayed. A condition string must have the folowing format:

```
// [input-name] [operator] [value]
condition: 'mySelect=option1'
```
accepted operators:
* `=` equal
* `>` higher *(numerical)*
* `<` lower *(numerical)*
* `>=` higher and equal  *(numerical)*
* `<=` lower and equal  *(numerical)*
* `<>` not equal

You can combine **multiple conditions** to more complex conditions by using `and` and `or`.
And-operators (`&`) have a stronger binding than or-operators (`|`).  

```
{name: 'complexInput', label: 'input with condition', value: '', type: 'text', placeholder: '',
condition: 'mySelect=option1|mySelect=option2&myInput=hi'}
```

The condition of the example above causes the input field *complexInput* to hide and become visible if either *Option1* is selected in the field *mySelect* **or** *Option2* is selected and the value of the input field *myInput* is equal to *'hi'*.

**Let me know if you're using the sweetprojects api in your own packages so I can add a link to your project!**

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
