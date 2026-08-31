# Revisión Conjunta del Programa

Instrumento anónimo para medir dónde converge y dónde diverge el colectivo docente del **Técnico Laboral como Asistente en Desarrollo de Software** · CESDE Medellín.

Ocho pasos: el caso de trabajo, tres bloques de preguntas sobre las nueve materias, el tablero de divergencias, la evidencia externa y el cierre con el acta descargable.

## Qué hay aquí

```
index.html        la página completa: marcado, estilos y lógica en un solo archivo
api/revision.js   el tablero compartido (función serverless)
lib/mongo.js      conexión reutilizable a MongoDB
dev-server.js     servidor local para probar antes de desplegar
```

`index.html` no se edita aquí. Se genera desde `colectivodocente/consultor-tech-expedicion.html`, que es el archivo fuente:

```bash
cd ../colectivodocente
node generar-revision-vercel.js
```

## Desplegar en Vercel

1. Crea el repositorio y súbelo.
2. En Vercel, **Add New → Project** e importa el repositorio. No hay framework ni paso de compilación: Vercel sirve `index.html` como estático y convierte `api/revision.js` en una función.
3. En **Settings → Environment Variables** añade las dos variables:

   | Variable | Valor |
   |---|---|
   | `MONGODB_URI` | la cadena de conexión de MongoDB Atlas |
   | `MONGODB_DB` | `cesde_consultor` |

4. Vuelve a desplegar para que la función tome las variables.

Sin esas dos variables la página funciona igual, pero cada docente ve solo sus propias respuestas: el tablero compartido no agrega nada.

## Probar en local

```bash
npm install
cp .env.example .env      # y completa MONGODB_URI
npm run dev               # http://localhost:4000
```

## Cómo funciona el tablero

Al abrirse, la página pide `GET /api/revision`. Si responde, guarda cada cambio con `POST` y refresca el conjunto cada 7 segundos, sin recargar. Si no responde, la página sigue siendo usable en modo individual y el acta se puede copiar al final.

Cada participante se identifica con un id aleatorio que su propio navegador guarda en `localStorage`. **No se pide ni se almacena ningún nombre.**

La URL acepta `?sesion=algo` para correr rondas separadas sin mezclar datos; por defecto usa `2026-08`.

## Fuentes de los datos del paso 06

Los índices de alineación y las brechas provienen del Observatorio Curricular del programa, calculados sobre el testeo empresarial CESDE–Comfama 2026, el panel de expertos sectoriales, el Estudio de Empleabilidad de Cenisoft 2025, la CUOC 2025 del DANE y el Marco Nacional de Cualificaciones (Decreto 1649 de 2021).
