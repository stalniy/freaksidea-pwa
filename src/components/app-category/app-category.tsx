import { Component, h, Prop, Host, Watch, State } from '@stencil/core';
import { ArticleSummary } from './article-summary';
import mapping from 'articles.mapping'

@Component({
  tag: 'app-category',
  styleUrl: 'app-category.css',
}) 
export class AppCategory {
  @Prop() category: any
  @State() articles: any[] = []

  componentWillLoad() {
    return this.loadArticles(this.category)
  }

  @Watch('category') 
  async loadArticles(category) {
    console.log('lang')
    const lang = document.documentElement.getAttribute('lang')

    this.articles = await import(mapping[category.name][lang])
  }

  render() {
    return (
      <Host>
        {this.articles.map(article => <ArticleSummary url={this.category.url} article={article} />)}
      </Host>
    )
  }
}