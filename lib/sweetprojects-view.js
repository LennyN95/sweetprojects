'use babel';

import SweetProject from './project.class.js';

export default class SweetprojectsView {

  element = null;
  items = null;
  inf = null;
  fs = require('fs');
  projectDefs = {};

  constructor(serializedState) {
    var me = this;

    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('sweetprojects');

    /// bar
    var bar = document.createElement('div');
    bar.classList.add('sweetprojects-bar');
    this.element.appendChild(bar);

    var block = document.createElement('div');
    block.classList.add('block');
    bar.appendChild(block);

    var button = document.createElement('button');
    button.classList.add('inline-block-tight');
    button.classList.add('btn');
    button.innerText = 'Refresh';
    button.addEventListener('click', function(){
      me.createItems();
    });
    block.appendChild(button);

    this.inf = document.createElement('div');
    this.inf.classList.add('sweetprojects-bar-info');
    this.inf.innerHTML = 'loading..';
    bar.appendChild(this.inf);

    /// items wrapper
    this.items = document.createElement('div');
    this.items.classList.add('sweetprojects-items');
    this.element.appendChild(this.items);

    // create items from atoms project history
    this.createItems();
  }

  /// NOTE uses always the first path
  createItems(){
    this.clearItems();

    var projects = atom.history.getProjects();
    var paths = [];

    for(var i in projects){
      var historyProject = projects[i];
      var path = historyProject.paths[0];

      /// ignore duplicates (TODO: symlinks)
      if(paths.indexOf(path) > -1)
        continue;

      paths.push(path);

      var project = SweetProject.initializeByHistoryProject(historyProject);

      atom.sweetproject = project;

      this.createItem(project);
    }
  }

  clearItems(){
    this.items.innerHTML = '';
  }

  refreshItem(item){
    var projectId = item.dataset.projectId;
    var project = SweetProject.getById(projectId);
    var newItem = this.createItem(project, true);
    item.replaceWith(newItem);
  }

  createItem(project, returnNode){
    if(returnNode == undefined) returnNode = false;
    var me = this;

    var cPath = atom.project.getDirectories()[0] ? atom.project.getDirectories()[0].path : '';

    var item = document.createElement('div');
    item.classList.add('sweetprojects-item');
    if(!returnNode) this.items.appendChild(item);

    item.dataset.projectId = project.id;
    item.dataset.type = project.hasDef ? 'sweetproject' : 'atom';

    item.dataset.current = (cPath == project.path) ? 'true' : 'false';

    if((cPath == project.path)){
      this.inf.innerHTML = project.name;
      this.inf.title = project.name;
    }

    item.addEventListener('dblclick', function(){
      me.openProjectFromHistory(project.historyProject);
    });

    // @ Cover
    var cover = document.createElement('div');
    cover.classList.add('sweetprojects-item-cover');
    item.appendChild(cover);

    if(project.hasDef){
      var loading = document.createElement('p');
      loading.innerText = 'loading..';
      cover.appendChild(loading);

      var img = document.createElement('img');

      project.getPreviewImg(function(previewImg){
        if(!previewImg){
          loading.innerText = 'no preview';
        }else{
          loading.remove();
          img.src = previewImg;
          cover.appendChild(img);
        }
      });
    }

    // @ caption
    var caption = document.createElement('div');
    caption.classList.add('sweetprojects-item-caption');
    item.appendChild(caption);

    var label = document.createElement('p');
    label.innerHTML = project.name;
    label.title = project.name;
    caption.appendChild(label);

    if(returnNode)
      return item;
  }

  openProjectFromHistory(historyProject){
    var newWindow = atom.config.get('sweetprojects.openInNewWindow') || !atom.project.getDirectories().length;

    atom.open({
      pathsToOpen: historyProject._paths,
      newWindow: newWindow,
      devMode: false
    });
  }

  showProjectInFinder(e){ // TODO
    return false;

    /*
    var me = this;

    var p = e.target;
    var item = null;
    while(p = p.parentNode){
      if(p.classList.contains('sweetprojects-item')){
        item = p;
        break;
      }
    }

    if(item === null) return;

    var projectId = item.dataset.projectId;
    var project = SweetProject.getById(projectId);

    var path = project.path;
    */
  }

  openProjectSettings(e){
    var me = this;

    var p = e.target;
    var item = null;
    while(p = p.parentNode){
      if(p.classList.contains('sweetprojects-item')){
        item = p;
        break;
      }
    }

    if(item === null) return;

    var projectId = item.dataset.projectId;
    let project = SweetProject.getById(projectId);

    var overlay = document.createElement('div');
    overlay.id = "sweetprojects-overlay";
    this.element.appendChild(overlay);
    overlay.addEventListener('click', function(e){
      if(e.target != overlay) return;
      this.remove();
    });

    var popup = document.createElement('div');
    popup.id = 'sweetprojects-popup';
    overlay.appendChild(popup);

    var head = document.createElement('div');
    head.classList.add('sweetprojects-popup-head');
    popup.appendChild(head);

    var title = document.createElement('p');
    title.innerText = 'Project Settings';
    head.appendChild(title);

    var body = document.createElement('div');
    body.classList.add('sweetprojects-popup-body');
    popup.appendChild(body);

    var groups = SweetProject.getInputGroups();

    var tabIndex = 0,
        packageActive = true;
    for(var j in groups){
      let group = groups[j];

      if(!atom.packages.isPackageActive(group.package)){
        console.error('Package [', group.package ,'] not installed or not active');
        packageActive = false;
      }

      var groupelem = document.createElement('div');
      groupelem.classList.add('sweetprojects-popup-body-group');
      if(!packageActive) groupelem.classList.add('sweetprojects-popup-body-group-inactive');
      groupelem.dataset.package = group.package;
      body.appendChild(groupelem);

      var h1 = document.createElement('h1');
      h1.innerText = group.label;
      groupelem.appendChild(h1);

      var groupSwitch = document.createElement('input');
      groupSwitch.type = 'checkbox';
      groupSwitch.classList.add('input-toggle');
      groupSwitch.addEventListener('change', function(e){
        this.parentNode.parentNode.getElementsByClassName('sweetprojects-popup-body-items')[0].style.display = this.checked ? 'block' : 'none';
        project.setValue('sweetprojects', group.package + '--active', this.checked?1:0);
      });
      try{
        groupSwitch.checked = project.getValue('sweetprojects', group.package + '--active');
      }catch(e){
        groupSwitch.checked = false;
      }
      if(group.package == 'sweetprojects') groupSwitch.checked = true;
      h1.appendChild(groupSwitch);

      var groupItemsWrapper = document.createElement('div');
      groupItemsWrapper.classList.add('sweetprojects-popup-body-items');
      groupItemsWrapper.style.display = groupSwitch.checked ? 'block' : 'none';
      groupelem.appendChild(groupItemsWrapper);

      for(var i in group.inputs){
        var input = group.inputs[i];

        var box = document.createElement('div');
        box.classList.add('sweetprojects-popup-body-item');
        //groupelem.appendChild(box);
        groupItemsWrapper.appendChild(box);

        var label = document.createElement('label');
        label.innerText = input.label;
        box.appendChild(label);

        var value = project.getValue(group.package, input.name, input.value);

        var inputelem;
        switch(input.type){
          case 'text': case 'number': case 'checkbox': case 'password':
            inputelem = document.createElement('input');
            inputelem.type = input.type;
            inputelem.value = value;
            if(input.type == 'checkbox'){
              inputelem.checked = (value == 1);
            }else{
              inputelem.value = value;
            }
          break;
          case 'select':
            inputelem = document.createElement('select');
            for(var i in input.options){
              var optionelem = document.createElement('option');
              optionelem.value = input.options[i].value;
              optionelem.innerHTML = input.options[i].label;
              optionelem.selected = (input.options[i].value == value);
              inputelem.appendChild(optionelem);
            }
          break;
        }

        inputelem.classList.add('sweetprojects-popup-input');
        inputelem.classList.add('native-key-bindings');
        inputelem.tabIndex = tabIndex++;
        inputelem.name = group.package + '.' + input.name;
        inputelem.placeholder = input.placeholder;
        inputelem.addEventListener('input', function(){
          /// 1) get values
          var values = {};
          for(var i in group.inputs){
            values[group.inputs[i].name] = group.inputs[i].elem.value;
          }

          /// 2) check conditions against values
          var regex = /^([\w]*)([=<>]{1,2})(.*)$/;
          for(var i in group.inputs){
            if(group.inputs[i].condition){
              var conditionsPassed = false;
              var conditionsOR = group.inputs[i].condition.split('|');

              /// or conditions
              for(var j in conditionsOR){
                var conditionOR = conditionsOR[j];
                var conditionsAND = conditionOR.split('&');

                /// and conditions
                var conditionsANDPassed = true;
                for(var k in conditionsAND){
                  var conditionAND = conditionsAND[k];

                  var match = conditionAND.match(regex);
                  //console.log('CONDITION [and] ', conditionAND, match);

                  switch(match[2]){
                    case '=': conditionsANDPassed = (values[match[1]] == match[3]); break;
                    case '<': conditionsANDPassed = (values[match[1]] < match[3]); break;
                    case '>': conditionsANDPassed = (values[match[1]] > match[3]); break;
                    case '<=': conditionsANDPassed = (values[match[1]] <= match[3]); break;
                    case '>=': conditionsANDPassed = (values[match[1]] >= match[3]); break;
                    case '<>': conditionsANDPassed = (values[match[1]] != match[3]); break;
                  }

                  /// leave and conditions as soon as one fails
                  if(!conditionsANDPassed) break;
                }

                /// leave or conditions as soon as one passes
                if(conditionsANDPassed){
                  conditionsPassed = true;
                  break;
                }
              }

              /// display the field when condition is fullfilled
              group.inputs[i].elem.parentNode.style.display = conditionsPassed ? 'block' : 'none';

            }
          }
        });

        box.appendChild(inputelem);

        input.elem = inputelem;
      }

    }

    /// first time check input conditions
    var inputEvent = new Event('input', {'bubbles': true, 'cancelable': true});
    for(var j in groups){
      for(var i in groups[j].inputs){
        groups[j].inputs[i].elem.dispatchEvent(inputEvent);
      }
    }

    var foot = document.createElement('div');
    foot.classList.add('sweetprojects-popup-foot');
    popup.appendChild(foot);

    var button = document.createElement('button');
    button.innerText = 'Remove Settings';
    button.disabled = !project.hasDef;
    button.style.cssFloat = 'left';
    button.addEventListener('click', function(e){
      project.reset();
      me.refreshItem(item);
      overlay.remove();
    });
    foot.appendChild(button);

    button = document.createElement('button');
    button.innerText = 'Save';
    button.addEventListener('click', function(e){
      /// get values from frm
      var values = {};
      for(var j in groups){
        for(var i in groups[j].inputs){
          var input = groups[j].inputs[i];
          if(input.type == 'checkbox'){
            values[groups[j].package + '.' + input.name] = input.elem.checked;
          }else{
            values[groups[j].package + '.' + input.name] = input.elem.value;
          }
        }
      }

      // console.log('save values: ', values);

      /// set build in values
      project.url = values['sweetprojects.url'];
      project.name = values['sweetprojects.name'];

      /// set other values
      for(var identifier in values){
        var [namespace, key] = identifier.split('.');

        project.setValue(namespace, key, values[identifier], false);
      }

      /// save project settings and close popup
      project.saveDef(function(){
        overlay.remove();
        me.refreshItem(item);
      });
    });
    foot.appendChild(button);

    button = document.createElement('button');
    button.innerText = 'Cancel';
    button.addEventListener('click', function(e){
      overlay.remove();
    });
    foot.appendChild(button);

  }

  // Returns an object that can be retrieved when package is activated
  // -> deactivated for debugging
/*  serialize() {
    return {
      deserializer: 'sweetprojects/SweetprojectsView'
    };
  }
*/

  // Tear down any state and detach
  destroy() {
    this.element.remove();
    //this.subscriptions.dispose();
  }

  getElement() {
    return this.element;
  }

  getTitle() {
    // Used by Atom for tab text
    return 'Sweet Projects Manager';
  }

  getURI() {
    // Used by Atom to identify the view when toggling.
    return 'atom://sweetprojects';
  }

  getDefaultLocation() {
    // This location will be used if the user hasn't overridden it by dragging the item elsewhere.
    // Valid values are "left", "right", "bottom", and "center" (the default).
    return 'center';
  }

  getAllowedLocations() {
    // The locations into which the item can be moved.
    return ['left', 'right', 'bottom', 'center'];
  }

}
