import { h, FunctionalComponent } from '@stencil/core'
import i18n from 'i18next'

function formatDate(d: Date) {
  return d.toISOString()
}

interface ArticleProps {
  article: any
  url: string
}

export const ArticleSummary: FunctionalComponent<ArticleProps> = ({ article, url }) => {
  const articleUrl = `${url}/${article.slug}`
  const createdAt = formatDate(article.createdAt)

  return (
    <article class="article" itemscope itemtype="http://schema.org/Article">
      <h2 itemprop="headline">
        <stencil-route-link 
          itemprop="url"
          url={articleUrl}
        >
          <i class="icon-idea"></i>
          {article.title}
        </stencil-route-link>
      </h2>
      <div class="brief">
        <div itemprop="summary">{article.summary}</div>
        <div class="footer">
          <time>
            {createdAt}
          </time>
          <span innerHTML={i18n.t('article.author', { author: `<span itemprop="author">${article.author}</span>` })}></span>
          <stencil-route-link
            url={`${articleUrl}#comments`}
            itemprop="commentCount"
          >
            <i class="icon-comment"></i>
            0
          </stencil-route-link>
          <stencil-route-link
            url={articleUrl}
            class="read-more"
          >
            {i18n.t('article.readMore')}
          </stencil-route-link>
        </div>
      </div>
  </article>    
  )
}