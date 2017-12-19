'use babel';

import SweetProject from './project.class.js';

export default class SweetprojectsView {

  element = null;
  items = null;
  fs = require('fs');
  projectDefs = {};

  constructor(serializedState) {
    var me = this;

    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('sweetprojects');

    /// dev
    var button = document.createElement('button');
    button.innerText = 'load items';
    button.addEventListener('click', function(){
      me.createItems();
    });
    this.element.appendChild(button);

    /// items wrapper
    this.items = document.createElement('div');
    this.items.classList.add('sweetprojects-items');
    this.element.appendChild(this.items);

    // Create message element
    /*
    const message = document.createElement('div');
    message.textContent = 'The Sweetprojects package is Alive! It\'s ALIVE!';
    message.classList.add('message');
    this.element.appendChild(message);
    */

    // create items from atoms project history
    this.createItems();

  }

  createItems(){
    this.clearItems();

    var projects = atom.history.getProjects();
    var paths = [];

    for(var i in projects){
      var historyProject = projects[i];
      var path = historyProject._paths[0];

      if(paths.indexOf(path) > -1)
        continue;

      paths.push(path);

      var project = new SweetProject(historyProject);
      SweetProject.cacheProject(project);

      //console.log('NEW SWEET PROJECT INSTANCE: ', project);

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

    var item = document.createElement('div');
    item.classList.add('sweetprojects-item');
    if(!returnNode) this.items.appendChild(item);

    //var itemID = this.guid();
    //this.projectDefs[itemID] = projectDef;
    item.dataset.projectId = project.id;
    item.dataset.type = project.hasDef ? 'sweetproject' : 'atom';

    item.addEventListener('dblclick', function(){
      //console.log(me, projectDef);
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
    atom.open({
      pathsToOpen: historyProject._paths,
      newWindow: true,
      devMode: false
    });
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
    var project = SweetProject.getById(projectId);

    console.log('item (projectId): ', projectId);
    console.log('project: ', project);

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

    var inputs = [
      {name: 'name', label: 'Name', value: project.name, placeholder: 'Projektname', type: 'text'},
      {name: 'url', label: 'URL', value: project.url, placeholder: 'https://my-domain.de/', type: 'text'}
    ];

    for(var i in inputs){
      var input = inputs[i];

      var box = document.createElement('div');
      body.appendChild(box);

      var label = document.createElement('label');
      label.innerText = input.label;
      box.appendChild(label);

      var inputelem = document.createElement('input');
      inputelem.classList.add('sweetprojects-popup-input');
      inputelem.classList.add('native-key-bindings');
      inputelem.type = input.type;
      inputelem.name = input.name;
      inputelem.value = input.value;
      inputelem.placeholder = input.placeholder;
      box.appendChild(inputelem);

      input.elem = inputelem;
    }


    var foot = document.createElement('div');
    foot.classList.add('sweetprojects-popup-foot');
    popup.appendChild(foot);

    var button = document.createElement('button');
    button.innerText = 'Save';
    button.addEventListener('click', function(e){
      var values = {};
      for(var i in inputs){
        var input = inputs[i];
        values[input.name] = input.elem.value;
      }

      project.url = values.url;
      project.name = values.name;
      project.saveDef(function(){
        console.log('VALUES Saved: ', values);
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
  /* deactivated for debugging
    serialize() {
    return {
      // This is used to look up the deserializer function. It can be any string, but it needs to be
      // unique across all packages!
      deserializer: 'sweetprojects/SweetprojectsView'
    };
  }*/

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
