"""Generate the cacheable header SVG and inline mask from one source; stdlib only."""
from pathlib import Path
import copy
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
SVG = 'http://www.w3.org/2000/svg'
ET.register_namespace('', SVG)
ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')
source = ET.parse(ROOT / 'artwork/gta-vi-logo.svg').getroot()

# The mask needs only the silhouette and lettering, not the decorative layers.
base_ids = {
    'SVGID_1_',
    'SVGID_00000032645392918268761040000011977638184012716684_',
    'SVGID_00000073684341689665879260000002493633541776414870_',
}
geometry = []
for node in source.iter():
    cls = node.get('class')
    if node.get('id') not in base_ids and cls not in {'st8', 'st9', 'st10', 'st11'}:
        continue
    attrs = {k: re.sub(r'\s+', ' ', v).strip() for k, v in node.attrib.items()
             if k in {'d', 'points', 'x', 'y', 'width', 'height'}}
    attrs['fill'] = 'white' if cls in {'st10', 'st11'} else 'black'
    if cls in {'st8', 'st9', 'st11'}:
        attrs['fill-rule'] = 'evenodd'
    geometry.append('              <' + node.tag.split('}')[-1] + ' ' +
                    ' '.join(f'{k}="{v}"' for k, v in attrs.items()) + ' />')
page = ROOT / 'public/index.html'
html = page.read_text()
pattern = r'(<g id="finale-logo-mask"[^>]*>).*?(\n\s*</g>)'
html, count = re.subn(pattern, lambda m: m[1] + '\n' + '\n'.join(geometry) + m[2], html, count=1, flags=re.S)
if count != 1:
    raise ValueError('Expected exactly one inline finale mask')
page.write_text(html)

# Expand only used CSS classes, then remove unreachable definitions and metadata.
logo = copy.deepcopy(source)
styles = {}
for style in logo.findall(f'.//{{{SVG}}}style'):
    styles.update(re.findall(r'\.([\w-]+)\s*\{([^}]+)\}', style.text or ''))
for parent in logo.iter():
    for child in list(parent):
        if child.tag == f'{{{SVG}}}style':
            parent.remove(child)
for node in logo.iter():
    cls = node.attrib.pop('class', '')
    declarations = [styles[name] for name in cls.split() if name in styles]
    if declarations:
        node.set('style', ';'.join(declarations + [node.get('style', '')]).strip(';'))
    for key in ('d', 'points', 'style'):
        if key in node.attrib:
            node.set(key, re.sub(r'\s+', ' ', node.get(key)).strip())
    if node.text and not node.text.strip(): node.text = None
    if node.tail and not node.tail.strip(): node.tail = None

def references(node, skip_defs=False):
    if skip_defs and node.tag == f'{{{SVG}}}defs': return set()
    refs = set()
    for key, value in node.attrib.items():
        refs.update(re.findall(r'url\(#([^)]+)\)', value))
        if key.endswith('href') and value.startswith('#'): refs.add(value[1:])
    for child in node: refs.update(references(child, skip_defs))
    return refs

ids = {node.get('id'): node for node in logo.iter() if node.get('id')}
reachable = references(logo, skip_defs=True)
pending = list(reachable)
while pending:
    identifier = pending.pop()
    if identifier not in ids: continue
    extra = references(ids[identifier]) - reachable
    reachable.update(extra)
    pending.extend(extra)
for defs in logo.findall(f'.//{{{SVG}}}defs'):
    for child in list(defs):
        if child.get('id') not in reachable: defs.remove(child)
for node in logo.iter():
    if node.get('id') not in reachable: node.attrib.pop('id', None)
for key in ('version', 'x', 'y', 'style', '{http://www.w3.org/XML/1998/namespace}space'):
    logo.attrib.pop(key, None)
output = ROOT / 'public/assets/gta-vi-logo.v1.svg'
output.write_text(ET.tostring(logo, encoding='unicode') + '\n')
print(f'Generated {output.relative_to(ROOT)} ({output.stat().st_size} bytes) and {len(geometry)} mask shapes.')
