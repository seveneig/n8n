/**
 * Verglichmi – Testdaten "Schlauchboote fürs Böötle 2026"
 * ------------------------------------------------------------------
 * Einzige Inhaltsquelle der Seite. Für einen neuen Vergleich: Datei
 * kopieren, Werte ersetzen, in index.html das <script src> umbiegen.
 * Feldbedeutung siehe README.md.
 */
window.VG_DATA = {

  /* --------------------------------------------------------------
   * 1) Seiten-Metadaten
   * ------------------------------------------------------------ */
  meta: {
    category: 'Schlauchboote',
    categoryLong: 'Schlauchboote fürs Böötle',
    breadcrumb: ['Ratgeber', 'Sommer', 'Wassersport'],
    kicker: 'Testsieger Note 1,2 · Preis-Leistung ab CHF 649.–',
    title: 'Schlauchboote fürs Böötle im Test',
    year: 2026,
    lead:
      'Ein Nachmittag auf der Aare, vier Leute, Kühlbox an Bord: Dafür braucht es ein Boot, das ' +
      'stabil liegt, Wasser wieder loswird und den Sommer übersteht. Wir haben ' +
      '<strong>8 Schlauchboote von CHF 179.– bis CHF 2’690.–</strong> auf demselben Flussabschnitt ' +
      'getestet – mit Stoppuhr beim Aufbau, Kippmessung am Steg und einem Abriebtest über Kies.',
    updated: '2026-08-24',
    published: '2026-05-14',
    readingTime: 16,
    author: {
      name: 'Nina Brunner',
      role: 'Ressortleiterin Outdoor & Sommer',
      initials: 'NB',
    },
    testFacts: [
      { value: '8',    label: 'Boote im Test' },
      { value: '112',  label: 'Flusskilometer' },
      { value: '19',   label: 'Messreihen' },
      { value: '6',    label: 'Testkriterien' },
    ],
    /* Begriffe – die Seite erklärt die Terminologie selbst. */
    glossary: {
      title: 'Kurz erklärt: die Begriffe',
      intro: 'Wer nach dem richtigen Boot sucht, stolpert über vier Wörter. Das steckt dahinter:',
      terms: [
        { term: 'Böötle', def: 'Schweizer Ausdruck fürs Flussfahren mit dem Schlauchboot – etwa auf der Aare zwischen Thun und Bern. In Deutschland sagt man dazu „Bootstour“ oder „Flussfahrt“.' },
        { term: 'Schlauchboot', def: 'Der Oberbegriff. Für Flüsse zählt die Variante mit mehreren getrennten Luftkammern und stabilem Boden – nicht das Strandmodell.' },
        { term: 'Selbstlenzer', def: 'Boot mit Ablauflöchern im Boden (englisch self-bailing). Wasser, das über den Rand schwappt, läuft von selbst wieder ab. Auf Flüssen mit Schwallstellen praktisch Pflicht.' },
        { term: 'Badeinsel', def: 'Die runde Liegeinsel für den See. Auf fliessendem Wasser nicht steuerbar und damit ungeeignet – nicht verwechseln.' },
      ],
    },
  },

  /* --------------------------------------------------------------
   * 2) Affiliate-Konfiguration
   * ------------------------------------------------------------ */
  affiliate: {
    staging: true,
    disclosureTitle: 'Warum Sie uns trauen können',
    disclosureText:
      'Wir kaufen jedes Boot selbst im Handel, testen es auf demselben Flussabschnitt und geben es ' +
      'danach zurück. Testmuster von Herstellern nehmen wir nicht an. Bestellen Sie über einen ' +
      'unserer Links, zahlt der Händler uns eine Provision – Ihr Preis bleibt exakt gleich, und auf ' +
      'die Reihenfolge in der Bestenliste hat das keinen Einfluss.',
    shops: {
      galaxus: {
        label: 'Galaxus', note: 'Versand aus der CH', theme: 'galaxus',
        pattern: 'https://www.galaxus.ch/de/s7/product/{sku}?utm_source={tag}', tag: 'verglichmi',
      },
      brack: {
        label: 'Brack.ch', note: 'Abholung möglich', theme: 'brack',
        pattern: 'https://www.brack.ch/{sku}?utm_source={tag}', tag: 'verglichmi',
      },
      amazon: {
        label: 'Amazon', note: 'Prime-Versand', theme: 'amazon',
        pattern: 'https://www.amazon.de/dp/{sku}/?tag={tag}', tag: 'verglichmi-21',
      },
    },
    shopOrder: ['galaxus', 'brack', 'amazon'],
  },

  /* --------------------------------------------------------------
   * 3) Testkriterien (Summe = 100)
   * ------------------------------------------------------------ */
  criteria: [
    { key: 'fahrverhalten', label: 'Fahrverhalten & Stabilität', weight: 25,
      desc: 'Wie ruhig liegt das Boot mit voller Besatzung? Wir messen den Kippwinkel am Steg, wenn zwei Personen auf dieselbe Seite rücken, und fahren jede Strecke einmal beladen.' },
    { key: 'robustheit', label: 'Robustheit & Material', weight: 20,
      desc: 'Abriebtest über Kiesgrund, Druckverlust nach 24 Stunden in der Sonne und eine Sichtprüfung aller Nähte nach der Testsaison.' },
    { key: 'ausstattung', label: 'Ausstattung & Gadgets', weight: 20,
      desc: 'Was ist an Bord und was taugt es: Getränkehalter, Kühlbox-Fixierung, Kopplungsösen, Trockentasche, Halterungen für Lautsprecher und Kamera.' },
    { key: 'komfort', label: 'Platz & Komfort', weight: 15,
      desc: 'Sitzfläche pro Person, Rückenlehnen, Fussraum und ob die angegebene Personenzahl im Alltag realistisch ist.' },
    { key: 'aufbau', label: 'Aufbau & Transport', weight: 12,
      desc: 'Gestoppte Zeit vom Sack bis zum fahrbereiten Boot, Packmass, Gewicht und ob eine Person es allein zum Wasser bringt.' },
    { key: 'sicherheit', label: 'Sicherheit', weight: 8,
      desc: 'Anzahl getrennter Luftkammern, Selbstlenzer, Griffleinen rundum, Sichtbarkeit auf dem Wasser und Qualität des Reparatursets.' },
  ],

  /* --------------------------------------------------------------
   * 4) Spalten der Datenvergleichstabelle
   * ------------------------------------------------------------ */
  specFields: [
    { key: 'personen',    label: 'Personen (Hersteller)',   group: 'Grösse & Kapazität' },
    { key: 'personenReal',label: 'Realistisch bequem',      group: 'Grösse & Kapazität', highlight: true },
    { key: 'masse',       label: 'Länge × Breite',          group: 'Grösse & Kapazität' },
    { key: 'zuladung',    label: 'Zuladung',                group: 'Grösse & Kapazität' },
    { key: 'gewicht',     label: 'Gewicht',                 group: 'Grösse & Kapazität' },
    { key: 'packmass',    label: 'Packmass',                group: 'Grösse & Kapazität' },

    { key: 'material',    label: 'Material',                group: 'Material & Bau' },
    { key: 'staerke',     label: 'Materialstärke',          group: 'Material & Bau' },
    { key: 'kammern',     label: 'Luftkammern',             group: 'Material & Bau' },
    { key: 'boden',       label: 'Bodenaufbau',             group: 'Material & Bau' },
    { key: 'selbstlenzer',label: 'Selbstlenzer',            group: 'Material & Bau' },

    { key: 'aufbauzeit',  label: 'Aufbauzeit (gestoppt)',   group: 'Messwerte', highlight: true, mono: true },
    { key: 'kippwinkel',  label: 'Kippwinkel bis Wassereinbruch', group: 'Messwerte', highlight: true, mono: true },
    { key: 'druckverlust',label: 'Druckverlust nach 24 h',  group: 'Messwerte', highlight: true, mono: true },
    { key: 'abrieb',      label: 'Abriebtest über Kies',    group: 'Messwerte' },

    { key: 'paddel',      label: 'Paddel',                  group: 'Lieferumfang' },
    { key: 'pumpe',       label: 'Pumpe',                   group: 'Lieferumfang' },
    { key: 'tasche',      label: 'Transporttasche',         group: 'Lieferumfang' },
    { key: 'reparatur',   label: 'Reparaturset',            group: 'Lieferumfang' },
    { key: 'garantie',    label: 'Garantie',                group: 'Lieferumfang' },
  ],

  /* Werte, die direkt in der Produktbox als Chips erscheinen */
  quickSpecs: ['personenReal', 'gewicht', 'aufbauzeit', 'selbstlenzer'],

  /* --------------------------------------------------------------
   * 5) Gadget- und Ausstattungsmatrix
   *    Werte je Produkt: true | false | 'option' | Text
   * ------------------------------------------------------------ */
  gadgets: {
    title: 'Ausstattung & Gadgets im Direktvergleich',
    intro:
      'Was ein Boot am Fluss angenehm macht, steht selten im Datenblatt. Diese Übersicht zeigt, ' +
      'was serienmässig an Bord ist – <strong>voller Punkt</strong> heisst vorhanden, ' +
      '<strong>Ring</strong> heisst gegen Aufpreis nachrüstbar.',
    groups: [
      {
        label: 'An Bord',
        items: [
          { key: 'becherhalter', label: 'Getränkehalter',      hint: 'Eingelassen im Schlauch, hält auch 5-dl-Dosen' },
          { key: 'kuehlbox',     label: 'Kühlbox-Fixierung',   hint: 'Gurte oder Netz, damit die Box nicht rutscht' },
          { key: 'stauraum',     label: 'Netz-Stauraum',       hint: 'Gespanntes Netz für Kleinkram' },
          { key: 'trockensack',  label: 'Trockensack dabei',   hint: 'Wasserdichter Sack im Lieferumfang' },
          { key: 'handyhuelle',  label: 'Handy-Trockenhülle',  hint: 'Bedienbar durch die Folie' },
        ],
      },
      {
        label: 'Halterungen',
        items: [
          { key: 'lautsprecher', label: 'Lautsprecher-Halter', hint: 'Aufnahme für Bluetooth-Box' },
          { key: 'actioncam',    label: 'Action-Cam-Gewinde',  hint: 'Standardgewinde am Bug' },
          { key: 'sonnendach',   label: 'Sonnendach möglich',  hint: 'Bimini oder Sonnensegel montierbar' },
          { key: 'angel',        label: 'Angelrutenhalter',    hint: 'Steckhalter am Schlauch' },
        ],
      },
      {
        label: 'Gruppe & Handling',
        items: [
          { key: 'kopplung',     label: 'Kopplungsösen',       hint: 'Zwei Boote nebeneinander verbinden' },
          { key: 'griffleine',   label: 'Griffleine rundum',   hint: 'Durchgehende Leine zum Festhalten' },
          { key: 'anker',        label: 'Wurfanker & Leine',   hint: 'Zum Halten an der Badestelle' },
          { key: 'ruecken',      label: 'Rückenlehnen',        hint: 'Verstellbar, nicht nur Sitzbank' },
        ],
      },
    ],
  },

  /* --------------------------------------------------------------
   * 6) Schnellwahl – deterministische Empfehlung
   * ------------------------------------------------------------ */
  quickPicker: {
    title: 'Schnellwahl',
    headline: 'Zwei Angaben, ein Vorschlag',
    intro: 'Wählen Sie Gruppengrösse und Einsatz – wir zeigen das Boot, das im Test am besten dazu passt.',
    axes: [
      { key: 'gruppe', label: 'Wie viele seid ihr?', options: [
        { v: '2-3', label: '2–3 Personen' },
        { v: '4',   label: '4 Personen' },
        { v: '5+',  label: '5 und mehr' },
      ] },
      { key: 'nutzung', label: 'Wie oft geht ihr aufs Wasser?', options: [
        { v: 'selten', label: 'Ein-, zweimal im Sommer' },
        { v: 'oft',    label: 'Fast jedes Wochenende' },
      ] },
    ],
    results: {
      '2-3|selten': { id: 'intex-mariner4',       why: 'Zu zweit oder zu dritt haben Sie im Mariner 4 viel Platz für Kühlbox und Gepäck – und zahlen dafür weniger als CHF 300.–. Das noch günstigere Boot im Test empfehlen wir für Flüsse ausdrücklich nicht.' },
      '2-3|oft':    { id: 'aquamarina-wildriver', why: 'Kompakt genug für zwei bis drei Personen, dank Drop-Stitch-Boden aber steif und langlebig. Das Boot, das auch nach drei Sommern noch gut dasteht.' },
      '4|selten':   { id: 'intex-mariner4',       why: 'Vier Personen, überschaubares Budget: Der Mariner 4 liegt für seine Klasse erstaunlich ruhig und bringt Paddel und Pumpe gleich mit.' },
      '4|oft':      { id: 'grabner-riverstar',    why: 'Wer jedes Wochenende auf dem Wasser ist, holt den Aufpreis über die Jahre heraus. Der Riverstar ist der Testsieger und das einzige Boot, dem wir zehn Saisons zutrauen.' },
      '5+|selten':  { id: 'intex-excursion5',     why: 'Fünf Sitzplätze zum Preis eines Abendessens. Für den einen grossen Ausflug im Jahr die pragmatische Wahl – mehr sollte man nicht erwarten.' },
      '5+|oft':     { id: 'zebec-380',            why: 'Der Klassiker auf der Aare: robust genug für ständigen Einsatz, gross genug für fünf Leute, und preislich weit unter den Premium-Booten.' },
    },
  },

  /* --------------------------------------------------------------
   * 7) Filter für die Bestenliste (greifen auf product.tags zu)
   * ------------------------------------------------------------ */
  filters: [
    { id: 'alle',        label: 'Alle 8 Modelle' },
    { id: 'selbstlenzer',label: 'Mit Selbstlenzer' },
    { id: 'ab4',         label: 'Ab 4 Personen' },
    { id: 'unter500',    label: 'Unter CHF 500.–' },
    { id: 'kopplung',    label: 'Koppelbar' },
  ],

  /* --------------------------------------------------------------
   * 8) Produkte – sortiert nach Testnote
   * ------------------------------------------------------------ */
  products: [
    {
      id: 'grabner-riverstar',
      brand: 'Grabner',
      model: 'Riverstar',
      badge: 'Testsieger',
      grade: 1.2,
      accent: '#0E5A6E',
      claim: 'Das einzige Boot im Test, dem wir zehn Sommer zutrauen.',
      price: { current: 2690, uvp: 2890 },
      tags: ['selbstlenzer', 'ab4', 'kopplung'],
      pros: [
        'Mit Abstand robustestes Material – nach der Testsaison keinerlei Spuren',
        'Liegt auch voll beladen ruhig, grösster Kippwinkel im Test',
        'Echter Selbstlenzer: Schwallwasser ist in Sekunden wieder draussen',
        'Reparierbar statt Wegwerfware, Ersatzteile jahrelang lieferbar',
      ],
      cons: [
        'Preis auf dem Niveau von vier Konkurrenzbooten',
        'Mit 32 kg trägt man es nicht allein weit',
      ],
      specs: {
        personen: '4', personenReal: '4 Personen', masse: '400 × 170 cm', zuladung: '600 kg',
        gewicht: '32,0 kg', packmass: '80 × 45 × 35 cm',
        material: 'EPDM-Gummi, vulkanisiert', staerke: '1,2 mm', kammern: '4 (3 + Boden)',
        boden: 'Hochdruck-Luftboden', selbstlenzer: 'Ja',
        aufbauzeit: '11:20 min', kippwinkel: '38°', druckverlust: '2 %', abrieb: 'keine sichtbaren Spuren',
        paddel: '2 Alu-Paddel, zerlegbar', pumpe: 'Doppelhub-Fusspumpe',
        tasche: 'Rucksacktasche mit Tragegurten', reparatur: 'Vollset inkl. Vulkanisierkleber', garantie: '5 Jahre',
      },
      scores: { fahrverhalten: 96, robustheit: 98, ausstattung: 84, komfort: 90, aufbau: 72, sicherheit: 96 },
      gadgets: {
        becherhalter: '4×', kuehlbox: true, stauraum: true, trockensack: true, handyhuelle: false,
        lautsprecher: 'option', actioncam: true, sonnendach: 'option', angel: 'option',
        kopplung: true, griffleine: true, anker: true, ruecken: true,
      },
      offers: {
        galaxus: { sku: '41220988', price: 2690 },
        brack:   { sku: 'grabner-riverstar', price: 2740 },
        amazon:  { sku: 'B07QZ8N4LM', price: 2795 },
      },
      review: {
        kicker: 'Testsieger',
        headline: 'Grabner Riverstar: die Anschaffung fürs Jahrzehnt',
        verdict: 'Teuer wie vier Konkurrenzboote – und das einzige, das nach der Testsaison aussieht wie neu.',
        bestFor: 'Für Gruppen, die jedes Wochenende raus wollen und einmal richtig investieren.',
        paragraphs: [
          'Der Riverstar ist im Testfeld der Fremdkörper: Er kostet <strong>CHF 2’690.–</strong> und ist damit teurer als die vier günstigsten Boote zusammen. Nach einer Saison auf Aare, Reuss und Thur ist auch klar, warum. Während bei den PVC-Booten nach dem Abriebtest über Kiesgrund feine Kratzspuren zurückblieben, zeigte der vulkanisierte EPDM-Gummi <strong>keine sichtbaren Spuren</strong>. Das ist kein kosmetisches Detail: An genau diesen Stellen fangen billige Boote nach zwei, drei Sommern an undicht zu werden.',
          'Auf dem Wasser fällt zuerst die Ruhe auf. In unserer Kippmessung – zwei Personen rücken gleichzeitig auf dieselbe Seite – hielt der Riverstar bis <strong>38 Grad</strong> Neigung, bevor Wasser über den Rand kam. Das günstigste Boot im Test gab bei 22 Grad auf. Praktisch heisst das: Wenn beim Anlegen jemand hektisch aufsteht, passiert hier nichts.',
          'Der Selbstlenzer arbeitet, wie er soll. Wir haben an der Schwallstelle bewusst Wasser übernommen – gut zehn Liter waren nach knapp zwanzig Sekunden wieder draussen. Bei Booten ohne Ablauf bleibt dieselbe Menge im Fussraum stehen und muss von Hand ausgeschöpft werden, während das Boot träge und kopflastig wird.',
          'Die Schwächen sind die Kehrseite der Bauweise. Mit <strong>32 kg</strong> ist der Riverstar das schwerste Boot im Test; vom Parkplatz zum Einstieg trägt man ihn zu zweit oder gar nicht. Und der Aufbau dauert mit 11:20 Minuten am längsten, weil der Hochdruck-Luftboden ordentlich Pumpenhübe verlangt. Wer das Boot zweimal im Sommer benutzt, kauft hier an seinem Bedarf vorbei.',
          'Bei der Ausstattung ist Grabner sachlich statt verspielt: vier eingelassene Getränkehalter, Kühlbox-Gurte, Kopplungsösen und eine durchgehende Griffleine sind an Bord. Lautsprecherhalter und Sonnensegel gibt es nur gegen Aufpreis. Dafür ist praktisch jedes Teil einzeln nachbestellbar – das Boot ist auf Reparatur ausgelegt, nicht auf Ersatz.',
        ],
        imageCaption: 'Der vulkanisierte Gummi überstand den Abriebtest über Kiesgrund als Einziger ohne sichtbare Spuren.',
      },
    },

    {
      id: 'gumotex-ontario',
      brand: 'Gumotex',
      model: 'Ontario 450',
      badge: null,
      grade: 1.4,
      accent: '#1B6F7E',
      claim: 'Fast die Robustheit des Testsiegers, gut tausend Franken günstiger.',
      price: { current: 1690, uvp: 1849 },
      tags: ['selbstlenzer', 'ab4', 'kopplung'],
      pros: [
        'Nitrilon-Material steckt Kies und Sonne fast so gut weg wie der Testsieger',
        'Mit 450 cm das längste Boot – viel Beinfreiheit für vier Personen',
        'Selbstlenzer mit grossen Ablauföffnungen',
        'Sehr sauber verarbeitete Nähte',
      ],
      cons: [
        'Nur zwei Getränkehalter, keine Kühlbox-Fixierung ab Werk',
        'Packmass zu gross für kleine Kofferräume',
      ],
      specs: {
        personen: '4', personenReal: '4 Personen', masse: '450 × 154 cm', zuladung: '450 kg',
        gewicht: '24,0 kg', packmass: '75 × 45 × 30 cm',
        material: 'Nitrilon (Gummi-Gewebe)', staerke: '1,0 mm', kammern: '4 (3 + Boden)',
        boden: 'Lattenverstärkter Luftboden', selbstlenzer: 'Ja',
        aufbauzeit: '9:45 min', kippwinkel: '34°', druckverlust: '3 %', abrieb: 'minimale Spuren',
        paddel: 'nicht enthalten', pumpe: 'Fusspumpe',
        tasche: 'Packsack', reparatur: 'Vollset', garantie: '3 Jahre',
      },
      scores: { fahrverhalten: 92, robustheit: 94, ausstattung: 70, komfort: 92, aufbau: 78, sicherheit: 92 },
      gadgets: {
        becherhalter: '2×', kuehlbox: false, stauraum: true, trockensack: false, handyhuelle: false,
        lautsprecher: false, actioncam: 'option', sonnendach: 'option', angel: 'option',
        kopplung: true, griffleine: true, anker: 'option', ruecken: true,
      },
      offers: {
        galaxus: { sku: '38771204', price: 1690 },
        brack:   { sku: 'gumotex-ontario-450', price: 1720 },
        amazon:  { sku: 'B08KX3M7QP', price: 1749 },
      },
      review: {
        kicker: 'Die vernünftige Premium-Wahl',
        headline: 'Gumotex Ontario 450: 90 Prozent Testsieger, 63 Prozent Preis',
        verdict: 'Wer die Langlebigkeit will, aber nicht den Testsieger-Preis, kauft hier.',
        bestFor: 'Für vier Personen mit langen Beinen und dem Wunsch nach einem Boot für viele Jahre.',
        paragraphs: [
          'Gumotex baut in Tschechien seit Jahrzehnten Gummiboote, und das Ontario 450 zeigt, wo dieses Wissen sitzt. Das <strong>Nitrilon</strong>-Gewebe ist ein Gummi-Verbund und damit deutlich näher am Testsieger als am PVC der günstigen Konkurrenz. Im Abriebtest über Kiesgrund blieben nur minimale Spuren – der zweitbeste Wert im Feld.',
          'Mit <strong>450 cm</strong> ist es das längste Boot im Test, und das merkt man sofort. Vier Erwachsene sitzen hier ohne Knieberührung, während in kürzeren Booten derselben Kapazitätsangabe die hinteren Plätze zur Zumutung werden. Für Gruppen, die auch mal drei, vier Stunden unterwegs sind, ist das der grösste Komfortgewinn im ganzen Vergleich.',
          'Der Kippwinkel von <strong>34 Grad</strong> liegt nur vier Grad unter dem Testsieger. Zusammen mit dem Selbstlenzer – die Ablauföffnungen sind hier besonders grosszügig ausgeführt – ergibt das ein Boot, das man auch auf Abschnitten mit Schwallstellen guten Gewissens einsetzt.',
          'Gespart wird beim Zubehör, und zwar spürbar. Es liegen <strong>keine Paddel bei</strong>, was bei einem Boot dieser Preisklasse überrascht und mit rund CHF 120.– extra zu Buche schlägt. Nur zwei Getränkehalter, keine Kühlbox-Gurte, kein Trockensack. Wer eine gut ausgestattete Gruppenfähre erwartet, muss nachrüsten.',
          'Auch das Packmass ist eine Ansage: 75 × 45 × 30 cm füllen einen Kombi-Kofferraum bereits ordentlich. In einen Kleinwagen passt das Boot nur, wenn sonst kaum Gepäck mitkommt.',
        ],
        imageCaption: '450 cm Länge: Als einziges Boot im Test sitzen vier Erwachsene hier ohne Knieberührung.',
      },
    },

    {
      id: 'zebec-380',
      brand: 'Zebec',
      model: '380 Adventure',
      badge: 'Preis-Leistungs-Sieger',
      grade: 1.7,
      accent: '#2C7F6B',
      claim: 'Der Aare-Klassiker: robust genug für jedes Wochenende, bezahlbar geblieben.',
      price: { current: 649, uvp: 749 },
      tags: ['selbstlenzer', 'ab4', 'kopplung'],
      pros: [
        'Bestes Verhältnis aus Haltbarkeit und Preis im ganzen Testfeld',
        'Fünf Personen passen realistisch hinein',
        'Kräftiges 1100-Denier-PVC, im Abriebtest deutlich über Klassenniveau',
        'Kopplungsösen serienmässig – zwei Boote lassen sich verbinden',
      ],
      cons: [
        'Selbstlenzer-Öffnungen recht klein, Wasser läuft langsamer ab',
        'Sitzbänke ohne Rückenlehne',
      ],
      specs: {
        personen: '4–5', personenReal: '5 Personen', masse: '380 × 160 cm', zuladung: '500 kg',
        gewicht: '17,5 kg', packmass: '65 × 40 × 28 cm',
        material: 'PVC 1100 Denier', staerke: '0,9 mm', kammern: '4 (3 + Boden)',
        boden: 'Luftboden mit Lattenverstärkung', selbstlenzer: 'Ja, kleine Öffnungen',
        aufbauzeit: '7:30 min', kippwinkel: '31°', druckverlust: '5 %', abrieb: 'leichte Spuren',
        paddel: '2 Alu-Paddel', pumpe: 'Doppelhub-Fusspumpe',
        tasche: 'Tragetasche', reparatur: 'Flicken + Kleber', garantie: '2 Jahre',
      },
      scores: { fahrverhalten: 86, robustheit: 84, ausstattung: 88, komfort: 82, aufbau: 88, sicherheit: 86 },
      gadgets: {
        becherhalter: '4×', kuehlbox: true, stauraum: true, trockensack: true, handyhuelle: true,
        lautsprecher: true, actioncam: true, sonnendach: 'option', angel: true,
        kopplung: true, griffleine: true, anker: true, ruecken: false,
      },
      offers: {
        galaxus: { sku: '29440871', price: 649 },
        brack:   { sku: 'zebec-380-adventure', price: 659 },
        amazon:  { sku: 'B09PLM2K4T', price: 689 },
      },
      review: {
        kicker: 'Preis-Leistungs-Sieger',
        headline: 'Zebec 380 Adventure: das Boot, das man auf der Aare am häufigsten sieht',
        verdict: 'Holt rund 85 Prozent der Testsieger-Qualität für ein Viertel des Preises.',
        bestFor: 'Für Gruppen bis fünf Personen, die regelmässig raus wollen ohne vierstellig zu investieren.',
        paragraphs: [
          'Es gibt einen Grund, warum an einem Sommersonntag zwischen Thun und Bern gefühlt jedes dritte Boot ein Zebec ist. Für <strong>CHF 649.–</strong> bekommt man hier eine Kombination, die im Testfeld sonst niemand liefert: kräftiges 1100-Denier-PVC, vier getrennte Luftkammern, Selbstlenzer, Kopplungsösen und Platz für fünf Personen.',
          'Im Abriebtest über Kiesgrund blieben leichte Spuren zurück – deutlich weniger als bei den Booten der 200-Franken-Klasse und erkennbar mehr als beim Testsieger. Genau dort liegt das Boot auch sonst: <strong>Note 1,7</strong>, mit Abstand der beste Wert unterhalb der Premium-Klasse.',
          'Bei der Ausstattung dreht Zebec den Spiess sogar um. Vier Getränkehalter, Kühlbox-Gurte, Trockensack, Handyhülle, Lautsprecher- und Kamerahalterung sowie ein Wurfanker sind an Bord – mehr, als der viermal so teure Testsieger serienmässig mitbringt. In der Gadget-Wertung ist das mit 88 von 100 Punkten der Bestwert im Test.',
          'Zwei Punkte kosten Note. Die Öffnungen des Selbstlenzers sind klein geraten: Dieselbe Menge Schwallwasser, die beim Riverstar in zwanzig Sekunden abläuft, braucht hier gut eine Minute. Und die Sitzbänke haben keine Rückenlehnen – nach drei Stunden auf dem Wasser meldet sich der untere Rücken.',
          'Der Aufbau geht dafür flott: <strong>7:30 Minuten</strong> mit der beiliegenden Doppelhub-Fusspumpe, und mit 17,5 kg trägt eine Person das Boot allein zum Einstieg. Für den Alltag ist das die praktischere Kombination als die 32 kg des Testsiegers.',
        ],
        imageCaption: 'Vier Getränkehalter, Kühlbox-Gurte, Anker: In der Ausstattung schlägt das Zebec den viermal teureren Testsieger.',
      },
    },

    {
      id: 'aquamarina-wildriver',
      brand: 'Aqua Marina',
      model: 'Wild River 330',
      badge: null,
      grade: 1.8,
      accent: '#3E7C9C',
      claim: 'Steifer Drop-Stitch-Boden macht das kleinste Boot im Test überraschend spurtreu.',
      price: { current: 899, uvp: 999 },
      tags: ['selbstlenzer'],
      pros: [
        'Hochdruck-Drop-Stitch-Boden: sehr steif, läuft spürbar geradeaus',
        'Kompakt und mit 15 kg leicht zu tragen',
        'Schnell aufgebaut, sauber verarbeitet',
        'Gute Rückenlehnen für die Bootsklasse',
      ],
      cons: [
        'Nur für drei Personen, als Gruppenboot zu klein',
        'Boden braucht hohen Druck – ohne Manometer schwer richtig zu treffen',
        'Keine Kopplungsösen',
      ],
      specs: {
        personen: '3', personenReal: '2–3 Personen', masse: '330 × 154 cm', zuladung: '340 kg',
        gewicht: '15,0 kg', packmass: '60 × 40 × 25 cm',
        material: 'PVC 900 Denier', staerke: '0,8 mm', kammern: '3 (2 + Boden)',
        boden: 'Drop-Stitch-Hochdruckboden', selbstlenzer: 'Ja',
        aufbauzeit: '8:10 min', kippwinkel: '29°', druckverlust: '4 %', abrieb: 'leichte Spuren',
        paddel: '2 Alu-Paddel', pumpe: 'Hochdruckpumpe mit Manometer',
        tasche: 'Rucksacktasche', reparatur: 'Flicken + Kleber', garantie: '2 Jahre',
      },
      scores: { fahrverhalten: 88, robustheit: 78, ausstattung: 72, komfort: 76, aufbau: 84, sicherheit: 80 },
      gadgets: {
        becherhalter: '2×', kuehlbox: false, stauraum: true, trockensack: true, handyhuelle: true,
        lautsprecher: false, actioncam: true, sonnendach: false, angel: 'option',
        kopplung: false, griffleine: true, anker: false, ruecken: true,
      },
      offers: {
        galaxus: { sku: '33019856', price: 899 },
        brack:   { sku: 'aqua-marina-wild-river-330', price: 915 },
        amazon:  { sku: 'B0B7T4N9XR', price: 929 },
      },
      review: {
        kicker: 'Bestes kleines Boot',
        headline: 'Aqua Marina Wild River 330: klein, steif, spurtreu',
        verdict: 'Das beste Boot für zwei bis drei Personen – aber kein Gruppenboot.',
        bestFor: 'Für Paare und Dreiergruppen, die regelmässig fahren und Wert auf Fahrverhalten legen.',
        paragraphs: [
          'Das Wild River ist das kleinste Boot im Test und trotzdem eines der interessantesten – wegen des Bodens. Statt eines einfachen Luftbodens sitzt hier ein <strong>Drop-Stitch-Element</strong>, das mit deutlich höherem Druck gefüllt wird und dadurch fast brettsteif ist. Auf dem Wasser macht das einen grösseren Unterschied, als man erwartet: Das Boot läuft spürbar geradeaus, statt bei jedem Paddelschlag seitlich auszubrechen.',
          'Mit <strong>15 kg</strong> ist es das leichteste Boot im Test. Eine Person trägt es problemlos vom Parkplatz zum Wasser, und das Packmass passt in jeden Kofferraum. Zusammen mit der Aufbauzeit von 8:10 Minuten ergibt das ein Boot, das man auch spontan nach Feierabend einpackt.',
          'Die Grenze ist die Grösse. Aqua Marina gibt drei Personen an, bequem sind zwei – bei drei Erwachsenen sitzt man mit angezogenen Knien. Für die Gruppe, die der Sommer eigentlich meint, ist das Boot schlicht zu klein. Und <strong>Kopplungsösen fehlen</strong>, das Boot lässt sich also nicht mit einem zweiten verbinden.',
          'Ein praktischer Stolperstein ist der Bodendruck. Die Steifigkeit stellt sich erst beim richtigen Druck ein – die beiliegende Pumpe hat zum Glück ein Manometer. Wer nach Gefühl pumpt, verschenkt genau den Vorteil, für den er bezahlt hat.',
        ],
        imageCaption: 'Der Drop-Stitch-Boden wird mit deutlich höherem Druck gefüllt und macht das Boot fast brettsteif.',
      },
    },

    {
      id: 'intex-mariner4',
      brand: 'Intex',
      model: 'Mariner 4',
      badge: null,
      grade: 2.1,
      accent: '#5E7F94',
      claim: 'Vier Sitzplätze, Paddel und Pumpe dabei – für unter CHF 300.–.',
      price: { current: 289, uvp: 329 },
      tags: ['ab4', 'unter500'],
      pros: [
        'Komplettpaket: Paddel, Pumpe und Tasche liegen bei',
        'Liegt für die Preisklasse erstaunlich ruhig im Wasser',
        'Lattenboden lässt sich ohne Werkzeug einlegen',
        'Vier Personen finden wirklich Platz',
      ],
      cons: [
        'Kein Selbstlenzer – Schwallwasser muss ausgeschöpft werden',
        'PVC deutlich dünner, im Abriebtest sichtbare Spuren',
        'Nur zwei getrennte Luftkammern plus Boden',
      ],
      specs: {
        personen: '4', personenReal: '4 Personen', masse: '328 × 145 cm', zuladung: '400 kg',
        gewicht: '15,9 kg', packmass: '58 × 40 × 25 cm',
        material: 'PVC „Super-Tough“', staerke: '0,75 mm', kammern: '3 (2 + Boden)',
        boden: 'Einlegbarer Lattenboden', selbstlenzer: 'Nein',
        aufbauzeit: '9:05 min', kippwinkel: '27°', druckverlust: '7 %', abrieb: 'sichtbare Spuren',
        paddel: '2 Alu-Paddel', pumpe: 'Handpumpe',
        tasche: 'Tragetasche', reparatur: 'Flicken', garantie: '2 Jahre',
      },
      scores: { fahrverhalten: 76, robustheit: 62, ausstattung: 74, komfort: 80, aufbau: 80, sicherheit: 64 },
      gadgets: {
        becherhalter: '2×', kuehlbox: false, stauraum: true, trockensack: false, handyhuelle: false,
        lautsprecher: false, actioncam: false, sonnendach: false, angel: true,
        kopplung: false, griffleine: true, anker: true, ruecken: false,
      },
      offers: {
        galaxus: { sku: '12447032', price: 289 },
        brack:   { sku: 'intex-mariner-4', price: 295 },
        amazon:  { sku: 'B004HKJ6KQ', price: 299 },
      },
      review: {
        kicker: 'Solides Einsteigerboot',
        headline: 'Intex Mariner 4: das ehrliche Komplettpaket',
        verdict: 'Für unter CHF 300.– bekommt man vier Sitzplätze und alles Nötige – aber keinen Selbstlenzer.',
        bestFor: 'Für Gruppen, die ein paar Mal pro Sommer auf ruhigen Abschnitten unterwegs sind.',
        paragraphs: [
          'Der Mariner 4 ist das meistverkaufte Schlauchboot dieser Grösse, und im Test wird schnell klar, warum: Für <strong>CHF 289.–</strong> liegen Paddel, Pumpe und Tasche bei, vier Erwachsene finden tatsächlich Platz, und das Boot liegt ruhiger im Wasser, als der Preis vermuten lässt.',
          'Der Lattenboden ist dabei der entscheidende Unterschied zu den ganz billigen Modellen. Er wird ohne Werkzeug eingelegt und gibt dem Rumpf genug Steifigkeit, dass das Boot beim Paddeln nicht durchhängt. Der Kippwinkel von <strong>27 Grad</strong> ist für die Klasse ein guter Wert.',
          'Der grösste Einwand steht im Datenblatt: <strong>kein Selbstlenzer</strong>. Was an einer Schwallstelle über den Rand kommt, bleibt im Fussraum stehen. Bei zehn Litern Wasser sitzt die Gruppe nass, das Boot wird träge und muss von Hand ausgeschöpft werden. Auf ruhigen Abschnitten kein Thema – auf lebhafteren schon.',
          'Auch das Material zeigt seine Klasse. Mit 0,75 mm ist das PVC deutlich dünner als beim Zebec, und im Abriebtest über Kiesgrund blieben <strong>sichtbare Spuren</strong> zurück. Der Druckverlust von 7 Prozent nach 24 Stunden in der Sonne bedeutet in der Praxis: einmal pro Ausflug nachpumpen.',
          'Sicherheitsseitig ist die Aufteilung in nur zwei Luftkammern plus Boden das Minimum. Fällt eine Kammer aus, wird das Boot deutlich instabiler als bei den Modellen mit drei getrennten Kammern.',
        ],
        imageCaption: 'Der einlegbare Lattenboden gibt dem Rumpf die Steifigkeit, die den ganz billigen Booten fehlt.',
      },
    },

    {
      id: 'sevylor-caravelle',
      brand: 'Sevylor',
      model: 'Caravelle KK105',
      badge: null,
      grade: 2.2,
      accent: '#6B7A8F',
      claim: 'Fünf Sitzplätze auf kompaktem Rumpf – eng, aber es geht.',
      price: { current: 399, uvp: 449 },
      tags: ['ab4', 'unter500'],
      pros: [
        'Fünf Sitzplätze bei kompaktem Packmass',
        'Robustere Bodenplane als bei den Billigmodellen',
        'Aufblasbare Sitze mit etwas Rückenhalt',
      ],
      cons: [
        'Fünf Personen sitzen sehr eng',
        'Kein Selbstlenzer',
        'Nur eine Handpumpe im Lieferumfang – der Aufbau zieht sich',
      ],
      specs: {
        personen: '5', personenReal: '4 Personen', masse: '340 × 158 cm', zuladung: '450 kg',
        gewicht: '18,2 kg', packmass: '62 × 42 × 28 cm',
        material: 'PVC 840 Denier', staerke: '0,8 mm', kammern: '3 (2 + Boden)',
        boden: 'Luftboden', selbstlenzer: 'Nein',
        aufbauzeit: '12:40 min', kippwinkel: '26°', druckverlust: '6 %', abrieb: 'sichtbare Spuren',
        paddel: '2 Kunststoffpaddel', pumpe: 'Handpumpe',
        tasche: 'Tragetasche', reparatur: 'Flicken', garantie: '2 Jahre',
      },
      scores: { fahrverhalten: 72, robustheit: 68, ausstattung: 66, komfort: 68, aufbau: 62, sicherheit: 66 },
      gadgets: {
        becherhalter: '2×', kuehlbox: false, stauraum: true, trockensack: false, handyhuelle: false,
        lautsprecher: false, actioncam: false, sonnendach: false, angel: 'option',
        kopplung: false, griffleine: true, anker: false, ruecken: true,
      },
      offers: {
        galaxus: { sku: '17663420', price: 399 },
        brack:   { sku: 'sevylor-caravelle-kk105', price: 409 },
        amazon:  { sku: 'B003TQ4M8G', price: 419 },
      },
      review: {
        kicker: 'Viel Sitzplatz, wenig Raum',
        headline: 'Sevylor Caravelle KK105: fünf Plätze auf dem Papier',
        verdict: 'Rechnerisch fünf Sitze, praktisch vier – und der Aufbau kostet Nerven.',
        bestFor: 'Für Vierergruppen, die ein kompaktes Packmass brauchen.',
        paragraphs: [
          'Sevylor verspricht fünf Sitzplätze auf <strong>340 cm</strong> Länge. Das Zebec braucht für dieselbe Angabe 40 cm mehr, und dieser Unterschied ist im Boot deutlich spürbar: Zu fünft sitzt man hier Schulter an Schulter, mit angezogenen Beinen. Wir haben das Boot in der Wertung als Vierer geführt, weil das die einzige Besetzung ist, bei der eine mehrstündige Fahrt angenehm bleibt.',
          'Positiv fällt die Bodenplane auf, die spürbar kräftiger ausfällt als bei den ganz günstigen Modellen. Die aufblasbaren Sitze geben etwas Rückenhalt – mehr, als das deutlich besser bewertete Zebec bietet.',
          'Der Aufbau ist der Schwachpunkt. Sevylor legt nur eine <strong>einfache Handpumpe</strong> bei, und die braucht für drei Kammern plus Boden ihre Zeit: <strong>12:40 Minuten</strong> waren der schlechteste Wert im ganzen Test. Wer das Boot regelmässig nutzt, sollte gleich eine Doppelhub-Fusspumpe dazukaufen.',
          'Wie der Intex hat auch der Caravelle <strong>keinen Selbstlenzer</strong>, und mit 26 Grad Kippwinkel ist er das zweitkippeligste Boot im Test. Beides zusammen heisst: ruhige Abschnitte wählen und beim Ein- und Aussteigen Ruhe bewahren.',
        ],
        imageCaption: 'Nur eine Handpumpe im Karton – mit 12:40 Minuten der langsamste Aufbau im Test.',
      },
    },

    {
      id: 'intex-excursion5',
      brand: 'Intex',
      model: 'Excursion 5',
      badge: 'Preistipp',
      grade: 2.6,
      accent: '#7C8B7F',
      claim: 'Fünf Plätze zum Preis eines Abendessens – mit den erwartbaren Abstrichen.',
      price: { current: 179, uvp: 219 },
      tags: ['ab4', 'unter500'],
      pros: [
        'Günstigstes Boot mit fünf Sitzplätzen im Test',
        'Paddel, Pumpe und zwei Angelrutenhalter liegen bei',
        'Für den einen Sommerausflug völlig ausreichend',
      ],
      cons: [
        'Dünnes Material, im Abriebtest deutliche Spuren',
        'Kein Selbstlenzer, hoher Druckverlust',
        'Sitzbänke ohne jede Polsterung',
        'Kippt am zweitfrühesten im Test',
      ],
      specs: {
        personen: '5', personenReal: '4 Personen', masse: '366 × 168 cm', zuladung: '500 kg',
        gewicht: '19,3 kg', packmass: '64 × 42 × 30 cm',
        material: 'PVC 600 Denier', staerke: '0,6 mm', kammern: '3 (2 + Boden)',
        boden: 'Einlegbarer Lattenboden', selbstlenzer: 'Nein',
        aufbauzeit: '10:15 min', kippwinkel: '24°', druckverlust: '9 %', abrieb: 'deutliche Spuren',
        paddel: '2 Alu-Paddel', pumpe: 'Handpumpe',
        tasche: 'Tragetasche', reparatur: 'Flicken', garantie: '2 Jahre',
      },
      scores: { fahrverhalten: 64, robustheit: 52, ausstattung: 62, komfort: 62, aufbau: 74, sicherheit: 58 },
      gadgets: {
        becherhalter: '4×', kuehlbox: false, stauraum: true, trockensack: false, handyhuelle: false,
        lautsprecher: false, actioncam: false, sonnendach: false, angel: true,
        kopplung: false, griffleine: true, anker: true, ruecken: false,
      },
      offers: {
        galaxus: { sku: '10112788', price: 179 },
        brack:   { sku: 'intex-excursion-5', price: 185 },
        amazon:  { sku: 'B003ZP0QOE', price: 189 },
      },
      review: {
        kicker: 'Preistipp',
        headline: 'Intex Excursion 5: fünf Plätze für CHF 179.–',
        verdict: 'Der günstigste Weg, eine grosse Gruppe aufs Wasser zu bringen – für ein, zwei Sommer.',
        bestFor: 'Für den einen grossen Gruppenausflug im Jahr, auf ruhigem Wasser.',
        paragraphs: [
          'Für <strong>CHF 179.–</strong> bekommt man hier fünf Sitzplätze, zwei Alu-Paddel, eine Pumpe und sogar vier Getränkehalter. Rein rechnerisch ist das der günstigste Platz auf dem Wasser im ganzen Test – rund 36 Franken pro Person.',
          'Die Abstriche stehen alle im selben Absatz. Das PVC ist mit <strong>0,6 mm</strong> das dünnste im Test, und der Abriebtest über Kiesgrund hinterliess entsprechend <strong>deutliche Spuren</strong>. Der Druckverlust von 9 Prozent nach 24 Stunden Sonne bedeutet, dass man vor der Rückfahrt praktisch immer nachpumpt.',
          'Mit <strong>24 Grad</strong> Kippwinkel ist das Excursion nach dem Bestway das kippeligste Boot im Test. Ohne Selbstlenzer bleibt jedes übergekommene Wasser im Boot stehen. Auf einem ruhigen Abschnitt mit vernünftiger Gruppe ist das beherrschbar – bei Schwallstellen oder Übermut wird es unangenehm.',
          'Intex gibt fünf Personen an; wir haben in der Wertung vier gesetzt. Zu fünft sitzt man auf ungepolsterten Bänken so eng, dass nach einer Stunde niemand mehr Freude hat. Zu viert dagegen ist das Boot für seinen Preis erstaunlich brauchbar.',
          'Unser Rat: als bewusste Ein-Saison-Anschaffung für den grossen Ausflug ja. Als Boot, das mehrere Sommer halten soll, lieber CHF 470.– mehr in den Preis-Leistungs-Sieger investieren.',
        ],
        imageCaption: '0,6 mm PVC: das dünnste Material im Test – nach dem Abriebtest deutlich gezeichnet.',
      },
    },

    {
      id: 'bestway-caspian',
      brand: 'Bestway',
      model: 'Hydro-Force Caspian Pro 280',
      badge: null,
      grade: 2.7,
      accent: '#8C7F86',
      claim: 'Das günstigste Boot im Test – und man merkt jeden gesparten Franken.',
      price: { current: 199, uvp: 249 },
      tags: ['unter500'],
      pros: [
        'Sehr niedriger Einstiegspreis',
        'Leicht und schnell aufgebaut',
        'Für zwei Personen auf ruhigem Wasser ausreichend',
      ],
      cons: [
        'Kippeligstes Boot im Test',
        'Kein Selbstlenzer, kein Lattenboden – der Rumpf hängt spürbar durch',
        'Kunststoffpaddel biegen sich schon bei mässigem Zug',
        'Höchster Druckverlust im Test',
      ],
      specs: {
        personen: '3', personenReal: '2 Personen', masse: '280 × 152 cm', zuladung: '270 kg',
        gewicht: '11,8 kg', packmass: '55 × 38 × 22 cm',
        material: 'PVC 500 Denier', staerke: '0,55 mm', kammern: '2 (1 + Boden)',
        boden: 'Einfacher Luftboden', selbstlenzer: 'Nein',
        aufbauzeit: '6:50 min', kippwinkel: '22°', druckverlust: '11 %', abrieb: 'deutliche Spuren',
        paddel: '2 Kunststoffpaddel', pumpe: 'Handpumpe',
        tasche: 'Beutel', reparatur: 'Flicken', garantie: '2 Jahre',
      },
      scores: { fahrverhalten: 54, robustheit: 46, ausstattung: 48, komfort: 56, aufbau: 86, sicherheit: 44 },
      gadgets: {
        becherhalter: '2×', kuehlbox: false, stauraum: false, trockensack: false, handyhuelle: false,
        lautsprecher: false, actioncam: false, sonnendach: false, angel: false,
        kopplung: false, griffleine: true, anker: false, ruecken: false,
      },
      offers: {
        galaxus: { sku: '14882301', price: 199 },
        brack:   { sku: 'bestway-caspian-pro-280', price: 205 },
        amazon:  { sku: 'B07DVKQ8H2', price: 209 },
      },
      review: {
        kicker: 'Schlusslicht',
        headline: 'Bestway Caspian Pro 280: günstig, und man merkt es',
        verdict: 'Für zwei Personen auf ruhigem Wasser gerade noch in Ordnung – mehr nicht.',
        bestFor: 'Nur für gelegentliche Fahrten zu zweit auf stehendem oder sehr ruhigem Wasser.',
        paragraphs: [
          'Das Caspian Pro ist mit <strong>CHF 199.–</strong> das günstigste Boot im Test und leider auch in fast jeder Messreihe das schwächste. Der Kippwinkel von <strong>22 Grad</strong> ist der tiefste Wert im Feld: Wenn zwei Personen gleichzeitig auf dieselbe Seite rücken, kommt hier bereits Wasser über den Rand, während der Testsieger noch 16 Grad Reserve hat.',
          'Bestway gibt drei Personen an. Realistisch sind zwei – und das nicht wegen der Sitzfläche, sondern wegen der Zuladung von 270 kg, die mit drei Erwachsenen plus Kühlbox bereits überschritten ist.',
          'Der einfache Luftboden ohne Latten oder Drop-Stitch lässt den Rumpf beim Paddeln spürbar durchhängen. Das Boot läuft dadurch schlecht geradeaus und reagiert träge – gerade auf fliessendem Wasser, wo man eine Badestelle ansteuern will, ist das der praktische Nachteil.',
          'Mit <strong>11 Prozent</strong> Druckverlust nach 24 Stunden in der Sonne ist Nachpumpen hier keine Option, sondern Pflicht. Und die Kunststoffpaddel biegen sich schon bei mässigem Zug so weit durch, dass kaum Vortrieb ankommt – ein Satz Alu-Paddel für rund CHF 60.– ist praktisch eine Pflichtinvestition.',
          'Zwei Dinge spricht das Boot frei: Mit 11,8 kg ist es das leichteste im Test, und mit 6:50 Minuten das am schnellsten aufgebaute. Wer es als Spontanboot für zwei Personen auf einem ruhigen See sieht, wird nicht unglücklich. Für den Fluss und für Gruppen ist es die falsche Wahl.',
        ],
        imageCaption: 'Nur zwei Luftkammern und ein einfacher Luftboden: Der Rumpf hängt beim Paddeln sichtbar durch.',
      },
    },
  ],

  /* --------------------------------------------------------------
   * 9) Methodik
   * ------------------------------------------------------------ */
  method: {
    kicker: 'So testen wir',
    headline: 'Stoppuhr am Ufer, Kippmessung am Steg, Abriebtest über Kies',
    intro:
      'Jedes Boot fährt denselben Flussabschnitt, wird von denselben vier Personen beladen und ' +
      'durchläuft dieselben Messreihen. Wir kaufen alle Boote selbst im Handel. Das sind die ' +
      'sechs Kriterien und ihre Gewichtung:',
    outro:
      'Aus den sechs Einzelnoten ergibt sich die Gesamtnote nach der genannten Gewichtung. Bei ' +
      'gleicher Note entscheidet das interne Ergebnis, das wir auf drei Nachkommastellen führen.',
  },

  /* --------------------------------------------------------------
   * 10) Sicherheit
   * ------------------------------------------------------------ */
  safety: {
    kicker: 'Bevor Sie ablegen',
    headline: 'Sechs Regeln, die am Fluss wirklich zählen',
    intro:
      'Das beste Boot nützt nichts, wenn die Grundlagen fehlen. Diese Punkte gelten unabhängig ' +
      'davon, für welches Modell Sie sich entscheiden.',
    rules: [
      { title: 'Schwimmweste für alle an Bord',
        text: 'Auch für geübte Schwimmer. Fliessendes Wasser ist kalt, und wer unerwartet reinfällt, hat die ersten Sekunden keine Kontrolle über die Atmung.' },
      { title: 'Niemals anbinden',
        text: 'Keine Leine um Handgelenk, Fuss oder Körper – auch nicht die Ankerleine. Wer am Boot hängt, wenn es sich verklemmt, kommt nicht frei.' },
      { title: 'Wehre und Schwellen umtragen',
        text: 'Vor jedem Wehr aussteigen und das Boot umtragen. Die Walze unterhalb einer Schwelle hält auch Erwachsene mit Weste fest.' },
      { title: 'Ausstieg vorher festlegen',
        text: 'Die Ausstiegsstelle vor dem Ablegen auf der Karte markieren. Wer zu spät reagiert, treibt daran vorbei – zurückpaddeln geht gegen die Strömung kaum.' },
      { title: 'Zuladung ernst nehmen',
        text: 'Die Angabe des Herstellers gilt inklusive Kühlbox und Gepäck. Ein überladenes Boot liegt tief, nimmt schneller Wasser auf und reagiert träge.' },
      { title: 'Alkohol erst am Ufer',
        text: 'Kaltes Wasser, Sonne und Alkohol sind die Kombination hinter den meisten Zwischenfällen beim Böötle. Die Kühlbox wartet auch bis zur Grillstelle.' },
    ],
  },

  /* --------------------------------------------------------------
   * 11) Fazit
   * ------------------------------------------------------------ */
  conclusion: {
    kicker: 'Unser Fazit',
    headline: 'Zwei Zahlen entscheiden: Kippwinkel und Materialstärke',
    paragraphs: [
      'Nach 112 Flusskilometern lässt sich der Test auf zwei Messwerte eindampfen. Der <strong>Kippwinkel</strong> sagt, wie entspannt eine Gruppe an Bord sein darf, und die <strong>Materialstärke</strong> sagt, wie viele Sommer das Boot übersteht. Beide Werte korrelieren fast perfekt mit dem Preis – anders als etwa die Anzahl der Sitzplätze, die viele Hersteller grosszügig auslegen.',
      'Wer regelmässig aufs Wasser geht, sollte den <strong>Zebec 380 Adventure</strong> (CHF 649.–) als Einstiegspunkt betrachten. Er ist das günstigste Boot mit Selbstlenzer, vier Luftkammern und wirklich brauchbarem Material – und schlägt in der Ausstattung sogar den Testsieger.',
      'Der <strong>Grabner Riverstar</strong> (CHF 2’690.–) lohnt sich nur bei häufiger Nutzung, ist dann aber konkurrenzlos: Er ist das einzige Boot im Test, das reparierbar statt ersetzbar konstruiert ist. Wer zu zweit oder zu dritt unterwegs ist, findet im <strong>Aqua Marina Wild River</strong> (CHF 899.–) das beste Fahrverhalten.',
      'Bei den günstigen Booten gilt: Der <strong>Intex Excursion 5</strong> (CHF 179.–) bringt eine grosse Gruppe für einen Sommer aufs Wasser, mehr sollte man nicht erwarten. Vom <strong>Bestway Caspian Pro</strong> raten wir für Flüsse ab – zwei Luftkammern und 22 Grad Kippwinkel sind zu wenig Reserve.',
    ],
    quote: {
      text: 'Die Sitzplatzangabe auf dem Karton ist die unzuverlässigste Zahl der ganzen Branche. Rechnen Sie eine Person ab – dann stimmt es meistens.',
      author: 'Nina Brunner',
      role: 'Ressortleiterin Outdoor & Sommer',
    },
  },

  /* --------------------------------------------------------------
   * 12) FAQ
   * ------------------------------------------------------------ */
  faq: [
    { q: 'Wie heisst so ein Boot eigentlich richtig?',
      a: 'Der Oberbegriff ist <strong>Schlauchboot</strong>. Flusstaugliche Modelle mit Wasserablauf im Boden heissen <strong>Selbstlenzer</strong> (englisch self-bailing raft). Die Aktivität selbst nennt man in der Schweiz <strong>Böötle</strong>. Nicht gemeint ist die runde <strong>Badeinsel</strong> – die ist auf fliessendem Wasser nicht steuerbar und dort gefährlich.' },
    { q: 'Wie viele Personen passen wirklich hinein?',
      a: 'Ziehen Sie von der Herstellerangabe eine Person ab. In unserem Test war bei sechs von acht Booten die angegebene Kapazität nur erreichbar, wenn alle mit angezogenen Knien sitzen. Verlässlicher als die Personenzahl ist die Zuladung in Kilogramm – rechnen Sie 80 kg pro Person plus 15 kg für Kühlbox und Gepäck.' },
    { q: 'Brauche ich zwingend einen Selbstlenzer?',
      a: 'Auf ruhigen Abschnitten nicht. Sobald Schwallstellen, Wellen oder viel Betrieb dazukommen, ja: Ohne Ablauf bleibt jedes übergekommene Wasser im Boot stehen, das Boot wird träge und muss von Hand ausgeschöpft werden. Drei der acht Testboote haben einen Selbstlenzer.' },
    { q: 'Was bedeutet Denier beim Material?',
      a: 'Denier beschreibt die Dichte des Trägergewebes unter der PVC-Schicht – je höher, desto reissfester. Im Test reichte die Spanne von 500 bis 1100 Denier, und der Zusammenhang mit dem Abriebtest war eindeutig. Ab etwa 900 Denier hält ein Boot mehrere Saisons durch.' },
    { q: 'Lohnt sich ein Boot für über CHF 1’000.–?',
      a: 'Bei häufiger Nutzung ja. Ein Premium-Boot hält bei sorgfältiger Behandlung acht bis zehn Sommer, ein 200-Franken-Boot ein bis zwei. Auf zehn Jahre gerechnet ist der Testsieger damit nicht teurer – vorausgesetzt, Sie fahren wirklich regelmässig.' },
    { q: 'Darf ich in der Schweiz überall böötle?',
      a: 'Auf den meisten Flüssen ja, es gelten aber örtliche Regeln. Boote ab einer gewissen Grösse brauchen je nach Gewässer eine Kennzeichnung, und für einzelne Abschnitte bestehen Fahrverbote. Erkundigen Sie sich vor der ersten Fahrt bei der zuständigen kantonalen Stelle – die Vorgaben unterscheiden sich von Kanton zu Kanton.' },
    { q: 'Warum sind eure Links Affiliate-Links?',
      a: 'Weil wir die Testboote selbst kaufen und unsere Arbeit damit finanzieren. Bestellen Sie über einen unserer Links, zahlt der Händler uns eine Provision – Ihr Preis bleibt identisch. Auf Testnoten und Platzierungen hat das keinen Einfluss; die Reihenfolge ergibt sich ausschliesslich aus den Messwerten.' },
  ],
};
