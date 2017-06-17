import fetch from 'node-fetch';
import Client from 'graphql-js-client';
import typeBundle from './types';

global.fetch = fetch;

export default new Client(typeBundle, {
  url: 'https://testo-mania.myshopify.com/api/graphql',
  fetcherOptions: {
    headers: {
      'X-Shopify-Storefront-Access-Token': ' 3d02750484be7c34eb8d53317b7d1f8a'
    }
  }
});
