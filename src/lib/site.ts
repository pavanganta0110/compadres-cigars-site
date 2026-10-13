export const SITE = {
  name: "Compadres Cigars",
  url: "https://compadrescigars.com",
  phone: "(816) 878 - 3545",
  phoneHref: "tel:+18168783545",
  address: "4342 Belleview Avenue, Kansas City, Missouri 64111, United States",
  facebook: "https://www.facebook.com/101236931573888",
  instagram: "https://www.instagram.com/compadrespremiumcigars/",
  description:
    "Experience the finest custom made cigars crafted by Compadres Cigars. We are a leading cigar manufacturer and importer, offering a wide range of premium cigars.",
  warning: "WARNING: Cigars Are Not A Safe Alternative To Cigarettes.",
};

export type NavItem = { label: string; href: string; children?: NavItem[] };

export const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Products",
    href: "/all-products",
    children: [
      { label: "All Products", href: "/all-products" },
      { label: "Main Line Cigars", href: "/main-line-cigars" },
      { label: "Cardinal Line", href: "/cardinal-line" },
      { label: "Cigarillos", href: "/cigarillos" },
      { label: "Dominican Blanks", href: "/dominican-blanks" },
      { label: "Private Label Program", href: "/private-label-program" },
      { label: "Humidor Program", href: "/humidor-program" },
    ],
  },
  { label: "Gallery", href: "/gallery" },
  { label: "About Us", href: "/about-us" },
  { label: "Contact Us", href: "/contact-us-1" },
  { label: "Where to Buy", href: "/where-to-buy" },
  {
    label: "More",
    href: "/become-a-customer",
    children: [
      { label: "Become a Customer", href: "/become-a-customer" },
      { label: "Catalog", href: "/catalog" },
    ],
  },
];

// Wide screens show every link inline (as the original does); narrower ones fold the last two into "More".
export const NAV_WIDE: NavItem[] = [
  ...NAV.slice(0, -1),
  { label: "Become a Customer", href: "/become-a-customer" },
  { label: "Catalog", href: "/catalog" },
];

export const BROCHURE = "/files/compadres-cigars.pdf";
export const CATALOG = "/files/compadres-digital-catalog.pdf";

export const MAIN_LINE = [
  {
    name: "Robusto", size: "50 X 5", image: "/images/robusto-box.png", w: 1035, h: 1200,
    filler: "Cuban Seed", binder: "Dominican", wrap: "Connecticut",
    first: ["First Third: Light, airy start with a solid pull. Developing a", "sweet nutty flavor."],
    second: ["Second Third: Light to medium body flavor; maintaining", "a smooth mellow taste."],
    final: ["Final Third: Consistant medium body throughout. Smooth", "and flavorful until the end."],
  },
  {
    name: "Belicoso", size: "50 X 5.25", image: "/images/belicoso-box.png", w: 1200, h: 913,
    filler: "Cuban Seed, Dominican", binder: "Dominican", wrap: "Habana",
    first: ["First Third: Sweet, earthy, slightly fruity which develops", "a smooth rich consistency."],
    second: ["Second Third: Medium body flavor; produces a medium", "pull; develops a sharpness and a little bit of fire."],
    final: ["Final Third: Hint of deep, smooth leather taste; retains its", "smoothness throughout the smoke; burns evenly and", "retains a smooth pull throughout."],
  },
  {
    name: "Maduro Torpedo", size: "52 X 6", image: "/images/torpedo-box.png", w: 878, h: 1200,
    filler: "Cuban Seed", binder: "Cuban Seed", wrap: "Habana",
    first: ["First Third: Dry, earthy flavor, a hint of expresso; light to", "medium pull."],
    second: ["Second Third: Medium full body flavor; produces a medium", "pull; develops a sharpness and a little bit of fire."],
    final: ["Final Third: Hint of deep, rugged leather taste; burns evenly", "and retains a smooth pull throughout."],
  },
  {
    name: "Double Maduro Toro", size: "52 X 6", image: "/images/toro-box.png", w: 1200, h: 1118,
    filler: "USA, Cuban Seed", binder: "Indonesia", wrap: "San Andres",
    first: ["First Third: A full body, earthy, chocolate taste with a hint", "of floral; strong, like a shot of expresso."],
    second: ["Second Third: Medium to full body flavor; produces a", "medium pull; develops a soft leather sharpness."],
    final: ["Final Third: Hint of deep, smooth leather taste; retains its", "smoothness throughout the smoke; burns evenly and", "retains a smooth pull throughout."],
  },
  {
    name: "Gran Corona", size: "60 X 6", image: "/images/gran-corona-box.png", w: 1200, h: 1086,
    filler: "USA, Cuban Seed", binder: "Cuban Seed", wrap: "Habana",
    first: ["First Third: Medium to full body, smooth pull."],
    second: ["Second Third: Maintains a smooth pull, developing a rich flavor."],
    final: ["Final Third: Burns evenly throughout, maintains a rich flavor with a smooth taste."],
  },
];

// Rows of three, bottom-aligned, in the same order as the original gallery.
export type GalleryImage = { file: string; w: number; h: number };
export const GALLERY_ROWS: GalleryImage[][] = [
  [
    { file: "lion-crest-main-logo-bold-black-background.jpg", w: 1800, h: 1800 },
    { file: "compadres-cigars-60-x-6-crop.jpg", w: 1717, h: 1800 },
    { file: "suzannefryerphotography_compadres--2.jpg", w: 1199, h: 1800 },
  ],
  [
    { file: "cardinal-box-press.jpg", w: 1800, h: 1353 },
    { file: "compadres-cigars-pressed-crop.jpg", w: 1249, h: 1800 },
    { file: "tobacco-leaf-crop.jpg", w: 1646, h: 1800 },
  ],
  [
    { file: "suzannefryerphotography_compadres-5622.jpg", w: 1199, h: 1800 },
    { file: "compadres-cigars-rolling-crop.jpg", w: 1593, h: 1800 },
    { file: "robustos-lined-up-crp.jpg", w: 1147, h: 1800 },
  ],
  [
    { file: "suzannefryerphotography_compadres--2-1.jpg", w: 1199, h: 1800 },
    { file: "compadres-cigars-packing-crop.jpg", w: 1047, h: 1800 },
    { file: "img_20201203_153536.jpg", w: 1350, h: 1800 },
  ],
  [
    { file: "51222067379_21628b58ac_o.jpg", w: 1800, h: 1200 },
    { file: "image-3.jpg", w: 1200, h: 1800 },
    { file: "51220572407_05e7f6b3f1_o.jpg", w: 1199, h: 1800 },
  ],
  [
    { file: "cover.jpg", w: 1247, h: 1800 },
    { file: "suzannefryerphotography_compadres-7194.jpg", w: 1800, h: 1200 },
    { file: "suzannefryerphotography_compadres-5007.jpg", w: 1800, h: 1200 },
  ],
  [
    { file: "suzannefryerphotography_compadres-6152.jpg", w: 1199, h: 1800 },
    { file: "suzannefryerphotography_compadres-5637.jpg", w: 1199, h: 1800 },
  ],
];
