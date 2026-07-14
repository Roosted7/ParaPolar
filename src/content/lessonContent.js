// Guided interactive lessons for ParaPolar.
// Same ids and order across all languages.

export const LESSONS = {
  en: [
    {
      id: "meet-the-polar",
      title: "Meet the polar",
      prompt:
        "Look at the curve: every point pairs an airspeed with the sink rate it costs. Move the pilot slider slowly from brakes to full bar and watch the dot ride along the curve.",
      explanation:
        "The dot always stays on the curve because you cannot choose speed and sink independently — the wing sets the trade. Slow flight sinks gently, fast flight sinks hard, and everything you will learn about gliding efficiently is written in this one arc.",
      setup: {
        gliderId: "en-a",
        pilotSlider: 50,
        windKmh: 0,
        liftMs: 0,
        maccreadyMs: 0,
      },
    },
    {
      id: "min-sink-vs-best-glide",
      title: "The two magic speeds",
      prompt:
        "Find the highest point of the curve, then compare it with where the tangent line from the origin touches. Move the slider between those two spots and watch sink rate and glide ratio trade places.",
      explanation:
        "Minimum sink loses the least height per second — your speed for circling in thermals. Best glide, slightly faster, loses the least height per metre travelled — your speed for going somewhere. They are different speeds for different jobs, and mixing them up costs either time or distance.",
      setup: {
        gliderId: "en-a",
        pilotSlider: 50,
        windKmh: 0,
        liftMs: 0,
        maccreadyMs: 0,
      },
    },
    {
      id: "headwind",
      title: "Push bar into wind",
      prompt:
        "You now face a 20 km/h headwind. Watch your groundspeed and ground glide ratio at trim, then push the slider toward full bar and see what happens to the glide over the ground.",
      explanation:
        "At trim the headwind eats most of your groundspeed, so your glide over the ground collapses. Speeding up sinks you faster through the air but shortens your time in the wind — and the ground glide improves. Into wind, the bar is your friend.",
      setup: {
        gliderId: "en-b-low",
        pilotSlider: 50,
        windKmh: 20,
        liftMs: 0,
        maccreadyMs: 0,
      },
    },
    {
      id: "tailwind",
      title: "Slow down downwind",
      prompt:
        "Now the wind pushes you from behind at 15 km/h. Try slowing from trim toward minimum sink and watch the ground glide ratio.",
      explanation:
        "With a tailwind, every extra second airborne is a second the wind carries you for free. Slowing toward minimum sink stretches that time and flattens your glide over the ground — the opposite reflex to the headwind case. Downwind, patience beats bar.",
      setup: {
        gliderId: "en-b-low",
        pilotSlider: 50,
        windKmh: -15,
        liftMs: 0,
        maccreadyMs: 0,
      },
    },
    {
      id: "sink",
      title: "Speed up through sink",
      prompt:
        "The whole airmass is sinking at 2 m/s. Compare your total sink rate at trim with full bar, and watch which one gives the better glide over the ground.",
      explanation:
        "The airmass takes 2 m/s from you no matter how fast you fly, so lingering only prolongs the loss. Pushing bar adds a little sink of your own but cuts your exposure time — and the tangent point on the shifted polar moves right. In sink, fly fast and get out.",
      setup: {
        gliderId: "en-b-plus",
        pilotSlider: 50,
        windKmh: 0,
        liftMs: -2,
        maccreadyMs: 0,
      },
    },
    {
      id: "backwind",
      title: "Going backwards",
      prompt:
        "Strong ridge lift, 25 km/h of wind, and you are flying with brakes applied. Check your groundspeed — then decide how you would escape forward.",
      explanation:
        "With brakes on, your airspeed barely exceeds the wind, so your groundspeed is close to zero — or negative, drifting you backwards over the ridge. This is how pilots get blown over the back. Hands up and full bar is the only way to buy forward speed, and if that is not enough, you should not be there.",
      setup: {
        gliderId: "en-a",
        pilotSlider: 30,
        windKmh: 25,
        liftMs: 3,
        maccreadyMs: 0,
      },
    },
  ],

  de: [
    {
      id: "meet-the-polar",
      title: "Die Polare kennenlernen",
      prompt:
        "Schau dir die Kurve an: Jeder Punkt verknüpft eine Fluggeschwindigkeit mit dem Sinken, das sie kostet. Schieb den Piloten-Regler langsam von den Bremsen bis zum vollen Beschleuniger und beobachte, wie der Punkt auf der Kurve entlangwandert.",
      explanation:
        "Der Punkt bleibt immer auf der Kurve, weil du Fahrt und Sinken nicht unabhängig wählen kannst — den Tauschkurs bestimmt der Schirm. Langsam fliegen heißt sanft sinken, schnell fliegen heißt kräftig sinken, und alles über effizientes Gleiten steht in diesem einen Bogen.",
      setup: {
        gliderId: "en-a",
        pilotSlider: 50,
        windKmh: 0,
        liftMs: 0,
        maccreadyMs: 0,
      },
    },
    {
      id: "min-sink-vs-best-glide",
      title: "Die zwei magischen Geschwindigkeiten",
      prompt:
        "Such den höchsten Punkt der Kurve und vergleich ihn mit dem Punkt, an dem die Tangente vom Ursprung die Kurve berührt. Fahr mit dem Regler zwischen beiden hin und her und beobachte, wie Sinkrate und Gleitzahl die Plätze tauschen.",
      explanation:
        "Beim geringsten Sinken verlierst du pro Sekunde am wenigsten Höhe — deine Geschwindigkeit zum Kurbeln in der Thermik. Beim besten Gleiten, etwas schneller, verlierst du pro zurückgelegtem Meter am wenigsten — deine Geschwindigkeit, um irgendwohin zu kommen. Zwei Geschwindigkeiten für zwei Aufgaben; wer sie verwechselt, bezahlt mit Zeit oder Strecke.",
      setup: {
        gliderId: "en-a",
        pilotSlider: 50,
        windKmh: 0,
        liftMs: 0,
        maccreadyMs: 0,
      },
    },
    {
      id: "headwind",
      title: "Gegen den Wind: Gas geben",
      prompt:
        "Du fliegst jetzt gegen 20 km/h Gegenwind. Schau dir Grundgeschwindigkeit und Gleitzahl über Grund bei Trimm an, dann schieb den Regler Richtung Vollgas und beobachte, was mit dem Gleiten über Grund passiert.",
      explanation:
        "Bei Trimm frisst der Gegenwind den Großteil deiner Grundgeschwindigkeit, dein Gleiten über Grund bricht ein. Schneller fliegen lässt dich zwar stärker sinken, verkürzt aber deine Zeit im Wind — und die Gleitzahl über Grund wird besser. Gegen den Wind ist der Beschleuniger dein Freund.",
      setup: {
        gliderId: "en-b-low",
        pilotSlider: 50,
        windKmh: 20,
        liftMs: 0,
        maccreadyMs: 0,
      },
    },
    {
      id: "tailwind",
      title: "Mit dem Wind: langsamer",
      prompt:
        "Jetzt schiebt dich der Wind mit 15 km/h von hinten. Werde von Trimm aus langsamer Richtung geringstes Sinken und beobachte die Gleitzahl über Grund.",
      explanation:
        "Mit Rückenwind ist jede zusätzliche Sekunde in der Luft eine Sekunde, in der dich der Wind gratis trägt. Langsamer werden Richtung geringstes Sinken streckt diese Zeit und macht dein Gleiten über Grund flacher — genau der umgekehrte Reflex zum Gegenwindfall. Mit dem Wind schlägt Geduld das Gas.",
      setup: {
        gliderId: "en-b-low",
        pilotSlider: 50,
        windKmh: -15,
        liftMs: 0,
        maccreadyMs: 0,
      },
    },
    {
      id: "sink",
      title: "Durchs Saufen: schneller",
      prompt:
        "Die ganze Luftmasse sinkt mit 2 m/s. Vergleiche dein Gesamtsinken bei Trimm und bei Vollgas und achte darauf, welche Einstellung das bessere Gleiten über Grund liefert.",
      explanation:
        "Die Luftmasse nimmt dir 2 m/s, egal wie schnell du fliegst — Trödeln verlängert nur den Verlust. Am Beschleuniger kommt etwas Eigensinken dazu, aber deine Aufenthaltszeit schrumpft, und der Tangentenpunkt an der verschobenen Polare wandert nach rechts. Im Saufen gilt: schnell fliegen und raus.",
      setup: {
        gliderId: "en-b-plus",
        pilotSlider: 50,
        windKmh: 0,
        liftMs: -2,
        maccreadyMs: 0,
      },
    },
    {
      id: "backwind",
      title: "Rückwärts über den Hang",
      prompt:
        "Starkes Hangsteigen, 25 km/h Wind, und du fliegst angebremst. Prüf deine Grundgeschwindigkeit — und überleg, wie du nach vorn entkommen würdest.",
      explanation:
        "Angebremst liegt deine Fahrt kaum über der Windstärke, also ist deine Grundgeschwindigkeit fast null — oder negativ, und du treibst rückwärts über die Hangkante. Genau so werden Piloten ins Lee gespült. Hände hoch und voller Beschleuniger ist der einzige Weg, Fahrt nach vorn zu kaufen — und reicht das nicht, hast du dort nichts verloren.",
      setup: {
        gliderId: "en-a",
        pilotSlider: 30,
        windKmh: 25,
        liftMs: 3,
        maccreadyMs: 0,
      },
    },
  ],

  fr: [
    {
      id: "meet-the-polar",
      title: "Découvrir la polaire",
      prompt:
        "Regardez la courbe : chaque point associe une vitesse air au taux de chute qu’elle coûte. Déplacez lentement le curseur pilote des freins jusqu’à l’accélérateur à fond et observez le point glisser le long de la courbe.",
      explanation:
        "Le point reste toujours sur la courbe parce qu’on ne choisit pas la vitesse et la chute indépendamment — c’est l’aile qui fixe l’échange. Voler lentement, c’est chuter doucement ; voler vite, c’est chuter fort. Tout ce que vous apprendrez sur le plané efficace est écrit dans cet arc.",
      setup: {
        gliderId: "en-a",
        pilotSlider: 50,
        windKmh: 0,
        liftMs: 0,
        maccreadyMs: 0,
      },
    },
    {
      id: "min-sink-vs-best-glide",
      title: "Les deux vitesses magiques",
      prompt:
        "Trouvez le point le plus haut de la courbe, puis comparez-le avec l’endroit où la tangente issue de l’origine la touche. Promenez le curseur entre ces deux points et regardez le taux de chute et la finesse échanger leurs rôles.",
      explanation:
        "Au taux de chute mini, vous perdez le moins de hauteur par seconde — votre vitesse pour enrouler les thermiques. À finesse max, un peu plus vite, vous perdez le moins de hauteur par mètre parcouru — votre vitesse pour aller quelque part. Deux vitesses, deux métiers : les confondre coûte du temps ou de la distance.",
      setup: {
        gliderId: "en-a",
        pilotSlider: 50,
        windKmh: 0,
        liftMs: 0,
        maccreadyMs: 0,
      },
    },
    {
      id: "headwind",
      title: "Face au vent : du barreau",
      prompt:
        "Vous affrontez maintenant un vent de face de 20 km/h. Notez votre vitesse sol et votre finesse sol bras hauts, puis poussez le curseur vers le barreau à fond et observez le plané par rapport au sol.",
      explanation:
        "Bras hauts, le vent de face mange l’essentiel de votre vitesse sol : votre finesse sol s’effondre. Accélérer vous fait chuter plus vite dans l’air, mais raccourcit votre temps dans le vent — et la finesse sol s’améliore. Face au vent, le barreau est votre ami.",
      setup: {
        gliderId: "en-b-low",
        pilotSlider: 50,
        windKmh: 20,
        liftMs: 0,
        maccreadyMs: 0,
      },
    },
    {
      id: "tailwind",
      title: "Vent arrière : ralentir",
      prompt:
        "Le vent vous pousse maintenant dans le dos à 15 km/h. Ralentissez depuis bras hauts vers le taux de chute mini et surveillez la finesse sol.",
      explanation:
        "Vent arrière, chaque seconde de vol supplémentaire est une seconde où le vent vous porte gratuitement. Ralentir vers le taux de chute mini étire ce temps et aplatit votre plané par rapport au sol — le réflexe inverse du cas vent de face. Sous le vent, la patience bat le barreau.",
      setup: {
        gliderId: "en-b-low",
        pilotSlider: 50,
        windKmh: -15,
        liftMs: 0,
        maccreadyMs: 0,
      },
    },
    {
      id: "sink",
      title: "Dans la descendance : accélérer",
      prompt:
        "Toute la masse d’air descend à 2 m/s. Comparez votre taux de chute total bras hauts et barreau à fond, et regardez lequel donne le meilleur plané par rapport au sol.",
      explanation:
        "La masse d’air vous prend 2 m/s quelle que soit votre vitesse : traîner ne fait que prolonger la perte. Le barreau ajoute un peu de chute propre mais réduit votre temps d’exposition — et le point de tangence sur la polaire décalée part vers la droite. Dans la descendance, volez vite et sortez-en.",
      setup: {
        gliderId: "en-b-plus",
        pilotSlider: 50,
        windKmh: 0,
        liftMs: -2,
        maccreadyMs: 0,
      },
    },
    {
      id: "backwind",
      title: "Reculer en vol",
      prompt:
        "Forte ascendance dynamique, 25 km/h de vent, et vous volez freiné. Vérifiez votre vitesse sol — puis réfléchissez à comment vous échapperiez vers l’avant.",
      explanation:
        "Freiné, votre vitesse air dépasse à peine celle du vent : votre vitesse sol est proche de zéro — voire négative, et vous dérivez en marche arrière au-dessus du relief. C’est exactement ainsi qu’on passe derrière la crête. Bras hauts et barreau à fond est le seul moyen de racheter de la vitesse vers l’avant — et si cela ne suffit pas, vous n’avez rien à faire là.",
      setup: {
        gliderId: "en-a",
        pilotSlider: 30,
        windKmh: 25,
        liftMs: 3,
        maccreadyMs: 0,
      },
    },
  ],

  nl: [
    {
      id: "meet-the-polar",
      title: "Maak kennis met de polaire",
      prompt:
        "Kijk naar de curve: elk punt koppelt een luchtsnelheid aan de daalsnelheid die ze kost. Schuif de pilotenschuif langzaam van de remmen tot volle speedbar en zie hoe de stip over de curve meebeweegt.",
      explanation:
        "De stip blijft altijd op de curve, omdat je snelheid en daling niet los van elkaar kunt kiezen — het scherm bepaalt de ruil. Langzaam vliegen is zacht dalen, snel vliegen is hard dalen, en alles wat je over efficiënt glijden gaat leren staat in deze ene boog.",
      setup: {
        gliderId: "en-a",
        pilotSlider: 50,
        windKmh: 0,
        liftMs: 0,
        maccreadyMs: 0,
      },
    },
    {
      id: "min-sink-vs-best-glide",
      title: "De twee magische snelheden",
      prompt:
        "Zoek het hoogste punt van de curve en vergelijk het met de plek waar de raaklijn vanuit de oorsprong de curve raakt. Beweeg de schuif tussen die twee punten en zie hoe daalsnelheid en glijgetal stuivertje wisselen.",
      explanation:
        "Bij minimale daling verlies je per seconde het minste hoogte — je snelheid om in thermiek te draaien. Bij het beste glijgetal, iets sneller, verlies je per afgelegde meter het minste — je snelheid om ergens te komen. Twee snelheden voor twee klussen; wie ze verwisselt, betaalt met tijd of afstand.",
      setup: {
        gliderId: "en-a",
        pilotSlider: 50,
        windKmh: 0,
        liftMs: 0,
        maccreadyMs: 0,
      },
    },
    {
      id: "headwind",
      title: "Tegen de wind: bar erin",
      prompt:
        "Je vliegt nu tegen 20 km/u tegenwind in. Bekijk je grondsnelheid en glijgetal over de grond op trim, duw dan de schuif richting volle bar en zie wat er met je glijpad over de grond gebeurt.",
      explanation:
        "Op trim vreet de tegenwind het grootste deel van je grondsnelheid op, dus je glijgetal over de grond stort in. Sneller vliegen laat je harder dalen door de lucht, maar verkort je tijd in de wind — en het glijgetal over de grond verbetert. Tegen de wind is de speedbar je vriend.",
      setup: {
        gliderId: "en-b-low",
        pilotSlider: 50,
        windKmh: 20,
        liftMs: 0,
        maccreadyMs: 0,
      },
    },
    {
      id: "tailwind",
      title: "Met de wind mee: vertragen",
      prompt:
        "Nu duwt de wind je met 15 km/u in de rug. Vertraag vanaf trim richting minimale daling en houd het glijgetal over de grond in de gaten.",
      explanation:
        "Met rugwind is elke extra seconde in de lucht een seconde waarin de wind je gratis draagt. Vertragen richting minimale daling rekt die tijd op en maakt je glijpad over de grond vlakker — precies de omgekeerde reflex van het tegenwindgeval. Met de wind mee wint geduld het van de bar.",
      setup: {
        gliderId: "en-b-low",
        pilotSlider: 50,
        windKmh: -15,
        liftMs: 0,
        maccreadyMs: 0,
      },
    },
    {
      id: "sink",
      title: "Door dalende lucht: gas erop",
      prompt:
        "De hele luchtmassa zakt met 2 m/s. Vergelijk je totale daalsnelheid op trim en op volle bar, en let op welke instelling het beste glijpad over de grond geeft.",
      explanation:
        "De luchtmassa pakt je 2 m/s af, hoe snel je ook vliegt — treuzelen rekt alleen het verlies op. De bar voegt wat eigen daling toe, maar verkort je blootstellingstijd, en het raakpunt op de verschoven polaire schuift naar rechts. In dalende lucht: snel vliegen en wegwezen.",
      setup: {
        gliderId: "en-b-plus",
        pilotSlider: 50,
        windKmh: 0,
        liftMs: -2,
        maccreadyMs: 0,
      },
    },
    {
      id: "backwind",
      title: "Achteruit vliegen",
      prompt:
        "Sterke hellingstijgwind, 25 km/u wind, en je vliegt met aangetrokken remmen. Check je grondsnelheid — en bedenk hoe je naar voren zou ontsnappen.",
      explanation:
        "Met rem erop ligt je luchtsnelheid amper boven de windsterkte, dus je grondsnelheid is bijna nul — of negatief, en dan drijf je achteruit over de hellingrand. Zo waaien piloten over de rug van de berg. Handen omhoog en volle bar is de enige manier om voorwaartse snelheid terug te kopen — en is dat niet genoeg, dan hoor je daar niet te vliegen.",
      setup: {
        gliderId: "en-a",
        pilotSlider: 30,
        windKmh: 25,
        liftMs: 3,
        maccreadyMs: 0,
      },
    },
  ],
};
