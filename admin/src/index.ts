import pluginPkg from '../../package.json';
import pluginId from './pluginId';
import {Initializer} from './components/Initializer';
import {PluginIcon} from './components/PluginIcon';
import { prefixPluginTranslations } from './utils/getTranslation';

const name = pluginPkg.strapi.name;
  
export default {
  register(app: any) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'Form Builder',
      },
      Component: async () => {
        const component = await import('./pages/App');
        return component;
      },
    
    });

    // Register plugin initialization
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    });

    
  },

  bootstrap(app: any) {
    // Add custom field injection
    // app.injectContentManagerComponent('editView', 'right-links', {
    //   name: 'form-submissions',
    //   Component: async () => {
    //     const component = await import('./components/FormSubmissions');
    //     return component;
    //   },
    // });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};
