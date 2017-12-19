'use babel';

export default class SweetProject {

  static cacheProject(project){
    if(this.cache === undefined) this.cache = {};
    this.cache[project.id] = project;
  }

  static getById(id){
    var project = this.cache[id] || null;
    return project;
  }

  constructor(historyProject) {
    this._historyProject = historyProject;
    this._id = this.guid();

    this._path = historyProject._paths[0];
    this._def = this.readDef();

    this._name = (this._def !== null)
                    ? this._def.name
                    : this._path.split('/').splice(-1)[0];

    this._url = (this._def !== null)
                    ? this._def.url
                    : '';

    this._previewImg = (this._def !== null)
                    ? this._def.previewImg
                    : null;

    // cache
    //SweetProject.cacheProject(this);
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

    var json = {
      id: this._id,
      name: this._name,
      url: this._url,
      previewImg: this._previewImg
    };

    fs.writeFile(defPath, JSON.stringify(json), function(err) {
        if(err)
            return console.log(err);

        console.log("The file was saved to " + me._path);

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

  get historyProject(){
    return this._historyProject;
  }

  sayHello() {
    console.log('Hello, my name is ' + this.name + ', I have ID: ' + this.id);
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
