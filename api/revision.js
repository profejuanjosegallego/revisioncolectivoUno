// Tablero compartido de la revisión conjunta del programa.
// Cada docente guarda un registro anónimo identificado por un id aleatorio que
// genera su propio navegador: aquí no entra ni se almacena ningún nombre.
const { getDb } = require('../lib/mongo');

const SESION_POR_DEFECTO = '2026-08';
const MAX_BYTES = 24 * 1024;
const MAX_PARTICIPANTES = 200;

function limpiarSesion(v) {
  const s = String(v || '').trim();
  return /^[A-Za-z0-9_-]{1,40}$/.test(s) ? s : SESION_POR_DEFECTO;
}

module.exports = async (req, res) => {
  try {
    const db = await getDb();
    const col = db.collection('revision');

    if (req.method === 'GET') {
      const sesion = limpiarSesion(req.query && req.query.sesion);
      const docs = await col
        .find({ sesion }, { projection: { _id: 0, pid: 1, reg: 1 } })
        .limit(MAX_PARTICIPANTES)
        .toArray();

      const participantes = {};
      docs.forEach((d) => {
        if (d && d.pid && d.reg) participantes[d.pid] = d.reg;
      });

      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ v: 3, sesion, participantes });
    }

    if (req.method === 'POST') {
      const b = req.body || {};
      const sesion = limpiarSesion(b.sesion);
      const pid = String(b.pid || '').trim();
      const reg = b.reg;

      if (!/^p[a-z0-9]{4,24}$/.test(pid)) {
        return res.status(400).json({ error: 'Identificador de participante inválido' });
      }
      if (!reg || typeof reg !== 'object' || Array.isArray(reg)) {
        return res.status(400).json({ error: 'Registro inválido' });
      }
      if (Buffer.byteLength(JSON.stringify(reg), 'utf8') > MAX_BYTES) {
        return res.status(413).json({ error: 'Registro demasiado grande' });
      }

      const total = await col.countDocuments({ sesion });
      const existe = await col.countDocuments({ sesion, pid });
      if (!existe && total >= MAX_PARTICIPANTES) {
        return res.status(429).json({ error: 'La sesión alcanzó el máximo de participantes' });
      }

      const now = new Date();
      await col.updateOne(
        { sesion, pid },
        { $set: { sesion, pid, reg, updatedAt: now }, $setOnInsert: { createdAt: now } },
        { upsert: true }
      );
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
