import { Component, h, Host } from '@stencil/core';
import i18n from 'i18next'

@Component({
  tag: 'app-footer',
  styleUrl: 'app-footer.css',
  shadow: true,
})
export class AppCategory {
  render() {
    return (
      <Host>
        <span class="copyright">{i18n.t('copyright', { year: new Date().getFullYear() })}</span>
        <div class="counters"></div>
      </Host>
    )
  }
}
