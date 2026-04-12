import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SYDNEY_SUBURBS: { name: string; postcode: string }[] = [
  // Sydney CBD & Inner City
  { name: "Sydney", postcode: "2000" },
  { name: "The Rocks", postcode: "2000" },
  { name: "Millers Point", postcode: "2000" },
  { name: "Dawes Point", postcode: "2000" },
  { name: "Haymarket", postcode: "2000" },
  { name: "Barangaroo", postcode: "2000" },
  { name: "Ultimo", postcode: "2007" },
  { name: "Chippendale", postcode: "2008" },
  { name: "Pyrmont", postcode: "2009" },
  { name: "Surry Hills", postcode: "2010" },
  { name: "Darlinghurst", postcode: "2010" },
  { name: "Kings Cross", postcode: "2011" },
  { name: "Potts Point", postcode: "2011" },
  { name: "Woolloomooloo", postcode: "2011" },
  { name: "Rushcutters Bay", postcode: "2011" },
  { name: "Elizabeth Bay", postcode: "2011" },
  { name: "Strawberry Hills", postcode: "2012" },
  { name: "Alexandria", postcode: "2015" },
  { name: "Beaconsfield", postcode: "2015" },
  { name: "Redfern", postcode: "2016" },
  { name: "Waterloo", postcode: "2017" },
  { name: "Zetland", postcode: "2017" },
  { name: "Rosebery", postcode: "2018" },
  { name: "Eastlakes", postcode: "2018" },

  // Inner South
  { name: "Mascot", postcode: "2020" },
  { name: "Paddington", postcode: "2021" },
  { name: "Bondi Junction", postcode: "2022" },
  { name: "Bellevue Hill", postcode: "2023" },
  { name: "Bronte", postcode: "2024" },
  { name: "Woollahra", postcode: "2025" },
  { name: "Bondi", postcode: "2026" },
  { name: "Bondi Beach", postcode: "2026" },
  { name: "Darling Point", postcode: "2027" },
  { name: "Edgecliff", postcode: "2027" },
  { name: "Double Bay", postcode: "2028" },
  { name: "Rose Bay", postcode: "2029" },
  { name: "Dover Heights", postcode: "2030" },
  { name: "Vaucluse", postcode: "2030" },
  { name: "Watsons Bay", postcode: "2030" },

  // Eastern Suburbs
  { name: "Randwick", postcode: "2031" },
  { name: "Kingsford", postcode: "2032" },
  { name: "Daceyville", postcode: "2032" },
  { name: "Kensington", postcode: "2033" },
  { name: "Coogee", postcode: "2034" },
  { name: "South Coogee", postcode: "2034" },
  { name: "Maroubra", postcode: "2035" },
  { name: "Maroubra Junction", postcode: "2035" },
  { name: "Matraville", postcode: "2036" },
  { name: "Malabar", postcode: "2036" },
  { name: "Chifley", postcode: "2036" },
  { name: "La Perouse", postcode: "2036" },
  { name: "Little Bay", postcode: "2036" },

  // Inner West
  { name: "Glebe", postcode: "2037" },
  { name: "Forest Lodge", postcode: "2037" },
  { name: "Annandale", postcode: "2038" },
  { name: "Rozelle", postcode: "2039" },
  { name: "Leichhardt", postcode: "2040" },
  { name: "Lilyfield", postcode: "2040" },
  { name: "Balmain", postcode: "2041" },
  { name: "Balmain East", postcode: "2041" },
  { name: "Birchgrove", postcode: "2041" },
  { name: "Newtown", postcode: "2042" },
  { name: "Enmore", postcode: "2042" },
  { name: "Erskineville", postcode: "2043" },
  { name: "St Peters", postcode: "2044" },
  { name: "Sydenham", postcode: "2044" },
  { name: "Tempe", postcode: "2044" },
  { name: "Haberfield", postcode: "2045" },
  { name: "Summer Hill", postcode: "2046" },
  { name: "Ashfield", postcode: "2046" },
  { name: "Petersham", postcode: "2049" },
  { name: "Stanmore", postcode: "2048" },
  { name: "Camperdown", postcode: "2050" },
  { name: "Marrickville", postcode: "2204" },
  { name: "Dulwich Hill", postcode: "2203" },
  { name: "Canterbury", postcode: "2193" },
  { name: "Hurlstone Park", postcode: "2193" },
  { name: "Earlwood", postcode: "2206" },
  { name: "Arncliffe", postcode: "2205" },

  // North Shore (Lower)
  { name: "North Sydney", postcode: "2060" },
  { name: "Lavender Bay", postcode: "2060" },
  { name: "McMahons Point", postcode: "2060" },
  { name: "Kirribilli", postcode: "2061" },
  { name: "Milsons Point", postcode: "2061" },
  { name: "Cammeray", postcode: "2062" },
  { name: "Crows Nest", postcode: "2065" },
  { name: "St Leonards", postcode: "2065" },
  { name: "Wollstonecraft", postcode: "2065" },
  { name: "Naremburn", postcode: "2065" },
  { name: "Lane Cove", postcode: "2066" },
  { name: "Lane Cove West", postcode: "2066" },
  { name: "Longueville", postcode: "2066" },
  { name: "Chatswood", postcode: "2067" },
  { name: "Chatswood West", postcode: "2067" },
  { name: "Willoughby", postcode: "2068" },
  { name: "Artarmon", postcode: "2064" },
  { name: "Castlecrag", postcode: "2068" },
  { name: "Middle Cove", postcode: "2068" },
  { name: "Northbridge", postcode: "2063" },

  // North Shore (Upper)
  { name: "Roseville", postcode: "2069" },
  { name: "Lindfield", postcode: "2070" },
  { name: "East Lindfield", postcode: "2070" },
  { name: "Killara", postcode: "2071" },
  { name: "Gordon", postcode: "2072" },
  { name: "Pymble", postcode: "2073" },
  { name: "Turramurra", postcode: "2074" },
  { name: "St Ives", postcode: "2075" },
  { name: "Wahroonga", postcode: "2076" },
  { name: "Warrawee", postcode: "2074" },
  { name: "Hornsby", postcode: "2077" },
  { name: "Asquith", postcode: "2078" },
  { name: "Waitara", postcode: "2077" },
  { name: "Normanhurst", postcode: "2076" },
  { name: "Thornleigh", postcode: "2120" },
  { name: "Pennant Hills", postcode: "2120" },
  { name: "Beecroft", postcode: "2119" },
  { name: "Cheltenham", postcode: "2119" },

  // Northern Beaches
  { name: "Manly", postcode: "2095" },
  { name: "Manly Vale", postcode: "2093" },
  { name: "Fairlight", postcode: "2094" },
  { name: "Balgowlah", postcode: "2093" },
  { name: "Seaforth", postcode: "2092" },
  { name: "Clontarf", postcode: "2093" },
  { name: "Brookvale", postcode: "2100" },
  { name: "Dee Why", postcode: "2099" },
  { name: "Curl Curl", postcode: "2096" },
  { name: "Freshwater", postcode: "2096" },
  { name: "Queenscliff", postcode: "2096" },
  { name: "North Manly", postcode: "2100" },
  { name: "Allambie Heights", postcode: "2100" },
  { name: "Narrabeen", postcode: "2101" },
  { name: "Collaroy", postcode: "2097" },
  { name: "Collaroy Plateau", postcode: "2097" },
  { name: "Cromer", postcode: "2099" },
  { name: "Warriewood", postcode: "2102" },
  { name: "Mona Vale", postcode: "2103" },
  { name: "Bayview", postcode: "2104" },
  { name: "Newport", postcode: "2106" },
  { name: "Bilgola Plateau", postcode: "2107" },
  { name: "Avalon Beach", postcode: "2107" },
  { name: "Palm Beach", postcode: "2108" },
  { name: "Whale Beach", postcode: "2107" },
  { name: "Church Point", postcode: "2105" },
  { name: "Frenchs Forest", postcode: "2086" },
  { name: "Belrose", postcode: "2085" },
  { name: "Davidson", postcode: "2085" },
  { name: "Forestville", postcode: "2087" },
  { name: "Killarney Heights", postcode: "2087" },

  // Mosman & Cremorne
  { name: "Mosman", postcode: "2088" },
  { name: "Cremorne", postcode: "2090" },
  { name: "Cremorne Point", postcode: "2090" },
  { name: "Neutral Bay", postcode: "2089" },

  // Ryde & Hunters Hill
  { name: "Ryde", postcode: "2112" },
  { name: "West Ryde", postcode: "2114" },
  { name: "Meadowbank", postcode: "2114" },
  { name: "Eastwood", postcode: "2122" },
  { name: "Epping", postcode: "2121" },
  { name: "North Epping", postcode: "2121" },
  { name: "Macquarie Park", postcode: "2113" },
  { name: "North Ryde", postcode: "2113" },
  { name: "Marsfield", postcode: "2122" },
  { name: "Denistone", postcode: "2114" },
  { name: "Gladesville", postcode: "2111" },
  { name: "Hunters Hill", postcode: "2110" },
  { name: "Putney", postcode: "2112" },
  { name: "Tennyson Point", postcode: "2111" },
  { name: "Henley", postcode: "2111" },

  // Parramatta & Cumberland
  { name: "Parramatta", postcode: "2150" },
  { name: "North Parramatta", postcode: "2151" },
  { name: "Harris Park", postcode: "2150" },
  { name: "Rosehill", postcode: "2142" },
  { name: "Granville", postcode: "2142" },
  { name: "South Granville", postcode: "2142" },
  { name: "Merrylands", postcode: "2160" },
  { name: "Guildford", postcode: "2161" },
  { name: "Holroyd", postcode: "2142" },
  { name: "Westmead", postcode: "2145" },
  { name: "Wentworthville", postcode: "2145" },
  { name: "Pendle Hill", postcode: "2145" },
  { name: "Toongabbie", postcode: "2146" },
  { name: "Greystanes", postcode: "2145" },
  { name: "Pemulwuy", postcode: "2145" },
  { name: "Auburn", postcode: "2144" },
  { name: "Lidcombe", postcode: "2141" },
  { name: "Berala", postcode: "2141" },
  { name: "Regents Park", postcode: "2143" },
  { name: "Silverwater", postcode: "2128" },
  { name: "Newington", postcode: "2127" },
  { name: "Wentworth Point", postcode: "2127" },

  // Strathfield & Burwood & Canada Bay
  { name: "Strathfield", postcode: "2135" },
  { name: "Strathfield South", postcode: "2136" },
  { name: "Homebush", postcode: "2140" },
  { name: "Homebush West", postcode: "2140" },
  { name: "Burwood", postcode: "2134" },
  { name: "Croydon", postcode: "2132" },
  { name: "Croydon Park", postcode: "2133" },
  { name: "Concord", postcode: "2137" },
  { name: "Concord West", postcode: "2138" },
  { name: "Rhodes", postcode: "2138" },
  { name: "Five Dock", postcode: "2046" },
  { name: "Drummoyne", postcode: "2047" },
  { name: "Russell Lea", postcode: "2046" },
  { name: "Abbotsford", postcode: "2046" },
  { name: "Canada Bay", postcode: "2046" },
  { name: "Liberty Grove", postcode: "2138" },
  { name: "Cabarita", postcode: "2137" },
  { name: "Breakfast Point", postcode: "2137" },
  { name: "Mortlake", postcode: "2137" },

  // Bankstown & Canterbury
  { name: "Bankstown", postcode: "2200" },
  { name: "Bass Hill", postcode: "2197" },
  { name: "Yagoona", postcode: "2199" },
  { name: "Birrong", postcode: "2143" },
  { name: "Condell Park", postcode: "2200" },
  { name: "Revesby", postcode: "2212" },
  { name: "Padstow", postcode: "2211" },
  { name: "Panania", postcode: "2213" },
  { name: "East Hills", postcode: "2213" },
  { name: "Lakemba", postcode: "2195" },
  { name: "Wiley Park", postcode: "2195" },
  { name: "Punchbowl", postcode: "2196" },
  { name: "Roselands", postcode: "2196" },
  { name: "Campsie", postcode: "2194" },
  { name: "Belmore", postcode: "2192" },
  { name: "Belfield", postcode: "2191" },
  { name: "Kingsgrove", postcode: "2208" },
  { name: "Beverly Hills", postcode: "2209" },
  { name: "Narwee", postcode: "2209" },

  // St George
  { name: "Hurstville", postcode: "2220" },
  { name: "Penshurst", postcode: "2222" },
  { name: "Mortdale", postcode: "2223" },
  { name: "Oatley", postcode: "2223" },
  { name: "Peakhurst", postcode: "2210" },
  { name: "Lugarno", postcode: "2210" },
  { name: "Riverwood", postcode: "2210" },
  { name: "Rockdale", postcode: "2216" },
  { name: "Bexley", postcode: "2207" },
  { name: "Bexley North", postcode: "2207" },
  { name: "Kogarah", postcode: "2217" },
  { name: "Carlton", postcode: "2218" },
  { name: "Allawah", postcode: "2218" },
  { name: "Sans Souci", postcode: "2219" },
  { name: "Ramsgate", postcode: "2217" },
  { name: "Monterey", postcode: "2217" },
  { name: "Brighton-Le-Sands", postcode: "2216" },
  { name: "Kyeemagh", postcode: "2216" },

  // Sutherland Shire
  { name: "Sutherland", postcode: "2232" },
  { name: "Kirrawee", postcode: "2232" },
  { name: "Gymea", postcode: "2227" },
  { name: "Miranda", postcode: "2228" },
  { name: "Caringbah", postcode: "2229" },
  { name: "Cronulla", postcode: "2230" },
  { name: "Woolooware", postcode: "2230" },
  { name: "Kurnell", postcode: "2231" },
  { name: "Jannali", postcode: "2226" },
  { name: "Como", postcode: "2226" },
  { name: "Sylvania", postcode: "2224" },
  { name: "Sylvania Waters", postcode: "2224" },
  { name: "Engadine", postcode: "2233" },
  { name: "Heathcote", postcode: "2233" },
  { name: "Menai", postcode: "2234" },
  { name: "Bangor", postcode: "2234" },
  { name: "Alfords Point", postcode: "2234" },
  { name: "Taren Point", postcode: "2229" },
  { name: "Loftus", postcode: "2232" },

  // Liverpool & South West
  { name: "Liverpool", postcode: "2170" },
  { name: "Warwick Farm", postcode: "2170" },
  { name: "Casula", postcode: "2170" },
  { name: "Moorebank", postcode: "2170" },
  { name: "Chipping Norton", postcode: "2170" },
  { name: "Prestons", postcode: "2170" },
  { name: "Hoxton Park", postcode: "2171" },
  { name: "Lurnea", postcode: "2170" },
  { name: "Green Valley", postcode: "2168" },
  { name: "Miller", postcode: "2168" },
  { name: "Cabramatta", postcode: "2166" },
  { name: "Canley Heights", postcode: "2166" },
  { name: "Canley Vale", postcode: "2166" },
  { name: "Fairfield", postcode: "2165" },
  { name: "Fairfield West", postcode: "2165" },
  { name: "Fairfield Heights", postcode: "2165" },
  { name: "Smithfield", postcode: "2164" },
  { name: "Wetherill Park", postcode: "2164" },
  { name: "Bossley Park", postcode: "2176" },
  { name: "Bonnyrigg", postcode: "2177" },
  { name: "Edensor Park", postcode: "2176" },
  { name: "Cecil Hills", postcode: "2171" },
  { name: "Ingleburn", postcode: "2565" },
  { name: "Minto", postcode: "2566" },
  { name: "Campbelltown", postcode: "2560" },
  { name: "Macarthur", postcode: "2560" },
  { name: "Leppington", postcode: "2179" },
  { name: "Austral", postcode: "2179" },
  { name: "Oran Park", postcode: "2570" },

  // Blacktown & West
  { name: "Blacktown", postcode: "2148" },
  { name: "Seven Hills", postcode: "2147" },
  { name: "Prospect", postcode: "2148" },
  { name: "Lalor Park", postcode: "2147" },
  { name: "Kings Langley", postcode: "2147" },
  { name: "Quakers Hill", postcode: "2763" },
  { name: "Rooty Hill", postcode: "2766" },
  { name: "Mount Druitt", postcode: "2770" },
  { name: "Doonside", postcode: "2767" },
  { name: "Woodcroft", postcode: "2767" },
  { name: "Plumpton", postcode: "2761" },
  { name: "Glendenning", postcode: "2761" },
  { name: "Dean Park", postcode: "2761" },
  { name: "Stanhope Gardens", postcode: "2768" },
  { name: "The Ponds", postcode: "2769" },
  { name: "Schofields", postcode: "2762" },
  { name: "Rouse Hill", postcode: "2155" },
  { name: "Kellyville", postcode: "2155" },
  { name: "Bella Vista", postcode: "2153" },
  { name: "Baulkham Hills", postcode: "2153" },
  { name: "Castle Hill", postcode: "2154" },
  { name: "Glenhaven", postcode: "2156" },
  { name: "Cherrybrook", postcode: "2126" },
  { name: "West Pennant Hills", postcode: "2125" },
  { name: "Carlingford", postcode: "2118" },
  { name: "North Rocks", postcode: "2151" },
  { name: "Northmead", postcode: "2152" },
  { name: "Winston Hills", postcode: "2153" },

  // Penrith & Blue Mountains fringe
  { name: "Penrith", postcode: "2750" },
  { name: "South Penrith", postcode: "2750" },
  { name: "Kingswood", postcode: "2747" },
  { name: "Cambridge Park", postcode: "2747" },
  { name: "Werrington", postcode: "2747" },
  { name: "St Marys", postcode: "2760" },
  { name: "Emu Plains", postcode: "2750" },
  { name: "Glenmore Park", postcode: "2745" },
  { name: "Jordan Springs", postcode: "2747" },
  { name: "Cranebrook", postcode: "2749" },
  { name: "Castlereagh", postcode: "2749" },
  { name: "Leonay", postcode: "2750" },
  { name: "Emu Heights", postcode: "2750" },
  { name: "Jamisontown", postcode: "2750" },
  { name: "Regentville", postcode: "2745" },
  { name: "Mulgoa", postcode: "2745" },

  // Botany & Airport
  { name: "Botany", postcode: "2019" },
  { name: "Pagewood", postcode: "2035" },
  { name: "Banksmeadow", postcode: "2019" },

  // Olympic Park
  { name: "Sydney Olympic Park", postcode: "2127" },

  // Ropes Crossing & surrounds
  { name: "Ropes Crossing", postcode: "2760" },
  { name: "Colyton", postcode: "2760" },
  { name: "Oxley Park", postcode: "2760" },
  { name: "North St Marys", postcode: "2760" },

  // Camden & outer south west
  { name: "Camden", postcode: "2570" },
  { name: "Narellan", postcode: "2567" },
  { name: "Harrington Park", postcode: "2567" },
  { name: "Mount Annan", postcode: "2567" },
  { name: "Currans Hill", postcode: "2567" },
  { name: "Gregory Hills", postcode: "2557" },
  { name: "Gledswood Hills", postcode: "2557" },

  // Botany Bay south
  { name: "Wolli Creek", postcode: "2205" },
  { name: "Tempe", postcode: "2044" },
  { name: "Turrella", postcode: "2205" },
  { name: "Bardwell Park", postcode: "2207" },
  { name: "Bardwell Valley", postcode: "2207" },

  // Ku-ring-gai extras
  { name: "West Pymble", postcode: "2073" },
  { name: "North Wahroonga", postcode: "2076" },
  { name: "South Turramurra", postcode: "2074" },
  { name: "North Turramurra", postcode: "2074" },
  { name: "Bobbin Head", postcode: "2074" },

  // Hills District extras
  { name: "Dural", postcode: "2158" },
  { name: "Galston", postcode: "2159" },
  { name: "Kenthurst", postcode: "2156" },
  { name: "Annangrove", postcode: "2156" },
  { name: "Box Hill", postcode: "2765" },
  { name: "Marsden Park", postcode: "2765" },
  { name: "Riverstone", postcode: "2765" },
  { name: "Vineyard", postcode: "2765" },
  { name: "Windsor", postcode: "2756" },
  { name: "Richmond", postcode: "2753" },

  // Hawkesbury
  { name: "Kurrajong", postcode: "2758" },
  { name: "North Richmond", postcode: "2754" },
  { name: "Wilberforce", postcode: "2756" },
  { name: "Pitt Town", postcode: "2756" },
  { name: "McGraths Hill", postcode: "2756" },
];

async function main() {
  console.log("Seeding Sydney suburbs...");

  // Find the Sydney delivery zone
  const sydneyZone = await prisma.deliveryZone.findFirst({
    where: { name: { contains: "Sydney", mode: "insensitive" } },
  });

  if (!sydneyZone) {
    console.error("No Sydney delivery zone found. Create one first in the admin dashboard.");
    process.exit(1);
  }

  console.log(`Found delivery zone: "${sydneyZone.name}" (${sydneyZone.id})`);

  // Clear existing suburbs for this zone
  const deleted = await prisma.suburb.deleteMany({
    where: { deliveryZoneId: sydneyZone.id },
  });
  console.log(`Cleared ${deleted.count} existing suburbs`);

  // Insert all suburbs
  let created = 0;
  for (const s of SYDNEY_SUBURBS) {
    try {
      await prisma.suburb.create({
        data: {
          name: s.name,
          postcode: s.postcode,
          deliveryZoneId: sydneyZone.id,
        },
      });
      created++;
    } catch {
      // Skip duplicates (unique constraint on name+zoneId)
      console.log(`  Skipped duplicate: ${s.name}`);
    }
  }

  console.log(`Seeded ${created} Sydney suburbs into "${sydneyZone.name}" zone`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
