// const directus = new Directus('https://shop.xcuts.co.uk');

// Authenticate using a static token
// directus.auth.static('N9WxXcaLtAzl-cNB2sXsLdZKmiG5Y3Pn');

// Now you can interact with your Directus instance
// const items = await directus.items('collection_name').readByQuery({});
// export default directus;
import { createDirectus, rest, readItems } from '@directus/sdk';

const directus = createDirectus('https://shop.xcuts.co.uk').with(rest());

export default directus;

// await client.login('spm@mzakeri.ir', 'Ss@46537678', options);
