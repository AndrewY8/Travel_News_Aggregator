const AIRLINE_KEYWORDS = [
  "airline",
  "airlines",
  "flight",
  "flights",
  "flying",
  "airport",
  "airports",
  "aviation",
  "pilot",
  "cabin crew",
  "first class",
  "business class",
  "economy class",
  "boarding",
  "lounge",
  "mile",
  "miles",
  "frequent flyer",
  "delta",
  "united",
  "american airlines",
  "southwest",
  "jetblue",
  "spirit",
  "frontier",
  "alaska airlines",
  "british airways",
  "lufthansa",
  "emirates",
  "qatar",
  "singapore airlines",
  "cathay pacific",
  "air france",
  "klm",
  "ryanair",
  "easyjet",
  "qantas",
  "air canada",
  "aeroplan",
  "skymiles",
  "mileageplus",
  "aadvantage",
  "avios",
  "jet fuel",
  "airbus",
  "boeing",
  "a321",
  "a350",
  "a380",
  "777",
  "787",
  "737",
];

const HOTEL_KEYWORDS = [
  "hotel",
  "hotels",
  "resort",
  "resorts",
  "marriott",
  "hilton",
  "hyatt",
  "ihg",
  "accor",
  "wyndham",
  "best western",
  "four seasons",
  "ritz-carlton",
  "st. regis",
  "w hotel",
  "sheraton",
  "westin",
  "bonvoy",
  "honors",
  "world of hyatt",
  "suite",
  "suites",
  "check-in",
  "checkout",
  "concierge",
  "room upgrade",
  "all-inclusive",
  "hostel",
  "airbnb",
  "vacation rental",
  "boutique hotel",
];

const BONUS_KEYWORDS = [
  "bonus",
  "bonuses",
  "deal",
  "deals",
  "offer",
  "offers",
  "promotion",
  "promotions",
  "promo",
  "discount",
  "discounts",
  "sale",
  "flash sale",
  "limited time",
  "save",
  "savings",
  "% off",
  "percent off",
  "free night",
  "free nights",
  "earn extra",
  "extra points",
  "bonus points",
  "transfer bonus",
  "sign-up bonus",
  "signup bonus",
  "welcome offer",
  "welcome bonus",
  "elevated offer",
  "increased offer",
  "limited-time",
  "reward",
  "rewards",
  "cashback",
  "cash back",
  "credit card offer",
  "annual fee",
  "waived",
  "complimentary",
  "upgrade offer",
];

export function categorizeArticle(title: string): "Airline" | "Hotel" | "Bonus" | "General" {
  const lower = title.toLowerCase();

  let airlineScore = 0;
  let hotelScore = 0;
  let bonusScore = 0;

  for (const kw of AIRLINE_KEYWORDS) {
    if (lower.includes(kw)) airlineScore++;
  }

  for (const kw of HOTEL_KEYWORDS) {
    if (lower.includes(kw)) hotelScore++;
  }

  for (const kw of BONUS_KEYWORDS) {
    if (lower.includes(kw)) bonusScore++;
  }

  // Bonus takes priority if it scores — these are the most actionable articles
  if (bonusScore > 0) return "Bonus";
  if (airlineScore === 0 && hotelScore === 0) return "General";
  if (airlineScore >= hotelScore) return "Airline";
  return "Hotel";
}
