'use babel';

import SweetProject from './project.class.js';

export default class SweetProjectsManager {

  _namespace = null;
  _project = null;

  constructor(namespace){

    /// get current project
    var path = atom.project.getDirectories()[0].path;
    this._project = new SweetProject([path]);

    this._namespace = namespace;

  }

  get project(){
    return this._project;
  }

  get namespace(){
    return this._namespace;
  }

  set options(options){
    var fs = require('fs'),
        cjsonPath = atom.config.configDirPath + '/sweetprojects.cjson',
        cjson = null;

    /// load cjson
    try{
      var fs = require('fs');
      var contents = fs.readFileSync(cjsonPath);
      cjson = JSON.parse(contents);
    }catch(e){
      cjson = {};
    }

    /// set options in ns
    if(cjson[this._namespace] == undefined)
      cjson[this._namespace] = {};

    cjson[this._namespace]['options'] = options;

    /// wirte cjson
    fs.writeFile(cjsonPath, JSON.stringify(cjson), function(err) {
        if(err)
            return console.log(err);

        //console.log("The file was saved to " + me._path);

        //me._def = json;

        //if(typeof callback == 'function')
        //  callback()
    });

  }

  readCJSON(){

  }

  writeCJSON(){

  }





};
