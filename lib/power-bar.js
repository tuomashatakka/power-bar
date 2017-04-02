'use babel';

import PowerBarView from './power-bar-view';
import PowerState from './power-state'
import { CompositeDisposable, Disposable } from 'atom';

export default {

  view: null,
  panel: null,
  state: null,
  subscriptions: null,
  commands: {
    'power-bar:toggle': 'toggle',
    'power-bar:display-numeral-level': 'toggleLevel',
  },

  activate(state) {

    let remove = (prop) => new Disposable(() => this[prop].destroy())
    let removeView = () => remove('view')
    let removePanel = () => remove('panel')
    let { registerCommands, updateConfig } = this

    this.state = new PowerState(state)
    this.view = new PowerBarView(this.state)
    let item = this.view.getElement()
    this.panel = atom.workspace.addHeaderPanel({ item, visible: true })
    let config = atom.config.observe('power-bar', (...a) => updateConfig.call(this.view, ...a))

    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(config)
    this.subscriptions.add(removeView())
    this.subscriptions.add(removePanel())
    this.subscriptions.add(registerCommands())

  },

  registerCommands () {
    let context = 'atom-workspace'
    console.log(this.commands)
    let commands = {}
    for (let command in this.commands) {
      let action = this.commands[command]
      commands[command] = () => this[action]()

    }
    console.log(commands) // FIXME: Remove

    return atom.commands.add(context, commands)
  },

  updateConfig (conf) {
    let c = (key) => conf.colors[key].toJSON()
    let gradient = () => `
      linear-gradient(90deg,
      ${c('low')} 0,
      ${c('mid')} 5vw,
      ${c('main')} 40vw,
      ${c('high')} 100vw
      )`

    this.element.style
      .setProperty('height', conf.height + 'px')

    this.element.querySelector('output').style
      .setProperty('background', gradient())
  },

  deactivate() {
    this.subscriptions.dispose()
  },

  serialize() {
    return {
      powerBarViewState: this.view.serialize()
    };
  },

  toggle() {
    return this.panel.isVisible() ?
           this.panel.hide() :
           this.panel.show()
  },

  toggleLevel () {
    return this.view.levelLabelVisible() ?
           this.view.hideLevelLabel() :
           this.view.showLevelLabel()
  }

}
