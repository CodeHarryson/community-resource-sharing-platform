from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
import textwrap
import os

IN = 'docs/COMPLETE_GUIDE.md'
OUT = 'docs/COMPLETE_GUIDE.pdf'

def render_text(c, text, x, y, max_width, leading=14):
    lines = []
    for paragraph in text.split('\n'):
        if not paragraph.strip():
            lines.append('')
            continue
        wrapped = textwrap.wrap(paragraph, width=100)
        lines.extend(wrapped)
    for line in lines:
        if y < inch:  # new page
            c.showPage()
            y = 10.5 * inch
            c.setFont('Helvetica', 10)
        c.drawString(x, y, line)
        y -= leading
    return y


def main():
    if not os.path.exists(IN):
        print('Input markdown not found:', IN)
        return
    with open(IN, 'r', encoding='utf-8') as f:
        md = f.read()
    c = canvas.Canvas(OUT, pagesize=letter)
    width, height = letter
    x = 72
    y = height - 72
    c.setFont('Helvetica-Bold', 18)
    title = 'Community Resource Sharing — Complete Guide'
    c.drawString(x, y, title)
    y -= 36
    c.setFont('Helvetica', 10)
    y = render_text(c, md, x, y, max_width=width - 144, leading=14)
    c.save()
    print('Wrote PDF to', OUT)

if __name__ == '__main__':
    main()
