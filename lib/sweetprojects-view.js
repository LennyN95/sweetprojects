'use babel';

export default class SweetprojectsView {

  element = null;
  items = null;
  fs = require('fs');

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
  //  this.createItems();

  }

  createItems(){
    var fs = this.fs;
    this.clearItems();

    var projects = atom.history.getProjects();

    for(var i in projects){
      var historyProject = projects[i];
      var path = historyProject._paths[0];
      var defPath = path + '/' + '.sweetproject';
      var sweetProjectDef = null;

      try{
        var contents = fs.readFileSync(defPath);
        sweetProjectDef = JSON.parse(contents);
      }catch(e){
        //console.log('ERROR: ', e);
      }

      //console.log('Project: ', project);

      /// use last folder from first path as default name
      var projectDef = {
        name: path.split('/').slice(-1)[0],
        light: true,
        historyProject: historyProject,
        sweetProjectDef: null,
        previewImg: false
      };

      if(sweetProjectDef !== null){
        projectDef.name = sweetProjectDef.name || 'no-name';
        projectDef.light = false;
        projectDef.sweetProjectDef = sweetProjectDef;
        projectDef.previewImg = sweetProjectDef.previewImg;

        /// experimental
        sweetProjectDef.path = defPath;
      }


      this.createItem(projectDef);
    }
  }

  getProjectPreviewImg(sweetProjectDef, callback){

    if(sweetProjectDef.url && sweetProjectDef.url.length && !sweetProjectDef.previewImg){
      var webshot = require('node-webshot');
      var renderStream = webshot(sweetProjectDef.url);
      var chunks = [];
      renderStream.on('data', function(chunk) {
        chunks.push(chunk);
      });
      renderStream.on('end', function() {
        var result = Buffer.concat(chunks);
        var imgsrc = 'data:image/png;base64,' + result.toString('base64');
        var fs = require('fs');
        sweetProjectDef.previewImg = imgsrc;
        fs.writeFile(sweetProjectDef.path, JSON.stringify(sweetProjectDef), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved to " + sweetProjectDef.path);

            callback(sweetProjectDef.previewImg);
        });
      });
    }else if(sweetProjectDef.previewImg){
      callback(sweetProjectDef.previewImg);
    }else{
      callback(false);
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

    // @ Cover

    var cover = document.createElement('div');
    cover.classList.add('sweetprojects-item-cover');
    item.appendChild(cover);

    if(!projectDef.light){
      var loading = document.createElement('p');
      loading.innerText = 'loading..';
      cover.appendChild(loading);

      var img = document.createElement('img');

      this.getProjectPreviewImg(projectDef.sweetProjectDef, function(previewImg){
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
