var fetch =  require('node-fetch');
var Client = require('graphql-js-client');
var typeBundle = require('./types');

global.fetch = fetch;

//console.log(GraphQLClient.default);

module.exports['default'] = new Client.default(typeBundle, {
  url: 'https://testo-mania.myshopify.com/api/graphql',
  fetcherOptions: {
    headers: {
      'X-Shopify-Storefront-Access-Token': ' 3d02750484be7c34eb8d53317b7d1f8a'
    }
  }
});
