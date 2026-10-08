---
name: Kamenictví Adámek — konfigurátor
description: Důstojný ateliér pro osobní návrh pomníku v kameni.
colors:
  forest: "#1d2620"
  forest-surface: "#243029"
  forest-raised: "#26342c"
  forest-line: "#435047"
  stone-text: "#ece9e2"
  muted-text: "#b3b0a6"
  gold: "#e2a64a"
  gold-hover: "#ecb968"
  ivory: "#ece9e2"
  selected-ivory: "#fff4dc"
typography:
  display:
    fontFamily: "Libre Caslon Display, Georgia, serif"
    fontSize: "42px"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.2
rounded:
  square: "2px"
  control: "3px"
  soft: "6px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "28px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.forest}"
    rounded: "{rounded.control}"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.gold-hover}"
  choice-row:
    backgroundColor: "transparent"
    textColor: "{colors.stone-text}"
    rounded: "0"
    padding: "16px 0"
  shape-sample:
    backgroundColor: "{colors.ivory}"
    textColor: "{colors.forest}"
    rounded: "{rounded.square}"
    padding: "16px 10px 12px"
  shape-sample-selected:
    backgroundColor: "{colors.selected-ivory}"
---

# Design System: Kamenictví Adámek — konfigurátor

## Overview

**Creative North Star: „Ateliér vzpomínek v kameni“**

Rozhraní spojuje tmavou zelenou dílnu s klidným, světlým prostorem skutečného kamenného návrhu. Zlatá označuje právě zvolenou cestu a hlavní akci; slonovinová nechává vyniknout siluetu, kresbu kamene a rozměry. Výrazný patkový nadpis dodá lidský tón, zatímco přehledné ovládání zůstává věcné a dobře čitelné.

Na široké obrazovce tvoří celek levý ovládací panel a dominantní 3D náhled vpravo. Šest kroků leží vodorovně pod hlavičkou. Na telefonu jdou kroky před náhledem a ovládáním; informace o cenové nabídce a navigace zůstávají ve spodní liště. Vizuální systém slouží návrhu pomníku, ne další marketingové vrstvě.

**Key Characteristics:**
- Tmavá dílna, světlý kámen, střídmý zlatý akcent.
- Výrazné patkové nadpisy a přístupné bezpatkové ovládání.
- Přesný katalog a prostorový náhled mají přednost před dekorací.

## Colors

Lesní zelená drží ovládací rozhraní pohromadě; teplá slonovinová patří kamenným vzorkům a světlé scéně náhledu.

### Primary
- **Zlato dílny** (#e2a64a): aktivní krok, výběr, fokus a hlavní tlačítko.
- **Zlato ve světle** (#ecb968): přechodný stav hlavního tlačítka.

### Neutral
- **Zelená dílny** (#1d2620): základní pozadí, hlavička a tmavé texty na zlaté akci.
- **Zelená plocha** (#243029): ovládací panel, dialogy a spodní lišta.
- **Zvýšená zelená** (#26342c): ovládací prvky a vnořené plochy.
- **Linka kamene** (#435047): jemné oddělení panelů a řádků.
- **Slonovinový text** (#ece9e2): hlavní text na tmavých plochách; stejný světlý tón v náhledu.
- **Tlumený text** (#b3b0a6): doprovodné popisy a neaktivní kroky.
- **Zvolená slonovinová** (#fff4dc): vybraný světlý vzorek tvaru.

### Named Rules
**Pravidlo Zlatého vodítka.** Zlato vyhraď aktivnímu výběru, fokusu a hlavním akcím; nepoužívej je jako plošnou dekoraci.

## Typography

**Display Font:** Libre Caslon Display (s Georgia, serif jako zálohou)
**Body Font:** Albert Sans (s system-ui, sans-serif jako zálohou)
**Label/Mono Font:** Albert Sans; čísla rozměrů používají tabulární číslice.

**Character:** Libre Caslon Display přináší klidný, osobní tón. Albert Sans drží kroky, popisy a volby čisté a čitelné.

### Hierarchy
- **Display** (400, 42px, line-height 1.05): hlavní nadpis kroku na desktopu; na telefonu 36px.
- **Title** (400, 25px, line-height dle komponenty): názvy voleb místa a vybrané titulky.
- **Body** (400, 15px, line-height 1.6): vysvětlení a úvodní text kroku.
- **Label** (500, 13–15px, line-height 1.2): navigace, tlačítka a ovládací popisky.

### Named Rules
**Pravidlo Dvou Hlasů.** Caslon vyhraď nadpisům a pojmenovaným volbám; veškeré ovládání sázej Albert Sans. Písma určená pro skutečné rytiny zůstávají samostatnou volbou v konfigurátoru.

## Layout

Na desktopu zabírá ovládací panel nejméně 390px a zhruba 32 % šířky; zbytek patří modelu. Hlavička měří 84px a řádek šesti kroků 64px. Vnitřní okraje panelu mají typicky 28px. Mezi 901 a 1199px se panel drží na 390px. Pod 900px přechází rozložení do jediného sloupce: hlavička, kroky, náhled, ovládání. Spodní navigace zůstává pevná a respektuje bezpečnou oblast telefonu. Pod 360px se zmenší logo, mezery hlavičky a horní CTA. Rozestupy vycházejí ze 4, 8, 16 a 28px.

**Pravidlo Modelu Na Dosah.** Model zůstává hlavní vizuální plochou; mobilní pořadí však nejdřív ukáže postup, pak náhled a nakonec podrobné volby.

## Elevation & Depth

Ovládací vrstva je převážně plochá: karty a tlačítka nepoužívají stíny k naznačení hierarchie. Hloubku vytvářejí změny tónu zelených ploch, jemné linky a samotný interaktivní 3D model. Světlá scéna modelu používá jemné přechody jako prostředí kamene; nejde o dekorativní pozadí ovládacího panelu.

## Shapes

Ovládání používá převážně pravoúhlé tvary s drobným zaoblením (2–6px). Výběr místa tvoří otevřené řádky s průhledným pozadím a linkou; při hoveru nebo výběru dostanou zelený tón (#2b382e). Tvary pomníků se ukazují ve světlých, téměř hranatých vzorcích. Kresbu a siluetu vzorku určuje katalog, nikoli dekorativní ikona.

## Components

### Buttons
- **Character:** jasná obdélníková akce bez stínu.
- **Primary:** zlatá plocha a tmavý text (#e2a64a / #1d2620), jemné rohy (3px), výška navigačního tlačítka 48px.
- **Hover / Focus:** pozadí přejde na světlejší zlato (#ecb968); viditelný fokus má zlatý obrys 2px s odsazením 3px.
- **Secondary:** tmavá plocha, světlý text a linka; rohy zůstávají malé.

### Cards / Containers
- **Choice rows:** otevřené řádky s průhledným pozadím a oddělovací linkou; při hoveru nebo výběru mají zelené pozadí (#2b382e).
- **Shape samples:** světlé obdélníkové vzorky s drobným vnitřním zlatým pruhem při výběru.
- **Material samples:** vzorek kamene je hlavním obsahem; popis zůstává pod ním.
- **Shadow Strategy:** ploché, linkou nebo změnou tónu oddělené plochy.

### Inputs / Fields
- **Style:** tmavá zelená plocha, tlumená linka, malý poloměr; text píše Albert Sans.
- **Focus:** zlatý obrys (2px, offset 3px); textová pole na mobilu mají nejméně 16px pro čitelné zadávání.

### Navigation
- **Desktop:** šest vodorovných kroků s číselným pořadím; aktivní krok má zlatý text a spodní linku, dokončené kroky světlý text.
- **Mobile:** kroky zůstávají před modelem a ovládáním; pevná spodní lišta nese cenu a tlačítka zpět/pokračovat.

### Signature Component: Kamenný ateliér
Velký světlý 3D náhled drží skutečný model, kresbu kamene a číselné rozměry. Vodorovné volby pohledu leží při spodní hraně scény; světlé prostředí odděluje model od tmavé ovládací plochy. Přechod kamery trvá nejvýše 280ms a při zapnutém omezení pohybu proběhne okamžitě; výběry UI reagují okamžitě.

## Do's and Don'ts

### Do:
- **Do** používej zelenou dílny pro rozhraní, slonovinovou pro kámen a zlato pro zvolený stav a hlavní akci.
- **Do** zachovej rozlišení mezi Caslonem pro titulky, Albert Sans pro UI a samostatnými písmy pro rytinu.
- **Do** udržuj volby místa jako přehledné řádky a náhled jako hlavní prostorovou plochu.

### Don't:
- **Don't** nepřenášej velké oblé karty ani stíny původní šablony do ateliérového ovládání.
- **Don't** neměň geometrii katalogu ani písma skutečných rytin jako součást vizuálního sjednocení.
- **Don't** nepoužívej slonovinovou scénu náhledu jako důvod k zesvětlení ovládacího panelu.
