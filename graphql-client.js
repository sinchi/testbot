var fetch =  require('node-fetch');
var GraphQLClient = require('graphql-js-client');
var typeBundle = require('./types');

global.fetch = fetch;

console.log(GraphQLClient.default);

var Client = new GraphQLClient.default(typeBundle, {
  url: 'https://testo-mania.myshopify.com/api/graphql',
  fetcherOptions: {
    headers: {
      'X-Shopify-Storefront-Access-Token': ' 3d02750484be7c34eb8d53317b7d1f8a'
    }
  }
});

module.exports['default'] = Client;
