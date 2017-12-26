'use babel';

import SweetprojectsView from './sweetprojects-view';
import SweetProject from './project.class.js';
import {CompositeDisposable, Disposable} from 'atom';

export default {

  subscriptions: null,

  activate(state) {
    /// subscriptions
    this.subscriptions = new CompositeDisposable(
      // Add an opener for our view.
      atom.workspace.addOpener(uri => {
        if (uri === 'atom://sweetprojects') {
          return new SweetprojectsView();
        }
      }),

      // Register command that toggles this view
      atom.commands.add('atom-workspace', {
        'sweetprojects:toggle': () => this.toggle()
      }),

      atom.commands.add('atom-workspace', {
        'sweetprojects:projectsettings': (e) => this.openSettings(e),
        'sweetprojects:openprojectinfinder': (e) => this.openInFinder(e)
      }),

      // Destroy any ActiveEditorInfoViews when the package is deactivated.
      new Disposable(() => {
        atom.workspace.getPaneItems().forEach(item => {
          if (item instanceof SweetprojectsView) {
            item.destroy();
          }
        });
      })
    );

    /// 'register' sweetprojects API
    atom.sweetprojects = {
      getActiveProject: function(){
        console.error('method not available :(');
      },
      setInputs: function(namespace, json){
        SweetProject.bindInputGroup(namespace, json);
      },
      removeInputs: function(namespace){
        SweetProject.unbindInputGroup(namespace);
      },
      getValue: function(namespace, key){
        var aproject = SweetProject.getActiveProject();
        return aproject.getValue(namespace, key);
      },
      setValue: function(namespace, key, value){
        console.error('method not available :(');
      },
      isActive: function(namespace){
        return this.getValue('sweetprojects', namespace + '--active');
      }
    };

    /// detect 'no project'
    if(atom.config.get('sweetprojects.openBrowserForEmptyWindows') && !atom.project.getDirectories().length){
      this.toggle();
    }
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  /*serialize() {
    return {
      sweetprojectsViewState: this.sweetprojectsView.serialize()
    };
  },*/

  openSettings(e){
    var apane = atom.workspace.getActivePane();
    var aitem = apane.getActiveItem();

    if(aitem instanceof SweetprojectsView){
      aitem.openProjectSettings(e);
    }
  },

  openInFinder(e){
    var apane = atom.workspace.getActivePane();
    var aitem = apane.getActiveItem();

    if(aitem instanceof SweetprojectsView){
      aitem.showProjectInFinder(e);
    }
  },

  toggle() {
    atom.workspace.toggle('atom://sweetprojects');
  },

  deserializeSweetprojectsView() {
    return new SweetprojectsView();
  },

  config: {
    "openBrowserForEmptyWindows": {
      "description": "In new windows without a project loaded open the project browser automatically.",
      "type": "boolean",
      "default": "true"
    },
    "openInNewWindow": {
      "description": "A double click on a project tile in the project browser opens the project in a new window.",
      "type": "boolean",
      "default": "true"
    }
  }

};
