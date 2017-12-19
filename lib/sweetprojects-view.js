'use babel';

export default class SweetprojectsView {

  element = null;
  items = null;

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('sweetprojects');

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

    for(var i in projects){
      var historyProject = projects[i];

      //console.log('Project: ', project);

      /// use last folder from first path as default name
      var projectDef = {
        name: historyProject._paths[0].split('/').slice(-1)[0],
        light: i > 4,
        historyProject: historyProject
      };

      this.createItem(projectDef);
    }
  }

  clearItems(){
    this.items.innerHTML = '';
  }

  createItem(projectDef){
    var me = this;

    var item = document.createElement('div');
    item.classList.add('sweetprojects-item');
    this.items.appendChild(item);

    item.addEventListener('dblclick', function(){
      //console.log(me, projectDef);
      me.openProjectFromHistory(projectDef.historyProject);
    });

    if(projectDef.light){
      item.dataset.type = "light";
    }

    var cover = document.createElement('div');
    cover.classList.add('sweetprojects-item-cover');
    item.appendChild(cover);

    var caption = document.createElement('div');
    caption.classList.add('sweetprojects-item-caption');
    item.appendChild(caption);

    var label = document.createElement('p');
    label.innerHTML = projectDef.name;
    label.title = projectDef.name;
    caption.appendChild(label);


  }

  openProjectFromHistory(historyProject){
    atom.open({
      pathsToOpen: historyProject._paths,
      newWindow: true,
      devMode: false
    });
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {
    return {
      // This is used to look up the deserializer function. It can be any string, but it needs to be
      // unique across all packages!
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
