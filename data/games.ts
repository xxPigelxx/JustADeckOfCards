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

// data/games.ts
export type Game = {
  id: string;
  name: string;
  shortDescription: string;
  rules: string;
};

export const GAMES: Game[] = [
  {
    id: "maumau",
    name: "Mau Mau",
    shortDescription: "Ablage-Kartenspiel für 3–99 Spieler.",
    rules: mauMauRules,
  },
  {
    id: "schwarzerpeter",
    name: "Schwarzer Peter",
    shortDescription:
      "Paarbildungsspiel – vermeide die letzte unpaarbare Karte.",
    rules: schwarzerPeterRules,
  },
  {
    id: "schwimmen",
    name: "Schwimmen",
    shortDescription: "Sammelspiel um Punktewerte bis 31 in einer Farbe.",
    rules: schwimmenRules,
  },
  {
    id: "quartett",
    name: "Quartett",
    shortDescription: "Sammle vier gleiche Werte zu einem Quartett.",
    rules: quartettRules,
  },
  {
    id: "praesident",
    name: "Praesident",
    shortDescription:
      "Ablagespiel mit sozialen Rollen wie Präsident und Bettler.",
    rules: praesidentRules,
  },
  {
    id: "siebenhalb",
    name: "Sieben und Halb",
    shortDescription: "Zahlen- und Risikospiel bis 7,5 Punkte.",
    rules: siebenUndHalbRules,
  },
  {
    id: "schnapsen",
    name: "Schnapsen",
    shortDescription: "Stichspiel für zwei Spieler mit 66 Punkten als Ziel.",
    rules: schnapsenRules,
  },
  {
    id: "durak",
    name: "Durak",
    shortDescription:
      "Russisches Ablege- und Stichspiel – vermeide den letzten Platz.",
    rules: durakRules,
  },
  {
    id: "luegenspiel",
    name: "Luegen",
    shortDescription: "Bluff- und Ablegespiel mit Aufdecken.",
    rules: liarGameRules,
  },
  // weitere Spiele …
];
