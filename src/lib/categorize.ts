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

export function categorizeArticle(title: string): "Airline" | "Hotel" | "General" {
  const lower = title.toLowerCase();

  let airlineScore = 0;
  let hotelScore = 0;

  for (const kw of AIRLINE_KEYWORDS) {
    if (lower.includes(kw)) airlineScore++;
  }

  for (const kw of HOTEL_KEYWORDS) {
    if (lower.includes(kw)) hotelScore++;
  }

  if (airlineScore === 0 && hotelScore === 0) return "General";
  if (airlineScore >= hotelScore) return "Airline";
  return "Hotel";
}
