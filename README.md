# elsrainbows.cat

Web estática con build de `webpack` para versionado de assets (`contenthash`).

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

## Build de producción (assets versionados)

```bash
npm install
npm run build
```

Salida en `dist/` con:
- JS/CSS hasheados
- imágenes/audio/video con nombre versionado
- `index.html` y `gracies.html` apuntando a los ficheros versionados

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

## Deploy en Netlify

Este repo ya incluye configuración en `netlify.toml`.

Pasos en Netlify:
1. `Add new site` -> `Import an existing project`.
2. Conecta el repositorio.
3. Build command: `npm run build`.
4. Publish directory: `dist`.
5. Deploy.

Si quieres dominio propio (`elsrainbows.cat`), en `Domain settings` añade el dominio y apunta los DNS según las instrucciones de Netlify.
