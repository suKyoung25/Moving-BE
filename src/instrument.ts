const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "https://1eadfd35627b2b46002598c4714b038e@o4509840360407040.ingest.us.sentry.io/4509840470638592",

  sendDefaultPii: true,
});
