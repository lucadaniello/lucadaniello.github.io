# Sito di Luca D'Aniello: istruzioni per l'aggiornamento

Sito accademico personale, statico (HTML/CSS/JS puro, nessuna build), pubblicato con GitHub Pages su <https://lucadaniello.github.io>.
Una volta al mese Claude legge il CV di Luca e aggiorna il sito in autonomia. Questo file contiene tutto quello che serve per farlo.

## Regole generali

- **Il CV è la fonte di verità per i dati.** Struttura, stile e testi descrittivi del sito restano come sono: aggiorni i contenuti, non riprogetti.
- **Il CV è in italiano, il sito in inglese.** Traduci in inglese seguendo la terminologia già usata sul sito (es. "Indagini Campionarie" → "Sample Survey Methods"). I titoli dei lavori restano nella lingua originale.
- **Niente commit e niente push.** Lascia le modifiche nella working tree: Luca le controlla e le carica lui con git.
- **Dati personali:** dal CV non pubblicare mai codice fiscale, numero di telefono, email personale (gmail) o indirizzo. L'unica email pubblica è `luca.daniello@unina.it`.
- **Non cancellare** voci presenti sul sito solo perché mancano nel CV: segnalale nel report. Unica eccezione: un preprint che nel CV risulta pubblicato (vedi sotto).
- **Non creare sezioni nuove.** Se il CV contiene un tipo di informazione che sul sito non ha una sezione (es. Associate Editor, attività di revisione, società scientifiche, premi), proponila nel report invece di crearla.
- **Nessun duplicato.** Prima di aggiungere qualcosa, controlla che non ci sia già: le pubblicazioni per DOI (o titolo), i convegni per sigla e anno, i corsi per titolo italiano.

## Input del task mensile

Percorsi sul Mac di Luca. Se lavori in un ambiente in cui le cartelle sono montate altrove (es. Cowork), usa la cartella collegata corrispondente.

- **CV:** `/Users/lucadaniello/Library/CloudStorage/Dropbox/08. Personali/0. Curriculum Vitae/CV_LD/CV_LucaDAniello.docx`
  È sempre l'ultima versione ed è l'unica da leggere. Ignora il PDF, le versioni "short", i file `~$…` e la cartella `old/`.
- **PDF delle pubblicazioni:** `/Users/lucadaniello/Library/CloudStorage/Dropbox/06. Pubblicazioni/`
  - Le sottocartelle sono per anno di pubblicazione, e dentro ogni anno c'è una cartella per lavoro, chiamata `<SIGLA RIVISTA> - <inizio del titolo>` (es. `2026/ERSS - Energy transition as the core/`, `2026/JOI - Rethinking thematic evolution/`).
  - I preprint stanno in cartelle `ARXIV - …`, i proceedings in `CONVEGNO …` o `<SIGLA CONVEGNO> - Proceedings`.
  - Se in una cartella ci sono più file, usa la versione pubblicata dall'editore (es. `1-s2.0-…-main.pdf` per Elsevier, oppure il file col titolo dell'articolo). Controlla sulla prima pagina che il titolo corrisponda.
  - Non usare `Importanti da leggere/`: sono lavori di altri autori.
- **Google Scholar** (fonte di H-index e citazioni): <https://scholar.google.com/citations?user=IXJxh0MAAAAJ&hl=en>

### Cadenza mensile

Il task può essere programmato ogni settimana: il file `tools/ultimo-aggiornamento.txt` fa sì che l'aggiornamento avvenga una volta al mese.
- **All'inizio:** leggi il file. Se contiene una data di meno di 28 giorni fa, fermati subito senza toccare nulla e rispondi solo "Aggiornamento non dovuto: ultimo il <data>". Se il file manca, procedi.
- **Alla fine:** scrivici la data di oggi (`AAAA-MM-GG`).
- **Se Luca chiede esplicitamente di aggiornare adesso**, ignora il controllo.

## Leggere il CV

```sh
python3 tools/cv_extract.py "<percorso>/CV_LucaDAniello.docx" > cv.txt
```

Usa sempre questo script, non un convertitore generico. Nel CV le pubblicazioni **Fascia A** sono marcate da una stellina, che però è una *immagine*: i convertitori normali la perdono. Lo script la conserva: ogni riga Fascia A inizia con `★ ` (la prima riga con ★ è solo la legenda "Fascia A, Area 13 STAT-03/B"). Le tabelle (didattica) escono una riga per riga di tabella, con le celle separate da ` | `.
Se hai solo il PDF del CV, leggilo come immagine: la stellina nera è visibile prima del riferimento.

## Mappa del sito: dove va ogni sezione del CV

| Sezione del CV | Dove va sul sito |
|---|---|
| Profilo generale, Posizione attuale, Formazione | `index.html`: hero (ruolo) e biosketch (`#about`) |
| Articoli su Rivista | `research.html` › Scientific Articles |
| Libri e monografie | `research.html` › Books & Monographs |
| Conference Proceedings | `research.html` › Conference Proceedings |
| Working Papers | `research.html` › Working Papers & Preprints |
| Partecipazione a Progetti di Ricerca | `research.html` › Research Projects (`#projects`) |
| Package e Software | `software.html` (+ cifre di installazione nel biosketch) |
| Titolarità e assistenza alla didattica, Altre attività didattiche | `teaching.html` › University Courses |
| Docenza in Dottorati, Alta Formazione, Workshop e Seminari | `teaching.html` › Doctoral Courses & Seminars |
| Relazioni a Convegni | `outreach.html` › Conference Participation |
| Organizzazione di Convegni, Chair di sessione, Summer School | `outreach.html` › Conference Organization & Chairs |
| Gruppi di Ricerca | `outreach.html` › Research Group Memberships |
| Contatti e profili (intestazione del CV) | `contact.html`, icone social in `index.html` |
| Premi | solo come news + post del blog (vedi "News e blog") |

Non vanno sul sito: esperienze professionali passate (assegni, contratti), commissioni d'esame, "cultore della materia", dati anagrafici.

## Elementi condivisi

- **Navbar e footer** sono copiati in ogni pagina, compresi `blog/*/index.html` (lì con percorsi `../../`). Se cambia qualcosa che compare in tutte le pagine (es. il ruolo "Assistant Professor (RTD-A)" nel footer, nel `<title>` o nella `meta description`), aggiornalo ovunque con un find/replace su tutti i file `.html`.
- **Animazioni:** gli elementi hanno la classe `reveal-up` (con `delay-1`…`delay-3` facoltativi). Mantienila sugli elementi nuovi.
- **CSS:** tutto in `css/style.css`. **JS:** `js/main.js` (contatori, filtri, pulsante Cite, carousel), `js/network.js` (animazione dell'hero). Per aggiornare i contenuti non serve toccarli.

## Research (`research.html`)

### Pubblicazioni

Quattro sottosezioni `.subsection` con `data-pub-group` = `journal` | `book` | `conference` | `preprint`. Dentro ognuna, le card sono in ordine di anno decrescente.

**Template della card:**

```html
<!-- Nome breve -->
<div class="pub-card reveal-up">
    <div class="pub-year">2026</div>
    <div class="pub-body">
        <div class="pub-badges"><span class="badge badge-journal">Journal</span><span class="badge badge-fascia">FASCIA A - AREA 13 STAT-03/B</span></div>
        <h4 class="pub-title">Titolo completo</h4>
        <p class="pub-meta">Aria, M., <strong>D'Aniello, L.</strong>, &amp; Spano, M.</p>
        <p class="pub-venue"><em>Scientometrics</em>, 129(11), 7055–7081 · Springer · DOI: 10.1007/s11192-024-05161-6</p>
        <a href="https://doi.org/10.1007/s11192-024-05161-6" target="_blank" rel="noopener" class="pub-link"><i class="fas fa-external-link-alt"></i> View</a>
    </div>
</div>
```

- **Autori:** come nel CV, con `<strong>D'Aniello, L.</strong>` e `&amp;`. Per le liste lunghe usa `…` come nel CV.
- **Venue:** `<em>Rivista</em>`, poi volume(numero) e pagine se ci sono, poi editore e `DOI: …`, separati da ` · `. Mantieni esattamente questo formato: il pulsante "Cite" (generato da `js/main.js`) ricava rivista, volume, pagine, DOI e ISBN proprio da qui. Se il CV non indica l'editore, ricavalo dal DOI.
- **Link:** `https://doi.org/<DOI>`. Se non c'è un DOI, niente link.
- **Badge:**
  - `badge-journal` "Journal", `badge-book` "Book", `badge-conf` "Proceedings";
  - per i preprint `badge-preprint` "Preprint" + `badge-arXiv` "arXiv", oppure solo `badge-preprint` "Under Review";
  - `badge-software` "Software" per i paper che presentano un software.
  - **`badge-fascia` "FASCIA A - AREA 13 STAT-03/B" segue la stellina del CV:** c'è se e solo se la riga del CV inizia con ★. Se sito e CV non coincidono, allinea al CV e indicalo nel report.
- **Scientific Articles** è divisa in blocchi segnati da commenti HTML:
  1. un blocco iniziale con i lavori più recenti;
  2. `<!-- Fascia A -->` (Fascia A meno recenti);
  3. `<!-- Statistica -->` (altri lavori statistici);
  4. `<!-- Medicina -->`.

  Un nuovo articolo non medico va in cima alla lista, preceduto da un commento col nome breve. Un nuovo articolo medico va in cima al blocco `<!-- Medicina -->`. Sono medici gli articoli con **Adamo, D.** tra gli autori, quelli del gruppo Burning Mouth Syndrome / SIPMO e quelli su riviste di odontoiatria o medicina orale.
- **Da preprint a pubblicato:** se un lavoro che sul sito è tra i preprint compare nel CV come articolo su rivista, togli la card dai preprint e crea la card in Scientific Articles. Per le news conta come nuova pubblicazione.
- **Contatori:** il totale delle pubblicazioni e il dettaglio (articles · books · proceedings) sono calcolati da `js/main.js` contando le card; i preprint sono esclusi. Non modificarli a mano.
- **H-index e citazioni** vengono da **Google Scholar**, non dal CV (il CV riporta valori Scopus, che non vanno usati).
  - Apri il profilo Scholar (link in "Input del task mensile") e prendi la colonna "All" di *h-index* e *Citations*.
  - Nel banner aggiorna i due `data-target` ("H-index" e "Citations") e la riga `Metrics updated <Month YYYY>` col mese corrente in inglese.
  - Se Scholar non si lascia leggere (captcha, errore), lascia tutto com'è e segnalalo nel report.
  - Da riga di comando di solito funziona così:
    ```sh
    curl -sL -A "Mozilla/5.0" "https://scholar.google.com/citations?user=IXJxh0MAAAAJ&hl=en" \
      | grep -o 'gsc_rsb_sc1"><a[^>]*>[^<]*</a></td><td class="gsc_rsb_std">[0-9]*'
    ```

### Research Projects

Card `.project-card` dentro `.projects-grid`: badge del programma (`project-badge`; aggiungi la classe `pnrr` per i PNRR), anni, titolo, una frase di descrizione in inglese, link al sito del progetto se esiste, ruolo e PI. Nuovi progetti in testa; aggiorna gli anni se cambiano nel CV.

### Research Areas & Interests

Non modificarle in autonomia. Se il profilo del CV introduce un'area nuova, proponila nel report. I tag degli interessi sono duplicati anche in `index.html`.

## Software (`software.html`)

Una `<section>` per pacchetto (TALL, bibliometrix, themescopeR), con sfondo alternato (`section` / `section section-alt`). Ogni sezione contiene:

- l'intestazione: logo in `loghi/`, nome, tagline e `.software-pills` (tipo, numero di installazioni, licenza);
- il testo descrittivo;
- `.sf-features`;
- `.sf-actions` (sito del pacchetto, paper).

- **Aggiorna** le cifre di installazione (pill, testo descrittivo e biosketch in `index.html`), i link e il paper di riferimento quando il CV li cambia.
- **Pacchetto nuovo:** aggiungi una sezione con la stessa struttura, rispettando l'alternanza degli sfondi. Il logo va preso dal sito o dal repository del pacchetto e salvato in `loghi/`. Se non trovi il logo, usa un'icona Font Awesome dentro `.sf-logo-wrap`.

## Teaching (`teaching.html`)

- **University Courses:** una `.teaching-card` per insegnamento, con titolo inglese in `.teaching-card-title` e titolo italiano in `.teaching-card-it`. Un insegnamento compare una sola volta, anche se tenuto in più anni. Comprende sia le titolarità sia l'assistenza alla didattica. I nuovi insegnamenti vanno in coda alla griglia.
- **Doctoral Courses & Seminars:** `.timeline-item`, dal più recente:
  - `.timeline-marker blue`;
  - data in `.timeline-years` (`Jan 2026`);
  - titolo `<h3>`;
  - `.timeline-place` = "Programma o evento · Istituzione";
  - `<p>` con il tipo: `Lecture`, `Lecturer`, `Seminar`, `Invited talk`, `Keynote`, `Doctoral course`.

  Qui vanno anche summer school, master e corsi di alta formazione (es. ENAIP/IFTS).

## Outreach (`outreach.html`)

- **Conference Participation:** una `.conf-card` per evento, dal più recente:
  - in `.conf-top`, `conf-acronym` (es. `ASA 2026`) e il badge `badge-conf` "International" o "National" (dal CV: "Convegno internazionale" / "nazionale");
  - `.conf-name` con il nome completo;
  - `.conf-meta` con data (`8&ndash;10 July 2026`) e luogo (`Palermo, Italy`).

  Se a un evento ci sono più relazioni, la card resta una sola.
- **Conference Organization & Chairs:** voci `<li><i class="fas fa-circle-dot"></i><span>…</span></li>` nelle liste "Local Organizing Committees", "Session Chairs" e "Summer School Organization", dalla più recente.
- **Research Group Memberships:** `.project-card` con badge `From <anno>`, nome, descrizione, ambito (International / Institutional) e sede.

## Homepage (`index.html`) e Contact

- **Hero:** nome, ruolo (`.hero-role`), dipartimento. Aggiornali se cambia la posizione (e in quel caso aggiorna anche i footer di tutte le pagine).
- **Biosketch (`#about`):** allinea i fatti al CV (posizione, dottorato e supervisore, numero di installazioni dei software, ruoli) senza riscrivere lo stile del testo.
- **Contact:** email istituzionale, profili accademici (Scholar, ORCID, ResearchGate, Scopus, GitHub, LinkedIn) e siti dei progetti. Aggiorna solo se il CV cambia un link.

## News e blog

### Quando si crea una news

| Evento nel CV | News + post del blog? |
|---|---|
| **Nuova pubblicazione Fascia A (★)** | **Sì, sempre**, oltre alla card in Research |
| Nuovo premio per attività di ricerca | Sì (tipo `award`) |
| Traguardo di carriera: nuova posizione, abilitazione | Sì (tipo `milestone`) |
| Nuovo pacchetto software pubblicato | Sì (tipo `software`: alla prima occorrenza aggiungi colore e filtro, vedi sotto) |
| **Qualsiasi lavoro con Adamo, D.** (medicina), anche se avesse la ★ | **No**: solo la card in Research, blocco Medicina |
| Premi legati ai lavori di medicina (es. poster SIPMO) | No |
| Altri articoli, proceedings, relazioni a convegni, didattica | No |

Una news è "nuova" se non esiste già un post in `blog/` sullo stesso lavoro o evento. Le pubblicazioni Fascia A già presenti sul sito senza post non generano news retroattive.

### I tre posti di ogni news

Sempre con la più recente in cima:

1. `blog/<slug>/index.html`: l'articolo completo.
2. `blog.html`: una card in cima a `.blog-list`, con `data-type` = `paper` | `award` | `milestone` | `talk` | `software`.
3. `index.html`: una `.news-card` in cima a `#newsTrack` (carousel Latest News). Tieni in homepage le 8 news più recenti, togliendo dal carousel le più vecchie (restano nel blog).

Formato data: homepage `8 Aug 2026`; blog e articolo `8 August 2026 · New publication`. Usa la data di pubblicazione online dell'articolo (o dell'evento); se non la trovi, usa la data dell'aggiornamento.

Se introduci un tipo nuovo, aggiungi il colore in `css/style.css` (blocco "Cover type tags": `.news-tag.tag-x, .blog-cover-tag.tag-x, .blog-post-tag.tag-x`) e un bottone filtro in `blog.html`.

### Scrivere il post

- Copia la struttura da un post esistente (es. `blog/reference-matching/index.html`):
  - `<title>`: `Titolo breve | Blog · Luca D'Aniello`;
  - `meta description`;
  - `page-tag`: es. "New Publication", "Award", "Career Milestone";
  - `page-title` breve;
  - `.article-meta`: data, rivista ed editore, autori;
  - copertina (vedi regole sulle immagini);
  - `.article-body` con paragrafi e `<h2>`;
  - `.article-callout` con la citazione completa;
  - `.article-actions` con i pulsanti "Read the paper" (DOI) ed eventuali link a software o progetti.
- **Contenuto:** leggi il PDF dell'articolo (cartella dei PDF, altrimenti online: abstract, introduzione, conclusioni) e spiega in modo divulgativo il problema, il contributo e perché conta. Nomina i coautori. Non inventare risultati che non sono nel paper.
- **Tono:** in inglese, in prima persona, caldo ma sobrio, come i post esistenti. 4–8 paragrafi, 2–3 sottotitoli.

### Regole sulle immagini

**Anteprima Latest News (homepage): mai immagini.** La card è solo testo:

```html
<a href="blog/<slug>/" class="news-card">
    <div class="news-body">
        <div class="news-meta">
            <span class="news-tag tag-paper">Paper</span>
            <span class="news-date"><i class="far fa-calendar"></i> 8 Aug 2026</span>
        </div>
        <span class="news-title">Titolo breve</span>
        <span class="news-excerpt">Una o due frasi.</span>
        <span class="news-more">Read more <i class="fas fa-arrow-right"></i></span>
    </div>
</a>
```

**Articolo del blog: tre casi, in quest'ordine.**

1. **Luca ha fornito immagini:** usale. La prima fa da copertina (`.article-cover cover-doc` per screenshot di documenti o certificati, `cover-photo` per le foto), le altre vanno nel testo come `<figure class="article-fig">` con `<figcaption>`.
2. **Nessuna immagine fornita:** crea tu l'immagine.
   - Per la copertina usa l'intestazione della prima pagina del paper (rivista, titolo, autori), come in `assets/blog/refmatch-cover.png`. Puoi aggiungere una figura significativa del paper, con didascalia.
   - **Prima cerca il PDF nella cartella dei PDF** (per titolo, DOI o primo autore e anno). Se c'è, renderizza la parte alta della prima pagina:
     ```python
     import fitz  # pip install pymupdf
     page = fitz.open("paper.pdf")[0]; r = page.rect
     page.get_pixmap(dpi=200, clip=fitz.Rect(r.x0, r.y0, r.x1, r.y0 + r.height * 0.33)).save("cover.png")
     ```
     Regola l'altezza del ritaglio in modo da includere titolo e autori, non l'abstract. Per una figura, usa `clip` sul suo riquadro nella pagina giusta.
   - **Se il PDF non c'è, cercalo online:** pagina del DOI, oppure versione open access o arXiv. Se riesci a scaricare il PDF (controlla con `file` che lo sia davvero: Springer, per esempio, a `curl` restituisce una pagina di verifica JavaScript), procedi come sopra. Altrimenti fai uno screenshot della pagina dell'articolo con il browser o con Chrome/Chromium headless, e ritaglia con PIL solo il blocco titolo/autori. Una finestra alta (es. 1300×1800) tiene il banner dei cookie lontano dal titolo:
     ```sh
     chrome --headless=new --hide-scrollbars --window-size=1300,1800 --virtual-time-budget=8000 --screenshot="$PWD/shot.png" "<url>"
     ```
     Su macOS il binario è `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`.
   - **Controlla sempre l'immagine prima di usarla:** deve essere leggibile e non mostrare paywall, captcha, banner o errori ("JavaScript is disabled", "Access denied"). Se non va bene, passa al caso 3.
3. **Nessuna immagine utilizzabile:** niente `.article-cover` e niente figure. Descrivi la news in modo più dettagliato: contesto, cosa è successo, perché conta, coautori, citazione e link.

Le immagini vanno in `assets/blog/` come `<slug>-cover.png` e `<slug>-<cosa>.png`.

### Card in `blog.html`: segue l'articolo

Se l'articolo ha una copertina, la card usa la stessa immagine:

```html
<article class="blog-post reveal-up" data-type="paper">
    <div class="blog-cover cover-doc">
        <span class="blog-cover-tag tag-paper">Paper</span>
        <img src="assets/blog/<slug>-cover.png" alt="...">
    </div>
    <div class="blog-post-body">
        <span class="blog-date"><i class="far fa-calendar"></i> 8 August 2026 · New publication</span>
        <h2 class="blog-post-title"><a href="blog/<slug>/">Titolo</a></h2>
        <p class="blog-excerpt">…</p>
        <a href="blog/<slug>/" class="blog-readmore">Read more <i class="fas fa-arrow-right"></i></a>
    </div>
</article>
```

Se l'articolo non ha immagini, usa la variante `no-cover`, con il tag dentro il corpo:

```html
<article class="blog-post no-cover reveal-up" data-type="paper">
    <div class="blog-post-body">
        <span class="blog-post-tag tag-paper">Paper</span>
        <span class="blog-date"><i class="far fa-calendar"></i> 8 August 2026 · New publication</span>
        <h2 class="blog-post-title"><a href="blog/<slug>/">Titolo</a></h2>
        <p class="blog-excerpt">…</p>
        <a href="blog/<slug>/" class="blog-readmore">Read more <i class="fas fa-arrow-right"></i></a>
    </div>
</article>
```

## Verifica

1. Avvia `python3 -m http.server 8899` dalla radice del repo.
2. Apri le pagine modificate (`index.html`, `research.html`, `blog.html`, i nuovi post…) e controlla che la struttura non sia rotta: card allineate, filtri e ricerca delle pubblicazioni funzionanti, contatore aggiornato.
3. Controlla che l'HTML sia ben formato (tag `div` bilanciati) e che non ci siano duplicati.
4. Chiudi il server alla fine.

## Report finale

Concludi ogni esecuzione con un report in italiano, diviso così:

- **Aggiunto:** pagina per pagina, cosa è stato inserito.
- **Modificato:** dati aggiornati (badge, cifre, anni, link…), con il valore prima e dopo.
- **News create:** per ognuna, lo slug e quale dei tre casi immagine è stato applicato (e da dove viene l'immagine).
- **Da decidere:**
  - differenze che non hai applicato (es. voci presenti sul sito ma non nel CV, metriche Scholar non leggibili);
  - sezioni nuove proposte;
  - casi dubbi (es. un lavoro di cui non è chiaro se sia medico).
- **File toccati:** l'elenco, così che Luca possa controllare il diff con git prima di caricare.
