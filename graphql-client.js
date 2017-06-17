var fetch =  require('node-fetch');
var GraphQLClient =  require('graphql-js-client')('Client');
var typeBundle = require('./types');

global.fetch = fetch;

module.exports['default'] = new GraphQLClient(typeBundle, {
  url: 'https://testo-mania.myshopify.com/api/graphql',
  fetcherOptions: {
    headers: {
      'X-Shopify-Storefront-Access-Token': ' 3d02750484be7c34eb8d53317b7d1f8a'
    }
  }
});
