var fetch =  require('node-fetch');
var Client =  require('graphql-js-client');
var typeBundle = require('./types');

global.fetch = fetch;

module.exports new Client(typeBundle, {
  url: 'https://testo-mania.myshopify.com/api/graphql',
  fetcherOptions: {
    headers: {
      'X-Shopify-Storefront-Access-Token': ' 3d02750484be7c34eb8d53317b7d1f8a'
    }
  }
});
