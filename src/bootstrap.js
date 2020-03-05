import 'core-js/modules/web.immediate';
import App from './components/App';
import AppBlock from './components/AppBlock';
import AppFooter from './components/AppFooter';
import AppHeader from './components/AppHeader';
import AppLink from './components/AppLink';
import AppMenu from './components/AppMenu';
import ArticleDetails from './components/ArticleDetails';
import ContactForm from './components/ContactForm';
import Page from './components/Page';
import PageAbout from './components/PageAbout';
import PageArticle from './components/PageArticle';
import PageArticles from './components/PageArticles';
import PageFriends from './components/PageFriends';
import Pager from './components/Pager';
import PageSearch from './components/PageSearch';
import PopularArticles from './components/PopularArticles';
import PopularTags from './components/PopularTags';
import SearchBlock from './components/SearchBlock';
import SimilarArticles from './components/SimilarArticles';
import LangPicker from './components/LangPicker';
import { locale, setLocale, defaultLocale } from './services/i18n';
import router from './services/router';
import { setRouteMeta } from './services/meta';

const components = [
  App,
  AppBlock,
  AppFooter,
  AppHeader,
  AppLink,
  AppMenu,
  ArticleDetails,
  ContactForm,
  Page,
  PageAbout,
  PageArticle,
  PageArticles,
  PageFriends,
  Pager,
  PageSearch,
  PopularArticles,
  PopularTags,
  SearchBlock,
  SimilarArticles,
  LangPicker,
];

export default function bootstrap(selector) {
  const app = document.querySelector(selector);
  components.forEach(c => customElements.define(c.cName, c));
  router.observe(async (route) => {
    const lang = route.response.params.lang || defaultLocale;

    if (locale() !== lang) {
      await setLocale(lang);
      app.ready = true;
    }

    setRouteMeta(route);
  });
}
