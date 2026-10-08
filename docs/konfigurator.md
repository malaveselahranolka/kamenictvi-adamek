# Konfigurátor Adámek

Samostatná statická stránka `/konfigurator/`, odkaz v hlavní i mobilní navigaci. Zachovává katalog referenčního konfigurátoru: 31 tvarů, 14 žul, konstrukce, rytiny, nápisy, 3D, čelní náhled, sdílení a tisk do PDF. Soubory modelů a textur jsou místní, včetně písem; návštěva nevyžaduje načítání ze Stonia ani Google Fonts. `asset-manifest.json` obsahuje původ a SHA-256 referenčních podkladů.

Rozhraní používá vlastní dvousloupcový ateliér Adámek: výběr vlevo, velký model vpravo, šest kroků vodorovně nahoře. Úvod „Vzpomínka v kameni.“, otevřené řádky pro místo, světlý vzorník tvarů a vodorovné kamery. Na mobilu kroky před náhledem a pevná spodní navigace. Jednotlivé materiály se vybírají uvnitř panelu na obou velikostech.

## Spuštění a ověření

Node 24: `npm run dev`, otevřít `http://127.0.0.1:4173/konfigurator/`.
Testy: `npm test`. Frontend nemá build krok ani instalační závislosti.

Sdílení uloží konfiguraci do parametru `cfg`; odkaz obsahuje jména a data z nápisu. Místní rozpracovaný návrh se ukládá v prohlížeči. Formulář se ukládá pouze během otevření a při chybě zůstane vyplněný. Fotky nejsou součást sdíleného odkazu.

## Poptávka na Vercelu

Endpoint `/api/contact` předá kontakt, text návrhu, odkaz na celý návrh a volitelnou fotku do 4 MiB na **info@kamenictvi-adamek.cz**. Používá Resend API a serverovou validaci. Přílohy podporují JPEG, PNG, WEBP; kontroluje se skutečná signatura souboru. Zákazník neovládá adresáta ani odesílatele. Osobní údaje nejsou zapisované do logů ani do souborů serveru.

Před aktivací odesílání nastavit ve Vercelu:

1. `RESEND_API_KEY` — klíč pro odesílání.
2. `CONTACT_FROM_EMAIL` — adresa na doméně ověřené v Resend, např. `Kamenictví Adámek <poptavky@kamenictvi-adamek.cz>`.
3. Zkontrolovat DNS ověření domény v Resend a nastavit ochranu `/api/contact` ve Vercel Firewall proti zneužití veřejného formuláře.
4. Na preview ověřit skutečné doručení jedné označené testovací poptávky včetně fotky a obnovení návrhu z odkazu.

Bez těchto proměnných formulář oznámí nedostupné online odesílání a nabídne telefon. Potvrzení se vrátí pouze po odpovědi Resend obsahující ID přijaté zprávy; API chyba, timeout nebo limit nikdy nepotvrdí odeslání. Přijetí službou samo o sobě nezaručuje doručení do schránky; to ověřuje poslední kontrola.

Testy mockují e-mailovou službu. Neodesílají skutečné zprávy. Aktuální příprava nepřidává DNS záznamy ani klíče, nemění produkční nasazení.

Oficiální smlouva: [Vercel Node.js Web Handlers](https://vercel.com/docs/functions/runtimes/node-js), [limity požadavků](https://vercel.com/docs/functions/limitations), [Resend Send Email](https://resend.com/docs/api-reference/emails/send-email).

## Ověření implementace — 2026-10-08

- `npm test`: 8 úspěšných testů katalogu, SHA-256 všech 70 podkladů a doručovací smlouvy. Poskytovatel e-mailu je mockovaný.
- In-app Browser: všechny kroky na šířkách 1440 a 390 px; jednotlivé typy, 20 atypických tvarů, vlastní rozměry 210 × 240 cm, dělený dvojhrob, podstavec/okénko, kameny, osoby, fotokeramika a rezervované místo.
- Sdílený odkaz otevřen v nové kartě: obnovily se rozměry, dělená deska, materiály, jména, fotografie a rezervované místo. Soubory fotografií se nesdílejí.
- Tiskový dialog obsahuje kompletní konstrukci, materiály a nápisy. „Uložit jako PDF / tisk“ používá systémový tisk prohlížeče. Tiskový náhled nevyžaduje vyskakovací okno. V automatizovaném prohlížeči ověřen obsah; fyzické uložení PDF závisí na systémovém dialogu.
- axe-core WCAG A/AA: šest kroků × dvě šířky, bez automaticky zjištěných porušení. Galerie má zamčené pozadí, cyklus Tab, Escape a návrat fokusu; formulář fokusuje jméno a bez služby zakáže odeslání.
- Lokální web-vitals první implementace před změnou rozložení: LCP 256 ms, CLS 0,00018. Odezva při přepnutí kroku 24 ms. Jde o lokální měření bez zpomalené sítě/CPU, ne produkční či terénní výsledky. Lighthouse není v tomto prostředí dostupný.
- `node --check` pro aplikaci, renderer, API a místní server; `git diff --check`.

Po přepracování rozložení: opakováno všech 8 testů a šest kroků × dvě šířky axe-core, bez automaticky zjištěných porušení. Otevřené náhledy 1440 × 1000, 390 × 700 a skutečný prohlížeč 1280 × 720. Přesunutý výběr materiálu rámy → Nero Assoluto ověřen v prohlížeči. Modely, motivy a hashované podklady beze změny.

Doručení skutečné poptávky zůstává neověřené do připojení služby. Pro živé nasazení zkontrolovat Vercel preview a provést označenou testovací poptávku.
