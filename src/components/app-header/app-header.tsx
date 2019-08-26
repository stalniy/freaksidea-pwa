import { Component, h, Host } from '@stencil/core';
import i18n from 'i18next';
import { topMenu } from '../../config/routes'

@Component({
  tag: 'app-header',
  styleUrl: 'app-header.css',
  shadow: true,
})
export class AppHeader {
  private items = topMenu

  render() {
    return (
      <Host>
        <nav>
          {this.items.map(item => <stencil-route-link url={item.url}>{i18n.t(`topMenu.${item.name}`)}</stencil-route-link>)}
        </nav>
        <header>
          <a href="/" class="logo"></a>
          <a href="/" class="slogan">
            <img src="/assets/slogan.jpg" />
          </a>
          {/* <app-menu></app-menu> */}
        </header>      
      </Host>
    );
  }
}



// <?php
// $basePath   = url_for('@homepage');
// $identifier = isset($sj_menu_item['fullpath']) && strpos($basePath . $sf_request->getPathInfo(), $sj_menu_item['fullpath']) !== false
//     ? $sj_menu_item['path'] . $sj_menu_item['href']
//     : 'general';
// ?>
// <div id="top-menu">
//     <a href="<?php echo $basePath ?>/format-rss" class="s-item">RSS</a>
//     <?php foreach ($sf_user->getMenu('topmenu') as $item): ?>
//     <a <?php if(!$item['is_disabled']): ?>href="<?php echo $basePath, $item['fullpath'] ?>"<?php endif?>><?php echo $item['title'] ?></a>
//     <?php endforeach ?>
// </div>
// <div id="header">
//     <a href="<?php echo $basePath ? $basePath : '/' ?>" id="slogan"></a>
//     <a href="<?php echo $basePath ? $basePath : '/' ?>" id="logo"></a>
//     <?php include_partial('global/menu', array('sf_cache_key' => md5('top_menu_' . $sf_user->getCulture() . $identifier))) ?>
// </div>
