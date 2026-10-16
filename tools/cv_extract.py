#!/usr/bin/env python3
"""Turn the CV (.docx) into plain text, keeping the Fascia A star.

In the CV, Fascia A papers are marked by a small star *image* placed
before the reference (Word alt text: "Stella con riempimento a tinta
unita"). Ordinary text converters drop images, and the star with them;
here every starred paragraph is printed with a leading "★ ".

Tables (e.g. teaching) are printed one row per line, cells joined by " | ".

Usage:  python3 tools/cv_extract.py /path/to/CV_LucaDAniello.docx > cv.txt
Standard library only.
"""
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
STAR_WORDS = re.compile(r"stell|star", re.I)
# Attributes where Word keeps an image's description (DrawingML and VML)
DESCR_ATTRS = ("descr", "title", "name", "alt",
               "{urn:schemas-microsoft-com:office:office}title")


def images_in(el):
    """Yield every drawing/VML image element inside el."""
    for node in el.iter():
        tag = node.tag.rsplit("}", 1)[-1]
        if tag in ("docPr", "shape", "imagedata"):
            yield node


def is_starred(p):
    imgs = list(images_in(p))
    if not imgs:
        return False
    for img in imgs:
        if any(STAR_WORDS.search(img.get(a, "")) for a in DESCR_ATTRS):
            return True
    # Fallback: an unlabelled image inside a list item is the star too
    return p.find(f"{W}pPr/{W}numPr") is not None


def para_text(p):
    out = []
    for node in p.iter():
        if node.tag == f"{W}t":
            out.append(node.text or "")
        elif node.tag == f"{W}tab":
            out.append("\t")
        elif node.tag in (f"{W}br", f"{W}cr"):
            out.append("\n")
    return re.sub(r"[ \t]+", " ", "".join(out)).strip()


def main(path):
    with zipfile.ZipFile(path) as z:
        body = ET.fromstring(z.read("word/document.xml")).find(f"{W}body")

    lines = []
    for el in body:
        if el.tag == f"{W}p":
            text = para_text(el)
            if not text:
                continue
            bullet = "- " if el.find(f"{W}pPr/{W}numPr") is not None else ""
            star = "★ " if is_starred(el) else ""
            lines.append(f"{bullet}{star}{text}")
        elif el.tag == f"{W}tbl":
            for row in el.iter(f"{W}tr"):
                cells = [" ".join(para_text(p) for p in tc.iter(f"{W}p")).strip()
                         for tc in row.iter(f"{W}tc")]
                if any(cells):
                    lines.append(" | ".join(cells))
    print("\n".join(lines))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
