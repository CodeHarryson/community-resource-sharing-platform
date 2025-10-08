from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Preformatted
from reportlab.lib.colors import Color
import re
import textwrap
import os
import time

IN = 'docs/PORTFOLIO_GUIDE.md'
OUT = 'docs/PORTFOLIO_GUIDE.pdf'

def split_into_blocks(md):
    """Split markdown into blocks (code vs text)."""
    parts = []
    current = []
    in_code = False
    
    for line in md.split('\n'):
        if line.startswith('```'):
            if in_code:
                parts.append(('code', '\n'.join(current)))
                current = []
            else:
                if current:
                    parts.append(('text', '\n'.join(current)))
                current = []
            in_code = not in_code
            continue
        current.append(line)
    
    if current:
        parts.append(('text' if not in_code else 'code', '\n'.join(current)))
    
    return parts

def main():
    if not os.path.exists(IN):
        print('Input markdown not found:', IN)
        return

    with open(IN, 'r', encoding='utf-8') as f:
        md = f.read()

    # Create PDF with better formatting
    doc = SimpleDocTemplate(OUT, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
    styles = getSampleStyleSheet()
    
    # Custom styles
    styles.add(ParagraphStyle(
        name='CodeBlock',
        parent=styles['Code'],
        fontSize=9,
        leading=11,
        backColor=Color(0.9, 0.9, 0.9),  # Light grey
    ))
    
    story = []
    
    # Process markdown blocks
    blocks = split_into_blocks(md)
    for block_type, content in blocks:
        if block_type == 'code':
            # Format code blocks with a grey background
            p = Preformatted(content, styles['CodeBlock'])
            story.append(p)
            story.append(Spacer(1, 12))
        else:
            # Process text blocks line by line
            lines = content.split('\n')
            for line in lines:
                if not line.strip():
                    story.append(Spacer(1, 12))
                    continue
                    
                # Headers
                if line.startswith('#'):
                    level = len(re.match(r'^#+', line).group(0))
                    text = line.lstrip('#').strip()
                    if level == 1:
                        p = Paragraph(text, styles['Title'])
                    elif level == 2:
                        p = Paragraph(text, styles['Heading2'])
                    else:
                        p = Paragraph(text, styles['Heading3'])
                else:
                    # Regular paragraph
                    p = Paragraph(line, styles['Normal'])
                story.append(p)
                story.append(Spacer(1, 6))
    
    # Build PDF
    doc.build(story)
    print('Wrote PDF to', OUT)

if __name__ == '__main__':
    main()