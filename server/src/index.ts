/**
 * Application methods
 */
import bootstrap from './bootstrap';
import destroy from './destroy';
import register from './register';

/**
 * Plugin server methods
 */
import config from './config';
import contentTypes from './content-types';
import controllers from './controllers';
import routes from './routes';
import services from './services';
import policies from './policies';
import middlewares from './middlewares';

export default {
  register,
  bootstrap() {},
  destroy() {},
  config,
  contentTypes,
  controllers,
  routes,
  services,
  policies,
  middlewares,
};
