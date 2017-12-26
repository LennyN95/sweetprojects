'use babel';

export default class SweetProject {

  static cacheProject(project){
    if(this.cache === undefined) this.cache = {};
    this.cache[project.id] = project;
    //console.log('>> Cached [',project.id,']');
  }

  static getById(id){
    var project = this.cache[id] || null;
    //console.log('>> Got from cache [',project.id,']');
    return project;
  }

  static initializeByHistoryProject(historyProject){
    var paths = historyProject.paths;
    var project = new SweetProject(paths);
    project.historyProject = historyProject;
    return project;
  }

  static getActiveProject(){

    if(this.activeProjectId !== undefined)
      return SweetProject.getById(this.activeProjectId);

    var path = atom.project.getDirectories()[0].path;
    var project = new SweetProject([path]);
    this.activeProjectId = project.id;

    return project;
  }

  static bindInputGroup(namespace, json){
    if(this.groups === undefined)
      this.groups = [];

    if(!json.package || json.package != namespace)
      return false;

    //if(!atom.packages.isPackageActive(namespace)){
    //  console.error('Package [', namespace ,'] not installed or not active');
    //  return false;
    //}

    this.groups.push(json);
  }

  static unbindInputGroup(namespace){
    if(this.groups === undefined) return false;
    for(var i in this.groups){
      if(this.groups[i].package == namespace){
        delete this.groups[i];
        break;
      }
    }
    return true;
  }

  static getInputGroups(){

    if(this.groups === undefined)
      this.groups = [];

    var groups = [{
      package: 'sweetprojects',
      label: 'General',
      inputs: [
        {name: 'name', label: 'Name', value: '', placeholder: 'Projektname', type: 'text'},
        {name: 'url', label: 'URL', value: '', placeholder: 'https://www.my-domain.de/', type: 'text'}
      ]
    }];

    groups = groups.concat(this.groups);

    return groups;

    /*
    if(this.groups !== undefined){
      return this.groups;
    }

    const fs = require('fs');
    const dir = atom.config.configDirPath;

    var groups = [{
      package: 'sweetprojects',
      label: 'General',
      inputs: [
        {name: 'name', label: 'Name', value: '', placeholder: 'Projektname', type: 'text'},
        {name: 'url', label: 'URL', value: '', placeholder: 'https://www.my-domain.de/', type: 'text'}
      ]
    }];

    var files = fs.readdirSync(dir);
    files.forEach(function(file){
      if(file.split('.').splice(-1)[0] == 'sweetprojects'){
        try{
          var contents = fs.readFileSync(dir + '/' + file);
          var groupDef = JSON.parse(contents);

          groups.push(groupDef);
        }catch(e){
          console.error(e);
        }
      }
    });

    this.groups = groups;

    return groups;
    */
  }

  constructor(paths) {
    //this._historyProject = historyProject;
    this._historyProject = null;
    this._id = this.guid();

    this._paths =  paths;
    this._path = paths[0];
    this._def = this.readDef();

    /// prepare def
    //if(this._def === null) // this._def has to be null as long as no def is set for this project
    //  this._def = {sweetprojects:{}};

    if(this._def !== null && this._def.sweetprojects == undefined)
      this._def.sweetprojects = {};

    this._mydef = (this._def !== null && this._def.sweetprojects)
                    ? this._def.sweetprojects
                    : null;

    this._name = (this._mydef !== null && this._mydef.name)
                    ? this._mydef.name
                    : this._path.split('/').splice(-1)[0];

    this._url = (this._mydef !== null && this._mydef.url)
                    ? this._mydef.url
                    : '';

    this._previewImg = (this._mydef !== null && this._mydef.previewImg)
                    ? this._mydef.previewImg
                    : null;

    // cache
    SweetProject.cacheProject(this);
  }

  get hasDef() {
    return this._def !== null;
  }


  readDef(){  // synchroneous
    var defPath = this._path + '/.sweetproject',
        sweetProjectDef = null;
    try{
      var fs = require('fs');
      var contents = fs.readFileSync(defPath);
      sweetProjectDef = JSON.parse(contents);
    }catch(e){

    }
    return sweetProjectDef;
  }

  saveDef(callback){
    var me = this,
        defPath = this._path + '/.sweetproject',
        fs = require('fs');

    var json = this._def || {}; // this._def can be null if no def set yet
    var myjson = this._mydef || {};
    myjson.id = this._id;
    myjson.name = this._name;
    myjson.url = this._url;
    myjson.paths = this._paths;
    myjson.previewImg = this._previewImg;

    json.sweetprojects = myjson; // json.sweetprojects == null

    fs.writeFile(defPath, JSON.stringify(json), function(err) {
        if(err)
            return console.log(err);

        //console.log("The file was saved to " + me._path, json);

        me._def = json;
        me._mydef =json.sweetprojects;

        if(typeof callback == 'function')
          callback()
    });
  }

  get id(){
    return this._id;
  }

  get name(){
    return this._name;
  }

  set name(name){
    this._name = name;
  }

  get url(){
    return this._url;
  }

  set url(url){

    if(url != this._url){
      this._previewImg = null;
    }

    this._url = url;
  }

  /// set value api
  /// callback not supported
  setValue(namespace, key, value, save, callback){
    if(save === undefined)
      save = false;

    if(this._def === null)
      this._def = {};

    if(!this._def[namespace])
      this._def[namespace] = {};

    /// 'typecasting' for file format
    if(value === true) value = 1;
    if(value === false) value = 0;

    this._def[namespace][key] = value;

    if(save)
      this.saveDef(callback);

  }

  /// refresh / callback not supported
  getValue(namespace, key, defaultValue){

    if(defaultValue == undefined) defaultValue = '';

    try{
      var value = this._def[namespace][key];
      return value === undefined ? defaultValue : value;
    }catch(e){
      //console.error('error in getValue: ', e);
      return defaultValue;
    }

  }

  getPreviewImg(callback){
    var me = this;
    if(this._url.length && !this._previewImg){
      var webshot = require('node-webshot');
      var renderStream = webshot(this._url);
      var chunks = [];
      renderStream.on('data', function(chunk) {
        chunks.push(chunk);
      });
      renderStream.on('end', function() {
        var result = Buffer.concat(chunks);
        var imgsrc = 'data:image/png;base64,' + result.toString('base64');

        me._previewImg = imgsrc;

        me.saveDef(function(){
            callback(imgsrc);
        });

      });
    }else if(this._previewImg){
      callback(this._previewImg);
    }else{
      callback(false);
    }
  }

  set historyProject(historyProject){
    if(this._historyProject !== null) return false;
    this._historyProject = historyProject;
  }

  get historyProject(){
    return this._historyProject;
  }

  /// FIXME: support multiple files, eg. hash them?
  get path(){
    return this._path;
  }

  /// FIXME: support multiple paths, eg hash them?
  get paths(){
    return [this._path];
  }

  reset(){
    var defPath = this._path + '/.sweetproject',
        fs = require('fs');
    fs.unlinkSync(defPath);
    this._def = null;
    this._name = this._path.split('/').splice(-1)[0]
  }

  guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }
}
