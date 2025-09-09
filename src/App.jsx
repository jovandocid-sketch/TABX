import React, { useMemo, useState } from "react";

/** ====== RANGOS UF/m² – versión FULL (honorarios de PROYECTO) ====== */
const RANGOS = {
  "Vivienda de interés social": [0.35, 0.40, 0.45],
  "Vivienda económica": [0.45, 0.525, 0.60],
  "Vivienda social estandarizada": [0.60, 0.675, 0.75],
  "Vivienda unifamiliar": [0.80, 0.90, 1.00],
  "Vivienda unifamiliar premium": [1.10, 1.25, 1.40],
  "Viviendas turísticas / Refugios / Hostales": [1.00, 1.30, 1.60],

  "Interiorismo residencial (proyecto)": [0.50, 1.00, 1.50],
  "Interiorismo comercial básico (proyecto)": [0.50, 1.00, 1.00],
  "Interiorismo comercial alta gama (proyecto)": [1.00, 1.50, 2.00],

  "Regularización (genérica)": [0.33, 0.39, 0.45],

  "Recepción Final – Estándar (proyecto propio)": [0.10, 0.125, 0.15],
  "Recepción Final – Compleja": [0.15, 0.175, 0.20],
  "Recepción Final – Encargo aislado (+recargo)": [0.18, 0.22, 0.26]
};

const TIPOS = Object.keys(RANGOS);

function fUF(n) {
  return `${(Number(n) || 0).toFixed(2)} UF`;
}

function fCLP(n) { return (Number(n)||0).toLocaleString("es-CL", { style:"currency", currency:"CLP", maximumFractionDigits:0 }); }

export default function App() {
  const [tipo, setTipo] = useState("Vivienda unifamiliar");
  const [m2, setM2] = useState(100);
  const [ufCLP, setUfCLP] = useState(39428);   // editable; botón intenta traer automático
  const [recargo, setRecargo] = useState(0);   // %
  const [costoObra, setCostoObra] = useState("");

// === OBRA por materialidad (usará tus m2 y UF existentes) ===
const [material, setMaterial] = useState("");
const [terminacion, setTerminacion] = useState("media");

// Bandas base (terminación media) en UF/m²
const BANDAS_OBRA = {
  "Madera (entramado liviano)": [22, 28],
  "Paneles / SIP / EPS": [23, 30],
  "Steel Framing liviano": [23, 30],
  "Albañilería (confinada/armada)": [24, 32],
  "Acero (perfiles/mixto)": [24, 32],
  "Hormigón armado": [26, 35],
  "CLT / Madera laminada": [28, 38],
};

// Cálculo de la banda ajustada y totales
const obraPorMaterial = useMemo(() => {
  if (!material) return null;
  let [min, max] = BANDAS_OBRA[material];

  if (terminacion === "basica") {
    min = Math.max(min - 2, 18);
    max = Math.max(max - 2, 18);
  } else if (terminacion === "alta") {
    min += 3;
    max += 3;
  }

  const totalUFMin = (Number(m2) || 0) * min;
  const totalUFMax = (Number(m2) || 0) * max;
  const totalCLPMin = Math.round(totalUFMin * (Number(ufCLP) || 0));
  const totalCLPMax = Math.round(totalUFMax * (Number(ufCLP) || 0));

  return { min, max, totalUFMin, totalUFMax, totalCLPMin, totalCLPMax };
}, [material, terminacion, m2, ufCLP]);


  const [bajo, medio, alto] = useMemo(() => RANGOS[tipo], [tipo]);
  const factor = 1 + (Number(recargo) || 0) / 100;

  const resultados = useMemo(() => {
    const calc = (t) => {
      const ufTotal = (Number(m2)||0) * t * factor;
      return {
        tasa: t,
        ufTotal,
        clpTotal: ufTotal * (Number(ufCLP)||0)
      };
    };
    return { bajo: calc(bajo), medio: calc(medio), alto: calc(alto) };
  }, [bajo, medio, alto, m2, ufCLP, factor]);

  const obraTotal = useMemo(() => {
    const v = Number(costoObra);
    if (!v || v <= 0) return null;
    return v * (Number(m2)||0);
  }, [costoObra, m2]);

  async function obtenerUF() {
    try {
      const res = await fetch("https://mindicador.cl/api/uf");
      const data = await res.json();
      const valor = Number(data?.serie?.[0]?.valor);
      if (valor > 0) setUfCLP(Math.round(valor));
      else alert("No se pudo leer la UF automática. Ingresa manual.");
    } catch (e) {
      alert("Error de conexión al obtener UF. Ingresa manual.");
    }
  }

  return (
    <div style={wrap}>
 <header style={{ width: "100%", marginBottom: 32 }}>
  {/* Fila superior: logo izquierda + CTA derecha */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16
    }}
  >
    <img
      src="/logos/joc.png"
      alt="J. Ovando Cid & Arquitectos"
      style={{ height: 100, objectFit: "contain" }}
    />

    <a href="mailto:contacto@jovandocid.com" style={btnSolid}>
      Solicitar cotización por correo
    </a>
  </div>

  {/* Título y subtítulo centrados */}
  <h1
    style={{
      fontSize: "clamp(20px, 5vw, 32px)",
      fontWeight: 800,
      margin: "0 0 8px 0",
      textAlign: "center"
    }}
  >
    PINAKE - X
  </h1>

  <h2
    style={{
      fontSize: "clamp(16px, 4vw, 18px)",
      fontWeight: 500,
      color: "#555",
      margin: 0,
      textAlign: "center",
      lineHeight: 1.4
    }}
  >
   Calcula el precio de tu proyecto de arquitectura en segundos.<br />
    UF/m² → Honorarios UF &amp; CLP
  </h2>
</header>


      <section style={panel}>
        <label style={label}>Tipo / destino</label>
        <select value={tipo} onChange={(e)=>setTipo(e.target.value)} style={input}>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div style={subtle}>Rango UF/m²: {fUF(bajo)} · {fUF(medio)} · {fUF(alto)}</div>
      </section>

      <section style={{...grid, marginTop:12}}>
        <div>
          <label style={label}>Superficie (m²)</label>
        <input type="number" value={m2} onChange={(e)=>setM2(Math.max(0, Number(e.target.value)))} style={inputNarrow} />
        </div>
        <div>
          <label style={label}>Valor UF (CLP)</label>
          <div style={{ display:"flex", gap:8 }}>
            <input type="number" value={ufCLP} onChange={(e)=>setUfCLP(Math.max(1, Number(e.target.value)))} style={{...input, flex:1}} />
            <button onClick={obtenerUF} style={btnGhost}>UF automática</button>
          </div>
          <div style={{ ...subtle, marginTop: 6 }}>
            Si la UF automática falla, ingrésala manualmente (SII mensual).
          </div>
        </div>
        <div>
          <label style={label}>Recargo (%)</label>
         <input type="number" value={recargo} onChange={(e)=>setRecargo(Math.max(0, Number(e.target.value)))} style={inputNarrow} />
          <div style={{ ...subtle, marginTop: 6 }}>Para encargos aislados u otras condiciones especiales.</div>
        </div>
      </section>

      <section style={{...grid, marginTop:18}}>
        {["bajo","medio","alto"].map((k,i) => (
          <div key={k} style={card}>
            <div style={chip}>{k.toUpperCase()}</div>
            <div style={ufTotal}>{fUF(resultados[k].ufTotal)}</div>
            <div style={clpTotal}>{fCLP(resultados[k].clpTotal)}</div>
            <div style={base}>Base: {fUF(resultados[k].tasa)} · m²: {m2}{recargo?` · recargo: ${recargo}%`:""}</div>
          </div>
        ))}
      </section>

      <section style={{ ...panel, marginTop: 18 }}>
  <h3 style={h3}>Referencia de OBRA por materialidad</h3>

  <div style={{ display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))" }}>
    <div>
      <label style={label}>Materialidad</label>
      <select style={input} value={material} onChange={(e)=>setMaterial(e.target.value)}>
        <option value="">Selecciona un material</option>
        {Object.keys(BANDAS_OBRA).map(m => <option key={m} value={m}>{m}</option>)}
      </select>
    </div>

    <div>
      <label style={label}>Terminación</label>
      <select style={input} value={terminacion} onChange={(e)=>setTerminacion(e.target.value)}>
        <option value="basica">Básica</option>
        <option value="media">Media</option>
        <option value="alta">Alta</option>
      </select>
      <div style={{ ...subtle, marginTop: 6 }}>
        Ajuste simple: básica (−2), media (0), alta (+3) UF/m².
      </div>
    </div>

    <div>
      <label style={label}>Superficie (m²)</label>
      <input style={input} type="number" value={m2} readOnly />
      <div style={{ ...subtle, marginTop: 6 }}>Usa la misma superficie definida arriba.</div>
    </div>

    <div>
      <label style={label}>Valor UF (CLP)</label>
      <input style={input} type="number" value={ufCLP} readOnly />
      <div style={{ ...subtle, marginTop: 6 }}>Usa la misma UF de tu calculadora.</div>
    </div>
  </div>

  {obraPorMaterial && (
    <div style={{ marginTop: 14 }}>
      <div style={{ marginBottom:6, fontWeight:700 }}>
        UF/m² estimado (rango): {obraPorMaterial.min} – {obraPorMaterial.max}
      </div>

      <div style={{ display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))" }}>
        <div style={{ border:"1px solid #eaeaea", borderRadius:16, padding:16, background:"#fff" }}>
          <div style={{ fontSize:12, color:"#666", letterSpacing:1, textTransform:"uppercase" }}>Total UF</div>
          <div style={{ fontSize:22, fontWeight:800 }}>
            {Math.round(obraPorMaterial.totalUFMin)} – {Math.round(obraPorMaterial.totalUFMax)} UF
          </div>
        </div>
        <div style={{ border:"1px solid #eaeaea", borderRadius:16, padding:16, background:"#fff" }}>
          <div style={{ fontSize:12, color:"#666", letterSpacing:1, textTransform:"uppercase" }}>Total CLP</div>
          <div style={{ fontSize:22, fontWeight:800 }}>
          ${obraPorMaterial.totalCLPMin.toLocaleString("es-CL")} – ${obraPorMaterial.totalCLPMax.toLocaleString("es-CL")}

          </div>
        </div>
      </div>

      <p style={{ ...subtle, marginTop:10 }}>
        * Valores referenciales “llave en mano” por materialidad y terminación. Pueden variar según proyecto, normativa y ubicación.
      </p>
    </div>
  )}
</section>

<section style={{ ...panel, marginTop: 18 }}>
  <h3 style={h3}><strong>Alcance general</strong></h3>
  <ul style={ul}>
    <li>
      <strong>Proyectos nuevos:</strong> Desarrollo de proyecto (según tipo/destino) con antecedentes completos para la
      obtención y gestión del Permiso de Edificación. <em>Este valor no incluye la Recepción Final.</em>
    </li>
    <li>
      <strong>Regularizaciones:</strong> Desarrollo de proyectos de regularización (según tipo/destino) hasta obtener la Recepción Final.
    </li>
    <li>
      <strong>Coordinación básica de especialidades:</strong> Gestión y coordinación mínima con especialistas (estructuras, instalaciones y eficiencia energética), según el alcance contratado.
    </li>
    <li>
      <strong>Encargos aislados:</strong> Para solicitudes puntuales de Recepción Final, se incluye revisión del expediente municipal y ajustes mínimos en planimetría para su aprobación.
    </li>
    <li>
      <strong>Valores de referencia:</strong> Todos los montos expresados corresponden a honorarios brutos.
    </li>
  </ul>

  <h3 style={h3}><strong>Notas</strong></h3>
  <ul style={ul}>
    <li>Los honorarios de proyecto no se incluyen dentro de los costos de construcción.</li>
    <li>En interiorismo, los valores consideran solo el desarrollo de proyecto, sin mobiliario ni materiales de ejecución.</li>
    <li>Se aplicará un recargo adicional en casos de encargos aislados, condiciones singulares, viajes frecuentes o situaciones de urgencia.</li>
  </ul>

  <h3 style={h3}><strong>Descargo</strong></h3>
  <p style={p}>
    <strong>Si eres cliente:</strong> Esta herramienta entrega rangos referenciales para orientarte. La propuesta definitiva puede variar según complejidad, ubicación, normativa y alcances específicos. Fue creada por J. Ovando Cid &amp; Arquitectos con el propósito de guiarte en la etapa inicial, cuando recién comienzas a imaginar tu proyecto.
  </p>
  <p style={p}>
    <strong>Si eres arquitecto:</strong> Esta herramienta entrega rangos referenciales de honorarios. No reemplaza el análisis particular de los costos directos de tu oficina en cada etapa. Fue creada por J. Ovando Cid &amp; Arquitectos con la intención de compartir criterios de referencia, especialmente útiles para colegas recién titulados como un primer acercamiento a la estructuración de honorarios.
  </p>
</section>





<section style={{ ...panel, marginTop: 18 }}>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
      flexWrap: "wrap",
    }}
  >
    {/* Columna izquierda: mailto + imprimir + banner */}
    <div style={{ display:"flex", flexDirection:"column", gap:10, flex:"0 0 300px" }}>
      <a
        href="mailto:contacto@jovandocid.com"
        style={{
          ...btnSolid,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: 44,
          padding: "0 16px",
          borderRadius: 12,
          whiteSpace: "nowrap",
        
        }}
        onClick={() => {
          if (window.gtag) {
            window.gtag("event", "click", {
              event_category: "CTA",
              event_label: "Solicitar cotización por correo",
            });
          }
        }}
      >
        Solicitar cotización por correo
      </a>

     <button
  onClick={() => window.print()}
  style={{ ...btnGhost, width: "100%", display: "block", boxSizing: "border-box" }}
>
  Imprimir
</button>



    {/* Banner publicitario debajo de Imprimir */}
<div
  style={{
    marginTop: 8,
    width: "100%",
    display: "block",
    boxSizing: "border-box",
    padding: "8px",
    background: "#f9fafb",
    border: "1px dashed #ccc",
    borderRadius: 10,
    textAlign: "center",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center"
  }}
>
  <span style={{ fontSize: 13, color: "#666" }}>🔒 Espacio reservado para publicidad</span>
</div>


</div>


    {/* Columna derecha: Formulario en recuadro */}
    <div style={{ flex: "1 1 360px", maxWidth: 520 }}>
      <div style={{ border: "1px solid #eaeaea", borderRadius: 14, padding: 14, background: "#fff" }}>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "#666" }}>
          ¿No usas cliente de correo? Completa este formulario:
        </p>

        <form
          action="https://formspree.io/f/mldwzgad"
          method="POST"
          onSubmit={() => {
            if (window.gtag) {
              window.gtag("event", "submit", {
                event_category: "Formulario",
                event_label: "Formspree – PINAKE-X",
              });
            }
          }}
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          <input
            name="name"
            type="text"
            placeholder="Tu nombre"
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
          <input
            name="email"
            type="email"
            placeholder="Tu correo"
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
          <textarea
            name="message"
            placeholder="Escribe tu mensaje"
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd", minHeight: 90 }}
          />
          <input type="hidden" name="_subject" value="Consulta desde PINAKE-X" />
          <input type="text" name="_gotcha" style={{ display: "none" }} tabIndex="-1" autoComplete="off" />

          <button type="submit" style={{ ...btnSolid, height: 44, borderRadius: 12 }}>
            Enviar con Formulario
          </button>
        </form>
      </div>
    </div>
  </div>
</section>



<footer style={{
  display: "flex",
  justifyContent: "space-between",  // ← reparte izquierda/derecha
  alignItems: "center",
  marginTop: 20,
  color: "#666",
  fontSize: 13,
  flexWrap: "wrap"
}}>
  {/* Texto a la izquierda */}
  <div>
    Desarrollado por <strong>J. Ovando Cid & Arquitectos</strong> Línea Do+Lab
  </div>

  {/* Logo a la derecha */}
  <img
    src="/logos/dolab.png"
    alt="Do+Lab"
    style={{ height: 80, objectFit: "contain" }}
  />
</footer>

<div style={{
  marginTop: 8,
  padding: "12px",
  background: "#f3f4f6",
  textAlign: "center",
  fontSize: 13,
  color: "#555",
  borderRadius: "0 0 14px 14px",
  lineHeight: 1.6
}}>
  Calle Dieciocho 420, Estudio 204 · Santiago de Chile<br/>
  Tel: +56 9 5629 1204 · (2) 2297 5958<br/>
  contacto@jovandocid.com ·{" "}
  <a href="https://www.instagram.com/jovandocid_arqs"
     target="_blank"
     rel="noopener noreferrer"
     style={{ color: "#111", fontWeight: 600, textDecoration: "none" }}>
    Instagram: @jovandocid_arqs
  </a>
</div>

    </div>
  );
}

const wrap = { fontFamily:"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto", padding:"24px", maxWidth:1100, margin:"0 auto" };
const header = { display:"flex", alignItems:"center", gap:16, marginBottom:16, flexWrap:"wrap" };
const logos = { display:"flex", alignItems:"center", gap:10 };
const h1 = { fontSize:26, margin:0, lineHeight:1.1 };
const h3 = { fontSize:18, margin:"0 0 8px 0" };
const p  = { margin:"6px 0", color:"#333" };
const panel = { border:"1px solid #eaeaea", borderRadius:14, padding:14, background:"#fff" };
const grid  = { display:"grid", gap:14, gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))" };
const input = {
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #ccc",
  outline: "none",
  fontSize: 16
};

const inputNarrow = {
  ...input,
  maxWidth: 260   // hace "Superficie (m²)" un poco más corto
};

const label = { display:"block", fontWeight:600, marginBottom:6 };
const subtle = { color:"#666", fontSize:13 };
const card = { border:"1px solid #eaeaea", borderRadius:16, padding:16, background:"#fff", boxShadow:"0 1px 2px rgba(0,0,0,.04)" };
const chip = { fontSize:12, color:"#666", letterSpacing:1, textTransform:"uppercase", marginBottom:6 };
const ufTotal = { fontSize:22, fontWeight:800, marginBottom:2 };
const clpTotal = { fontWeight:700, marginBottom:8, color:"#111" };
const base = { fontSize:12, color:"#777" };
const btnSolid = {
  display: "inline-block",
  padding: "clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)",
  borderRadius: 12,
  background: "#111",
  color: "#fff",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "clamp(13px, 2vw, 16px)"
};

const btnGhost = {
  padding: "clamp(8px, 2vw, 12px) clamp(12px, 3vw, 14px)",
  borderRadius: 12,
  background: "#f3f4f6",
  border: "1px solid #e5e7eb",
  cursor: "pointer",
  fontSize: "clamp(13px, 2vw, 16px)"
};
const ul = { margin:"6px 0 2px 0", paddingLeft: "20px" };
const footer = { marginTop:28, color:"#666", fontSize:13, display:"flex", gap:6, flexWrap:"wrap" };

