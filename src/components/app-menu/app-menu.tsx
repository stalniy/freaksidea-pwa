import { Component, h } from '@stencil/core';
import i18n from 'i18next';
import { categories } from '../../config/routes'

@Component({
  tag: 'app-menu',
  styleUrl: 'app-menu.css',
  shadow: true,
})
export class AppMenu {
  render() {
    return (
      <nav 
        role="navigation" 
        itemscope 
        itemtype="http://schema.org/SiteNavigationElement"
      >
        {this.renderLinks(categories, 'categories')}
      </nav>
    )
  }

  private renderLinks(items, scope) {
    return items.map(item => 
      <stencil-route-link itemprop="url" url={item.url}>
        {i18n.t(`${scope}.${item.name}.title`)}
      </stencil-route-link>
    )
  }
}