# Konfigurátor pomníků — Adámek

Uživatel: zákazník vybírající pietní místo, často starší člověk na mobilu. Cíl: prohlédnout věrný návrh a vyžádat individuální nabídku. Rozhodnutí musí působit klidně, důstojně a srozumitelně.

## Dohodnutý rozsah

Zachovat referenční geometrii všech 31 tvarů, 14 kamenů, 14 konstrukčních modelů, všechny rytiny včetně růže, čtyři styly nápisů, osoby a fotografie, rozměry, doplňky, čelní i 3D náhled, sdílení, PDF a poptávku. Použít úplný katalog. Geometrii nepřekreslovat odhadem.

Šest kroků: velikost → tvar → materiál → nápis → doplňky → shrnutí. Na desktopu levá navigace, dominantní 3D náhled uprostřed, ovládání napravo. Na mobilu náhled nad ovládáním, kroky vodorovně, dostupná spodní navigace.

## Vzhled z existujícího webu

- Pozadí `#1d2620`, plocha `#243029`, zvýšená plocha `#26342c`.
- Text `#ece9e2`, vedlejší text `#b3b0a6`, akcent `#e2a64a`.
- Albert Sans pro ovládání, Libre Caslon Display pro hlavní nadpisy. Písma rytiny zachovat.
- Skutečné logo Adámek, telefon 602 277 869. Hlavní tlačítka zlatá s tmavým textem, rohy 3 px.
- Náhled zachová světlé studio pro věrné kameny a volitelné prostředí hřbitova. Rytiny a tvary tvoří podpis rozhraní.
- Žádné nové gradientové dekorace, marketingové karty, smyčky ani vymyšlené sliby odpovědi do 48 hodin.

## Pohyb

| Místo | Účel | Četnost | Rozhodnutí |
| --- | --- | --- | --- |
| Změna kamery | prostorová návaznost | občas | nejvýše 280 ms; při reduced-motion okamžitá změna |
| Stisk tlačítka | zpětná vazba | běžná | jemný stav bez nové animace |
| Změna kroku, kamene, nápisu | četba a přesná volba | běžná | okamžitá změna; bez dekorativní animace |
| Galerie tvarů | četba katalogu | občas | bez postupného odhalování položek |
| Otáčení modelu | přímá manipulace | běžná | původní OrbitControls, bez automatického otáčení |

## Ověření

In-app Browser na localhost: desktop 1440 a mobil 390, dvě kola. Ověřit plný průchod, motivy, sdílený návrh, PDF, přístupnost, chyby a doručovací smlouvu API pomocí mocku. Bez nastavení služby nelze ověřit skutečné doručení. Živý web neměnit před konkrétní revizí změn.
