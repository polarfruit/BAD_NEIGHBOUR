/* ============================================================
   BAD NEIGHBOUR — tuktuk.js
   Booking form: date range, time, suburb autocomplete, pricing
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const form       = document.getElementById('booking-form');
  const addressIn  = document.getElementById('book-address');
  const guestsIn   = document.getElementById('book-guests');
  const dateIn     = document.getElementById('book-date');
  const dateIso    = document.getElementById('book-date-iso');
  const hint       = document.getElementById('location-hint');
  const estimate   = document.getElementById('booking-estimate');
  const blocked    = document.getElementById('booking-blocked');
  const priceEl    = document.getElementById('estimate-price');
  const successEl  = document.getElementById('booking-success');
  const submitBtn  = document.getElementById('booking-submit');
  const dropdown   = document.getElementById('suburb-dropdown');

  if (!form) return;

  /* ============================================================
     ADELAIDE LOCATIONS — suburbs, venues, parks, landmarks
     No API needed. Blocked areas omitted entirely.
     ============================================================ */
  const LOCATIONS = [
    // ---- VENUES & EVENT SPACES ----
    { name: 'Adelaide Convention Centre', area: 'North Terrace, Adelaide' },
    { name: 'Adelaide Entertainment Centre', area: 'Hindmarsh' },
    { name: 'Adelaide Oval', area: 'North Adelaide' },
    { name: 'Adelaide Showground', area: 'Wayville' },
    { name: 'Adelaide Town Hall', area: 'King William St, Adelaide' },
    { name: 'Adelaide Zoo', area: 'Frome Rd, Adelaide' },
    { name: 'Botanic Gardens', area: 'North Terrace, Adelaide' },
    { name: 'Brighton Surf Life Saving Club', area: 'Brighton' },
    { name: 'Carrick Hill', area: 'Springfield' },
    { name: 'Coopers Stadium', area: 'Hindmarsh' },
    { name: 'Elder Park', area: 'Adelaide' },
    { name: 'Glenelg Town Hall', area: 'Glenelg' },
    { name: 'Harbour Town Adelaide', area: 'Adelaide Airport' },
    { name: 'Henley Beach Square', area: 'Henley Beach' },
    { name: 'Marion Cultural Centre', area: 'Marion' },
    { name: 'McLaren Vale Visitor Centre', area: 'McLaren Vale' },
    { name: 'Morphettville Racecourse', area: 'Morphettville' },
    { name: 'National Wine Centre', area: 'Botanic Rd, Adelaide' },
    { name: 'Norwood Oval', area: 'Norwood' },
    { name: 'Penfolds Magill Estate', area: 'Magill' },
    { name: 'Rundle Mall', area: 'Adelaide CBD' },
    { name: 'SA Museum', area: 'North Terrace, Adelaide' },
    { name: 'Semaphore Foreshore', area: 'Semaphore' },
    { name: 'The Bend Motorsport Park', area: 'Tailem Bend' },
    { name: 'Victoria Square', area: 'Adelaide CBD' },
    { name: 'Wayville Showgrounds', area: 'Wayville' },
    { name: 'West Beach Parks', area: 'West Beach' },
    // ---- HOTELS & FUNCTION CENTRES ----
    { name: 'Adelaide Hilton', area: 'Victoria Square, Adelaide' },
    { name: 'Crowne Plaza Adelaide', area: 'Hindmarsh Square, Adelaide' },
    { name: 'Hotel Richmond', area: 'Rundle Mall, Adelaide' },
    { name: 'InterContinental Adelaide', area: 'North Terrace, Adelaide' },
    { name: 'Majestic Roof Garden Hotel', area: 'Frome St, Adelaide' },
    { name: 'Novotel Adelaide', area: 'Hindley St, Adelaide' },
    { name: 'Oval Hotel', area: 'North Adelaide' },
    { name: 'Pier Hotel', area: 'Glenelg' },
    { name: 'Playford Hotel', area: 'North Terrace, Adelaide' },
    { name: 'Stamford Grand Adelaide', area: 'Glenelg' },
    { name: 'Stamford Plaza Adelaide', area: 'North Terrace, Adelaide' },
    // ---- PARKS & OUTDOOR ----
    { name: 'Adelaide Park Lands', area: 'Adelaide' },
    { name: 'Bonython Park', area: 'Adelaide' },
    { name: 'Botanic Park', area: 'Adelaide' },
    { name: 'Glenelg Foreshore', area: 'Glenelg' },
    { name: 'Hazelwood Park', area: 'Hazelwood Park' },
    { name: 'Henley Square', area: 'Henley Beach' },
    { name: 'Linear Park', area: 'Various' },
    { name: 'Morialta Conservation Park', area: 'Rostrevor' },
    { name: 'Rymill Park', area: 'Adelaide' },
    { name: 'Veale Gardens', area: 'Adelaide' },
    { name: 'Wittunga Botanic Garden', area: 'Blackwood' },
    // ---- SCHOOLS & UNIVERSITIES ----
    { name: 'Adelaide University', area: 'North Terrace, Adelaide' },
    { name: 'Flinders University', area: 'Bedford Park' },
    { name: 'UniSA City West', area: 'Adelaide' },
    { name: 'UniSA Mawson Lakes', area: 'Mawson Lakes' },
    // ---- SHOPPING CENTRES ----
    { name: 'Burnside Village', area: 'Burnside' },
    { name: 'Colonnades Shopping Centre', area: 'Noarlunga Centre' },
    { name: 'Elizabeth City Centre', area: 'Elizabeth' },
    { name: 'Marion Shopping Centre', area: 'Marion' },
    { name: 'Mitcham Square', area: 'Mitcham' },
    { name: 'Norwood Place', area: 'Norwood' },
    { name: 'Parabanks Shopping Centre', area: 'Salisbury' },
    { name: 'Tea Tree Plaza', area: 'Modbury' },
    { name: 'West Lakes Mall', area: 'West Lakes' },
    { name: 'Westfield Marion', area: 'Marion' },
    { name: 'Westfield West Lakes', area: 'West Lakes' }
  ];

  // ---- STREETS (major roads — user can prepend a street number) ----
  const STREETS = [
    // CBD
    { street: 'Wakefield Street', area: 'Adelaide', postcode: '5000' },
    { street: 'Rundle Street', area: 'Adelaide', postcode: '5000' },
    { street: 'Rundle Mall', area: 'Adelaide', postcode: '5000' },
    { street: 'Hindley Street', area: 'Adelaide', postcode: '5000' },
    { street: 'Grenfell Street', area: 'Adelaide', postcode: '5000' },
    { street: 'Currie Street', area: 'Adelaide', postcode: '5000' },
    { street: 'King William Street', area: 'Adelaide', postcode: '5000' },
    { street: 'King William Road', area: 'Unley', postcode: '5061' },
    { street: 'North Terrace', area: 'Adelaide', postcode: '5000' },
    { street: 'South Terrace', area: 'Adelaide', postcode: '5000' },
    { street: 'East Terrace', area: 'Adelaide', postcode: '5000' },
    { street: 'West Terrace', area: 'Adelaide', postcode: '5000' },
    { street: 'Hutt Street', area: 'Adelaide', postcode: '5000' },
    { street: 'Gouger Street', area: 'Adelaide', postcode: '5000' },
    { street: 'Grote Street', area: 'Adelaide', postcode: '5000' },
    { street: 'Flinders Street', area: 'Adelaide', postcode: '5000' },
    { street: 'Franklin Street', area: 'Adelaide', postcode: '5000' },
    { street: 'Pirie Street', area: 'Adelaide', postcode: '5000' },
    { street: 'Pulteney Street', area: 'Adelaide', postcode: '5000' },
    { street: 'Frome Street', area: 'Adelaide', postcode: '5000' },
    { street: 'Morphett Street', area: 'Adelaide', postcode: '5000' },
    { street: 'Wright Street', area: 'Adelaide', postcode: '5000' },
    { street: 'Sturt Street', area: 'Adelaide', postcode: '5000' },
    { street: 'Waymouth Street', area: 'Adelaide', postcode: '5000' },
    { street: 'Angas Street', area: 'Adelaide', postcode: '5000' },
    { street: 'Carrington Street', area: 'Adelaide', postcode: '5000' },
    { street: 'Halifax Street', area: 'Adelaide', postcode: '5000' },
    { street: 'Leigh Street', area: 'Adelaide', postcode: '5000' },
    { street: 'Peel Street', area: 'Adelaide', postcode: '5000' },
    { street: 'Gawler Place', area: 'Adelaide', postcode: '5000' },
    { street: 'Victoria Square', area: 'Adelaide', postcode: '5000' },
    // Inner suburbs & popular strips
    { street: 'O\'Connell Street', area: 'North Adelaide', postcode: '5006' },
    { street: 'Melbourne Street', area: 'North Adelaide', postcode: '5006' },
    { street: 'Jetty Road', area: 'Glenelg', postcode: '5045' },
    { street: 'Jetty Road', area: 'Brighton', postcode: '5048' },
    { street: 'The Parade', area: 'Norwood', postcode: '5067' },
    { street: 'Prospect Road', area: 'Prospect', postcode: '5082' },
    { street: 'Unley Road', area: 'Unley', postcode: '5061' },
    { street: 'Goodwood Road', area: 'Goodwood', postcode: '5034' },
    { street: 'Henley Beach Road', area: 'Mile End', postcode: '5031' },
    { street: 'Semaphore Road', area: 'Semaphore', postcode: '5019' },
    { street: 'Military Road', area: 'Semaphore', postcode: '5019' },
    { street: 'Commercial Road', area: 'Port Adelaide', postcode: '5015' },
    { street: 'Churchill Road', area: 'Prospect', postcode: '5082' },
    // Major roads
    { street: 'Magill Road', area: 'Magill', postcode: '5072' },
    { street: 'Payneham Road', area: 'Payneham', postcode: '5070' },
    { street: 'Anzac Highway', area: 'Ashford', postcode: '5035' },
    { street: 'South Road', area: 'Adelaide', postcode: '5000' },
    { street: 'Main North Road', area: 'Prospect', postcode: '5082' },
    { street: 'Port Road', area: 'Hindmarsh', postcode: '5007' },
    { street: 'Greenhill Road', area: 'Eastwood', postcode: '5063' },
    { street: 'Glen Osmond Road', area: 'Parkside', postcode: '5063' },
    { street: 'Brighton Road', area: 'Brighton', postcode: '5048' },
    { street: 'Tapleys Hill Road', area: 'Glenelg North', postcode: '5045' },
    { street: 'Marion Road', area: 'Marion', postcode: '5043' },
    { street: 'Cross Road', area: 'Cumberland Park', postcode: '5041' },
    { street: 'Sir Donald Bradman Drive', area: 'Hilton', postcode: '5033' },
    { street: 'Diagonal Road', area: 'Somerton Park', postcode: '5044' },
    { street: 'Torrens Road', area: 'Kilkenny', postcode: '5009' },
    { street: 'Grand Junction Road', area: 'Ottoway', postcode: '5013' },
    { street: 'Port Wakefield Road', area: 'Gepps Cross', postcode: '5094' },
    { street: 'Main South Road', area: 'Morphett Vale', postcode: '5162' },
    { street: 'Regency Road', area: 'Regency Park', postcode: '5010' },
    { street: 'Portrush Road', area: 'Payneham', postcode: '5070' },
    { street: 'Lower North East Road', area: 'Campbelltown', postcode: '5074' },
    { street: 'North East Road', area: 'Walkerville', postcode: '5081' },
    { street: 'Fullarton Road', area: 'Fullarton', postcode: '5063' },
    { street: 'The Esplanade', area: 'Henley Beach', postcode: '5022' },
    { street: 'The Esplanade', area: 'Semaphore', postcode: '5019' },
    { street: 'Seaview Road', area: 'Henley Beach', postcode: '5022' },
    { street: 'Military Road', area: 'West Beach', postcode: '5024' },
    { street: 'Morphett Road', area: 'Glengowrie', postcode: '5044' },
    { street: 'Sherriff Street', area: 'Underdale', postcode: '5032' },
    { street: 'James Congdon Drive', area: 'Thebarton', postcode: '5031' }
  ];

  // ---- SUBURBS ----
  const SUBURBS = [
    'Aberfoyle Park','Adelaide','Albert Park','Alberton','Aldinga','Aldinga Beach',
    'Allenby Gardens','Angle Park','Angle Vale','Ascot Park','Athelstone',
    'Athol Park','Auldana','Banksia Park','Beaumont','Bedford Park','Belair',
    'Bellevue Heights','Beverley','Birkenhead','Blair Athol','Blakeview',
    'Bolivar','Bowden','Brahma Lodge','Brighton','Broadview','Brompton',
    'Brooklyn Park','Brown Hill Creek','Burnside','Burton','Camden Park',
    'Campbelltown','Cavan','Cheltenham','Christie Downs',
    'Christies Beach','Clarence Gardens','Clarence Park','Clearview',
    'Clovelly Park','Collinswood','Colonel Light Gardens',
    'Coromandel Valley','Cowandilla','Craigburn Farm','Croydon','Croydon Park',
    'Cumberland Park','Darlington','Davoren Park','Daw Park','Devon Park',
    'Dernancourt','Dry Creek','Dulwich','East Adelaide','Eastwood',
    'Eden Hills','Edwardstown','Elizabeth','Elizabeth Downs','Elizabeth East',
    'Elizabeth Grove','Elizabeth North','Elizabeth Park','Elizabeth South',
    'Elizabeth Vale','Enfield','Erindale','Ethelton',
    'Evandale','Evanston','Evanston Gardens','Evanston Park','Everard Park',
    'Exeter','Fairview Park','Felixstow','Ferryden Park','Findon',
    'Firle','Flagstaff Hill','Flinders Park','Forestville','Frewville',
    'Fulham','Fulham Gardens','Fullarton','Gawler','Gawler Belt',
    'Gawler East','Gawler South','Gawler West','Gepps Cross','Gilberton',
    'Gilles Plains','Gillman','Glandore','Glen Osmond','Glenalta',
    'Glengowrie','Glenelg','Glenelg East','Glenelg North','Glenelg South',
    'Glenside','Golden Grove','Goodwood','Gould Creek','Grange',
    'Greenacres','Greenfields','Greenwith','Gulfview Heights',
    'Hackham','Hackham West','Hackney','Hallett Cove',
    'Hampstead Gardens','Happy Valley','Hawthorn','Hawthorndene',
    'Hendon','Henley Beach','Henley Beach South','Highbury',
    'Highgate','Hillbank','Hillcrest','Hilton','Hindmarsh',
    'Holden Hill','Hope Valley','Hove','Huntfield Heights','Hyde Park',
    'Ingle Farm','Joslin','Kensington','Kensington Gardens',
    'Kensington Park','Kent Town','Keswick','Kidman Park','Kilburn',
    'Kilkenny','Kings Park','Kingston Park','Klemzig',
    'Largs Bay','Largs North','Leabrook','Lightsview','Linden Park',
    'Lockleys','Lower Mitcham','Lonsdale','Magill','Malvern',
    'Manningham','Mansfield Park','Marden','Marion','Marino',
    'Marleston','Maslin Beach','Mawson Lakes','Maylands','McLaren Flat',
    'McLaren Vale','Medindie','Melrose Park','Mile End','Millswood',
    'Mitcham','Mitchell Park','Modbury','Modbury Heights','Modbury North',
    'Moana','Morphett Vale','Morphettville','Mount Osmond',
    'Munno Para','Munno Para Downs','Munno Para West','Myrtle Bank',
    'Nailsworth','Netherby','Netley',
    'Newton','Noarlunga Centre','Noarlunga Downs',
    'North Adelaide','North Brighton','North Haven','North Plympton',
    'Northfield','Northgate','Norwood','Novar Gardens','Oakden',
    'Oaklands Park','Old Noarlunga','Old Reynella','One Tree Hill',
    'Osborne','Ottoway','Outer Harbor','Ovingham','O\'Halloran Hill',
    'Panorama','Paradise','Parafield','Parafield Gardens','Para Hills',
    'Para Hills West','Para Vista','Paralowie','Park Holme',
    'Parkside','Pasadena','Payneham','Payneham South','Pennington',
    'Peterhead','Plympton','Plympton Park',
    'Pooraka','Port Adelaide','Port Noarlunga',
    'Port Noarlunga South','Port Willunga','Prospect','Queenstown',
    'Redwood Park','Regency Park','Renown Park','Reynella',
    'Reynella East','Richmond','Ridgehaven','Ridleyton',
    'Rose Park','Rosewater','Rosslyn Park','Rostrevor','Royal Park',
    'Royston Park','St Agnes','St Clair','St Georges','St Kilda',
    'St Marys','St Morris','St Peters','Salisbury','Salisbury Downs',
    'Salisbury East','Salisbury Heights','Salisbury North',
    'Salisbury Park','Salisbury Plain','Salisbury South','Seaford',
    'Seaford Heights','Seaford Meadows','Seaford Rise','Seacliff',
    'Seacliff Park','Seaton','Seaview Downs','Sellicks Beach',
    'Semaphore','Semaphore Park','Semaphore South','Sheidow Park',
    'Smithfield','Smithfield Plains','Somerton Park','South Brighton',
    'South Plympton','Springfield','Sturt','Surrey Downs',
    'Tea Tree Gully','Tennyson','Thebarton','Thorngate','Toorak Gardens',
    'Torrensville','Torrens Park','Totness','Tranmere','Trinity Gardens',
    'Trott Park','Tusmore','Two Wells','Underdale','Unley',
    'Unley Park','Vale Park','Valley View','Virginia',
    'Vista','Walkerville','Walkley Heights','Warradale',
    'Waterfall Gully','Waterloo Corner','Wayville','Welland',
    'West Beach','West Croydon','West Hindmarsh','West Lakes',
    'West Lakes Shore','West Richmond','Westbourne Park','Willaston',
    'Willunga','Windsor Gardens','Wingfield','Woodcroft',
    'Woodville','Woodville Gardens','Woodville North','Woodville Park',
    'Woodville South','Woodville West','Wynn Vale','Yatala Vale'
  ];

  /* ============================================================
     BLOCKED SUBURBS — Adelaide Hills & regional
     ============================================================ */
  const blockedSuburbs = [
    'adelaide hills','mount lofty','stirling','crafers','bridgewater',
    'hahndorf','lobethal','woodside','birdwood','gumeracha',
    'mount barker','nairne','littlehampton','echunga','meadows',
    'macclesfield','strathalbyn','mylor','aldgate','basket range',
    'norton summit','uraidla','summertown','piccadilly','greenhill',
    'carey gully','ashton','lenswood','forest range',
    'charleston','mount pleasant','williamstown','chain of ponds',
    'kersbrook','mount torrens','palmer',
    'mannum','murray bridge','victor harbor','port augusta',
    'port lincoln','whyalla','mount gambier','clare','barossa',
    'tanunda','nuriootpa','angaston','lyndoch','kapunda',
    'renmark','berri','loxton','waikerie','riverland'
  ];

  function isBlocked(location) {
    const lower = location.toLowerCase().trim();
    return blockedSuburbs.some(s => lower.includes(s));
  }

  /* ============================================================
     SEARCHABLE SUBURB DROPDOWN
     ============================================================ */
  let activeIndex = -1;

  function showDropdown(venueMatches, streetMatches, suburbMatches, streetNum) {
    dropdown.innerHTML = '';
    activeIndex = -1;

    if (!venueMatches.length && !streetMatches.length && !suburbMatches.length) {
      dropdown.style.display = 'none';
      return;
    }

    // 1) Venue/location results
    venueMatches.slice(0, 3).forEach((loc) => {
      const item = document.createElement('div');
      item.className = 'tuktuk-suburb-item tuktuk-suburb-item--venue';
      item.innerHTML = '<strong>' + loc.name + '</strong> <span class="tuktuk-suburb-area">— ' + loc.area + '</span>';
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        addressIn.value = loc.name + ', ' + loc.area;
        dropdown.style.display = 'none';
        updateEstimate();
      });
      dropdown.appendChild(item);
    });

    // 2) Street results
    streetMatches.slice(0, 4).forEach((st) => {
      const prefix = streetNum ? streetNum + ' ' : '';
      const label = prefix + st.street + ', ' + st.area + ' ' + st.postcode;
      const item = document.createElement('div');
      item.className = 'tuktuk-suburb-item tuktuk-suburb-item--street';
      item.innerHTML = '<span class="tuktuk-street-name">' + prefix + st.street + '</span> <span class="tuktuk-suburb-area">— ' + st.area + ' ' + st.postcode + '</span>';
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        addressIn.value = label;
        dropdown.style.display = 'none';
        updateEstimate();
      });
      dropdown.appendChild(item);
    });

    // 3) Suburb results
    suburbMatches.slice(0, 4).forEach((suburb) => {
      const item = document.createElement('div');
      item.className = 'tuktuk-suburb-item';
      item.textContent = suburb + ', SA';
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        addressIn.value = suburb + ', SA';
        dropdown.style.display = 'none';
        updateEstimate();
      });
      dropdown.appendChild(item);
    });

    dropdown.style.display = 'block';
  }

  addressIn.addEventListener('input', () => {
    const raw = addressIn.value.trim();
    if (raw.length < 2) {
      dropdown.style.display = 'none';
      return;
    }

    // Detect leading street number (e.g. "3 wakefield" → num=3, text="wakefield")
    let streetNum = '';
    let searchText = raw.toLowerCase();
    const numMatch = raw.match(/^(\d+[-/]?\d*)\s+(.+)/);
    if (numMatch) {
      streetNum = numMatch[1];
      searchText = numMatch[2].toLowerCase();
    }

    // Normalise common abbreviations for matching
    const normalised = searchText
      .replace(/\bst\b/g, 'street')
      .replace(/\brd\b/g, 'road')
      .replace(/\bhwy\b/g, 'highway')
      .replace(/\bdr\b/g, 'drive')
      .replace(/\bave?\b/g, 'avenue')
      .replace(/\btce\b/g, 'terrace')
      .replace(/\bpl\b/g, 'place')
      .replace(/\bcrt?\b/g, 'court')
      .replace(/\bcres\b/g, 'crescent');

    // Search venues/locations (use original text — no abbreviation expansion)
    const venueMatches = LOCATIONS.filter(loc =>
      loc.name.toLowerCase().includes(searchText) || loc.area.toLowerCase().includes(searchText)
    );
    venueMatches.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(searchText) ? 0 : 1;
      const bStarts = b.name.toLowerCase().startsWith(searchText) ? 0 : 1;
      return aStarts - bStarts || a.name.localeCompare(b.name);
    });

    // Search streets (match on both raw text and normalised abbreviations)
    const streetMatches = STREETS.filter(st => {
      const full = (st.street + ' ' + st.area + ' ' + st.postcode).toLowerCase();
      return full.includes(searchText) || full.includes(normalised);
    });
    streetMatches.sort((a, b) => {
      const aStarts = a.street.toLowerCase().startsWith(searchText) || a.street.toLowerCase().startsWith(normalised) ? 0 : 1;
      const bStarts = b.street.toLowerCase().startsWith(searchText) || b.street.toLowerCase().startsWith(normalised) ? 0 : 1;
      return aStarts - bStarts || a.street.localeCompare(b.street);
    });

    // Search suburbs
    const suburbMatches = SUBURBS.filter(s => s.toLowerCase().includes(searchText));
    suburbMatches.sort((a, b) => {
      const aStarts = a.toLowerCase().startsWith(searchText) ? 0 : 1;
      const bStarts = b.toLowerCase().startsWith(searchText) ? 0 : 1;
      return aStarts - bStarts || a.localeCompare(b);
    });

    showDropdown(venueMatches, streetMatches, suburbMatches, streetNum);
  });

  // Keyboard navigation
  addressIn.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('.tuktuk-suburb-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      items.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      items.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      items[activeIndex].dispatchEvent(new Event('mousedown'));
    }
  });

  // Close dropdown on blur
  addressIn.addEventListener('blur', () => {
    setTimeout(() => { dropdown.style.display = 'none'; }, 150);
  });

  // Re-open on focus if there's text
  addressIn.addEventListener('focus', () => {
    if (addressIn.value.trim().length >= 2) {
      addressIn.dispatchEvent(new Event('input'));
    }
  });

  /* ============================================================
     CUSTOM CALENDAR — date range support
     ============================================================ */
  const cal       = document.getElementById('tuktuk-cal');
  const calTitle  = document.getElementById('cal-title');
  const calGrid   = document.getElementById('cal-grid');
  const calDaysH  = document.getElementById('cal-days-header');
  const calPrev   = document.getElementById('cal-prev');
  const calNext   = document.getElementById('cal-next');
  const calDone   = document.getElementById('cal-done');

  const today     = new Date();
  today.setHours(0, 0, 0, 0);

  let viewYear    = today.getFullYear();
  let viewMonth   = today.getMonth();
  let startDate   = null;
  let endDate     = null;

  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const DAYS   = ['Mo','Tu','We','Th','Fr','Sa','Su'];

  DAYS.forEach(d => {
    const el = document.createElement('span');
    el.className = 'tuktuk-cal-day-name';
    el.textContent = d;
    calDaysH.appendChild(el);
  });

  function formatDisplay(date) {
    const dayName = date.toLocaleDateString('en-AU', { weekday: 'short' });
    const d = date.getDate();
    const monthName = date.toLocaleDateString('en-AU', { month: 'short' });
    return `${dayName} ${d} ${monthName} ${date.getFullYear()}`;
  }

  function toIso(date) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }

  function isSameDay(a, b) { return a && b && a.getTime() === b.getTime(); }
  function isInRange(date) { return startDate && endDate && date >= startDate && date <= endDate; }

  function updateDateField() {
    if (startDate && endDate && !isSameDay(startDate, endDate)) {
      dateIn.value = `${formatDisplay(startDate)} — ${formatDisplay(endDate)}`;
      dateIso.value = `${toIso(startDate)} to ${toIso(endDate)}`;
    } else if (startDate) {
      dateIn.value = formatDisplay(startDate);
      dateIso.value = toIso(startDate);
    } else {
      dateIn.value = '';
      dateIso.value = '';
    }
    updateEstimate();
  }

  function renderCalendar() {
    calGrid.innerHTML = '';
    calTitle.textContent = `${MONTHS[viewMonth]} ${viewYear}`;

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const startOffset = (firstDay + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < startOffset; i++) {
      const empty = document.createElement('span');
      empty.className = 'tuktuk-cal-cell tuktuk-cal-cell--empty';
      calGrid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'tuktuk-cal-cell';
      cell.textContent = d;

      const cellDate = new Date(viewYear, viewMonth, d);
      cellDate.setHours(0, 0, 0, 0);

      if (cellDate < today) { cell.classList.add('tuktuk-cal-cell--past'); cell.disabled = true; }
      if (isSameDay(cellDate, today)) cell.classList.add('tuktuk-cal-cell--today');

      if (isSameDay(cellDate, startDate)) {
        cell.classList.add('tuktuk-cal-cell--selected');
        if (endDate && !isSameDay(startDate, endDate)) cell.classList.add('tuktuk-cal-cell--range-start');
      }
      if (endDate && isSameDay(cellDate, endDate) && !isSameDay(startDate, endDate)) {
        cell.classList.add('tuktuk-cal-cell--selected');
        cell.classList.add('tuktuk-cal-cell--range-end');
      }
      if (isInRange(cellDate) && !isSameDay(cellDate, startDate) && !isSameDay(cellDate, endDate)) {
        cell.classList.add('tuktuk-cal-cell--in-range');
      }

      cell.addEventListener('click', () => {
        if (!startDate || (startDate && endDate)) {
          startDate = cellDate; endDate = null;
        } else {
          if (cellDate < startDate) { endDate = startDate; startDate = cellDate; }
          else { endDate = cellDate; }
        }
        updateDateField();
        renderCalendar();
      });

      calGrid.appendChild(cell);
    }

    calPrev.disabled = (viewYear === today.getFullYear() && viewMonth === today.getMonth());
  }

  calDone.addEventListener('click', () => { if (startDate) cal.classList.remove('open'); });
  dateIn.addEventListener('click', () => { cal.classList.toggle('open'); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.tuktuk-date-wrap')) cal.classList.remove('open'); });
  calPrev.addEventListener('click', () => { viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } renderCalendar(); });
  calNext.addEventListener('click', () => { viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } renderCalendar(); });

  renderCalendar();

  /* ============================================================
     PRICING
     ============================================================ */
  const pricing = { small: 1000, medium: 2000, large: 3000 };

  function formatPrice(amount) {
    return '$' + amount.toLocaleString('en-AU');
  }

  function updateEstimate() {
    const address = addressIn.value.trim();
    const guests  = guestsIn.value;

    estimate.style.display = 'none';
    blocked.style.display  = 'none';
    hint.textContent       = '';
    hint.className         = 'tuktuk-form-hint';

    if (!address) return;

    if (isBlocked(address)) {
      blocked.style.display = 'block';
      hint.textContent = 'This location is outside our service area.';
      hint.className = 'tuktuk-form-hint tuktuk-form-hint--blocked';
      return;
    }

    hint.textContent = 'This location is within our service area.';
    hint.className = 'tuktuk-form-hint tuktuk-form-hint--ok';

    if (guests && pricing[guests]) {
      let days = 1;
      if (startDate && endDate) {
        days = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      }
      const total = pricing[guests] * days;
      const dayLabel = days > 1 ? ` (${days} days)` : '';
      priceEl.textContent = formatPrice(total) + dayLabel;
      estimate.style.display = 'block';
    }
  }

  guestsIn.addEventListener('change', updateEstimate);

  /* ============================================================
     FORM SUBMISSION
     ============================================================ */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const address = addressIn.value.trim();

    if (!dateIso.value) {
      dateIn.focus();
      cal.classList.add('open');
      return;
    }

    if (!address) {
      addressIn.focus();
      hint.textContent = 'Please select a location.';
      hint.className = 'tuktuk-form-hint tuktuk-form-hint--blocked';
      return;
    }

    if (isBlocked(address)) {
      blocked.style.display = 'block';
      blocked.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    let days = 1;
    if (startDate && endDate) {
      days = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    }
    const basePrice = pricing[guestsIn.value] || 0;
    const totalPrice = basePrice * days;

    const data = {
      name:       document.getElementById('book-name').value,
      email:      document.getElementById('book-email').value,
      phone:      document.getElementById('book-phone').value,
      date:       dateIso.value,
      time_start: document.getElementById('book-time-start').value,
      time_end:   document.getElementById('book-time-end').value,
      days:       days,
      event_type: document.getElementById('book-event-type').value,
      guests:     guestsIn.value,
      address:    address,
      message:    document.getElementById('book-message').value,
      total_price: totalPrice
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Something went wrong.');

      form.style.display      = 'none';
      successEl.style.display  = 'block';
      successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Enquiry';
      alert(err.message || 'Something went wrong. Please try again.');
    }
  });

});
