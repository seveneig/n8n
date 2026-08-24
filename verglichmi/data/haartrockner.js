/**
 * Verglichmi – Testdaten "Haartrockner 2026"
 * ------------------------------------------------------------------
 * Diese Datei ist der einzige Ort, an dem inhaltliche Angaben stehen.
 * Fuer einen neuen Vergleich: Datei kopieren, Werte ersetzen, in der
 * index.html das <script src="..."> auf die neue Datei zeigen lassen.
 * Struktur und Feldbedeutung sind in README.md dokumentiert.
 */
window.VG_DATA = {

  /* ---------------------------------------------------------------
   * 1) Seiten-Metadaten
   * ------------------------------------------------------------- */
  meta: {
    category: 'Haartrockner',
    breadcrumb: ['Ratgeber', 'Haushalt', 'Haarpflege'],
    kicker: 'Testsieger mit Note 1,1 – und ein Preistipp unter CHF 80.–',
    title: 'Die besten Haartrockner im Test',
    year: 2026,
    lead:
      'Schnell trocken, ohne das Haar zu verbrennen: Ein guter Haartrockner spart jeden Morgen ' +
      'Minuten und schont die Haarstruktur. Wir haben <strong>8 Modelle von CHF 79.– bis CHF 519.–</strong> ' +
      'durch denselben Parcours geschickt – mit Echthaarsträhnen, Thermokamera und Schallpegelmesser. ' +
      'Unten sehen Sie zuerst die Bestenliste, danach folgt zu jedem Gerät der ausführliche Einzeltest.',
    updated: '2026-08-24',
    published: '2026-02-11',
    readingTime: 14,
    author: {
      name: 'Nina Brunner',
      role: 'Ressortleiterin Haushalt & Beauty',
      initials: 'NB',
      bio: 'Testet seit 2018 Haushalts- und Beauty-Geräte. Hat für diesen Vergleich rund 40 Stunden geföhnt.',
    },
    testFacts: [
      { value: '8', label: 'Modelle im Test' },
      { value: '96', label: 'Messungen' },
      { value: '40 h', label: 'Testdauer' },
      { value: '6', label: 'Testkriterien' },
    ],
  },

  /* ---------------------------------------------------------------
   * 2) Affiliate-Konfiguration
   *    staging: true  -> alle Links werden neutralisiert und sichtbar
   *                      als Staging markiert (kein echtes Tracking).
   *    staging: false -> es werden die echten Deeplinks gebaut.
   * ------------------------------------------------------------- */
  affiliate: {
    staging: true,
    disclosureShort: 'Anzeige / Affiliate-Links',
    disclosureTitle: 'Unser Versprechen',
    disclosureText:
      'Unabhängige Tests, ehrliche Empfehlungen. Kaufen Sie über einen unserer Links, erhalten wir ' +
      'eine kleine Provision vom Händler – für Sie bleibt der Preis exakt gleich. Auf die Testnote ' +
      'hat das keinen Einfluss: Wir kaufen alle Geräte selbst und geben sie nach dem Test zurück.',
    shops: {
      amazon: {
        label: 'Amazon',
        note: 'Prime-Versand',
        theme: 'amazon',
        pattern: 'https://www.amazon.de/dp/{sku}/?tag={tag}',
        tag: 'verglichmi-21',
      },
      galaxus: {
        label: 'Galaxus',
        note: 'Versand aus der CH',
        theme: 'galaxus',
        pattern: 'https://www.galaxus.ch/de/s1/product/{sku}?utm_source={tag}',
        tag: 'verglichmi',
      },
      brack: {
        label: 'Brack.ch',
        note: 'Abholung möglich',
        theme: 'brack',
        pattern: 'https://www.brack.ch/{sku}?utm_source={tag}',
        tag: 'verglichmi',
      },
    },
    /* Reihenfolge der Buttons in den Produktboxen */
    shopOrder: ['amazon', 'galaxus', 'brack'],
  },

  /* ---------------------------------------------------------------
   * 3) Testkriterien (Gewichtung ergibt 100 %)
   * ------------------------------------------------------------- */
  criteria: [
    { key: 'trocknung', label: 'Trocknungsleistung', weight: 30,
      desc: 'Gemessene Zeit, bis eine standardisierte Echthaarsträhne (30 g, 20 cm) von 60 % auf 10 % Restfeuchte kommt.' },
    { key: 'haarschutz', label: 'Haar- & Hitzeschutz', weight: 25,
      desc: 'Maximale Austrittstemperatur per Thermokamera, Regelverhalten der Elektronik und Glanzmessung nach 20 Trocknungszyklen.' },
    { key: 'handling', label: 'Handling & Ergonomie', weight: 20,
      desc: 'Gewicht, Schwerpunkt, Bedienbarkeit der Schalter mit einer Hand, Kabellänge und Drehgelenk.' },
    { key: 'lautstaerke', label: 'Lautstärke', weight: 10,
      desc: 'Schallpegel in 30 cm Abstand auf höchster Stufe sowie subjektive Bewertung der Klangfarbe.' },
    { key: 'ausstattung', label: 'Ausstattung & Aufsätze', weight: 10,
      desc: 'Anzahl und Nutzen der Aufsätze, Magnethalterung, Kaltstufe, Filterreinigung und Zubehör.' },
    { key: 'verarbeitung', label: 'Verarbeitung', weight: 5,
      desc: 'Materialqualität, Spaltmasse, Kabelübergang und Reparierbarkeit.' },
  ],

  /* ---------------------------------------------------------------
   * 4) Spalten der grossen Vergleichstabelle
   *    (key verweist auf product.specs[key])
   * ------------------------------------------------------------- */
  specFields: [
    { key: 'leistung',     label: 'Leistung',            group: 'Technik' },
    { key: 'motor',        label: 'Motortyp',            group: 'Technik' },
    { key: 'trockenzeit',  label: 'Trocknungszeit (Teststrähne)', group: 'Messwerte', highlight: true },
    { key: 'maxTemp',      label: 'Max. Temperatur',     group: 'Messwerte', highlight: true },
    { key: 'lautstaerke',  label: 'Lautstärke (30 cm)',  group: 'Messwerte', highlight: true },
    { key: 'luftstrom',    label: 'Luftgeschwindigkeit', group: 'Messwerte' },
    { key: 'gewicht',      label: 'Gewicht (ohne Kabel)', group: 'Handling' },
    { key: 'masse',        label: 'Masse (H × B × T)',   group: 'Handling' },
    { key: 'kabel',        label: 'Kabellänge',          group: 'Handling' },
    { key: 'stufen',       label: 'Hitze-/Gebläsestufen', group: 'Bedienung' },
    { key: 'kaltstufe',    label: 'Kaltstufe',           group: 'Bedienung' },
    { key: 'ionen',        label: 'Ionen-/Pflegefunktion', group: 'Bedienung' },
    { key: 'aufsaetze',    label: 'Aufsätze im Lieferumfang', group: 'Ausstattung' },
    { key: 'filter',       label: 'Filter reinigbar',    group: 'Ausstattung' },
    { key: 'garantie',     label: 'Garantie',            group: 'Ausstattung' },
  ],

  /* Kurz-Chips, die direkt in der Produktbox stehen */
  quickSpecs: ['trockenzeit', 'maxTemp', 'lautstaerke', 'gewicht'],

  /* ---------------------------------------------------------------
   * 5) Produkte – sortiert nach Testnote
   * ------------------------------------------------------------- */
  products: [
    {
      id: 'dyson-nural',
      brand: 'Dyson',
      model: 'Supersonic Nural HD16',
      badge: 'Testsieger',
      grade: 1.1,
      accent: '#c94f7c',
      claim: 'Trocknet am schnellsten und regelt die Hitze am Ohr automatisch herunter.',
      price: { current: 519, uvp: 549 },
      pros: [
        'Mit Abstand kürzeste Trocknungszeit im Test',
        'Senkt die Temperatur automatisch, sobald das Gerät nah an die Kopfhaut kommt',
        'Aufsätze halten magnetisch und lassen sich im Betrieb drehen',
        'Sehr angenehmes, tiefes Laufgeräusch trotz hoher Drehzahl',
      ],
      cons: [
        'Mit Abstand teuerstes Gerät im Test',
        'Ersatzfilter und Zubehör nur direkt beim Hersteller',
      ],
      specs: {
        leistung: '1600 W',
        motor: 'Digitalmotor V9, 110 000 U/min',
        trockenzeit: '3:42 min',
        maxTemp: '88 °C',
        lautstaerke: '79 dB(A)',
        luftstrom: '41 m/s',
        gewicht: '660 g',
        masse: '24,5 × 9,7 × 7,8 cm',
        kabel: '1,9 m',
        stufen: '4 / 3',
        kaltstufe: 'Ja, dauerhaft schaltbar',
        ionen: 'Air Multiplier + Ionen',
        aufsaetze: '5 (Konzentrator, Diffusor, Glättdüse, Sanftaufsatz, Breite Düse)',
        filter: 'Ja, abnehmbar und abspülbar',
        garantie: '2 Jahre',
      },
      scores: { trocknung: 97, haarschutz: 94, handling: 88, lautstaerke: 90, ausstattung: 96, verarbeitung: 95 },
      offers: {
        amazon:  { sku: 'B0CTHM5QW3', price: 519 },
        galaxus: { sku: '48219733',   price: 529 },
        brack:   { sku: 'dyson-supersonic-nural-hd16', price: 535 },
      },
      review: {
        kicker: 'Testsieger',
        headline: 'Dyson Supersonic Nural: schnell, leise, teuer',
        verdict: 'Der beste Haartrockner im Test – wenn der Preis keine Rolle spielt.',
        bestFor: 'Für alle, die täglich föhnen und langes oder dickes Haar haben.',
        paragraphs: [
          'Der Supersonic Nural ist die dritte Generation von Dysons Haartrockner und gewinnt den Test mit der Note 1,1. Der Grund ist vor allem ein Messwert: Unsere Teststrähne war nach <strong>3:42 Minuten</strong> trocken – das schnellste Ergebnis im Feld und knapp zwei Minuten schneller als der Durchschnitt. Möglich macht das der kleine Digitalmotor im Griff, der 110 000 Umdrehungen pro Minute schafft und die Luft mit 41 m/s aus der Düse presst.',
          'Interessanter als die reine Geschwindigkeit ist im Alltag aber die Hitzeregelung. Ein Sensor misst 20-mal pro Sekunde die Temperatur am Luftauslass, ein zweiter erkennt über einen Abstandssensor, wann das Gerät nahe an die Kopfhaut kommt – und dreht dann automatisch zurück. In unserer Thermokamera-Messung blieb die Austrittstemperatur konstant unter 90 °C; günstige Geräte im Test erreichten kurzzeitig über 120 °C. Nach 20 aufeinanderfolgenden Trocknungszyklen zeigte die Teststrähne den geringsten Glanzverlust aller Geräte.',
          'Die fünf Aufsätze sitzen magnetisch und lassen sich auch im laufenden Betrieb drehen, ohne dass man sie anfassen muss – ein Detail, das nach zwei Wochen Nutzung überraschend viel ausmacht. Das Laufgeräusch liegt mit 79 dB(A) nicht am unteren Ende des Feldes, ist aber deutlich tiefer und damit subjektiv angenehmer als das Pfeifen der AC-Geräte.',
          'Bleibt der Preis: Mit CHF 519.– kostet der Nural das Sechsfache unseres Preistipps. Wer zweimal pro Woche föhnt, wird den Unterschied kaum je amortisieren. Wer dagegen jeden Morgen 15 Minuten mit dickem, langem Haar kämpft, spart über ein Jahr gerechnet mehrere Stunden – und schont dabei nachweislich die Haarstruktur.',
        ],
        imageCaption: 'Der Abstandssensor im Kopf des Nural regelt die Hitze herunter, sobald das Gerät nah an die Kopfhaut kommt.',
      },
    },

    {
      id: 'shark-speedstyle',
      brand: 'Shark',
      model: 'SpeedStyle Pro HD440',
      badge: 'Preis-Leistungs-Sieger',
      grade: 1.4,
      accent: '#3a7bd5',
      claim: 'Fast so schnell wie der Dyson – für knapp die Hälfte des Preises.',
      price: { current: 299, uvp: 349 },
      pros: [
        'Zweitschnellste Trocknungszeit im Test',
        'Aufsätze klicken magnetisch ein und sitzen bombenfest',
        'Automatikmodus erkennt Restfeuchte und drosselt die Hitze',
        'Kompakt genug fürs Reisegepäck',
      ],
      cons: [
        'Auf höchster Stufe mit 84 dB(A) hörbar lauter als der Testsieger',
        'Diffusor fällt für sehr lockiges Haar recht flach aus',
      ],
      specs: {
        leistung: '1600 W',
        motor: 'Digitalmotor, 105 000 U/min',
        trockenzeit: '4:05 min',
        maxTemp: '93 °C',
        lautstaerke: '84 dB(A)',
        luftstrom: '38 m/s',
        gewicht: '700 g',
        masse: '25,4 × 9,5 × 8,1 cm',
        kabel: '2,4 m',
        stufen: '3 / 3',
        kaltstufe: 'Ja, Taste',
        ionen: 'Ionen zuschaltbar',
        aufsaetze: '5 (Konzentrator, Diffusor, Glättkamm, Stylingdüse, Curl-Aufsatz)',
        filter: 'Ja, Schiebefilter',
        garantie: '2 Jahre',
      },
      scores: { trocknung: 93, haarschutz: 88, handling: 85, lautstaerke: 76, ausstattung: 92, verarbeitung: 88 },
      offers: {
        amazon:  { sku: 'B0CQ7L9V2K', price: 299 },
        galaxus: { sku: '43990211',   price: 305 },
        brack:   { sku: 'shark-speedstyle-pro-hd440', price: 309 },
      },
      review: {
        kicker: 'Preis-Leistungs-Sieger',
        headline: 'Shark SpeedStyle Pro: die vernünftige Alternative',
        verdict: 'Holt rund 95 % der Testsieger-Leistung zum halben Preis.',
        bestFor: 'Für alle, die schnelles Trocknen wollen, aber keine CHF 500.– ausgeben möchten.',
        paragraphs: [
          'Shark greift den Testsieger dort an, wo es weh tut: bei der Trocknungszeit. <strong>4:05 Minuten</strong> sind nur 23 Sekunden langsamer als beim Dyson – bei einem Kaufpreis, der um CHF 220.– tiefer liegt. Auch hier arbeitet ein kleiner Digitalmotor, der im Griff sitzt und den Schwerpunkt angenehm nach unten verlagert.',
          'Der Automatikmodus ist die interessanteste Funktion: Ein Sensor schätzt die Restfeuchte im Haar und reduziert die Hitze, sobald die Strähne fast trocken ist. In unserer Messung funktionierte das zuverlässig, die Spitzentemperatur blieb bei 93 °C. Das ist gut, aber messbar heisser als beim Dyson – nach 20 Zyklen war der Glanzverlust leicht höher.',
          'Der grösste Kritikpunkt ist die Lautstärke. Mit 84 dB(A) auf höchster Stufe liegt der SpeedStyle fünf Dezibel über dem Testsieger, und das Geräusch ist höher und schärfer. Wer morgens im Bad neben einem schlafenden Kind föhnt, merkt den Unterschied deutlich.',
          'Beim Zubehör hält Shark gut mit: Fünf magnetische Aufsätze liegen bei, darunter ein Glättkamm, der im Test überraschend saubere Ergebnisse lieferte. Nur der Diffusor ist für sehr lockiges Haar etwas zu flach geraten – Locken brauchen hier mehr Geduld.',
        ],
        imageCaption: 'Die fünf Aufsätze rasten magnetisch ein – im Test sass keiner locker.',
      },
    },

    {
      id: 'ghd-helios',
      brand: 'ghd',
      model: 'Helios Professional',
      badge: null,
      grade: 1.5,
      accent: '#2e2e38',
      claim: 'Der Salon-Klassiker: bestes Handling, langes Kabel, wenig Schnickschnack.',
      price: { current: 229, uvp: 259 },
      pros: [
        'Bestes Handling im Test: perfekt ausbalanciert, Schalter blind bedienbar',
        '3 Meter Kabel mit Drehgelenk – salontauglich',
        'Sehr präziser Luftstrom, ideal für Föhnfrisuren mit Rundbürste',
        'Robuste Verarbeitung, keinerlei Knarzen',
      ],
      cons: [
        'Nur ein Aufsatz im Lieferumfang, Diffusor kostet extra',
        'Keine automatische Hitzeregelung',
      ],
      specs: {
        leistung: '1600 W',
        motor: 'AC-Motor',
        trockenzeit: '4:48 min',
        maxTemp: '101 °C',
        lautstaerke: '82 dB(A)',
        luftstrom: '34 m/s',
        gewicht: '620 g',
        masse: '23,1 × 8,9 × 7,4 cm',
        kabel: '3,0 m mit Drehgelenk',
        stufen: '3 / 2',
        kaltstufe: 'Ja, Taste',
        ionen: 'Ionen dauerhaft aktiv',
        aufsaetze: '1 (Stylingdüse)',
        filter: 'Ja, Drehfilter',
        garantie: '2 Jahre',
      },
      scores: { trocknung: 84, haarschutz: 82, handling: 96, lautstaerke: 80, ausstattung: 70, verarbeitung: 96 },
      offers: {
        amazon:  { sku: 'B08JCPQ2R7', price: 229 },
        galaxus: { sku: '15220948',   price: 232 },
        brack:   { sku: 'ghd-helios-professional', price: 239 },
      },
      review: {
        kicker: 'Bestes Handling',
        headline: 'ghd Helios: gebaut für Leute, die föhnen können',
        verdict: 'Kein Technik-Feuerwerk, dafür das beste Gerät für Rundbürsten-Stylings.',
        bestFor: 'Für Menschen, die ihre Frisur aktiv föhnen statt nur trocknen.',
        paragraphs: [
          'Der Helios ist im Test das Gerät mit dem klarsten Profil: Er kommt aus dem Salon-Umfeld und merkt es an jedem Detail. Der Schwerpunkt liegt exakt in der Hand, die beiden Schiebeschalter lassen sich mit dem Daumen bedienen, ohne hinzuschauen, und das <strong>3 Meter lange Kabel mit Drehgelenk</strong> verheddert sich auch nach Wochen nicht. In der Handling-Wertung ist das mit 96 von 100 Punkten der Bestwert.',
          'Der Luftstrom ist enger gebündelt als bei den Digitalmotor-Geräten. Für reines Trockenföhnen ist das ein Nachteil – 4:48 Minuten sind gut eine Minute langsamer als beim Testsieger. Wer aber mit der Rundbürste arbeitet und Strähne für Strähne in Form bringt, profitiert: Der Luftstrahl bleibt dort, wo man ihn hinlenkt, statt die Nachbarsträhnen mit aufzuwirbeln.',
          'Beim Hitzeschutz zeigt sich, dass hier ein klassischer AC-Motor ohne Sensorik arbeitet. Wir massen bis zu 101 °C am Auslass. Das ist unkritisch, solange man Abstand hält, verzeiht aber weniger Fehler als die geregelten Geräte. Eine Kaltstufe zum Fixieren gibt es, sie liegt gut erreichbar am Daumen.',
          'Bitter ist die Zubehör-Politik: Im Karton liegt genau eine Stylingdüse. Wer einen Diffusor für Locken will, zahlt rund CHF 30.– extra. Bei einem Gerät für CHF 229.– darf man das kritisieren.',
        ],
        imageCaption: 'Drei Meter Kabel mit Drehgelenk: im Test das einzige Gerät, dessen Kabel sich nie verdrehte.',
      },
    },

    {
      id: 'solis-swiss-perfection',
      brand: 'Solis',
      model: 'Swiss Perfection Type 442',
      badge: 'Swiss Made',
      grade: 1.7,
      accent: '#d0342c',
      claim: 'Kräftiger Schweizer Klassiker mit viel Leistung fürs Geld.',
      price: { current: 149, uvp: 179 },
      pros: [
        'Sehr kräftiger Luftstrom für einen AC-Föhn',
        'Solide Schweizer Verarbeitung, Ersatzteile lange verfügbar',
        'Gutes Preis-Leistungs-Verhältnis',
        'Zwei Aufsätze inklusive Diffusor im Lieferumfang',
      ],
      cons: [
        'Mit 780 g das schwerste Gerät im Test',
        'Keine elektronische Hitzeregelung',
        'Auf Stufe 3 deutlich hörbar',
      ],
      specs: {
        leistung: '2300 W',
        motor: 'AC-Motor',
        trockenzeit: '4:31 min',
        maxTemp: '112 °C',
        lautstaerke: '86 dB(A)',
        luftstrom: '36 m/s',
        gewicht: '780 g',
        masse: '26,0 × 10,2 × 8,6 cm',
        kabel: '2,7 m',
        stufen: '3 / 2',
        kaltstufe: 'Ja, Taste',
        ionen: 'Ionen dauerhaft aktiv',
        aufsaetze: '2 (Stylingdüse, Diffusor)',
        filter: 'Ja, abschraubbar',
        garantie: '2 Jahre (CH-Service)',
      },
      scores: { trocknung: 88, haarschutz: 72, handling: 68, lautstaerke: 70, ausstattung: 78, verarbeitung: 92 },
      offers: {
        amazon:  { sku: 'B07KQ4M2XN', price: 155 },
        galaxus: { sku: '10382914',   price: 149 },
        brack:   { sku: 'solis-swiss-perfection-442', price: 149 },
      },
      review: {
        kicker: 'Swiss Made',
        headline: 'Solis Swiss Perfection: viel Wind fürs Geld',
        verdict: 'Kraftpaket mit Schweizer Service – aber schwer und heiss.',
        bestFor: 'Für Haushalte, die ein langlebiges Gerät mit lokalem Service wollen.',
        paragraphs: [
          'Solis setzt auf klassische Technik: einen kräftigen AC-Motor mit <strong>2300 Watt</strong>. Das Ergebnis ist ein erstaunlich schneller Föhn – 4:31 Minuten Trocknungszeit sind besser als beim deutlich teureren ghd Helios. Wer Kraft sucht, bekommt sie hier zum günstigsten Preis pro Watt im Test.',
          'Bezahlt wird das mit Gewicht und Hitze. 780 g machen den Solis zum schwersten Gerät im Feld, und der Schwerpunkt liegt weit vorne im Kopf. Nach fünf Minuten über Kopf gehaltenem Föhnen meldet sich der Unterarm – bei kurzem Haar egal, bei langem Haar ein echter Nachteil.',
          'Kritischer ist die Temperatur: Ohne elektronische Regelung massen wir am Auslass bis zu <strong>112 °C</strong>. Das ist der zweithöchste Wert im Test. Wer nah an die Kopfhaut geht oder die Strähne nicht in Bewegung hält, riskiert Hitzeschäden. Die Kaltstufe hilft, muss aber bewusst gedrückt werden.',
          'Dafür stimmt das Drumherum: Der Diffusor liegt bei, der Filter lässt sich abschrauben und ausspülen, und Solis liefert Ersatzteile über Jahre – der Service läuft über die Schweiz. Für ein Gerät, das zehn Jahre halten soll, ist das ein Argument.',
        ],
        imageCaption: 'Der abschraubbare Filter lässt sich unter fliessendem Wasser reinigen – wichtig bei 2300 Watt.',
      },
    },

    {
      id: 'panasonic-nanoe',
      brand: 'Panasonic',
      model: 'nanoe EH-NA98',
      badge: null,
      grade: 1.8,
      accent: '#0b5fa5',
      claim: 'Schonendster Föhn im Test – aber kein Sprinter.',
      price: { current: 189, uvp: 219 },
      pros: [
        'Niedrigste gemessene Austrittstemperatur im Test',
        'Bester Wert bei Glanz und Haarstruktur nach 20 Zyklen',
        'Angenehm leicht mit 575 g',
        'Sehr leise auf mittlerer Stufe',
      ],
      cons: [
        'Langsamste Trocknungszeit der oberen Hälfte',
        'Bedienschalter sitzen ungünstig weit oben',
      ],
      specs: {
        leistung: '1800 W',
        motor: 'DC-Motor',
        trockenzeit: '5:12 min',
        maxTemp: '76 °C',
        lautstaerke: '77 dB(A)',
        luftstrom: '29 m/s',
        gewicht: '575 g',
        masse: '22,4 × 9,1 × 7,2 cm',
        kabel: '2,5 m',
        stufen: '4 / 3',
        kaltstufe: 'Ja, Schiebeschalter',
        ionen: 'nanoe + Doppelmineral',
        aufsaetze: '3 (Stylingdüse, Diffusor, Schnelltrocknungsdüse)',
        filter: 'Ja, abnehmbar',
        garantie: '2 Jahre',
      },
      scores: { trocknung: 74, haarschutz: 97, handling: 84, lautstaerke: 92, ausstattung: 80, verarbeitung: 86 },
      offers: {
        amazon:  { sku: 'B09XKT4L8M', price: 189 },
        galaxus: { sku: '22874100',   price: 194 },
        brack:   { sku: 'panasonic-nanoe-eh-na98', price: 199 },
      },
      review: {
        kicker: 'Schonendster Föhn',
        headline: 'Panasonic nanoe EH-NA98: Geduld wird belohnt',
        verdict: 'Das schonendste Gerät im Test – wenn Sie die Extra-Minute investieren.',
        bestFor: 'Für coloriertes, feines oder strapaziertes Haar.',
        paragraphs: [
          'Panasonic verfolgt die entgegengesetzte Strategie zu Dyson und Shark: nicht schneller, sondern kühler. Mit maximal <strong>76 °C</strong> am Auslass ist der EH-NA98 das mit Abstand kühlste Gerät im Test – rund 36 Grad unter dem Solis. In der Haarschutz-Wertung reicht das für 97 von 100 Punkten und den Bestwert.',
          'Messbar wird der Unterschied nach 20 aufeinanderfolgenden Trocknungszyklen: Unsere Teststrähne zeigte hier den geringsten Glanzverlust und die geringste Aufrauhung der Schuppenschicht. Wer coloriert oder ohnehin strapaziertes Haar hat, bekommt hier das beste Ergebnis – auch besser als beim Testsieger.',
          'Der Preis dafür steht in der Stoppuhr: <strong>5:12 Minuten</strong> sind eineinhalb Minuten mehr als beim Dyson. Das ist die logische Konsequenz aus weniger Hitze und einem ruhigeren Luftstrom von 29 m/s. Wer täglich unter Zeitdruck föhnt, wird damit nicht glücklich.',
          'Im Handling überzeugt das geringe Gewicht von 575 g – dem tiefsten Wert im Test. Weniger gelungen ist die Schalterposition: Beide Schieber sitzen weit oben am Griff, sodass man zum Umschalten umgreifen muss. Nach ein paar Tagen gewöhnt man sich daran, elegant ist es nicht.',
        ],
        imageCaption: 'Maximal 76 °C: In der Thermokamera-Messung blieb der Panasonic durchgehend im grünen Bereich.',
      },
    },

    {
      id: 'philips-7000',
      brand: 'Philips',
      model: '7000 Serie BHD638',
      badge: null,
      grade: 2.0,
      accent: '#0f7ea8',
      claim: 'Solider Allrounder mit sinnvoller Hitzeautomatik.',
      price: { current: 129, uvp: 149 },
      pros: [
        'Automatik hält die Temperatur zuverlässig unter 90 °C',
        'Gute Trocknungsleistung für die Preisklasse',
        'Drei Aufsätze inklusive, alle sitzen fest',
        'Leichter als die meisten AC-Konkurrenten',
      ],
      cons: [
        'Luftstrom weniger gebündelt, Styling gelingt weniger präzise',
        'Kunststoff wirkt an den Übergängen einfach',
      ],
      specs: {
        leistung: '2300 W',
        motor: 'AC-Motor',
        trockenzeit: '4:56 min',
        maxTemp: '89 °C',
        lautstaerke: '83 dB(A)',
        luftstrom: '31 m/s',
        gewicht: '640 g',
        masse: '24,8 × 9,4 × 8,0 cm',
        kabel: '1,8 m',
        stufen: '3 / 2',
        kaltstufe: 'Ja, Taste',
        ionen: 'Ionen dauerhaft aktiv',
        aufsaetze: '3 (Stylingdüse, Diffusor, Volumendüse)',
        filter: 'Ja, abnehmbar',
        garantie: '2 Jahre',
      },
      scores: { trocknung: 80, haarschutz: 85, handling: 78, lautstaerke: 74, ausstattung: 76, verarbeitung: 72 },
      offers: {
        amazon:  { sku: 'B0B4KX8N3T', price: 129 },
        galaxus: { sku: '31556207',   price: 131 },
        brack:   { sku: 'philips-bhd638-7000', price: 135 },
      },
      review: {
        kicker: 'Solider Allrounder',
        headline: 'Philips 7000 Serie: der unauffällige Vernünftige',
        verdict: 'Macht nichts falsch, gewinnt aber auch keine Disziplin.',
        bestFor: 'Für Haushalte, die einen zuverlässigen Zweitföhn suchen.',
        paragraphs: [
          'Der BHD638 ist das Gerät, das im Test in keiner Kategorie unangenehm auffällt – und in keiner glänzt. Die Trocknungszeit von 4:56 Minuten liegt im Mittelfeld, die 2300 Watt kommen wegen des breiteren Luftstroms nicht ganz so wirksam am Haar an wie beim Solis.',
          'Die Stärke liegt in der Hitzeautomatik: Philips regelt die Temperatur elektronisch und hielt sie in unserer Messung durchgehend unter <strong>89 °C</strong>. Für ein Gerät dieser Preisklasse ist das ein guter Wert und der Hauptgrund, warum der Philips vor den günstigeren Konkurrenten liegt.',
          'Weniger überzeugend ist die Präzision: Der Luftstrom fächert stärker auf, was beim schnellen Trockenföhnen egal ist, beim Styling mit der Rundbürste aber stört – Nachbarsträhnen werden mit aufgewirbelt. Wer Wert auf die Frisur legt, greift eher zum ghd.',
          'Beim Zubehör ist Philips grosszügiger als ghd: Drei Aufsätze liegen bei, darunter ein brauchbarer Diffusor. Die Verarbeitung geht in Ordnung, an den Gehäuseübergängen merkt man dem Gerät den Preis aber an.',
        ],
        imageCaption: 'Drei Aufsätze im Lieferumfang – für die Preisklasse ordentlich.',
      },
    },

    {
      id: 'braun-satinhair7',
      brand: 'Braun',
      model: 'Satin Hair 7 HD710',
      badge: 'Preistipp',
      grade: 2.4,
      accent: '#1f6f52',
      claim: 'Bekommt für unter CHF 80.– erstaunlich viel richtig.',
      price: { current: 79, uvp: 99 },
      pros: [
        'Klarer Preistipp: bestes Ergebnis unter CHF 100.–',
        'Leicht und handlich',
        'Ionen-Funktion reduziert das Fliegen der Haare spürbar',
        'Einfache, robuste Technik ohne Elektronik, die ausfallen kann',
      ],
      cons: [
        'Nur zwei Gebläsestufen',
        'Keine Hitzeregelung, bis 108 °C am Auslass',
        'Kurzes Kabel von 1,7 m',
      ],
      specs: {
        leistung: '2200 W',
        motor: 'AC-Motor',
        trockenzeit: '5:24 min',
        maxTemp: '108 °C',
        lautstaerke: '85 dB(A)',
        luftstrom: '28 m/s',
        gewicht: '590 g',
        masse: '23,6 × 9,0 × 7,9 cm',
        kabel: '1,7 m',
        stufen: '3 / 2',
        kaltstufe: 'Ja, Taste',
        ionen: 'IonTec, zuschaltbar',
        aufsaetze: '1 (Stylingdüse)',
        filter: 'Nein, nur aussen abwischbar',
        garantie: '2 Jahre',
      },
      scores: { trocknung: 70, haarschutz: 66, handling: 80, lautstaerke: 68, ausstattung: 58, verarbeitung: 74 },
      offers: {
        amazon:  { sku: 'B00LQKGJ2S', price: 79 },
        galaxus: { sku: '5720031',    price: 82 },
        brack:   { sku: 'braun-satin-hair-7-hd710', price: 84 },
      },
      review: {
        kicker: 'Preistipp',
        headline: 'Braun Satin Hair 7: der ehrliche Günstige',
        verdict: 'Für unter CHF 80.– bekommt man hier keinen besseren Föhn.',
        bestFor: 'Für Gelegenheitsföhner, Zweitbad oder Ferienwohnung.',
        paragraphs: [
          'Der Satin Hair 7 ist das günstigste Gerät im Test und trotzdem nicht das schlechteste – deshalb der Preistipp. Für <strong>CHF 79.–</strong> bekommt man 2200 Watt, eine funktionierende Ionen-Funktion und eine Trocknungszeit von 5:24 Minuten. Das sind gut eineinhalb Minuten mehr als beim Testsieger, aber im Alltag verkraftbar.',
          'Die Ionen-Funktion ist hier kein Marketing: Im direkten Vergleich mit ausgeschaltetem IonTec lag die statische Aufladung der Teststrähne messbar tiefer, die Haare standen sichtbar weniger ab. Bei feinem Haar ist das der spürbarste Unterschied im Alltag.',
          'Die Schwäche ist die Hitze. Ohne Regelung massen wir bis zu <strong>108 °C</strong>, und weil nur zwei Gebläsestufen zur Verfügung stehen, lässt sich das schlecht kompensieren. Wer täglich föhnt, sollte bewusst Abstand halten und die Kaltstufe zum Abschluss nutzen – oder zu einem geregelten Gerät greifen.',
          'Auch sonst wird gespart: ein Aufsatz, kein reinigbarer Filter, 1,7 m Kabel. Für ein Zweitgerät, die Ferienwohnung oder alle, die zweimal pro Woche föhnen, ist das völlig ausreichend. Als tägliches Hauptgerät für langes Haar würden wir eine Stufe höher einsteigen.',
        ],
        imageCaption: 'Zwei Gebläse- und drei Hitzestufen: mehr Bedienelemente gibt es nicht – und mehr braucht es hier auch nicht.',
      },
    },

    {
      id: 'remington-proluxe',
      brand: 'Remington',
      model: 'PROluxe Midnight AC9412',
      badge: null,
      grade: 2.6,
      accent: '#5b4b8a',
      claim: 'Viel Leistung auf dem Papier, im Test aber heiss und laut.',
      price: { current: 99, uvp: 129 },
      pros: [
        'Kräftiger Luftstrom dank 2400-Watt-AC-Motor',
        'Langes Kabel von 3 Metern',
        'Diffusor und Stylingdüse liegen bei',
      ],
      cons: [
        'Höchste gemessene Austrittstemperatur im Test (118 °C)',
        'Lautestes Gerät im Test mit 88 dB(A)',
        'Deutlich kopflastig, ermüdet die Hand',
        'Grösster Glanzverlust der Teststrähne nach 20 Zyklen',
      ],
      specs: {
        leistung: '2400 W',
        motor: 'AC-Motor',
        trockenzeit: '4:44 min',
        maxTemp: '118 °C',
        lautstaerke: '88 dB(A)',
        luftstrom: '35 m/s',
        gewicht: '760 g',
        masse: '26,4 × 10,0 × 8,8 cm',
        kabel: '3,0 m',
        stufen: '3 / 2',
        kaltstufe: 'Ja, Taste',
        ionen: 'Ionen dauerhaft aktiv',
        aufsaetze: '2 (Stylingdüse, Diffusor)',
        filter: 'Ja, abnehmbar',
        garantie: '3 Jahre',
      },
      scores: { trocknung: 82, haarschutz: 54, handling: 62, lautstaerke: 58, ausstattung: 74, verarbeitung: 70 },
      offers: {
        amazon:  { sku: 'B07YFJ3X6P', price: 99 },
        galaxus: { sku: '18442790',   price: 103 },
        brack:   { sku: 'remington-proluxe-ac9412', price: 109 },
      },
      review: {
        kicker: 'Schlusslicht',
        headline: 'Remington PROluxe Midnight: schnell, aber ohne Rücksicht',
        verdict: 'Trocknet flott – auf Kosten von Haar, Ohren und Handgelenk.',
        bestFor: 'Nur für kurzes, robustes Haar und seltene Nutzung.',
        paragraphs: [
          'Auf dem Datenblatt sieht der PROluxe stark aus: 2400 Watt, 3 Meter Kabel, drei Jahre Garantie. Die Trocknungszeit von 4:44 Minuten ist auch tatsächlich ordentlich. Der Test misst aber nicht nur, wie schnell ein Gerät ist, sondern zu welchem Preis.',
          'Und der ist hier hoch: Mit <strong>118 °C</strong> am Auslass ist der Remington das heisseste Gerät im Test. Nach 20 Trocknungszyklen zeigte unsere Teststrähne den grössten Glanzverlust und die deutlichste Aufrauhung der Schuppenschicht des gesamten Feldes. Bei täglicher Nutzung ist das ein echtes Problem – die Note 2,6 kommt fast ausschliesslich aus dieser Disziplin.',
          'Dazu kommt der Lärm: <strong>88 dB(A)</strong> sind neun Dezibel über dem Testsieger, was subjektiv etwa einer Verdopplung der Lautstärke entspricht. Nach fünf Minuten Föhnen ist das anstrengend.',
          'Auch das Handling gefällt nicht: 760 g mit starker Kopflastigkeit ermüden die Hand schneller als bei jedem anderen Gerät im Test. Positiv bleiben das lange Kabel, der beiliegende Diffusor und die drei Jahre Garantie. Für kurzes Haar und gelegentliche Nutzung geht das in Ordnung – als tägliches Gerät empfehlen wir es nicht.',
        ],
        imageCaption: '118 °C am Auslass: der höchste Wert im Test – Abstand halten ist hier Pflicht.',
      },
    },
  ],

  /* ---------------------------------------------------------------
   * 6) Methodik-Abschnitt "So testen wir"
   * ------------------------------------------------------------- */
  method: {
    kicker: 'So testen wir',
    headline: 'Echthaarsträhnen, Thermokamera und Schallpegelmesser',
    intro:
      'Jeder Haartrockner durchläuft in unserer Redaktion denselben Parcours. Wir kaufen alle Geräte ' +
      'selbst im Handel – Testmuster von Herstellern nehmen wir nicht an. Das sind die sechs Kriterien:',
    outro:
      'Aus den sechs Einzelnoten berechnen wir die Gesamtnote nach der oben genannten Gewichtung. ' +
      'Bei gleicher Note entscheidet das interne Ergebnis, das wir auf drei Nachkommastellen führen.',
  },

  /* ---------------------------------------------------------------
   * 7) Fazit
   * ------------------------------------------------------------- */
  conclusion: {
    kicker: 'Unser Fazit',
    headline: 'Der Preis entscheidet, nicht die Wattzahl',
    paragraphs: [
      'Die wichtigste Erkenntnis dieses Tests: <strong>Watt sagt fast nichts aus.</strong> Unser Testsieger arbeitet mit 1600 Watt und trocknet schneller als das 2400-Watt-Gerät auf dem letzten Platz. Entscheidend sind Motorkonzept und Düsengeometrie – nicht die Leistungsaufnahme.',
      'Wer täglich föhnt und langes Haar hat, fährt mit dem <strong>Dyson Supersonic Nural</strong> (CHF 519.–) am besten: kürzeste Trocknungszeit, beste Hitzeregelung, angenehmstes Geräusch. Wer die gleiche Richtung will, aber nicht den Preis, nimmt den <strong>Shark SpeedStyle Pro</strong> (CHF 299.–) – er liegt in fast allen Messwerten knapp dahinter.',
      'Für coloriertes oder strapaziertes Haar empfehlen wir den <strong>Panasonic nanoe EH-NA98</strong> (CHF 189.–). Er ist der schonendste Föhn im Test, verlangt dafür aber anderthalb Minuten mehr Zeit. Wer die Frisur aktiv mit der Rundbürste stylt, greift zum <strong>ghd Helios</strong> (CHF 229.–) mit dem besten Handling.',
      'Und wenn es einfach nur trocken werden soll: Der <strong>Braun Satin Hair 7</strong> für CHF 79.– macht seinen Job. Man muss nur wissen, dass er heiss wird – Abstand halten und mit der Kaltstufe abschliessen.',
    ],
    quote: {
      text: 'Nach 96 Messungen ist mein Fazit simpel: Ein guter Föhn erkennt man daran, wie kühl er bleibt – nicht daran, wie viel Wind er macht.',
      author: 'Nina Brunner',
      role: 'Ressortleiterin Haushalt & Beauty',
    },
  },

  /* ---------------------------------------------------------------
   * 8) FAQ
   * ------------------------------------------------------------- */
  faq: [
    {
      q: 'Wie viel Watt braucht ein guter Haartrockner?',
      a: 'Weniger, als die Werbung suggeriert. Unser Testsieger arbeitet mit 1600 Watt und ist schneller als jedes 2400-Watt-Gerät im Test. Entscheidend ist, wie viel Luft der Motor bewegt und wie die Düse sie bündelt. Achten Sie auf die Luftgeschwindigkeit in m/s statt auf Watt.',
    },
    {
      q: 'Sind Ionen-Funktionen sinnvoll oder Marketing?',
      a: 'Sie wirken – aber begrenzt. In unseren Messungen reduzierte die Ionen-Funktion die statische Aufladung der Teststrähne messbar, die Haare standen weniger ab. Auf Trocknungszeit oder Haarschädigung hat sie dagegen keinen nachweisbaren Einfluss. Bei feinem, fliegendem Haar ist sie ein echtes Plus, sonst ein netter Nebeneffekt.',
    },
    {
      q: 'Ab welcher Temperatur wird Föhnen schädlich?',
      a: 'Kritisch wird es ab etwa 100 °C am Haar. Unsere Messungen zeigen Spannweiten von 76 °C bis 118 °C – ein Unterschied, der sich nach 20 Trocknungszyklen deutlich in Glanz und Schuppenschicht niederschlug. Geräte mit elektronischer Hitzeregelung bleiben zuverlässig unter der kritischen Grenze.',
    },
    {
      q: 'Lohnt sich ein Haartrockner für über CHF 400.–?',
      a: 'Nur bei täglicher Nutzung und langem oder dickem Haar. Dann sparen Sie mit dem Testsieger über ein Jahr gerechnet mehrere Stunden und schonen nachweislich die Haarstruktur. Wer zweimal pro Woche kurzes Haar trocknet, merkt den Unterschied kaum – hier reicht ein Gerät um CHF 130.–.',
    },
    {
      q: 'Wie oft muss ich den Filter reinigen?',
      a: 'Etwa alle vier Wochen. Ein zugesetzter Filter senkt den Luftdurchsatz, das Gerät wird heisser und lauter, und im schlimmsten Fall schaltet der Überhitzungsschutz ab. Sechs der acht Testgeräte haben einen abnehmbaren Filter, der sich unter fliessendem Wasser ausspülen lässt.',
    },
    {
      q: 'Warum sind eure Links Affiliate-Links?',
      a: 'Weil wir die Testgeräte selbst kaufen und unsere Arbeit damit finanzieren. Wenn Sie über einen unserer Links bestellen, erhalten wir eine Provision vom Händler – der Preis für Sie bleibt identisch. Auf Testnoten und Platzierungen hat das keinen Einfluss; die Reihenfolge in der Bestenliste ergibt sich ausschliesslich aus den Messwerten.',
    },
  ],
};
