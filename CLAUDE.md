# Revisión Conjunta del Programa

Repositorio de despliegue del instrumento anónimo con el que el colectivo docente del Técnico Laboral como Asistente en Desarrollo de Software (CESDE Medellín) mide dónde coincide y dónde no.

## El trabajo está repartido en tres carpetas

| Carpeta | Qué es |
|---|---|
| `Escritorio\colectivodocente` | **El archivo fuente.** `consultor-tech-expedicion.html` es donde se edita el instrumento, y `generar-revision-vercel.js` genera desde él el `index.html` de este repositorio. |
| `Escritorio\revision-conjunta` | **Este repositorio.** Lo que se despliega en Vercel: la página, la API del tablero y la conexión a MongoDB. |
| `Escritorio\matriz-consultor` | El Observatorio Curricular (`observatoriocurricular.vercel.app`), de donde salen los datos de alineación del paso 06. No se toca desde aquí. |

## Regla importante

**`index.html` no se edita en este repositorio.** Se sobrescribe cada vez que se regenera. Para cambiar el instrumento:

1. Editar `..\colectivodocente\consultor-tech-expedicion.html`.
2. Republicar el artifact (mismo URL, se pasa como `url`).
3. `cd ..\colectivodocente && node generar-revision-vercel.js`.
4. Commit y push de este repositorio.

Si se salta el paso 3, Vercel sigue sirviendo la versión anterior mientras el enlace de Claude ya tiene la nueva.

## Transporte doble

La página detecta sola dónde corre: intenta `GET /api/revision` y, si no responde —lo que ocurre dentro del artifact—, cae a la capability `artifact` de Claude. Si ninguna funciona, sigue siendo usable en modo individual.

## Memoria compartida

La carpeta de memoria de este proyecto es un enlace (junction) a la de `colectivodocente`: las dos apuntan al mismo sitio, así que el contexto es el mismo se trabaje desde donde se trabaje.
