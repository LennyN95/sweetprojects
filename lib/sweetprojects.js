'use babel';

import SweetprojectsView from './sweetprojects-view';
import {CompositeDisposable, Disposable} from 'atom';

export default {

  subscriptions: null,

  activate(state) {
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

      // Destroy any ActiveEditorInfoViews when the package is deactivated.
      new Disposable(() => {
        atom.workspace.getPaneItems().forEach(item => {
          if (item instanceof SweetprojectsView) {
            item.destroy();
          }
        });
      })
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  /*serialize() {
    return {
      sweetprojectsViewState: this.sweetprojectsView.serialize()
    };
  },*/

  toggle() {
    atom.workspace.toggle('atom://sweetprojects');
  },

  deserializeSweetprojectsView() {
    return new SweetprojectsView();
  }

};
