// Educational articles for ParaPolar — Learn section.
// Structure is identical across languages: same slugs, same number of sections.

export const LEARN_ARTICLES = {
  en: [
    {
      slug: "polar-curve",
      title: "Reading the Polar Curve",
      metaDescription:
        "Learn to read a paraglider polar curve: what the axes show, where minimum sink, best glide and trim speed live, and how wing loading shifts the curve.",
      readingMinutes: 5,
      intro: [
        "Every paraglider has a performance fingerprint: for each airspeed you can fly, the wing comes down at one specific sink rate. Plot those pairs and you get the polar curve. It is the single most useful picture of what your wing can and cannot do.",
        "You do not need mathematics to use it. Once you can find three points on the curve — minimum sink, best glide and trim — you can answer most everyday questions: how slowly can I circle, how far can I reach, and what does pushing the speedbar really cost me?",
      ],
      sections: [
        {
          heading: "The axes and their conventions",
          paragraphs: [
            "The horizontal axis shows airspeed, usually in km/h — your speed through the air, not over the ground. The vertical axis shows vertical speed in m/s, and because a glider without an engine is always descending through the airmass, the curve lives below zero. By convention sink is drawn downward, so lower on the chart means coming down faster.",
            "Each point on the curve is one steady flight state: pick an airspeed, and the polar tells you the sink rate that comes with it. The curve only covers speeds you can actually fly — from deep brakes near minimum speed on the left, through hands-up trim, out to full speedbar on the right.",
            "Notice the shape: it is not a straight line but a bowed arc. Fly very slowly and sink increases because the wing is close to the stall; fly very fast and sink increases sharply because drag grows with the square of speed. The useful speeds sit in the shallow bowl between those extremes.",
          ],
        },
        {
          heading: "Three speeds worth memorising",
          paragraphs: [
            "Minimum sink is the highest point of the curve — the airspeed at which you lose the least height per second, typically with a touch of brake, a few km/h above stall. This is your speed for staying up: circling in weak thermals or scratching in ridge lift. It buys time aloft, not distance.",
            "Best glide is where a straight line from the chart's origin just touches the curve. At that tangent point the ratio of forward speed to sink — your glide ratio — is at its maximum, so in still air this airspeed carries you the farthest per metre of height. On most paragliders it sits at or just below trim speed.",
            "Trim speed is simply where the wing flies with brakes and speedbar released. It is your reference point: everything to the left of it needs brake, everything to the right needs bar. Knowing where trim sits relative to best glide tells you whether hands-up is already close to your optimal still-air glide — on many wings, it is.",
          ],
        },
        {
          heading: "What wing loading does to the curve",
          paragraphs: [
            "Fly the same wing heavier — top of the weight range, or with ballast — and the whole polar shifts to the right and down. Every characteristic speed increases: stall, minimum sink, best glide and trim all move to higher airspeeds, and the sink rates grow with them.",
            "Here is the elegant part: the best glide ratio barely changes. The tangent line from the origin touches the new curve farther out, but at nearly the same angle. Loaded heavy, you glide just as far — you simply do it faster, and pay with a higher sink rate in weak lift.",
            "That is why cross-country pilots load their wings up on strong days: more speed for the same glide, plus a more solid, collapse-resistant wing. On weak days the trade reverses — a lighter loading sinks less in gentle thermals, and staying up beats going fast.",
          ],
        },
        {
          heading: "What the polar cannot tell you on its own",
          paragraphs: [
            "The polar describes your motion through the airmass, and only that. The moment the airmass itself moves — wind pushing you back, sink pulling you down — the speed that is best over the ground is no longer the still-air best glide speed. That correction is the subject of speed to fly.",
            "Also keep some healthy scepticism about the numbers. Published polars are measured in calm morning air with a test pilot; your wing, your harness drag and your flying weight all shift the curve. Treat the polar in this app as an archetype for learning the shapes and trade-offs, not as a certificate of performance.",
          ],
        },
      ],
      takeaway:
        "The polar maps every airspeed to its price in sink. Find minimum sink, best glide and trim on it, and you understand your wing.",
      widgetState: {
        gliderId: "en-b-low",
        pilotSlider: 50,
        windKmh: 0,
        liftMs: 0,
        maccreadyMs: 0,
        wingLoad: 1.0,
      },
    },
    {
      slug: "speed-to-fly",
      title: "Speed to Fly: Wind and Sink Change Everything",
      metaDescription:
        "Why best glide speed changes with headwind, tailwind and sinking air. The shifting-origin tangent trick, plus speed-to-fly rules for paraglider pilots.",
      readingMinutes: 6,
      intro: [
        "Best glide speed is the answer to a still-air question. The moment there is wind or the air around you rises or sinks, the airspeed that carries you farthest over the ground changes — sometimes by a lot. Speed to fly is the discipline of picking the right airspeed for the air you are actually in.",
        "The core insight fits in one sentence: your glide over the ground depends on groundspeed and total sink, not on airspeed alone. Everything below is that sentence unpacked into a picture you can read off the polar curve.",
      ],
      sections: [
        {
          heading: "Why wind changes your best speed",
          paragraphs: [
            "Glide into a 20 km/h headwind at a best-glide airspeed of 36 km/h and only 16 km/h remain over the ground — while you sink exactly as fast as before. Your glide ratio over the ground collapses. Every second spent in that headwind costs ground you are not covering.",
            "Push the speedbar and your sink rate increases — but your time exposed to the headwind shrinks faster than the extra sink costs you. Up to a point, flying faster into wind gets you farther, not just there sooner. Beyond that point the steepening polar takes back more than the wind argument gives.",
            "With a tailwind the logic flips: the wind is doing free work for you, so you want to stay in it longer. Slowing down toward minimum sink stretches your time in the helping air and flattens your glide over the ground.",
          ],
        },
        {
          heading: "The shifting-origin trick",
          paragraphs: [
            "Recall that best glide in still air is the tangent line from the origin to the polar. The beautiful generalisation: with wind, slide the origin along the horizontal axis by the wind speed — into the wind for headwind, the other way for tailwind — and draw the tangent from there. The new tangent point is your speed to fly.",
            "A headwind moves the origin toward the curve, so the tangent touches farther right: fly faster. A tailwind moves the origin away, so the tangent touches farther left: fly slower. The picture does the algebra for you, and this app draws it live as you move the wind slider.",
            "Sinking or rising air shifts the origin vertically instead — down for lift, up for sink. Sinking air makes the tangent touch farther right, again telling you to speed up. The two shifts combine, so any wind-plus-airmass situation reduces to one tangent line.",
          ],
        },
        {
          heading: "Sink is a headwind pointing down",
          paragraphs: [
            "Flying through air that descends at 2 m/s roughly triples a paraglider's sink rate. If you dawdle through it at minimum sink speed, you maximise the time spent losing height. The correct reflex is counterintuitive at first: push the bar and get out.",
            "Run the numbers and it stops feeling strange. Crossing a 2 km wide sink band at 30 km/h takes four minutes; at 50 km/h it takes under two and a half. The extra sink from the bar is small compared with the 2 m/s the airmass takes from you either way — shortening the exposure wins.",
            "In lift, the same reasoning inverts: slow down, spend longer in the rising air, and if it is strong enough, stop gliding and turn in it. The boundary between 'slow down' and 'stop and climb' is exactly what the MacCready setting formalises.",
          ],
        },
        {
          heading: "Rules of thumb for the real air",
          paragraphs: [
            "Speed up into headwind and in sink; slow down in tailwind and in lift. That one line covers most decisions. Into a stiff headwind, half to full bar is usually right; downwind, trim or a touch of brake toward minimum sink.",
            "Respect the paraglider-specific caveat: our polars steepen quickly on bar, so the last centimetres of speedbar buy little groundspeed for a lot of sink. In a light headwind, trim or quarter bar is often nearly optimal — save full bar for strong wind and strong sink.",
            "Do not chase the theoretical optimum km/h by km/h. The polar is shallow near the optimum, so being 5 km/h off costs almost nothing, while flying the wrong side of trim in a 30 km/h headwind costs everything. Get the direction of the correction right and be roughly right about its size.",
          ],
        },
      ],
      takeaway:
        "Judge your glide over the ground, not through the air: speed up into headwind and sink, slow down in tailwind and lift — the shifted tangent shows exactly how much.",
      widgetState: {
        gliderId: "en-b-plus",
        pilotSlider: 80,
        windKmh: 15,
        liftMs: -1,
        maccreadyMs: 0,
        wingLoad: 1.0,
      },
    },
    {
      slug: "maccready",
      title: "MacCready for Paraglider Pilots",
      metaDescription:
        "What the MacCready setting means on a paraglider: how the strength of your next expected thermal sets glide speed, and honest caveats for weak climbs and bar.",
      readingMinutes: 6,
      intro: [
        "Speed to fly answers the question 'what does the air I am in right now demand?'. MacCready theory adds a second, forward-looking question: 'how strong will my next climb be?'. Together they tell you how fast to glide between thermals on a cross-country flight.",
        "Paul MacCready's idea, borrowed from sailplane racing, is that altitude has a price, and the price is set by your next thermal. If climbs are strong, height is cheap to replace — so you can afford to burn it for speed. If climbs are weak, height is precious — glide carefully.",
      ],
      sections: [
        {
          heading: "What the MacCready value actually means",
          paragraphs: [
            "The MacCready setting — 'MC value' or ring setting — is one number: the average climb rate, in m/s, you expect in the next thermal you will stop for. Set MC 2 and you are asserting: the next climb I take will average 2 m/s from entry to exit, including the messy centring at the bottom.",
            "Mathematically, the optimum glide speed comes from the same tangent construction as speed to fly: shift the origin upward by the MC value, as if you were gliding through air rising at that rate that you refuse to stop in. A higher MC pushes the tangent point right — glide faster.",
            "Set MC to zero and the theory hands back plain best glide: maximise distance, ignore time. That is your setting when getting there at all is in doubt — scraping toward a landing field or stretching a final glide over unlandable terrain.",
          ],
        },
        {
          heading: "Why expecting a strong climb makes you fly faster",
          paragraphs: [
            "Think of it as time accounting. Gliding faster means arriving at the next thermal lower — you traded height for time on the glide. The height you sacrificed must be climbed back, and the cost of climbing depends entirely on how strong the thermal is.",
            "If the next climb averages 3 m/s, 100 metres of height costs 33 seconds to replace — cheap, so race. If it averages 0.5 m/s, the same 100 metres costs over three minutes — expensive, so glide near best glide and hoard your altitude. Flying MC correctly minimises total time: glide plus climb.",
            "This is why the same transition is flown differently at 2 pm under a booming sky than at 6 pm in dying thermals. Nothing about the air between the thermals changed — only the price of the altitude you will need to buy back at the far end.",
          ],
        },
        {
          heading: "Honest caveats for paragliding",
          paragraphs: [
            "MacCready theory was built for sailplanes with glide ratios of 40 or better and strong, reliable climbs. Paragliders climb at 1–2 m/s on a good day, and our glide degrades noticeably on bar — the polar steepens where a sailplane's stays flat. The optimal MC speeds are therefore closer to trim than the theory's sailplane pedigree suggests.",
            "The theory also assumes you will find that next climb. On a paraglider, arriving 200 metres lower can mean arriving below the working band and bombing out — an asymmetric risk no tangent line captures. Most experienced pilots deliberately fly a 'degraded' MacCready: set roughly half the climb rate you honestly expect.",
            "In practice: fly closer to MC on strong days with high cloudbases, on final glide, and downwind of a reliable house thermal. Fly conservatively — MC near zero — when low, in weak conditions, or over bad terrain. MacCready is a ceiling on aggression, not a floor.",
          ],
        },
      ],
      takeaway:
        "MacCready prices your altitude by your next climb: strong expected thermals justify a fast glide, weak ones do not — and on a paraglider, honest means conservative.",
      widgetState: {
        gliderId: "en-c",
        pilotSlider: 90,
        windKmh: 0,
        liftMs: 0,
        maccreadyMs: 2,
        wingLoad: 1.05,
      },
    },
  ],

  de: [
    {
      slug: "polar-curve",
      title: "Die Polare lesen",
      metaDescription:
        "Die Polare deines Gleitschirms verstehen: Achsen, geringstes Sinken, bestes Gleiten und Trimmspeed — und wie die Flächenbelastung die Kurve verschiebt.",
      readingMinutes: 5,
      intro: [
        "Jeder Gleitschirm hat einen Leistungs-Fingerabdruck: Zu jeder fliegbaren Geschwindigkeit gehört genau eine Sinkrate. Trägt man diese Paare in ein Diagramm ein, entsteht die Polare — das nützlichste Bild davon, was dein Schirm kann und was nicht.",
        "Dafür brauchst du keine Mathematik. Sobald du drei Punkte auf der Kurve findest — geringstes Sinken, bestes Gleiten und Trimm — kannst du die wichtigsten Alltagsfragen beantworten: Wie langsam kann ich kurbeln, wie weit komme ich, und was kostet mich der Beschleuniger wirklich?",
      ],
      sections: [
        {
          heading: "Achsen und Konventionen",
          paragraphs: [
            "Auf der horizontalen Achse steht die Fluggeschwindigkeit in km/h — die Geschwindigkeit gegenüber der Luft, nicht über Grund. Auf der vertikalen Achse steht die Vertikalgeschwindigkeit in m/s, und weil ein Schirm ohne Motor gegenüber der Luftmasse immer sinkt, liegt die Kurve unter der Nulllinie. Sinken wird nach unten aufgetragen: Je tiefer der Punkt, desto schneller geht es abwärts.",
            "Jeder Punkt der Kurve ist ein stationärer Flugzustand: Wähle eine Geschwindigkeit, und die Polare verrät dir die zugehörige Sinkrate. Die Kurve deckt nur ab, was du wirklich fliegen kannst — von tief angebremst nahe der Minimalgeschwindigkeit links über Trimm mit Händen oben bis Vollgas am Beschleuniger rechts.",
            "Achte auf die Form: keine Gerade, sondern ein Bogen. Sehr langsam steigt das Sinken, weil der Schirm nahe am Strömungsabriss fliegt; sehr schnell steigt es steil an, weil der Widerstand mit dem Quadrat der Geschwindigkeit wächst. Die nützlichen Geschwindigkeiten liegen in der flachen Mulde dazwischen.",
          ],
        },
        {
          heading: "Drei Geschwindigkeiten zum Merken",
          paragraphs: [
            "Das geringste Sinken ist der höchste Punkt der Kurve — die Geschwindigkeit, bei der du pro Sekunde am wenigsten Höhe verlierst, typischerweise leicht angebremst, ein paar km/h über dem Abriss. Das ist deine Geschwindigkeit zum Obenbleiben: Kurbeln in schwacher Thermik oder Soaren am Hang. Sie kauft Zeit, keine Strecke.",
            "Das beste Gleiten liegt dort, wo eine Gerade vom Ursprung des Diagramms die Kurve gerade noch berührt. In diesem Tangentenpunkt ist das Verhältnis von Vorwärtsfahrt zu Sinken — die Gleitzahl — maximal: In ruhiger Luft kommst du mit dieser Geschwindigkeit pro Meter Höhe am weitesten. Bei den meisten Gleitschirmen liegt sie bei oder knapp unter Trimmspeed.",
            "Die Trimmgeschwindigkeit ist schlicht die Geschwindigkeit mit offenen Bremsen und ohne Beschleuniger. Sie ist dein Referenzpunkt: Alles links davon erfordert Bremse, alles rechts davon Gas. Wer weiß, wo Trimm relativ zum besten Gleiten liegt, weiß auch, ob Hände-oben schon fast optimal gleitet — bei vielen Schirmen ist genau das der Fall.",
          ],
        },
        {
          heading: "Was die Flächenbelastung mit der Kurve macht",
          paragraphs: [
            "Fliegst du denselben Schirm schwerer — am oberen Ende des Gewichtsbereichs oder mit Ballast — verschiebt sich die gesamte Polare nach rechts unten. Alle charakteristischen Geschwindigkeiten steigen: Abriss, geringstes Sinken, bestes Gleiten und Trimm wandern zu höheren Werten, und die Sinkraten wachsen mit.",
            "Der elegante Teil: Die beste Gleitzahl ändert sich kaum. Die Tangente vom Ursprung berührt die neue Kurve weiter rechts, aber unter fast demselben Winkel. Schwer beladen gleitest du genauso weit — nur schneller, und du bezahlst mit mehr Sinken in schwachem Steigen.",
            "Genau deshalb laden Streckenflieger ihre Schirme an starken Tagen auf: mehr Fahrt bei gleichem Gleiten, dazu eine prallere, klappstabilere Kappe. An schwachen Tagen dreht sich der Handel um — leichter beladen sinkt man in zarter Thermik weniger, und Obenbleiben schlägt Schnellsein.",
          ],
        },
        {
          heading: "Was die Polare allein nicht verrät",
          paragraphs: [
            "Die Polare beschreibt deine Bewegung gegenüber der Luftmasse — und nur die. Sobald sich die Luftmasse selbst bewegt — Gegenwind bremst dich, Sinken zieht dich hinunter — ist die über Grund beste Geschwindigkeit nicht mehr das Ruhigluft-Optimum. Diese Korrektur ist das Thema der Sollfahrt.",
            "Und bleib bei den Zahlen skeptisch: Veröffentlichte Polaren entstehen in ruhiger Morgenluft mit Testpiloten; dein Schirm, dein Gurtzeugwiderstand und dein Abfluggewicht verschieben die Kurve. Nimm die Polare in dieser App als Lehrbeispiel für Formen und Kompromisse — nicht als Leistungszertifikat.",
          ],
        },
      ],
      takeaway:
        "Die Polare ordnet jeder Geschwindigkeit ihren Preis in Sinken zu. Wer geringstes Sinken, bestes Gleiten und Trimm darauf findet, versteht seinen Schirm.",
      widgetState: {
        gliderId: "en-b-low",
        pilotSlider: 50,
        windKmh: 0,
        liftMs: 0,
        maccreadyMs: 0,
        wingLoad: 1.0,
      },
    },
    {
      slug: "speed-to-fly",
      title: "Sollfahrt: Wind und Sinken ändern alles",
      metaDescription:
        "Warum sich die beste Gleitgeschwindigkeit mit Gegenwind, Rückenwind und Sinken verschiebt: die Tangente mit verschobenem Ursprung und einfache Sollfahrt-Regeln.",
      readingMinutes: 6,
      intro: [
        "Die Geschwindigkeit des besten Gleitens beantwortet eine Ruhigluft-Frage. Sobald Wind weht oder die Luft um dich steigt oder sinkt, ändert sich die Geschwindigkeit, die dich über Grund am weitesten trägt — manchmal deutlich. Sollfahrt heißt: die richtige Fahrt für die Luft wählen, in der du tatsächlich fliegst.",
        "Der Kern passt in einen Satz: Dein Gleiten über Grund hängt von Grundgeschwindigkeit und Gesamtsinken ab, nicht von der Fahrt allein. Alles Weitere ist dieser Satz, ausgepackt in ein Bild, das du direkt von der Polare ablesen kannst.",
      ],
      sections: [
        {
          heading: "Warum Wind deine beste Fahrt verschiebt",
          paragraphs: [
            "Gleite mit 36 km/h bester Gleitgeschwindigkeit gegen 20 km/h Gegenwind, und über Grund bleiben nur 16 km/h übrig — während du genauso schnell sinkst wie vorher. Deine Gleitzahl über Grund bricht ein. Jede Sekunde im Gegenwind kostet Strecke, die du nicht zurücklegst.",
            "Trittst du in den Beschleuniger, steigt zwar dein Sinken — aber deine Zeit im Gegenwind schrumpft schneller, als das Mehrsinken kostet. Bis zu einem gewissen Punkt bringt dich schnelleres Fliegen gegen den Wind weiter, nicht nur früher an. Jenseits davon nimmt die steiler werdende Polare mehr zurück, als das Wind-Argument gibt.",
            "Mit Rückenwind kippt die Logik: Der Wind arbeitet gratis für dich, also willst du länger in ihm bleiben. Wer Richtung geringstes Sinken langsamer wird, verlängert die Zeit in der schiebenden Luft und macht sein Gleiten über Grund flacher.",
          ],
        },
        {
          heading: "Der Trick mit dem verschobenen Ursprung",
          paragraphs: [
            "Zur Erinnerung: Bestes Gleiten in ruhiger Luft ist die Tangente vom Ursprung an die Polare. Die schöne Verallgemeinerung: Bei Wind verschiebst du den Ursprung entlang der Geschwindigkeitsachse um die Windstärke — bei Gegenwind zur Kurve hin, bei Rückenwind von ihr weg — und legst von dort die Tangente an. Der neue Berührpunkt ist deine Sollfahrt.",
            "Gegenwind rückt den Ursprung näher an die Kurve, die Tangente berührt weiter rechts: schneller fliegen. Rückenwind rückt ihn weg, die Tangente berührt weiter links: langsamer fliegen. Das Bild erledigt die Rechnung für dich — und diese App zeichnet es live, während du am Windregler ziehst.",
            "Sinkende oder steigende Luft verschiebt den Ursprung stattdessen vertikal — nach unten bei Steigen, nach oben bei Sinken. Sinkende Luft schiebt den Berührpunkt nach rechts: wieder Gas geben. Beide Verschiebungen lassen sich kombinieren, sodass jede Wind-plus-Luftmasse-Lage auf eine einzige Tangente hinausläuft.",
          ],
        },
        {
          heading: "Sinken ist Gegenwind von oben",
          paragraphs: [
            "Wer durch Luft fliegt, die mit 2 m/s fällt, verdreifacht grob das Sinken seines Gleitschirms. Trödelst du mit der Geschwindigkeit des geringsten Sinkens hindurch, maximierst du ausgerechnet die Zeit, in der du Höhe verlierst. Der richtige Reflex fühlt sich anfangs falsch an: Beschleuniger treten und raus da.",
            "Rechne nach, und es hört auf, seltsam zu sein. Ein 2 km breites Saufband mit 30 km/h zu queren dauert vier Minuten; mit 50 km/h keine zweieinhalb. Das Mehrsinken am Gas ist klein gegen die 2 m/s, die dir die Luftmasse so oder so nimmt — die kürzere Aufenthaltszeit gewinnt.",
            "Im Steigen kehrt sich dieselbe Rechnung um: langsamer werden, länger in der steigenden Luft bleiben — und wenn sie stark genug ist, das Gleiten abbrechen und eindrehen. Wo genau die Grenze zwischen »langsamer« und »eindrehen« verläuft, formalisiert der MacCready-Wert.",
          ],
        },
        {
          heading: "Faustregeln für echte Luft",
          paragraphs: [
            "Gas geben bei Gegenwind und im Sinken; langsamer werden bei Rückenwind und im Steigen. Dieser eine Satz deckt die meisten Entscheidungen ab. Gegen kräftigen Wind ist halb bis voll beschleunigt meist richtig; mit dem Wind Trimm oder ein Hauch Bremse Richtung geringstes Sinken.",
            "Beachte die Gleitschirm-Besonderheit: Unsere Polaren werden am Beschleuniger schnell steil, die letzten Zentimeter Gas kaufen wenig Fahrt für viel Sinken. Bei leichtem Gegenwind ist Trimm oder ein Viertel Gas oft fast optimal — spar dir das volle Gas für starken Wind und starkes Saufen.",
            "Jage dem theoretischen Optimum nicht km/h für km/h hinterher. Nahe am Optimum ist die Polare flach: 5 km/h daneben kosten fast nichts, während die falsche Seite von Trimm bei 30 km/h Gegenwind alles kostet. Triff die Richtung der Korrektur sicher und ihre Größe ungefähr.",
          ],
        },
      ],
      takeaway:
        "Beurteile dein Gleiten über Grund, nicht durch die Luft: schneller bei Gegenwind und Sinken, langsamer bei Rückenwind und Steigen — die verschobene Tangente zeigt dir, wie viel.",
      widgetState: {
        gliderId: "en-b-plus",
        pilotSlider: 80,
        windKmh: 15,
        liftMs: -1,
        maccreadyMs: 0,
        wingLoad: 1.0,
      },
    },
    {
      slug: "maccready",
      title: "MacCready für Gleitschirmflieger",
      metaDescription:
        "Was der MacCready-Wert beim Gleitschirmfliegen bedeutet: Wie das erwartete Steigen im nächsten Bart deine Sollfahrt bestimmt — mit ehrlichen Einschränkungen.",
      readingMinutes: 6,
      intro: [
        "Die Sollfahrt beantwortet die Frage: »Was verlangt die Luft, in der ich gerade fliege?« Die MacCready-Theorie fügt eine zweite, vorausschauende Frage hinzu: »Wie stark wird mein nächstes Steigen?« Zusammen sagen sie dir, wie schnell du auf Strecke zwischen den Bärten gleiten solltest.",
        "Paul MacCreadys Idee, aus dem Segelflug-Wettbewerb entliehen: Höhe hat einen Preis, und den setzt dein nächster Bart fest. Sind die Bärte stark, ist Höhe billig zu ersetzen — du kannst sie also für Geschwindigkeit verheizen. Sind sie schwach, ist Höhe kostbar — gleite sparsam.",
      ],
      sections: [
        {
          heading: "Was der MacCready-Wert wirklich bedeutet",
          paragraphs: [
            "Der MacCready-Wert — »MC-Wert« oder Ringeinstellung — ist eine einzige Zahl: das mittlere Steigen in m/s, das du im nächsten Bart erwartest, für den du anhalten wirst. Stellst du MC 2 ein, behauptest du: Mein nächstes Steigen bringt im Schnitt 2 m/s, vom Einflug bis zum Verlassen — das mühsame Zentrieren unten eingerechnet.",
            "Mathematisch entsteht die optimale Gleitgeschwindigkeit aus derselben Tangentenkonstruktion wie die Sollfahrt: Verschiebe den Ursprung um den MC-Wert nach oben — als würdest du durch Luft gleiten, die mit dieser Rate steigt und in der du dich weigerst einzudrehen. Ein höherer MC-Wert schiebt den Berührpunkt nach rechts: schneller gleiten.",
            "Stellst du MC auf null, liefert die Theorie schlicht das beste Gleiten zurück: Strecke maximieren, Zeit ignorieren. Das ist deine Einstellung, wenn das Ankommen selbst auf der Kippe steht — beim Kratzen Richtung Landewiese oder auf Endanflug über landbarem Niemandsland.",
          ],
        },
        {
          heading: "Warum erwartetes Steigen schneller macht",
          paragraphs: [
            "Denk in Zeit-Buchhaltung. Schneller gleiten heißt tiefer am nächsten Bart ankommen — du hast auf der Gleitstrecke Höhe gegen Zeit getauscht. Die geopferte Höhe musst du zurückkurbeln, und was das kostet, hängt allein davon ab, wie stark der Bart ist.",
            "Steigt der nächste Bart im Schnitt mit 3 m/s, kosten 100 Meter Höhe 33 Sekunden — billig, also renn. Steigt er mit 0,5 m/s, kosten dieselben 100 Meter über drei Minuten — teuer, also gleite nahe am besten Gleiten und horte deine Höhe. Wer MC richtig fliegt, minimiert die Gesamtzeit: Gleiten plus Kurbeln.",
            "Deshalb fliegt man dieselbe Talquerung um 14 Uhr unter einem knallenden Himmel anders als um 18 Uhr in sterbender Thermik. An der Luft zwischen den Bärten hat sich nichts geändert — nur am Preis der Höhe, die du am anderen Ende zurückkaufen musst.",
          ],
        },
        {
          heading: "Ehrliche Einschränkungen fürs Gleitschirmfliegen",
          paragraphs: [
            "Die MacCready-Theorie wurde für Segelflugzeuge mit Gleitzahl 40 und mehr und für starkes, verlässliches Steigen entwickelt. Gleitschirme steigen an guten Tagen mit 1–2 m/s, und unser Gleiten leidet spürbar am Beschleuniger — die Polare wird steil, wo die eines Segelflugzeugs flach bleibt. Die optimalen MC-Geschwindigkeiten liegen darum näher an Trimm, als die Segelflug-Herkunft der Theorie vermuten lässt.",
            "Die Theorie unterstellt außerdem, dass du den nächsten Bart auch findest. Mit dem Gleitschirm kann 200 Meter tiefer ankommen heißen: unter dem Arbeitsband ankommen und absaufen — ein asymmetrisches Risiko, das keine Tangente abbildet. Viele erfahrene Piloten fliegen bewusst einen »entschärften« MacCready: Stell etwa die Hälfte des Steigens ein, das du ehrlich erwartest.",
            "In der Praxis: Flieg näher an MC an starken Tagen mit hoher Basis, auf Endanflug und im Lee eines verlässlichen Hausbarts. Flieg konservativ — MC nahe null — wenn du tief bist, die Bedingungen schwach sind oder das Gelände unfreundlich ist. MacCready ist eine Obergrenze für Aggressivität, keine Untergrenze.",
          ],
        },
      ],
      takeaway:
        "MacCready bepreist deine Höhe mit deinem nächsten Steigen: Starke erwartete Bärte rechtfertigen schnelles Gleiten, schwache nicht — und ehrlich heißt beim Gleitschirm konservativ.",
      widgetState: {
        gliderId: "en-c",
        pilotSlider: 90,
        windKmh: 0,
        liftMs: 0,
        maccreadyMs: 2,
        wingLoad: 1.05,
      },
    },
  ],

  fr: [
    {
      slug: "polar-curve",
      title: "Lire la polaire",
      metaDescription:
        "Apprenez à lire la polaire d’un parapente : les axes, le taux de chute mini, la finesse max et bras hauts, et l’effet de la charge alaire sur la courbe.",
      readingMinutes: 5,
      intro: [
        "Chaque parapente a une empreinte de performance : à chaque vitesse que vous pouvez tenir correspond un taux de chute précis. Reportez ces couples sur un graphique et vous obtenez la polaire — l’image la plus utile de ce que votre aile sait faire, et de ce qu’elle ne sait pas faire.",
        "Pas besoin de mathématiques pour s’en servir. Dès que vous savez situer trois points sur la courbe — taux de chute mini, finesse max et vitesse bras hauts — vous répondez aux questions du quotidien : à quelle vitesse enrouler, jusqu’où planer, et ce que l’accélérateur coûte vraiment.",
      ],
      sections: [
        {
          heading: "Les axes et leurs conventions",
          paragraphs: [
            "L’axe horizontal porte la vitesse air, en km/h — votre vitesse par rapport à la masse d’air, pas par rapport au sol. L’axe vertical porte la vitesse verticale en m/s, et comme un planeur sans moteur descend toujours dans la masse d’air, la courbe vit sous le zéro. Par convention, la chute se dessine vers le bas : plus le point est bas, plus ça descend vite.",
            "Chaque point de la courbe est un état de vol stabilisé : choisissez une vitesse air, la polaire vous donne le taux de chute qui va avec. La courbe ne couvre que ce que vous pouvez réellement voler — du vol très freiné près de la vitesse mini à gauche, en passant par bras hauts, jusqu’à l’accélérateur à fond à droite.",
            "Observez la forme : pas une droite, mais un arc creusé. Très lentement, la chute augmente parce que l’aile frôle le décrochage ; très vite, elle augmente brutalement parce que la traînée croît avec le carré de la vitesse. Les vitesses utiles logent dans le creux peu profond entre ces deux extrêmes.",
          ],
        },
        {
          heading: "Trois vitesses à retenir",
          paragraphs: [
            "Le taux de chute mini est le point le plus haut de la courbe — la vitesse à laquelle vous perdez le moins de hauteur par seconde, généralement avec un filet de frein, quelques km/h au-dessus du décrochage. C’est votre vitesse pour rester en l’air : enrouler un thermique faible ou gratter en soaring. Elle achète du temps, pas de la distance.",
            "La finesse max se trouve là où une droite issue de l’origine du graphique vient juste effleurer la courbe. À ce point de tangence, le rapport entre vitesse horizontale et taux de chute — la finesse — est maximal : en air calme, c’est la vitesse qui vous emmène le plus loin par mètre de hauteur. Sur la plupart des parapentes, elle se situe à la vitesse bras hauts ou juste en dessous.",
            "La vitesse bras hauts est tout simplement celle de l’aile freins relâchés, sans accélérateur. C’est votre repère : tout ce qui est à gauche demande du frein, tout ce qui est à droite demande du barreau. Savoir où se situe bras hauts par rapport à la finesse max vous dit si voler relâché est déjà proche de l’optimum en air calme — sur beaucoup d’ailes, c’est le cas.",
          ],
        },
        {
          heading: "Ce que la charge alaire fait à la courbe",
          paragraphs: [
            "Volez la même aile plus chargée — en haut de la fourchette de poids, ou avec du ballast — et toute la polaire glisse vers la droite et vers le bas. Toutes les vitesses caractéristiques augmentent : décrochage, taux de chute mini, finesse max et bras hauts montent, et les taux de chute grimpent avec elles.",
            "Le détail élégant : la finesse max ne change presque pas. La tangente issue de l’origine touche la nouvelle courbe plus loin, mais sous quasiment le même angle. Chargé lourd, vous planez aussi loin — simplement plus vite, en payant un taux de chute plus élevé dans les ascendances faibles.",
            "C’est pourquoi les pilotes de cross chargent leur aile les jours forts : plus de vitesse à finesse égale, et une voile plus tendue, plus résistante aux fermetures. Les jours faibles, le marché s’inverse — une charge légère descend moins dans les thermiques doux, et tenir en l’air vaut mieux qu’aller vite.",
          ],
        },
        {
          heading: "Ce que la polaire ne dit pas toute seule",
          paragraphs: [
            "La polaire décrit votre mouvement par rapport à la masse d’air, et rien d’autre. Dès que la masse d’air bouge elle-même — vent de face qui vous retient, descendance qui vous aspire — la vitesse optimale par rapport au sol n’est plus la finesse max en air calme. Cette correction, c’est le sujet de la vitesse de consigne.",
            "Gardez aussi un scepticisme sain sur les chiffres. Les polaires publiées se mesurent dans l’air calme du matin avec un pilote d’essai ; votre aile, la traînée de votre sellette et votre poids total volant décalent la courbe. Prenez la polaire de cette appli comme un archétype pour apprendre les formes et les compromis, pas comme un certificat de performance.",
          ],
        },
      ],
      takeaway:
        "La polaire donne à chaque vitesse son prix en taux de chute. Sachez y situer le taux de chute mini, la finesse max et bras hauts, et vous comprenez votre aile.",
      widgetState: {
        gliderId: "en-b-low",
        pilotSlider: 50,
        windKmh: 0,
        liftMs: 0,
        maccreadyMs: 0,
        wingLoad: 1.0,
      },
    },
    {
      slug: "speed-to-fly",
      title: "Vitesse de consigne : le vent et la descendance changent tout",
      metaDescription:
        "Pourquoi la vitesse de finesse max change avec le vent et les descendances : la tangente à origine décalée, plus des règles pratiques pour le parapente.",
      readingMinutes: 6,
      intro: [
        "La vitesse de finesse max répond à une question d’air calme. Dès qu’il y a du vent, ou que l’air autour de vous monte ou descend, la vitesse qui vous emmène le plus loin par rapport au sol change — parfois beaucoup. La vitesse de consigne, c’est l’art de choisir la bonne vitesse air pour l’air dans lequel vous volez vraiment.",
        "L’idée centrale tient en une phrase : votre plané par rapport au sol dépend de la vitesse sol et de la chute totale, pas de la seule vitesse air. Tout ce qui suit n’est que cette phrase, dépliée en une image qui se lit directement sur la polaire.",
      ],
      sections: [
        {
          heading: "Pourquoi le vent déplace votre vitesse optimale",
          paragraphs: [
            "Planez face à un vent de 20 km/h à votre vitesse de finesse max de 36 km/h : il ne reste que 16 km/h par rapport au sol — alors que vous descendez exactement aussi vite qu’avant. Votre finesse sol s’effondre. Chaque seconde passée dans ce vent de face coûte du terrain que vous ne couvrez pas.",
            "Poussez l’accélérateur et votre taux de chute augmente — mais votre temps d’exposition au vent de face diminue plus vite que le surcroît de chute ne coûte. Jusqu’à un certain point, voler plus vite face au vent vous emmène plus loin, pas seulement plus tôt. Au-delà, la polaire qui plonge reprend plus que l’argument du vent ne donne.",
            "Vent arrière, la logique s’inverse : le vent travaille gratuitement pour vous, donc vous voulez rester dedans plus longtemps. Ralentir vers le taux de chute mini étire votre temps dans l’air qui pousse et aplatit votre plané par rapport au sol.",
          ],
        },
        {
          heading: "Le truc de l’origine décalée",
          paragraphs: [
            "Rappel : la finesse max en air calme, c’est la tangente menée de l’origine à la polaire. La généralisation est belle : avec du vent, décalez l’origine le long de l’axe des vitesses de la valeur du vent — vers la courbe pour un vent de face, à l’opposé pour un vent arrière — et tracez la tangente depuis ce nouveau point. Le point de tangence est votre vitesse de consigne.",
            "Un vent de face rapproche l’origine de la courbe : la tangente touche plus à droite, volez plus vite. Un vent arrière l’éloigne : la tangente touche plus à gauche, volez plus lentement. Le dessin fait le calcul à votre place — et cette appli le trace en direct pendant que vous déplacez le curseur de vent.",
            "L’air qui monte ou descend décale l’origine verticalement — vers le bas pour une ascendance, vers le haut pour une descendance. Une descendance envoie le point de tangence vers la droite : encore accélérer. Les deux décalages se combinent : toute situation vent plus masse d’air se réduit à une seule tangente.",
          ],
        },
        {
          heading: "La descendance, un vent de face vertical",
          paragraphs: [
            "Traverser de l’air qui descend à 2 m/s triple en gros le taux de chute d’un parapente. Si vous vous y attardez à la vitesse de taux de chute mini, vous maximisez précisément le temps passé à perdre de la hauteur. Le bon réflexe surprend au début : barreau, et on sort de là.",
            "Faites le calcul et l’étrangeté disparaît. Traverser une zone de descendance de 2 km à 30 km/h prend quatre minutes ; à 50 km/h, moins de deux minutes et demie. Le surcroît de chute dû au barreau est petit devant les 2 m/s que la masse d’air vous prend de toute façon — raccourcir l’exposition gagne.",
            "En ascendance, le même raisonnement s’inverse : ralentissez, restez plus longtemps dans l’air qui monte, et si c’est assez fort, arrêtez de planer et enroulez. La frontière exacte entre « ralentir » et « s’arrêter pour monter », c’est précisément ce que le calage MacCready formalise.",
          ],
        },
        {
          heading: "Règles de base pour l’air réel",
          paragraphs: [
            "Accélérez face au vent et dans la descendance ; ralentissez vent arrière et dans l’ascendance. Cette phrase couvre l’essentiel des décisions. Face à un vent soutenu, entre demi-barreau et barreau à fond ; vent dans le dos, bras hauts ou un filet de frein vers le taux de chute mini.",
            "Respectez la particularité du parapente : nos polaires plongent vite au barreau, et les derniers centimètres d’accélérateur achètent peu de vitesse pour beaucoup de chute. Par vent de face léger, bras hauts ou un quart de barreau est souvent presque optimal — gardez le barreau à fond pour le vent fort et les fortes descendances.",
            "Ne traquez pas l’optimum théorique au km/h près. La polaire est plate autour de l’optimum : 5 km/h d’écart ne coûtent presque rien, alors que voler du mauvais côté de bras hauts face à 30 km/h de vent coûte tout. Ayez la bonne direction de correction, et à peu près la bonne ampleur.",
          ],
        },
      ],
      takeaway:
        "Jugez votre plané par rapport au sol, pas à l’air : accélérez face au vent et dans la descendance, ralentissez vent arrière et en ascendance — la tangente décalée dit exactement de combien.",
      widgetState: {
        gliderId: "en-b-plus",
        pilotSlider: 80,
        windKmh: 15,
        liftMs: -1,
        maccreadyMs: 0,
        wingLoad: 1.0,
      },
    },
    {
      slug: "maccready",
      title: "MacCready pour le parapentiste",
      metaDescription:
        "Ce que le calage MacCready signifie en parapente : comment la force du prochain thermique fixe votre vitesse de transition — avec des réserves honnêtes.",
      readingMinutes: 6,
      intro: [
        "La vitesse de consigne répond à la question : « qu’exige l’air dans lequel je vole en ce moment ? » La théorie de MacCready ajoute une seconde question, tournée vers l’avant : « quelle sera la force de ma prochaine ascendance ? » Ensemble, elles vous disent à quelle vitesse faire vos transitions entre thermiques en cross.",
        "L’idée de Paul MacCready, empruntée à la compétition en planeur : l’altitude a un prix, et ce prix est fixé par votre prochain thermique. Si les ascendances sont fortes, la hauteur se remplace à bon compte — vous pouvez donc la brûler pour de la vitesse. Si elles sont faibles, la hauteur est précieuse — planez avec économie.",
      ],
      sections: [
        {
          heading: "Ce que le calage MacCready veut vraiment dire",
          paragraphs: [
            "Le calage MacCready — « valeur MC » ou calage de l’anneau — tient en un seul nombre : le taux de montée moyen, en m/s, que vous attendez du prochain thermique où vous vous arrêterez. Caler MC 2, c’est affirmer : ma prochaine ascendance fera 2 m/s de moyenne, de l’entrée à la sortie — y compris le centrage laborieux du bas.",
            "Mathématiquement, la vitesse de transition optimale sort de la même construction par tangente que la vitesse de consigne : décalez l’origine vers le haut de la valeur MC, comme si vous traversiez un air montant à ce taux dans lequel vous refusez d’enrouler. Un MC plus élevé pousse le point de tangence vers la droite : transitez plus vite.",
            "Calez MC à zéro et la théorie vous rend la simple finesse max : maximiser la distance, ignorer le temps. C’est votre calage quand arriver tout court est en jeu — en grattant vers un champ posable ou en étirant une finale au-dessus d’une zone invachable.",
          ],
        },
        {
          heading: "Pourquoi une forte montée attendue fait voler plus vite",
          paragraphs: [
            "Pensez en comptabilité de temps. Transiter plus vite, c’est arriver plus bas au thermique suivant — vous avez troqué de la hauteur contre du temps pendant le plané. Cette hauteur sacrifiée devra être regagnée en spirale, et son coût dépend entièrement de la force du thermique.",
            "Si la prochaine ascendance fait 3 m/s de moyenne, 100 mètres de hauteur se rachètent en 33 secondes — c’est bon marché, foncez. Si elle fait 0,5 m/s, les mêmes 100 mètres coûtent plus de trois minutes — c’est cher, planez près de la finesse max et thésaurisez votre altitude. Bien voler le MC minimise le temps total : plané plus montée.",
            "Voilà pourquoi la même transition se vole différemment à 14 h sous un ciel qui claque et à 18 h dans une thermique mourante. Rien n’a changé dans l’air entre les thermiques — seulement le prix de l’altitude qu’il faudra racheter à l’autre bout.",
          ],
        },
        {
          heading: "Réserves honnêtes pour le parapente",
          paragraphs: [
            "La théorie de MacCready a été bâtie pour des planeurs de finesse 40 et plus, avec des ascendances fortes et fiables. Un parapente monte à 1–2 m/s les bons jours, et notre finesse se dégrade nettement au barreau — la polaire plonge là où celle d’un planeur reste plate. Les vitesses MC optimales sont donc plus proches de bras hauts que le pedigree planeur de la théorie ne le suggère.",
            "La théorie suppose aussi que vous trouverez ce prochain thermique. En parapente, arriver 200 mètres plus bas peut signifier arriver sous la couche qui marche — et aller à la vache. Un risque asymétrique qu’aucune tangente ne capture. Beaucoup de pilotes expérimentés volent délibérément un MacCready « dégradé » : calez environ la moitié de la montée que vous attendez honnêtement.",
            "En pratique : rapprochez-vous du MC les jours forts à plafond haut, en finale, et sous le vent d’un thermique de service fiable. Volez conservateur — MC proche de zéro — quand vous êtes bas, en conditions faibles ou au-dessus d’un terrain hostile. MacCready est un plafond d’agressivité, pas un plancher.",
          ],
        },
      ],
      takeaway:
        "MacCready fixe le prix de votre altitude par votre prochaine montée : des thermiques forts justifient des transitions rapides, des thermiques faibles non — et en parapente, honnête veut dire conservateur.",
      widgetState: {
        gliderId: "en-c",
        pilotSlider: 90,
        windKmh: 0,
        liftMs: 0,
        maccreadyMs: 2,
        wingLoad: 1.05,
      },
    },
  ],

  nl: [
    {
      slug: "polar-curve",
      title: "De polaire leren lezen",
      metaDescription:
        "Leer de polaire van een paraglider lezen: wat de assen tonen, minimale daling, beste glijgetal en trimsnelheid, en hoe vleugelbelasting de curve verschuift.",
      readingMinutes: 5,
      intro: [
        "Elk scherm heeft een prestatie-vingerafdruk: bij elke snelheid die je kunt vliegen hoort precies één daalsnelheid. Zet die paren in een grafiek en je krijgt de polaire — het nuttigste plaatje van wat jouw scherm wel en niet kan.",
        "Je hebt er geen wiskunde voor nodig. Zodra je drie punten op de curve kunt aanwijzen — minimale daling, beste glijgetal en trim — kun je de belangrijkste praktijkvragen beantwoorden: hoe langzaam kan ik draaien, hoe ver kom ik, en wat kost de speedbar me nu echt?",
      ],
      sections: [
        {
          heading: "De assen en hun afspraken",
          paragraphs: [
            "Op de horizontale as staat de luchtsnelheid, meestal in km/u — je snelheid ten opzichte van de lucht, niet ten opzichte van de grond. Op de verticale as staat de verticale snelheid in m/s, en omdat een scherm zonder motor altijd daalt ten opzichte van de luchtmassa, ligt de curve onder de nullijn. Dalen wordt naar beneden getekend: hoe lager het punt, hoe sneller je zakt.",
            "Elk punt op de curve is één stabiele vliegtoestand: kies een luchtsnelheid en de polaire vertelt je welke daalsnelheid erbij hoort. De curve beslaat alleen wat je echt kunt vliegen — van diep geremd vlak boven de minimumsnelheid links, via trim met de handen omhoog, tot volle speedbar rechts.",
            "Let op de vorm: geen rechte lijn, maar een boog. Vlieg je heel langzaam, dan neemt de daling toe omdat het scherm dicht bij de overtrek zit; vlieg je heel snel, dan neemt ze sterk toe omdat de weerstand met het kwadraat van de snelheid groeit. De bruikbare snelheden liggen in de ondiepe kom daartussen.",
          ],
        },
        {
          heading: "Drie snelheden om te onthouden",
          paragraphs: [
            "Minimale daling is het hoogste punt van de curve — de snelheid waarbij je per seconde het minste hoogte verliest, meestal met een vleugje rem, een paar km/u boven de overtrek. Dit is je snelheid om boven te blijven: draaien in zwakke thermiek of krabbelen in hellingstijgwind. Ze koopt tijd, geen afstand.",
            "Het beste glijgetal vind je waar een rechte lijn vanuit de oorsprong van de grafiek de curve nét raakt. In dat raakpunt is de verhouding tussen voorwaartse snelheid en daling — het glijgetal — maximaal: in stilstaande lucht kom je op deze snelheid het verst per meter hoogte. Bij de meeste schermen ligt ze op of net onder de trimsnelheid.",
            "De trimsnelheid is simpelweg de snelheid met losse remmen en zonder speedbar. Het is je referentiepunt: alles links ervan vraagt rem, alles rechts ervan vraagt bar. Als je weet waar trim ligt ten opzichte van het beste glijgetal, weet je ook of handen-omhoog al bijna optimaal glijdt — bij veel schermen is dat zo.",
          ],
        },
        {
          heading: "Wat vleugelbelasting met de curve doet",
          paragraphs: [
            "Vlieg je hetzelfde scherm zwaarder — bovenin de gewichtsrange, of met ballast — dan schuift de hele polaire naar rechts en omlaag. Alle karakteristieke snelheden nemen toe: overtrek, minimale daling, beste glijgetal en trim schuiven naar hogere waarden, en de daalsnelheden groeien mee.",
            "En dan het elegante deel: het beste glijgetal verandert nauwelijks. De raaklijn vanuit de oorsprong raakt de nieuwe curve verder naar rechts, maar onder vrijwel dezelfde hoek. Zwaar beladen glij je even ver — alleen sneller, en je betaalt met meer daling in zwak stijgen.",
            "Daarom laden XC-piloten hun scherm op sterke dagen zwaar: meer snelheid bij gelijk glijden, plus een strakker scherm dat minder snel inklapt. Op zwakke dagen keert de ruil om — licht beladen daal je minder in zachte thermiek, en boven blijven wint het van snel gaan.",
          ],
        },
        {
          heading: "Wat de polaire in haar eentje niet vertelt",
          paragraphs: [
            "De polaire beschrijft je beweging ten opzichte van de luchtmassa — en alleen die. Zodra de luchtmassa zelf beweegt — tegenwind die je afremt, dalende lucht die je omlaag trekt — is de beste snelheid over de grond niet meer het optimum voor stilstaande lucht. Die correctie is het onderwerp van de aanbevolen snelheid, oftewel speed to fly.",
            "Blijf ook gezond sceptisch over de getallen. Gepubliceerde polaires worden gemeten in rustige ochtendlucht met een testpiloot; jouw scherm, de weerstand van je harnas en je startgewicht verschuiven de curve. Zie de polaire in deze app als een archetype om vormen en afwegingen te leren — niet als een prestatiecertificaat.",
          ],
        },
      ],
      takeaway:
        "De polaire koppelt elke snelheid aan haar prijs in daling. Wie er minimale daling, beste glijgetal en trim op kan aanwijzen, begrijpt zijn scherm.",
      widgetState: {
        gliderId: "en-b-low",
        pilotSlider: 50,
        windKmh: 0,
        liftMs: 0,
        maccreadyMs: 0,
        wingLoad: 1.0,
      },
    },
    {
      slug: "speed-to-fly",
      title: "Speed to fly: wind en dalen veranderen alles",
      metaDescription:
        "Waarom de snelheid voor het beste glijgetal verschuift met tegenwind, rugwind en dalende lucht: de raaklijn met verschoven oorsprong, plus handige vuistregels.",
      readingMinutes: 6,
      intro: [
        "De snelheid van het beste glijgetal beantwoordt een vraag voor stilstaande lucht. Zodra er wind staat, of de lucht om je heen stijgt of daalt, verandert de snelheid die je het verst over de grond brengt — soms flink. Speed to fly is de kunst om de juiste luchtsnelheid te kiezen voor de lucht waarin je werkelijk vliegt.",
        "De kern past in één zin: je glijpad over de grond hangt af van grondsnelheid en totale daling, niet van luchtsnelheid alleen. Alles hieronder is die ene zin, uitgepakt tot een plaatje dat je zo van de polaire afleest.",
      ],
      sections: [
        {
          heading: "Waarom wind je beste snelheid verschuift",
          paragraphs: [
            "Glij met 36 km/u — je beste glijsnelheid — tegen 20 km/u tegenwind in, en over de grond blijft er maar 16 km/u over — terwijl je precies even hard daalt als eerst. Je glijgetal over de grond stort in. Elke seconde in die tegenwind kost afstand die je niet aflegt.",
            "Trap je de speedbar in, dan neemt je daling toe — maar je tijd in de tegenwind krimpt sneller dan de extra daling kost. Tot op zekere hoogte brengt sneller vliegen tegen de wind je vérder, niet alleen eerder ergens. Voorbij dat punt neemt de steiler wordende polaire meer terug dan het windargument oplevert.",
            "Met rugwind klapt de logica om: de wind doet gratis werk voor je, dus je wilt er juist langer in blijven. Vertragen richting minimale daling rekt je tijd in de duwende lucht op en maakt je glijpad over de grond vlakker.",
          ],
        },
        {
          heading: "De truc met de verschoven oorsprong",
          paragraphs: [
            "Ter herinnering: het beste glijgetal in stilstaande lucht is de raaklijn vanuit de oorsprong aan de polaire. De mooie veralgemening: bij wind schuif je de oorsprong langs de snelheidsas op met de windsterkte — richting de curve bij tegenwind, ervandaan bij rugwind — en trek je vanaf daar de raaklijn. Het nieuwe raakpunt is je aanbevolen snelheid.",
            "Tegenwind schuift de oorsprong dichter naar de curve, dus de raaklijn raakt verder naar rechts: sneller vliegen. Rugwind schuift hem er verder vandaan, dus de raaklijn raakt verder naar links: langzamer vliegen. Het plaatje doet het rekenwerk voor je — en deze app tekent het live terwijl je aan de windschuif trekt.",
            "Dalende of stijgende lucht verschuift de oorsprong juist verticaal — omlaag bij stijgen, omhoog bij dalen. Dalende lucht duwt het raakpunt naar rechts: opnieuw versnellen. De twee verschuivingen zijn te combineren, zodat elke situatie van wind plus luchtmassa terug te brengen is tot één raaklijn.",
          ],
        },
        {
          heading: "Dalende lucht is tegenwind van boven",
          paragraphs: [
            "Vlieg je door lucht die met 2 m/s zakt, dan verdrievoudigt je daalsnelheid ruwweg. Treuzel je erdoorheen op de snelheid van minimale daling, dan maximaliseer je uitgerekend de tijd waarin je hoogte verliest. De juiste reflex voelt eerst tegennatuurlijk: bar intrappen en wegwezen.",
            "Reken het na en het went snel. Een daalzone van 2 km breed oversteken met 30 km/u duurt vier minuten; met 50 km/u nog geen tweeënhalf. De extra daling door de bar is klein vergeleken met de 2 m/s die de luchtmassa je hoe dan ook afpakt — de blootstelling verkorten wint.",
            "In stijgende lucht draait dezelfde redenering om: vertraag, blijf langer in de stijgende lucht, en is die sterk genoeg, stop dan met glijden en draai erin op. Waar precies de grens ligt tussen 'vertragen' en 'stoppen en klimmen' — dat is exact wat de MacCready-instelling formaliseert.",
          ],
        },
        {
          heading: "Vuistregels voor echte lucht",
          paragraphs: [
            "Versnel bij tegenwind en in dalende lucht; vertraag bij rugwind en in stijgende lucht. Die ene regel dekt de meeste beslissingen. Tegen stevige wind is half tot vol bar meestal goed; met de wind mee trim of een vleugje rem richting minimale daling.",
            "Houd rekening met de eigenaardigheid van de paraglider: onze polaires worden op de bar snel steil, en de laatste centimeters speedbar kopen weinig snelheid voor veel daling. Bij lichte tegenwind is trim of een kwart bar vaak bijna optimaal — bewaar de volle bar voor harde wind en sterk dalen.",
            "Jaag het theoretische optimum niet per km/u na. Rond het optimum is de polaire vlak: er 5 km/u naast zitten kost bijna niets, terwijl aan de verkeerde kant van trim vliegen bij 30 km/u tegenwind alles kost. Zorg dat de richting van je correctie klopt en de grootte ongeveer.",
          ],
        },
      ],
      takeaway:
        "Beoordeel je glijpad over de grond, niet door de lucht: versnel bij tegenwind en dalen, vertraag bij rugwind en stijgen — de verschoven raaklijn laat precies zien hoeveel.",
      widgetState: {
        gliderId: "en-b-plus",
        pilotSlider: 80,
        windKmh: 15,
        liftMs: -1,
        maccreadyMs: 0,
        wingLoad: 1.0,
      },
    },
    {
      slug: "maccready",
      title: "MacCready voor paragliders",
      metaDescription:
        "Wat de MacCready-waarde betekent voor paragliders: hoe de sterkte van je volgende verwachte thermiekbel je glijsnelheid bepaalt, met eerlijke kanttekeningen.",
      readingMinutes: 6,
      intro: [
        "Speed to fly beantwoordt de vraag: 'wat vraagt de lucht waarin ik nú vlieg?' De MacCready-theorie voegt daar een tweede, vooruitkijkende vraag aan toe: 'hoe sterk wordt mijn volgende klim?' Samen vertellen ze je hoe snel je op een XC-vlucht tussen de thermiekbellen door moet glijden.",
        "Het idee van Paul MacCready, geleend uit de zweefvliegwedstrijden: hoogte heeft een prijs, en die prijs wordt bepaald door je volgende bel. Zijn de klimmen sterk, dan is hoogte goedkoop te vervangen — dus mag je haar verstoken voor snelheid. Zijn ze zwak, dan is hoogte kostbaar — glij zuinig.",
      ],
      sections: [
        {
          heading: "Wat de MacCready-waarde werkelijk betekent",
          paragraphs: [
            "De MacCready-instelling — 'MC-waarde' of ringinstelling — is één getal: de gemiddelde klimsnelheid, in m/s, die je verwacht in de eerstvolgende bel waarvoor je zult stoppen. Zet je MC 2, dan beweer je: mijn volgende klim levert gemiddeld 2 m/s op, van binnenvliegen tot verlaten — het gepruts met centreren onderin meegerekend.",
            "Wiskundig volgt de optimale glijsnelheid uit dezelfde raaklijnconstructie als speed to fly: schuif de oorsprong omhoog met de MC-waarde, alsof je door lucht glijdt die met dat tempo stijgt maar waarin je weigert op te draaien. Een hogere MC duwt het raakpunt naar rechts: sneller glijden.",
            "Zet je MC op nul, dan geeft de theorie gewoon het beste glijgetal terug: afstand maximaliseren, tijd negeren. Dat is je instelling wanneer überhaupt aankomen op het spel staat — krabbelend richting een landingsweide of een final glide oprekkend boven onlandbaar terrein.",
          ],
        },
        {
          heading: "Waarom een verwachte sterke klim je sneller laat vliegen",
          paragraphs: [
            "Denk in tijdboekhouding. Sneller glijden betekent lager aankomen bij de volgende bel — je hebt onderweg hoogte tegen tijd geruild. De opgeofferde hoogte moet je terugklimmen, en wat dat kost hangt volledig af van hoe sterk de bel is.",
            "Klimt de volgende bel gemiddeld 3 m/s, dan kost 100 meter hoogte 33 seconden om terug te verdienen — goedkoop, dus geef gas. Klimt hij 0,5 m/s, dan kosten diezelfde 100 meter ruim drie minuten — duur, dus glij dicht bij het beste glijgetal en pot je hoogte op. Wie MC goed vliegt, minimaliseert de totale tijd: glijden plus klimmen.",
            "Daarom vlieg je dezelfde oversteek om 14.00 uur onder een knallende lucht anders dan om 18.00 uur in stervende thermiek. Aan de lucht tussen de bellen is niets veranderd — alleen aan de prijs van de hoogte die je aan de overkant moet terugkopen.",
          ],
        },
        {
          heading: "Eerlijke kanttekeningen voor het schermvliegen",
          paragraphs: [
            "De MacCready-theorie is gebouwd voor zweefvliegtuigen met glijgetallen van 40 en meer, en voor sterk, betrouwbaar stijgen. Paragliders klimmen op een goede dag 1–2 m/s, en ons glijden lijdt merkbaar onder de bar — de polaire wordt steil waar die van een zwever vlak blijft. De optimale MC-snelheden liggen daardoor dichter bij trim dan de zweefvlieg-afkomst van de theorie doet vermoeden.",
            "De theorie gaat er bovendien van uit dat je die volgende bel ook vindt. Met een paraglider kan 200 meter lager aankomen betekenen: onder de werkbare laag aankomen en uitboeren — een asymmetrisch risico dat geen enkele raaklijn vangt. Veel ervaren piloten vliegen daarom bewust een 'afgezwakte' MacCready: stel ongeveer de helft in van de klim die je eerlijk verwacht.",
            "In de praktijk: vlieg dichter bij MC op sterke dagen met een hoge basis, op final glide, en benedenwinds van een betrouwbare huisbel. Vlieg conservatief — MC bijna nul — als je laag zit, de omstandigheden zwak zijn of het terrein onvriendelijk is. MacCready is een plafond voor agressie, geen vloer.",
          ],
        },
      ],
      takeaway:
        "MacCready prijst je hoogte naar je volgende klim: sterke verwachte bellen rechtvaardigen snel glijden, zwakke niet — en op een paraglider betekent eerlijk: conservatief.",
      widgetState: {
        gliderId: "en-c",
        pilotSlider: 90,
        windKmh: 0,
        liftMs: 0,
        maccreadyMs: 2,
        wingLoad: 1.05,
      },
    },
  ],
};
