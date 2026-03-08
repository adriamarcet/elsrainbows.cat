# elsrainbows.cat

Web estática (`index.html` + `estils.css` + recursos multimedia).

## Ejecutar en local (simple)

```bash
cd </Path/To/Project/Folder/elsrainbows.cat>
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

## Tests unitarios

```bash
npm test
```

Cobertura actual:
- Toggle de menú móvil.
- Clase `is-scrolled` del header según scroll.
- Avance automático del slideshow cada 4s (salvo `prefers-reduced-motion`).
- Sincronización de dots activos con la slide activa.
- Año actual en footer.
