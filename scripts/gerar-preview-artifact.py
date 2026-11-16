#!/usr/bin/env python3
"""Converte dist-preview/index.html (npm run build:preview) no arquivo da pré-visualização do claude.ai.

Uso: python3 scripts/gerar-preview-artifact.py <arquivo-de-saida.html>
O Artifact já tem <html>, <head> e <body> próprios: este script tira essas tags,
o charset, o viewport e os ícones, e põe o script do app depois do <div id="root">.
"""
import re
import sys

s = open('dist-preview/index.html', encoding='utf-8').read()
head = re.search(r'<head>(.*)</head>', s, re.S).group(1)
body = re.search(r'<body>(.*)</body>', s, re.S).group(1)
head = re.sub(r'<meta charset[^>]*>\s*|<meta name="viewport"[^>]*>\s*|<link rel="(icon|apple-touch-icon)"[^>]*>\s*', '', head)
scripts = re.findall(r'<script type="module"[^>]*>.*?</script>', head, re.S)
for sc in scripts:
    head = head.replace(sc, '')
open(sys.argv[1], 'w', encoding='utf-8').write(head.strip() + '\n' + body.strip() + '\n' + '\n'.join(scripts) + '\n')
print('Pré-visualização gravada em', sys.argv[1])
