'use babel'

import { CompositeDisposable, Disposable, Emitter } from 'atom'

function parseEventProperties ({ target, type, timeStamp }) {

  let { charging, chargingTime, dischargingTime, level } = target
  let timeUntilEnd = charging ? chargingTime : dischargingTime

  return {
    level,
    charging,
    timeUntilEnd,
    details: { type, timeStamp, },
  }
}

function bindDisposableEvent (name, handler) {
  let dispatch  = (event) => handler.call(this, event)
  let dispose = new Disposable(
    () => this.removeEventListener(name, dispatch))
  this.addEventListener(name, dispatch)
  return dispose
}

export default class BatteryManager extends Emitter {

  constructor () {

    super ()

    document.querySelectorAll('.power-bar').forEach(bar => bar.remove())
    this.subscriptions = new CompositeDisposable()

    this.tooltip = new Disposable(() => {})
    const init = () =>
      navigator
      .getBattery()
      .then(mgr => {

      this.battery = mgr
      this.emit('change', {})
      let callback = (event) => this.emit('change', parseEventProperties(event))
      this.subscriptions.add(bindDisposableEvent.call(this.battery, 'levelchange', callback))
    })
    console.log({thiss:this,navigator}) // FIXME: Remove

    if (window.navigator)
      init()

    this.on('change', ({ level }) => {
      if (this.level === 0)
        setTimeout(() => init(), 1000)
      let el = document.querySelector('.power-bar')
      let title = this.toString()
      el.classList.add('tooltip.enabled-lol')
      this.tooltip.dispose()
      this.tooltip = atom.tooltips.add(el, { title, trigger: 'hover'})
    })
  }

  static get EVENT () { return {
    LEVEL_CHANGE:             'levelchange',
    CHARGING_TIME_CHANGE:     'chargingtimechange',
    DISCHARGING_TIME_CHANGE:  'dischargingtimechange',
   }
 }

  get time () {
    return this.battery ?
    this.battery.charging ?
    this.battery.chargingTime :
    this.battery.dischargingTime : Infinity }
  get charging () { return this.battery ? this.battery.charging : false }
  get level () { return this.battery ? this.battery.level : 0 }

  toString () {
    let level = this.level * 100
    return level.toString() + '%'
  }

  destroy () {
    this.subscriptions.dispose()
    this.tooltip.dispose()
  }

}


export const getProxiedManager = () => {

  let manager = new BatteryManager()
  let proxy = new Proxy(
    manager, {
      get: (obj, key) => obj[key]
  })
  return proxy
}
