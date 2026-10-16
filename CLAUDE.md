# Sito personale di Luca D'Aniello

Sito statico in HTML/CSS/JS pubblicato con GitHub Pages: niente build, niente framework. I testi del sito sono **in inglese**.

## Aggiungere una news

Ogni news vive in tre posti, sempre con la più recente in cima:

1. `blog/<slug>/index.html`: l'articolo completo. Copia la struttura da un post esistente (i percorsi sono relativi, `../../`).
2. `blog.html`: una card in cima a `.blog-list`, con `data-type` = `paper` | `award` | `milestone` | `talk`.
3. `index.html`: una `.news-card` in cima a `#newsTrack` (carousel Latest News).

Formato data: homepage `8 Aug 2026`; blog e articolo `8 August 2026 · New publication`.
Le immagini vanno in `assets/blog/` come `<slug>-cover.png`, `<slug>-<cosa>.png`.
Se introduci un tipo nuovo, aggiungi il colore in `css/style.css` (blocco "Cover type tags") e un bottone filtro in `blog.html`.

## Regole sulle immagini

### Anteprima Latest News (homepage): mai immagini

La card in `index.html` è solo testo, qualunque cosa contenga l'articolo:

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

### Articolo del blog: tre casi, in quest'ordine

1. **L'utente ha fornito immagini**: usale. La prima fa da copertina (`.article-cover cover-doc` per screenshot di documenti o certificati, `cover-photo` per le foto), le altre vanno nel testo come `<figure class="article-fig">` con `<figcaption>`.
2. **Nessuna immagine, ma c'è un articolo o una pagina online**: fai tu uno screenshot della parte che serve, di solito l'intestazione del paper (rivista, titolo, autori), come le copertine esistenti (`assets/blog/refmatch-cover.png`).
   - Se hai il PDF (fornito o scaricabile; controlla con `file` che sia davvero un PDF), renderizza la parte alta della prima pagina con PyMuPDF:
     ```python
     import fitz
     page = fitz.open("paper.pdf")[0]; r = page.rect
     page.get_pixmap(dpi=200, clip=fitz.Rect(r.x0, r.y0, r.x1, r.y0 + r.height * 0.33)).save("cover.png")
     ```
   - Altrimenti fai lo screenshot della pagina con Chrome headless, guardalo e ritaglia con PIL solo la zona utile (titolo/autori), escludendo banner cookie, menu e pubblicità:
     ```sh
     "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars \
       --user-data-dir="$TMPDIR/chrome-shot" --window-size=1300,1800 --virtual-time-budget=8000 \
       --screenshot="$PWD/shot.png" "<url>"
     ```
     Con una finestra alta, il banner dei cookie (fisso in basso) resta lontano dal titolo.
   - Prima di usarla, apri l'immagine e controllala: deve essere leggibile e non mostrare paywall, captcha, banner o errori ("JavaScript is disabled", "Access denied"). Se non va bene, passa al caso 3.
   - Il download diretto dei PDF Springer con `curl` restituisce una pagina di verifica JavaScript, non il PDF.
3. **Nessuna immagine utilizzabile**: niente `.article-cover` e niente figure. Descrivi la news in dettaglio: contesto, cosa è successo, perché conta, coautori, riferimento bibliografico (`.article-callout`) e link (`.article-actions`).

Nel messaggio finale indica quale dei tre casi hai applicato.

### Card in `blog.html`: segue l'articolo

Se l'articolo ha una copertina, la card usa la stessa immagine:

```html
<article class="blog-post reveal-up" data-type="paper">
    <div class="blog-cover cover-doc">
        <span class="blog-cover-tag tag-paper">Paper</span>
        <img src="assets/blog/<slug>-cover.png" alt="...">
    </div>
    <div class="blog-post-body"> … </div>
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

`python3 -m http.server 8899` dalla radice del repo, poi controlla `index.html`, `blog.html` e il nuovo articolo (anche con uno screenshot headless come sopra). Chiudi il server alla fine.
