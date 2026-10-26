import { SITE } from "@/lib/site";

// DRAFT policy text for owner review. It was written around how this site works today: wholesale tobacco
// sold to licensed businesses, buyers must be 21+, orders are REQUESTS (pricing and payment are confirmed
// by Compadres afterward), and no card details are collected on the website.
//
// Defaults chosen here that the owner must confirm (search for the constants below):
//   CLAIM_DAYS, PROCESSING_DAYS, REFUND_DAYS, CARRIERS, GOVERNING_STATE.
// Have the owner (and ideally a lawyer) approve this text before relying on it.
export const POLICY_UPDATED = "October 20, 2026";
const CLAIM_DAYS = 7;
const PROCESSING_DAYS = "1 to 3 business days";
const REFUND_DAYS = 10;
const CARRIERS = "UPS or FedEx";
const GOVERNING_STATE = "Missouri";

export type Section = { h: string; p?: string[]; ul?: string[] };
export type Policy = { title: string; intro: string; sections: Section[] };

const name = SITE.name;

export const TERMS: Policy = {
  title: "Terms & Conditions",
  intro: `These Terms & Conditions govern your use of compadrescigars.com and any orders you place with ${name} ("we", "us"). By using this website or placing an order you agree to them.`,
  sections: [
    { h: "Who may buy", p: [
      `${name} is a licensed importer that supplies tobacco products to businesses holding the proper tobacco licenses in their state. Products are not sold to consumers.`,
      "By placing an order you confirm that you are at least 21 years old, that you act for a business that is licensed to purchase and resell tobacco products where it operates, and that the information you give us is accurate.",
      "We may refuse or cancel any order, and may ask for a copy of your license before shipping.",
    ] },
    { h: "Age and identity verification", p: [
      "Before an order can be placed, we require a 21+ age check through our third-party verification provider, Didit. You will be asked to scan a government-issued photo ID. We receive the result of the check; the provider handles the ID image under its own policies. Orders cannot be placed without a successful check.",
    ] },
    { h: "Orders, pricing and payment", p: [
      "Prices are shown in US dollars on our product pages and in your cart. Prices exclude sales, excise and other taxes unless stated, and shipping is added at checkout. We may correct pricing or availability errors, and if we do we will contact you before shipping and give you the choice to proceed or cancel for a full refund.",
      "When you place an order you pay by card at checkout on a secure payment page provided by our payment processor, Authorize.net. We never see or store your card number, and we never ask for card numbers by email or phone.",
      "An order is accepted when your payment is approved and we have confirmed your age and license where required. We may decline or cancel any order (for example if we cannot verify your age or license, an item is unavailable, or shipping to your location would be unlawful), in which case you will not be charged or will be refunded in full.",
    ] },
    { h: "Shipping, delivery and returns", p: [
      "Shipping is described in our Shipping Policy and returns and refunds in our Refund Policy. Both form part of these Terms.",
    ] },
    { h: "Compliance with laws", p: [
      "You are responsible for knowing and following all federal, state and local laws that apply to buying, receiving, storing, taxing and reselling tobacco products, including licensing, age and tax requirements. We may decline to ship to any location where we believe shipping would be unlawful.",
    ] },
    { h: "Product information", p: [
      "We try to describe and photograph our products accurately, but packaging, blends and appearance can vary slightly between production runs. Images on the site are for illustration.",
    ] },
    { h: "Intellectual property", p: [
      `The ${name} name, logo, photographs and website content belong to us or our licensors. You may not copy or reuse them without our written permission.`,
    ] },
    { h: "Health warning", p: [SITE.warning] },
    { h: "Limitation of liability", p: [
      "To the fullest extent the law allows, we are not liable for indirect or consequential losses arising from use of this website or from products purchased, and our total liability for any claim is limited to the amount you paid us for the product concerned. Nothing in these Terms limits liability that cannot be limited by law.",
    ] },
    { h: "Governing law", p: [`These Terms are governed by the laws of the State of ${GOVERNING_STATE}, and disputes will be handled in the courts located there, unless the law requires otherwise.`] },
    { h: "Changes", p: ["We may update these Terms from time to time. The date at the top shows when they were last changed. Continued use of the site or a new order means you accept the updated Terms."] },
    { h: "Contact us", p: [`${name}, ${SITE.address}. Phone: ${SITE.phone}.`] },
  ],
};

export const PRIVACY: Policy = {
  title: "Privacy Policy",
  intro: `This policy explains what information ${name} collects through compadrescigars.com, how we use it and the choices you have.`,
  sections: [
    { h: "Information we collect", ul: [
      "Details you give us in forms: name, company, address, email, phone, notes and the contents of your order.",
      "Your tobacco license, if you upload it with an application or order.",
      "The result of your 21+ age check (approved or not). We do not receive or keep a copy of your ID image: the check is run by our verification provider, Didit, which handles your ID and its own records under its privacy policy.",
      "Basic site usage data: our own cookie-less visit counter (no IP address is stored). If analytics or advertising tags are enabled on the site, they load only after you accept the cookie notice.",
      "A cookie that remembers you confirmed you are 21 or older, and browser storage that remembers the contents of your cart.",
    ] },
    { h: "How we use it", ul: [
      "To process and fulfill orders and customer applications, take payment and arrange shipping.",
      "To verify that buyers are of legal age and are licensed businesses, as the law and our payment partners require.",
      "To respond to your questions, keep records, prevent fraud and meet legal and tax obligations.",
      "To understand and improve how the website is used.",
    ] },
    { h: "Who we share it with", p: [
      "We do not sell your personal information. We share it only with service providers that help us run the business, under their own privacy and security terms: our website host, our database and file storage provider, our email provider, our identity-verification provider (Didit), our payment processor and shipping carriers.",
      "We may also disclose information when the law requires it or to protect our rights.",
    ] },
    { h: "Payment information", p: ["We do not collect or store payment card numbers on this website. Card payments are taken on a secure page provided by our payment processor."] },
    { h: "How long we keep it", p: ["We keep order and application records for as long as needed to serve you and to meet legal, tax and accounting requirements. Age-check results are kept only as long as needed to show that an order was properly verified."] },
    { h: "Security", p: ["We protect information with access controls and encrypted connections. No system is perfectly secure, so we cannot guarantee absolute security."] },
    { h: "Your choices", p: [
      `You can ask us what information we hold about you, or ask us to correct or delete it, by contacting us below. We will honor requests as far as the law allows (we may need to keep some records).`,
      "You can decline optional analytics cookies, and clear your browser storage at any time to empty your cart.",
    ] },
    { h: "Not for anyone under 21", p: ["This website and our products are for adults 21 and older. We do not knowingly collect information from anyone under 21."] },
    { h: "Changes", p: ["We may update this policy. The date at the top shows when it was last changed."] },
    { h: "Contact us", p: [`${name}, ${SITE.address}. Phone: ${SITE.phone}.`] },
  ],
};

export const REFUND: Policy = {
  title: "Refund Policy",
  intro: `We want every order to arrive in good condition. This policy explains returns, replacements and refunds for orders placed with ${name}.`,
  sections: [
    { h: "Wholesale tobacco products", p: [
      "Because cigars and other tobacco products are perishable and cannot be resold once they leave our control, we do not accept returns of product that was opened, used, damaged after delivery or stored improperly, or of product returned without our approval.",
    ] },
    { h: "Damaged, defective or incorrect orders", p: [
      `If your order arrives damaged, defective or not what you ordered, contact us within ${CLAIM_DAYS} days of delivery. Please include your order details and clear photos of the product, the packaging and the shipping label.`,
      "After we review your claim we will, at our choice, replace the product, issue a credit, or refund the affected items.",
      "Do not return anything until we give you written return instructions. Unauthorized returns are not accepted.",
    ] },
    { h: "How refunds are paid", p: [
      `Approved refunds are issued to the original payment method (or by check/ACH where that was used) within ${REFUND_DAYS} business days of approval. Your bank may take additional time to post it.`,
      "Shipping charges are refunded only when the problem was our error.",
    ] },
    { h: "Cancellations and changes", p: [
      "You can cancel or change an order before it ships by contacting us as soon as possible. Once an order has shipped it can only be handled under this policy.",
      "If we cannot fulfill part of an order, we will tell you and refund or adjust the affected portion.",
    ] },
    { h: "Payment disputes", p: ["If you have a concern about a charge, please contact us first. We will work to resolve it quickly."] },
    { h: "How to contact us", p: [`Call ${SITE.phone} or write to ${SITE.address}.`] },
  ],
};

export const SHIPPING: Policy = {
  title: "Shipping Policy",
  intro: `This policy explains how ${name} ships orders to licensed business customers.`,
  sections: [
    { h: "Who we ship to", p: [
      "We ship to licensed businesses within the United States, in states where the sale and delivery of the products is lawful. We do not ship to PO boxes or internationally.",
      "We may ask for a copy of your tobacco license before shipping and may decline an order for a location where shipping would be unlawful.",
    ] },
    { h: "Age verification at delivery", p: ["Tobacco shipments require an adult signature. The person receiving the package must be at least 21 years old and may be asked to show ID. If no eligible adult is available, the carrier may hold or return the package, and extra charges may apply."] },
    { h: "Processing time", p: [`After we confirm your order, verify your age and license and receive payment, orders usually ship within ${PROCESSING_DAYS}. Timing can vary with product availability.`] },
    { h: "Carriers and delivery times", p: [
      `We ship with ${CARRIERS}. Delivery estimates come from the carrier and are not guaranteed. Delays can happen because of weather, carrier issues or incorrect addresses.`,
      "We email or call you with tracking information when your order ships.",
    ] },
    { h: "Shipping charges", p: ["A flat shipping charge per order is shown at checkout before you pay. Any applicable taxes are not added online and may be invoiced separately."] },
    { h: "Address accuracy", p: ["Please make sure your shipping address and contact details are correct. Address changes must be made before the order ships. We are not responsible for delays or losses caused by an incorrect address."] },
    { h: "Damage or loss in transit", p: [
      `Please inspect your shipment on delivery. If it is damaged or lost, contact us within ${CLAIM_DAYS} days with photos so we can make a claim with the carrier and resolve it under our Refund Policy.`,
    ] },
    { h: "Contact us", p: [`Call ${SITE.phone} or write to ${SITE.address}.`] },
  ],
};
