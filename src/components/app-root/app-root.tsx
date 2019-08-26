import { Component, h, State, Host } from '@stencil/core';
import i18n from 'i18next'
import { topMenu, categories } from '../../config/routes'

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
})
export class AppRoot {
  @State() lang = document.documentElement.getAttribute('lang')

  async componentWillLoad() {
    const translation = await import('../../content/app.uk.json')
    await i18n.init({
      lng: this.lang,
      debug: process.env.NODE_ENV === 'development',
      interpolation: {
        prefix: '#{',
        suffix: '}'
      },
      resources: { 
        [this.lang]: { translation }
      }
    })
  }

  render() {
    return (
      <Host>
        <app-header></app-header>
        <app-menu></app-menu>
        <main>
          <stencil-router>
            <stencil-route-switch scrollTopOffset={0}>
              <stencil-route 
                url="/" 
                component="app-category" 
                componentProps={{ category: categories[0] }}
                exact={true}
              />
              {topMenu.map(item => 
                <stencil-route
                  url={item.url}
                  component="app-page"
                  componentProps={{ name: item.name }}
                />
              )}
              <stencil-route 
                url="/:category" 
                component="app-category"
              />
            </stencil-route-switch>
          </stencil-router>
        </main>   
        <app-footer></app-footer>     
      </Host>
    );
  }
}
