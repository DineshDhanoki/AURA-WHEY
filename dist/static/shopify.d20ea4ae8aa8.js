// SHOPIFY CONNECTION CONFIGURATION — public Storefront values only.
const SHOPIFY_CONFIG = Object.freeze({
  domain: 'cay9kn-xc.myshopify.com',
  publicAccessToken: 'df537a5d2dc008d3c82a38c62f80ce5b', // PUBLIC Storefront token only.
  apiVersion: '2026-07',
  country: 'IN',
  products: {
    'Rich Chocolate': 'aura-whey-rich-chocolate-1-kg',
    'Mawa Kulfi': 'aura-whey-mawa-kulfi-1-kg'
  },
  blogHandle: 'journal'
});

function createShopifyClient(config, request = fetch) {
  const money = 'amount currencyCode';
  const cartFields = `id checkoutUrl totalQuantity discountCodes { code applicable }
    cost { subtotalAmount { ${money} } totalAmount { ${money} } totalTaxAmount { ${money} } }
    lines(first: 100) { nodes { id quantity cost { totalAmount { ${money} } }
      merchandise { ... on ProductVariant { id title availableForSale price { ${money} }
        image { url altText } product { handle title } } }
    } pageInfo { hasNextPage } }`;

  async function query(query, variables = {}) {
    if (!config.publicAccessToken || config.publicAccessToken.includes('PASTE')) {
      throw new Error('Shopify public Storefront API token is missing in shopify.js.');
    }
    if (!/^[a-z0-9-]+\.myshopify\.com$/.test(config.domain)) throw new Error('Invalid Shopify store domain.');
    if (/^(shpat_|shpca_|shpss_)/.test(config.publicAccessToken)) throw new Error('Use a public Storefront token, never an Admin or private token.');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let response;
    try {
      response = await request(`https://${config.domain}/api/${config.apiVersion}/graphql.json`, {
        method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': config.publicAccessToken },
        body: JSON.stringify({ query, variables })
      });
      const payload = await response.json();
      if (!response.ok || payload.errors?.length) throw new Error(payload.errors?.map(error => error.message).join('; ') || `Shopify request failed (${response.status}).`);
      return payload.data;
    } finally { clearTimeout(timeout); }
  }

  async function products() {
    const entries = await Promise.all(Object.entries(config.products).map(async ([flavour, handle]) => {
      const data = await query(`query Product($handle: String!, $country: CountryCode!) @inContext(country: $country) {
        product(handle: $handle) { id handle title description availableForSale
          featuredImage { url altText } images(first: 50) { nodes { url altText } }
          variants(first: 100) { nodes { id title availableForSale selectedOptions { name value }
            price { ${money} } image { url altText }
          } pageInfo { hasNextPage } }
        }
      }`, { handle, country: config.country });
      if (!data.product) throw new Error(`Product ${handle} is unavailable. Check its status and Headless publication.`);
      if (data.product.variants.pageInfo.hasNextPage) throw new Error(`Product ${handle} has more than 100 variants; pagination is required.`);
      return [flavour, data.product];
    }));
    return Object.fromEntries(entries);
  }

  async function mutation(name, declaration, argumentsText, variables) {
    const data = await query(`mutation ${declaration} { ${name}(${argumentsText}) {
      cart { ${cartFields} } userErrors { field message code }
      warnings { code message }
    } }`, variables);
    const result = data[name];
    if (result.userErrors.length) throw new Error(result.userErrors.map(error => error.message).join('; '));
    if (!result.cart) throw new Error('This cart is no longer available. Reload the page to start a new cart.');
    if (result.cart.lines.pageInfo.hasNextPage) throw new Error('This cart contains more items than can be displayed.');
    return { cart: result.cart, warnings: result.warnings || [] };
  }

  return {
    products,
    async cart(id) {
      const data = await query(`query Cart($id: ID!) { cart(id: $id) { ${cartFields} } }`, { id });
      if (data.cart?.lines.pageInfo.hasNextPage) throw new Error('This cart contains more items than can be displayed.');
      return data.cart;
    },
    create: (lines, discountCodes = []) => mutation('cartCreate', 'Create($input: CartInput!)', 'input: $input', { input: { lines, discountCodes, buyerIdentity: { countryCode: config.country } } }),
    add: (cartId, lines) => mutation('cartLinesAdd', 'Add($cartId: ID!, $lines: [CartLineInput!]!)', 'cartId: $cartId, lines: $lines', { cartId, lines }),
    update: (cartId, lines) => mutation('cartLinesUpdate', 'Update($cartId: ID!, $lines: [CartLineUpdateInput!]!)', 'cartId: $cartId, lines: $lines', { cartId, lines }),
    remove: (cartId, lineIds) => mutation('cartLinesRemove', 'Remove($cartId: ID!, $lineIds: [ID!]!)', 'cartId: $cartId, lineIds: $lineIds', { cartId, lineIds }),
    discount: (cartId, discountCodes) => mutation('cartDiscountCodesUpdate', 'Discount($cartId: ID!, $discountCodes: [String!]!)', 'cartId: $cartId, discountCodes: $discountCodes', { cartId, discountCodes })
  };
}
