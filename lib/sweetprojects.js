'use babel';

import SweetprojectsView from './sweetprojects-view';
import { CompositeDisposable } from 'atom';

export default {

  sweetprojectsView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.sweetprojectsView = new SweetprojectsView(state.sweetprojectsViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.sweetprojectsView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'sweetprojects:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.sweetprojectsView.destroy();
  },

  serialize() {
    return {
      sweetprojectsViewState: this.sweetprojectsView.serialize()
    };
  },

  toggle() {
    console.log('Sweetprojects was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
