'use babel';

export default class PowerBarView {

  constructor(battery) {
    // Create root element
    this.element = document.createElement('div')
    this.element.classList.add('power-bar')

    // Create message element
    const message   = document.createElement('div')
    const bar       = document.createElement('output')
    const label     = document.createElement('article')

    this.element.appendChild(bar)
    this.element.appendChild(label)
    this.element.classList.add('level-display')
    bar.classList.add('battery-level')
    label.classList.add('battery-level-label')

    this.hideLevelLabel = () => label.classList.add('hidden')
    this.showLevelLabel = () => label.classList.remove('hidden')
    this.levelLabelVisible = () => !label.classList.contains('hidden')

    battery.on('change', ({ charging }) => {
      console.warn("batt on change_>", battery.toString(), charging, battery)
      bar.style.setProperty('width', battery.toString())
      label.textContent = battery.toString()
      this.element.classList.toggle('charging', charging)
    })

  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove()
  }

  getElement() {
    return this.element
  }

  hideLabel () {
    this.levelLabelVisible = false
  }

  showLabel () {
    this.levelLabelVisible = true
  }

}
