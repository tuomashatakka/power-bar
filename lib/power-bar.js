'use babel';

import PowerBarView from './power-bar-view';
import PowerState from './power-state'
import { CompositeDisposable, Disposable } from 'atom';

let _cached_pos
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
    let { registerCommands, updateConfig } = this
    let updatePanel = (pos) => this.updatePanelPosition.call(this, pos)

    this.state = new PowerState(state)
    this.view = new PowerBarView(this.state)
    updatePanel()

    let config = atom.config.observe('power-bar', (...a) => updateConfig.call(this, updatePanel, ...a))
    this.state.emit('change', {})
    _cached_pos = 'header'

    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(config)
    this.subscriptions.add(removeView.call(this))
    this.subscriptions.add(registerCommands.call(this))

  },

  updatePanelPosition (pos='header') {
    let item = this.view.getElement()

    if (this.panel)
      this.panel.destroy()

    document
      .querySelectorAll('.battery-panel')
      .forEach(el => el.remove())

    this.panel = atom.workspace.addPanel(pos, {
      item,
      className: 'battery-panel',
      visible: true })
  },

  registerCommands () {

    let context = 'atom-workspace'
    let commands = {}

    for (let command in this.commands) {
      let action = this.commands[command]
      commands[command] = () => this[action]()
    }
    return atom.commands.add(context, commands)
  },

  updateConfig (updatePanel, conf) {
    let c = (key) => conf.colors[key].toJSON()
    let gradient = () => `
      linear-gradient(84deg,
      ${c('low')} 0,
      ${c('mid')} 5vw,
      ${c('main')} 40vw,
      ${c('high')} 100vw
      )`


    if (conf.position !== _cached_pos)
      updatePanel(conf.position)
    _cached_pos = conf.position

    if (conf.visible)
      this.panel.show()
    else
      this.panel.hide()

    if (conf['label-visible'])
      this.view.showLevelLabel()
    else
      this.view.hideLevelLabel()


    this.view.element.style
      .setProperty('height', conf.height + 'px')

    this.view.element.querySelector('output').style
      .setProperty('background', gradient())
  },

  deactivate() {
    this.panel.destroy()
    this.subscriptions.dispose()
  },

  serialize() {
    return {
      powerBarViewState: this.view.serialize()
    };
  },

  toggle() {
    atom.config.set('power-bar.visible', !this.panel.isVisible())
  },

  toggleLevel () {
    atom.config.set('power-bar.label-visible', !this.view.levelLabelVisible())
  }

}
