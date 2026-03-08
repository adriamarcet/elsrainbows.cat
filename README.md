# elsrainbows.cat

Web estática (`index.html` + `estils.css` + recursos multimedia).

## Ejecutar en local (simple)

```bash
cd /Users/adria/Sites/02.elsrainbows.cat/elsrainbows.cat
python3 -m http.server 5173
```

Abrir: `http://localhost:5173`

## Ejecutar en local (más cómodo para editar)

Si quieres auto-recarga del navegador:

```bash
npx --yes live-server --port=5173 --open=index.html
```

## Base visual usada

- `PicoCSS` vía CDN para tener un set base accesible y consistente.
- `estils.css` mantiene la identidad visual del proyecto (colores, hero, galerías, etc.).
