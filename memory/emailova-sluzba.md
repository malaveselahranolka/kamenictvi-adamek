---
name: E-mailová služba konfigurátoru
description: Neuzavřená volba externí služby k doručování poptávek.
metadata:
  node_type: memory
  type: project
---

2026-10-08: Uživatel nedodal ani nevybral SMTP/Resend. Na dotaz odpověděl „na co?“; vysvětleno, že služba pouze doručuje návrh a kontakt zákazníka. Resend připraven jako technický výchozí adaptér, nikoli uživatelem odsouhlasený poskytovatel.

**Why:** Bez připojeného účtu a DNS nelze ověřit skutečné doručení. Zachovat funkční navrhování nezávisle na odesílání.

**How to apply:** Před aktivací potvrdit používanou službu a ověřit příjem jedné označené testovací poptávky včetně fotografie na info@kamenictvi-adamek.cz. Mockované testy nepředstavují potvrzení doručení.
