import { useState } from "react";

export default function LandingCalculadora() {
  const [material, setMaterial] = useState("");
  const [m2, setM2] = useState("");
  const [terminacion, setTerminacion] = useState("media");
  const [uf, setUf] = useState("39462"); // CLP por UF (editable)
  const [resultado, setResultado] = useState(null);

  const bandas = {
    madera: [22, 28],
    sip: [23, 30],
    steel: [23, 30],
    albanileria: [24, 32],
    acero: [24, 32],
    hormigon: [26, 35],
    clt: [28, 38],
  };

  function calcular() {
    const m2Num = parseFloat(m2);
    const ufNum = parseFloat(uf);
    if (!material || !m2Num || !ufNum) return;

    let [min, max] = bandas[material];

    if (terminacion === "basica") {
      min = Math.max(min - 2, 18);
      max = Math.max(max - 2, 18);
    } else if (terminacion === "alta") {
      min += 3;
      max += 3;
    }

    const totalUFMin = m2Num * min;
    const totalUFMax = m2Num * max;
    const totalCLPMin = Math.round(totalUFMin * ufNum);
    const totalCLPMax = Math.round(totalUFMax * ufNum);

    setResultado({
      min,
      max,
      totalUFMin,
      totalUFMax,
      totalCLPMin,
      totalCLPMax,
    });
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold">Calculadora de referencia de obra</h1>
        <p className="text-sm text-gray-600">
          Valores referenciales (UF/m²). Resultado estimado en UF y CLP.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          className="border p-2 rounded"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
        >
          <option value="">Seleccione materialidad</option>
          <option value="madera">Madera liviana</option>
          <option value="sip">Paneles / SIP</option>
          <option value="steel">Steel framing</option>
          <option value="albanileria">Albañilería</option>
          <option value="acero">Acero</option>
          <option value="hormigon">Hormigón</option>
          <option value="clt">CLT / Madera laminada</option>
        </select>

        <input
          className="border p-2 rounded"
          type="number"
          min="1"
          step="1"
          placeholder="Superficie (m²)"
          value={m2}
          onChange={(e) => setM2(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={terminacion}
          onChange={(e) => setTerminacion(e.target.value)}
        >
          <option value="basica">Terminación básica</option>
          <option value="media">Terminación media</option>
          <option value="alta">Terminación alta</option>
        </select>

        <input
          className="border p-2 rounded"
          type="number"
          min="1"
          step="1"
          placeholder="UF del día (CLP)"
          value={uf}
          onChange={(e) => setUf(e.target.value)}
        />
      </section>

      <button
        onClick={calcular}
        className="w-full border p-3 rounded font-semibold hover:bg-gray-50"
      >
        Calcular
      </button>

      {resultado && (
        <section className="border rounded p-4 space-y-2">
          <h2 className="font-semibold">Resultado</h2>
          <p>
            UF/m²: {resultado.min} – {resultado.max}
          </p>
          <p>
            Total UF: {resultado.totalUFMin.toFixed(0)} –{" "}
            {resultado.totalUFMax.toFixed(0)}
          </p>
          <p>
            Total CLP: ${resultado.totalCLPMin.toLocaleString()} – $
            {resultado.totalCLPMax.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            Estos valores son referenciales y pueden variar según proyecto,
            normativa y ubicación.
          </p>
        </section>
      )}

      <footer className="text-center">
        <a href="#" className="underline">
          Obtener informe detallado (Pro)
        </a>
      </footer>
    </div>
  );
}
