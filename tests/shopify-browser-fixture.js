// Loaded only by the browser smoke test; never shipped by the build.
window.fetch = async (_url, options) => {
  const { query, variables } = JSON.parse(options.body);
  const amount = value => ({ amount: String(value), currencyCode: 'INR' });
  const products = ['Rich Chocolate', 'Mawa Kulfi'].map((flavour, index) => {
    const handle = index ? 'aura-whey-mawa-kulfi-1-kg' : 'aura-whey-rich-chocolate-1-kg';
    const image = { url: location.origin + '/assets/aura-whey-logo.jpeg', altText: flavour };
    return { id: 'product-' + index, handle, title: 'Aura Whey ' + flavour + ' 1 kg', description: 'Product description from Shopify.', availableForSale: true,
      images: { nodes: [image] }, featuredImage: image,
      variants: { nodes: [{ id: 'variant-' + index, title: 'Default Title', price: amount(index ? 4199 : 4499), availableForSale: true, image }], pageInfo: { hasNextPage: false } } };
  });
  let cart = JSON.parse(sessionStorage.getItem('fixture-cart') || 'null');
  let data;
  if (query.includes('query Product')) data = { product: products.find(product => product.handle === variables.handle) };
  else if (query.includes('query Cart')) data = { cart };
  else {
    const name = query.match(/\{ (cart\w+)\(/)[1];
    if (name === 'cartCreate') cart = { id: 'fixture-cart?key=test', checkoutUrl: location.origin + '/checkout-fixture', lines: { nodes: [], pageInfo: { hasNextPage: false } }, discountCodes: [] };
    const input = variables.input || variables;
    if (name === 'cartCreate' || name === 'cartLinesAdd') {
      for (const line of input.lines) {
        const existing = cart.lines.nodes.find(item => item.merchandise.id === line.merchandiseId);
        if (existing) existing.quantity += line.quantity;
        else {
          const product = products.find(product => product.variants.nodes[0].id === line.merchandiseId);
          cart.lines.nodes.push({ id: 'line-' + line.merchandiseId, quantity: line.quantity, merchandise: { ...product.variants.nodes[0], product: { title: product.title, handle: product.handle } } });
        }
      }
    }
    if (name === 'cartLinesUpdate') for (const line of input.lines) cart.lines.nodes.find(item => item.id === line.id).quantity = line.quantity;
    if (name === 'cartLinesRemove') cart.lines.nodes = cart.lines.nodes.filter(item => !input.lineIds.includes(item.id));
    if (input.discountCodes) cart.discountCodes = input.discountCodes.map(code => ({ code, applicable: code === 'DISC5' }));
    let subtotal = 0;
    cart.totalQuantity = 0;
    for (const line of cart.lines.nodes) {
      const cost = Number(line.merchandise.price.amount) * line.quantity;
      line.cost = { totalAmount: amount(cost) }; subtotal += cost; cart.totalQuantity += line.quantity;
    }
    cart.cost = { subtotalAmount: amount(subtotal), totalAmount: amount((subtotal * (cart.discountCodes.some(code => code.applicable) ? .95 : 1)).toFixed(2)), totalTaxAmount: null };
    sessionStorage.setItem('fixture-cart', JSON.stringify(cart));
    data = { [name]: { cart, userErrors: [], warnings: [] } };
  }
  return { ok: true, json: async () => ({ data }) };
};
