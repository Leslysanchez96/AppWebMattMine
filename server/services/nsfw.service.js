const tf = require("@tensorflow/tfjs");
const nsfw = require("nsfwjs");
const sharp = require("sharp");

let modelo = null;
let cargando = null;

async function cargarModelo() {
  if (modelo) return modelo;
  if (cargando) return cargando;
  cargando = nsfw.load().then((m) => {
    modelo = m;
    cargando = null;
    console.log("Modelo NSFW cargado.");
    return modelo;
  }).catch((err) => {
    cargando = null;
    throw err;
  });
  return cargando;
}

async function imagenATensor(imagePath) {
  // Leer imagen, redimensionar a 224x224 (input del modelo) y convertir a RGB raw
  const { data, info } = await sharp(imagePath)
    .resize(224, 224, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const tensor = tf.tensor3d(new Uint8Array(data), [info.height, info.width, 3], "int32");
  return tensor;
}

async function validar(imagePath) {
  const m = await cargarModelo();
  let image;
  try {
    image = await imagenATensor(imagePath);
  } catch (err) {
    console.error("Error decodificando imagen:", err.message);
    return { ok: false, motivo: "No se pudo procesar la imagen." };
  }
  const predictions = await m.classify(image);
  image.dispose();

  const probs = {};
  predictions.forEach((p) => { probs[p.className] = p.probability; });

  const PORN_LIMIT = 0.6;
  const HENTAI_LIMIT = 0.6;
  const SEXY_LIMIT = 0.7;

  if ((probs.Porn || 0) >= PORN_LIMIT) {
    return { ok: false, motivo: "Contenido inapropiado detectado en la imagen.", probs };
  }
  if ((probs.Hentai || 0) >= HENTAI_LIMIT) {
    return { ok: false, motivo: "Contenido inapropiado detectado en la imagen.", probs };
  }
  if ((probs.Sexy || 0) >= SEXY_LIMIT && (probs.Neutral || 0) < 0.3) {
    return { ok: false, motivo: "La imagen no es apropiada para una foto de perfil.", probs };
  }

  return { ok: true, probs };
}

module.exports = { validar, cargarModelo };
