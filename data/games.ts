const mauMauRules = `
Ziel:
Werde als Erster alle deine Karten los.

Setup:
- 2–6 Spieler
- 32- oder 52-Karten-Deck
- Jeder Spieler erhält 5 Karten
- Eine Karte wird offen in die Mitte gelegt, der Rest ist der Nachziehstapel

Ablauf:
- Der Startspieler beginnt, dann im Uhrzeigersinn
- Du darfst eine Karte ablegen, wenn sie die gleiche Farbe oder den gleichen Wert wie die oberste Karte hat
- Kannst du nicht legen, ziehst du eine Karte
- Kannst du danach legen, darfst du es tun, sonst ist der nächste Spieler dran

Sonderkarten:
- 7: Nächster Spieler zieht 2 Karten (kann mit einer 7 kontern)
- 8: Nächster Spieler wird übersprungen
- Bube: Wunschfarbe bestimmen
- Ass (optional): Richtungswechsel

Mau rufen:
- Hat ein Spieler nur noch eine Karte, muss er „Mau“ sagen
- Vergisst er es und wird erwischt, zieht er 2 Strafkarten

Spielende:
- Wer keine Karten mehr hat, gewinnt
- Das Spiel kann über mehrere Runden gespielt werden
`.trim();

const schwarzerPeterRules = `
Ziel:
Vermeide es, am Spielende den Schwarzen Peter zu halten.

Setup:
- 2–6 Spieler
- 32- oder 52-Karten-Deck
- Eine einzelne schwarze Karte (z. B. Pik Bube) wird als Schwarzer Peter festgelegt
- Karten werden gleichmäßig verteilt

Ablauf:
- Spieler bilden Paare gleichen Wertes und legen sie offen ab
- Reihum zieht jeder eine Karte vom linken Nachbarn
- Kann ein neues Paar gebildet werden, wird es sofort abgelegt

Schwarzer Peter:
- Die festgelegte schwarze Karte kann nicht gepaart werden
- Wer sie am Ende besitzt, verliert

Spielende:
- Wenn alle Paare abgelegt sind
- Der Spieler mit dem Schwarzen Peter verliert
`.trim();

const schwimmenRules = `
Ziel:
Erreiche möglichst nahe 31 Punkte in einer Farbe.

Setup:
- 2–6 Spieler
- 32-Karten-Deck
- Jeder Spieler erhält 3 Karten
- 3 Karten offen in der Mitte zum Tauschen

Wertung:
- Ass = 11
- Bildkarten = 10
- Zahlenkarten = Wert entsprechend der Zahl
- Nur Karten einer Farbe zählen zusammen

Ablauf:
- Spieler sind reihum am Zug
- Du kannst:
  - eine Karte tauschen
  - alle drei Karten tauschen
  - passen
- Wer sich sicher fühlt, kann „Klopfen“: Alle haben noch einen Zug

Spielende:
- Nach dem Klopfen endet die Runde
- Wer die wenigsten Punkte hat, verliert ein Leben
- Ein Spieler mit 31 gewinnt sofort die Runde
`.trim();

const quartettRules = `
Ziel:
Sammle möglichst viele vollständige Quartette (vier gleiche Werte).

Setup:
- 3–6 Spieler
- 32- oder 52-Karten-Deck
- Karten werden vollständig verteilt

Ablauf:
- Wer am Zug ist, fragt einen Mitspieler nach einer bestimmten Karte
- Voraussetzung: Man muss mindestens eine Karte dieses Wertes besitzen
- Bekommt man die Karte, darf man weiterfragen
- Andernfalls ist der nächste Spieler an der Reihe

Quartett:
- Hat ein Spieler vier gleiche Werte, legt er sie offen ab

Spielende:
- Wenn keine Karten mehr auf der Hand sind
- Es gewinnt, wer die meisten Quartette gesammelt hat
`.trim();

const praesidentRules = `
Ziel:
Werde als Erster alle deine Karten los und werde Präsident.

Setup:
- 3–8 Spieler
- 52-Karten-Deck
- Alle Karten werden gleichmäßig verteilt

Ablauf:
- Gespielt werden Karten mit gleichem oder höherem Wert
- Es dürfen auch mehrere gleiche Karten gleichzeitig gelegt werden
- Wer nicht legen kann oder will, passt

Rangfolge nach einer Runde:
- 1. Präsident
- 2. Vizepräsident
- mittlere Plätze neutral
- Vorletzter: Vize-Bettler
- Letzter: Bettler

Sonderregel zu Beginn:
- Bettler muss seine besten Karten an den Präsidenten abgeben
- Präsident gibt gleich viele seiner schlechtesten Karten zurück

Spielende:
- Neue Runde mit den vergebenen Titeln
- Punkte oder Rundenanzahl nach Vereinbarung
`.trim();

const siebenUndHalbRules = `
Ziel:
Komme so nah wie möglich an den Wert 7,5 ohne ihn zu überschreiten.

Setup:
- 2–8 Spieler
- 32-Karten-Deck
- Zahlenkarten zählen ihren Wert
- Bildkarten zählen 0,5

Ablauf:
- Reihum zieht jeder Spieler Karten
- Man kann jederzeit stoppen
- Wer über 7,5 kommt, ist sofort raus

Bank:
- Einer spielt die Bank
- Bank vergleicht am Ende ihren Wert mit den Spielern

Spielende:
- Gewinner ist, wer am nächsten an 7,5 liegt
`.trim();

const schnapsenRules = `
Ziel:
Erreiche 66 Punkte durch Stiche und Hochzeiten.

Setup:
- 2 Spieler
- 20-Karten-Deck (Ass–Zehn)
- Jeder erhält 5 Karten
- Trumpf wird bestimmt

Ablauf:
- Stichzwang erst nach Aufbrauchen des Talons
- Ass = 11, Zehn = 10, König = 4, Dame = 3, Bube = 2
- Trumpf sticht

Hochzeiten:
- König + Dame gleicher Farbe melden
- 20 Punkte, in Trumpf 40 Punkte

Spielende:
- Bei 66 Punkten oder bei „Ausspielen“
`.trim();

const durakRules = `
Ziel:
Vermeide es, als letzter Karten auf der Hand zu haben – werde nicht zum Durak.

Setup:
- 2–6 Spieler
- 36-Karten-Deck
- Jeder erhält 6 Karten
- Unterste Karte bestimmt Trumpffarbe

Ablauf:
- Ein Spieler greift mit einer oder mehreren Karten eines Wertes an
- Verteidiger muss jede Karte schlagen
- Schlagen mit höherem Wert der gleichen Farbe oder Trumpf

Nachziehen:
- Nach jedem Angriff werden Karten nachgezogen
- Reihenfolge: Angreifer zuerst

Spielende:
- Wenn ein Spieler keine Karten mehr hat, scheidet er aus
- Wer zuletzt Karten hat, ist Durak
`.trim();

const liarGameRules = `
Ziel:
Werde alle deine Karten los, indem du bluffst.

Setup:
- 3–8 Spieler
- 52-Karten-Deck
- Alle Karten werden gleichmäßig verteilt

Ablauf:
- Spieler legen verdeckt Karten in die Mitte
- Sie nennen einen Wert (z. B. „zwei Damen“)
- Nächster Spieler kann glauben oder „Lügner!“ rufen

Aufdecken:
- Wenn es stimmte, muss der Zweifler den Stapel nehmen
- Wenn es Lüge war, nimmt der Lügner den Stapel

Spielende:
- Wer keine Karten mehr hat, gewinnt
`.trim();

const rommeRules = `
Ziel:
Alle Karten in Sätzen (drei oder vier gleiche Werte) oder Folgen (gleiche Farbe, aufsteigend) auslegen.

Setup:
- 2–6 Spieler
- 2x 52 Karten + 6 Joker (110 Karten)
- Jeder erhält 13 Karten (Startspieler 14)

Ablauf:
- Startspieler legt eine Karte ab
- Nächster Spieler zieht eine Karte (vom Stapel oder Ablagestapel)
- Erstmeldung muss mind. 40 Punkte wert sein
- Karten können an eigene oder fremde Meldungen angelegt werden
- Joker ersetzen jede beliebige Karte

Spielende:
- Wer alle Karten ausgelegt und die letzte auf den Ablagestapel gelegt hat
- Punkte der Gegner werden als Minuspunkte notiert
`.trim();

const pokerRules = `
Ziel:
Das beste Blatt aus 5 Karten bilden oder alle anderen zum Aufgeben (Folden) bringen.

Setup:
- 2–10 Spieler
- 52-Karten-Deck
- Chips für Einsätze

Ablauf (Texas Hold'em):
- Jeder erhält 2 verdeckte Karten (Hole Cards)
- 1. Setzrunde
- Flop: 3 Gemeinschaftskarten offen
- 2. Setzrunde
- Turn: 4. Gemeinschaftskarte
- 3. Setzrunde
- River: 5. Gemeinschaftskarte
- Letzte Setzrunde

Showdown:
- Wer noch im Spiel ist, zeigt die Karten
- Bestes Blatt aus eigenen und Gemeinschaftskarten gewinnt den Pot
`.trim();

const blackjackRules = `
Ziel:
Mehr Punkte als der Dealer haben, ohne 21 zu überschreiten.

Setup:
- 1–7 Spieler gegen den Dealer
- 52-Karten-Deck (meist mehrere Decks)
- Alle Bildkarten = 10, Ass = 1 oder 11

Ablauf:
- Spieler und Dealer erhalten 2 Karten (Dealer meist eine verdeckt)
- Spieler entscheidet: Karte ziehen (Hit) oder stehenbleiben (Stand)
- Wer über 21 kommt (Bust), verliert sofort

Dealer-Regel:
- Muss bis 16 ziehen, muss bei 17 stehenbleiben

Gewinn:
- Blackjack (Ass + 10er Karte) zahlt meist 3:2
- Einfacher Sieg zahlt 1:1
`.trim();

const jassRules = `
Ziel:
Gemeinsam mit dem Partner möglichst viele Punkte durch Stiche machen (Schieber).

Setup:
- 4 Spieler (2 Teams)
- 36-Karten-Deck (Deutschschweizer oder Französische Farben)
- Jeder erhält 9 Karten

Ablauf:
- Trumpf wird bestimmt (oder geschoben zum Partner)
- Es herrscht Farbzwang (außer Trumpf)
- Stiche zählen Punkte (Ass=11, König=4, etc.)
- "Nell" (Trumpf-9) = 14 Punkte, "Bauer" (Trumpf-J) = 20 Punkte

Weis:
- Zusätzliche Punkte für Reihen (3+ aufeinanderfolgend) oder 4 Gleiche

Spielende:
- Gespielt wird meist auf eine feste Punktzahl (z.B. 1000 oder 2500)
`.trim();

const skatRules = `
Ziel:
Durch Bieten das Spielrecht erhalten und dann 61 Augen (Punkte) im Stichspiel erreichen.

Setup:
- 3 Spieler
- 32-Karten-Deck
- Jeder erhält 10 Karten, 2 liegen im "Skat"

Ablauf:
- Reizen: Wer das höchste Spiel bietet, wird Alleinspieler
- Alleinspieler nimmt (optional) den Skat auf und drückt 2 Karten
- Alleinspieler bestimmt Spielart (Farbspiel, Grand, Null)
- Die anderen zwei spielen als Team gegen ihn

Wertung:
- Farbstiche zählen Augen (Ass=11, 10=10, K=4, D=3, B=2)
- Nullspiel: Alleinspieler darf keinen Stich machen

Spielende:
- Nach 10 Stichen wird gezählt
- Überreizt der Spieler, verliert er doppelt
`.trim();

const sechsUndSechzigRules = `
Ziel:
66 Augen durch Stiche und Ansagen erreichen (ähnlich Schnapsen, aber mit leichten Unterschieden).

Setup:
- 2 Spieler
- 24-Karten-Deck (Ass, 10, K, D, B, 9)
- Jeder erhält 6 Karten

Ablauf:
- Farbzwang erst, wenn der Talon aufgebraucht/gesperrt ist
- Stichwerte: Ass=11, 10=10, K=4, D=3, B=2, 9=0
- Hochzeiten (K+D) zählen 20 (in Trumpf 40)

Unterschied zu Schnapsen:
- Wird oft mit 24 Karten (inkl. Neunern) gespielt
- Start mit 6 Handkarten (statt 5)
- "Gehen" (Schließen) ist erlaubt

Spielende:
- Wer zuerst 66 Augen meldet, gewinnt den Deal
- Siegpunkte je nach Augen des Verlierers (1 bis 3)
`.trim();

export type Game = {
  id: string;
  name: string;
  shortDescription: string;
  rules: string;
};

// data/games.ts
// ... (Die Regel-Texte bleiben oben gleich) ...

export const GAMES: Game[] = [
  // --- KLASSIKER & EINSTEIGERSPIELE ---
  {
    id: "maumau",
    name: "Mau Mau",
    shortDescription: "Der Klassiker: Werde deine Karten als Erster los.",
    rules: mauMauRules,
  },
  {
    id: "schwarzerpeter",
    name: "Schwarzer Peter",
    shortDescription: "Vermeide die letzte unpaarbare Karte.",
    rules: schwarzerPeterRules,
  },
  {
    id: "quartett",
    name: "Quartett",
    shortDescription: "Sammle vier gleiche Werte zu einem Satz.",
    rules: quartettRules,
  },
  {
    id: "romme",
    name: "Romme",
    shortDescription: "Lege Folgen und Sätze aus.",
    rules: rommeRules,
  },
  {
    id: "schwimmen",
    name: "Schwimmen",
    shortDescription: "Tausche dich zu 31 Punkten.",
    rules: schwimmenRules,
  },

  // --- STICHSPIELE & STRATEGIE ---
  {
    id: "skat",
    name: "Skat",
    shortDescription: "Das deutsche Nationalspiel: Alleine gegen zwei.",
    rules: skatRules,
  },
  {
    id: "durak",
    name: "Durak",
    shortDescription: "Angriff und Verteidigung – werde nicht der Dumme.",
    rules: durakRules,
  },
  {
    id: "schnapsen",
    name: "Schnapsen",
    shortDescription: "Schnelles Stichspiel für zwei Personen.",
    rules: schnapsenRules,
  },
  {
    id: "jass",
    name: "Jass",
    shortDescription: "Schweizer Stichspiel im Team.",
    rules: jassRules,
  },
  {
    id: "sechsundsechzig",
    name: "Sechsundsechzig",
    shortDescription: "Ähnlich wie Schnapsen, oft mit 24 Karten.",
    rules: sechsUndSechzigRules,
  },

  // --- PARTY & BLUFF ---
  {
    id: "praesident",
    name: "Präsident", // (Ä/Ae angepasst für Anzeige)
    shortDescription: "Vom Bettler zum Boss – Rangordnung durch Kartenspiel.",
    rules: praesidentRules,
  },
  {
    id: "luegenspiel",
    name: "Lügen / Cheat",
    shortDescription: "Bluffe dich zum Sieg.",
    rules: liarGameRules,
  },

  // --- CASINO & GLÜCK ---
  {
    id: "poker",
    name: "Poker (Hold'em)",
    shortDescription: "Das ultimative Spiel um Einsätze und Nerven.",
    rules: pokerRules,
  },
  {
    id: "blackjack",
    name: "Blackjack",
    shortDescription: "Schlage die Bank bis zur 21.",
    rules: blackjackRules,
  },
  {
    id: "siebenhalb",
    name: "Sieben und Halb",
    shortDescription: "Die klassische Variante von Blackjack.",
    rules: siebenUndHalbRules,
  },
];
