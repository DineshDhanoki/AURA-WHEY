export const links = [
  ['home', 'Home'], ['shop', 'Shop'], ['quality', 'Quality & lab reports'],
  ['blog', 'Journal'], ['authenticate', 'Authenticate'], ['track-order', 'Track order'],
  ['faq', 'FAQs'], ['contact', 'Contact']
];

const assetBase = './stitch_aura_whey_storefront_design/';

export const assets = {
  chocolate: `${assetBase}chatgpt_image_aug_15_2026_02_36_24_pm.png/screen.png`,
  mawa: `${assetBase}chatgpt_image_aug_15_2026_02_34_55_pm.png/screen.png`,
  duo: `${assetBase}chatgpt_image_aug_15_2026_02_33_29_pm.png/screen.png`,
  labelMawa: `${assetBase}whatsapp_image_2026_07_22_at_21.31.00.jpeg/screen.png`,
  why: `${assetBase}chatgpt_image_sep_4_2026_07_09_56_pm.png/screen.png`
};

export const productPrice = '₹4,199';

export const posts = [
  { title: 'How to choose a whey protein flavour', excerpt: 'Start with the taste you will genuinely look forward to using.', image: assets.duo },
  { title: 'A simple way to plan your protein routine', excerpt: 'Build a repeatable food and training routine around your day.', image: assets.why },
  { title: 'Mawa Kulfi or Rich Chocolate?', excerpt: 'Two different flavour profiles, one straightforward choice.', image: assets.chocolate }
];

export const documents = [
  ['FSSAI licence', 'Food safety licence', 'Licence no. 10724997000182'],
  ['ISO 22000 certificate', 'Food safety management', 'Certificate supplied by the manufacturer'],
  ['GMP certificate', 'Manufacturing practice', 'Certificate supplied by the manufacturer'],
  ['HACCP certificate', 'Hazard analysis and control', 'Certificate supplied by the manufacturer'],
  ['Kosher certificate', 'Dietary certification', 'Certificate supplied by the manufacturer'],
  ['Halal certificate', 'Dietary certification', 'Certificate supplied by the manufacturer']
];

export const faqs = [
  ['Which flavours are available?', 'Aura Whey Protein is currently available in Mawa Kulfi and Rich Chocolate flavours.'],
  ['How much protein is in one serving?', 'The product label states 24 g protein per 35 g serving, with 5.7 g BCAAs.'],
  ['How do I authenticate my product?', 'Visit Authenticate, then enter the code printed on your Aura Whey pack.'],
  ['Where can I read the certificates?', 'The Quality & lab reports page contains the supplied manufacturing and food-safety documents.'],
  ['How do I track an order?', 'Use your order number and the email address used at checkout on the Track order page.']
];
