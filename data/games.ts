
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
  // weitere Spiele …
];
