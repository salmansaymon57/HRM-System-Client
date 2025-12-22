import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';
// import { environment } from './environments/environment.development';


// if (true === environment?.ssrIgnoresSsl) {
//   console.warn('main.server.ts: SSR is running with SSL Certificate Checking disabled because environment.ssrIgnoresSsl is true.');
//   process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
// }

const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(App, config, context);

export default bootstrap;
