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

  /// NOTE uses always the first path
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

    var cPath = atom.project.getDirectories()[0].path;

    var item = document.createElement('div');
    item.classList.add('sweetprojects-item');
    if(!returnNode) this.items.appendChild(item);

    //var itemID = this.guid();
    //this.projectDefs[itemID] = projectDef;
    item.dataset.projectId = project.id;
    item.dataset.type = project.hasDef ? 'sweetproject' : 'atom';

    item.dataset.current = (cPath == project.path) ? 'true' : 'false';

    if((cPath == project.path)){
      this.inf.innerHTML = project.name;
      this.inf.title = project.name;
    }

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

  showProjectInFinder(e){ // TODO
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
      var values = {};
      for(var i in inputs){
        var input = inputs[i];
        values[input.name] = input.elem.value;
      }

      project.url = values.url;
      project.name = values.name;
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
  serialize() {
    return {
      deserializer: 'sweetprojects/SweetprojectsView'
    };
  }

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
