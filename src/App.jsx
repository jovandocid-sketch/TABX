import React, { useMemo, useState, useEffect } from "react";
import "./App.css";


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
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const onChange = () => setIsDesktop(mq.matches);
    onChange(); // valor inicial
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

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
 <section style={{ ...panel, marginTop: 18, textAlign: "center" }}>
  <h1 style={{ fontSize: "clamp(24px, 6vw, 40px)", fontWeight: 800, marginBottom: 8 }}>
    TABX
  </h1>

  {/* Claim (frase breve y persuasiva) */}
  <p style={{ fontSize: "clamp(16px, 4vw, 22px)", fontWeight: 600, marginBottom: 12 }}>
    Simula el precio de tu proyecto en segundos.
  </p>

  {/* Subtítulo (explicación descriptiva, sin repetir “segundos”) */}
  <p style={{ fontSize: "clamp(14px, 3vw, 18px)", fontWeight: 400, maxWidth: 700, margin: "0 auto" }}>
    TABX-tech: tabla de precios para arquitectura y construcción. Integra honorarios en UF/m² y CLP.
  </p>
</section>

</header>


      <section style={panel}>
        <h3 style={h3}>Referencia de HONORARIOS por tipo/destino</h3>
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
  <details open={isDesktop}>
    <summary style={{ fontWeight: 600, cursor: "pointer", marginBottom: 6 }}>
     <strong>Alcance general</strong>
    </summary>
    <ul style={ul}>
      <li>
        <strong>Proyectos nuevos:</strong> Desarrollo de proyecto (según tipo/destino) con antecedentes completos para la obtención y gestión del Permiso de Edificación. <em>Este valor no incluye la Recepción Final.</em>
      </li>
      <li>
        <strong>Regularizaciones:</strong> Desarrollo de proyectos de regularización (según tipo/destino) hasta obtener la Recepción Final.
      </li>
      <li>
        <strong>Coordinación básica de especialidades:</strong> Gestión y coordinación mínima con especialistas (estructuras, instalaciones y eficiencia energética).
      </li>
      <li>
        <strong>Encargos aislados:</strong> Para solicitudes puntuales de Recepción Final, incluye revisión de expediente municipal y ajustes mínimos en planimetría.
      </li>
      <li>
        <strong>Valores de referencia:</strong> Todos los montos expresados corresponden a honorarios brutos.
      </li>
    </ul>
  </details>

  <details open={isDesktop}>
    <summary style={{ fontWeight: 600, cursor: "pointer", margin: "12px 0 6px" }}>
      <strong>Notas</strong>
    </summary>
    <ul style={ul}>
      <li>Los honorarios de proyecto no se incluyen dentro de los costos de construcción.</li>
      <li>En interiorismo, los valores consideran solo el desarrollo de proyecto, sin mobiliario ni materiales de ejecución.</li>
      <li>Se aplicará un recargo adicional en casos de encargos aislados, condiciones singulares, viajes frecuentes o situaciones de urgencia.</li>
    </ul>
  </details>

  <details open={isDesktop}>
    <summary style={{ fontWeight: 600, cursor: "pointer", margin: "12px 0 6px" }}>
      <strong>¿Para quién es esta herramienta?</strong>
    </summary>
    <p style={p}>
      <strong>Si eres cliente:</strong> Esta herramienta entrega rangos referenciales para orientarte. La propuesta definitiva puede variar según complejidad, ubicación, normativa y alcances específicos.
    </p>
    <p style={p}>
      <strong>Si eres arquitecto:</strong> Esta herramienta entrega rangos referenciales de honorarios. No reemplaza el análisis particular de los costos directos de tu oficina en cada etapa. Fue creada con la intención de compartir criterios de referencia, especialmente útiles para colegas recién titulados como un primer acercamiento a la estructuración de honorarios.
    </p>
  </details>
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



  {/* Banner publicitario debajo de Imprimir (enlace a tu web) */}
<a
  href="https://jovandocid.com"
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => {
    if (window.gtag) {
      window.gtag("event", "click", {
        event_category: "Banner",
        event_label: "Banner JOCA (footer lateral)",
      });
    }
  }}
  style={{
    marginTop: 8,
    width: "100%",
    display: "flex",
    boxSizing: "border-box",
    padding: "10px 14px",
    background:
      "linear-gradient(90deg, rgba(17,17,17,1) 0%, rgba(34,34,34,1) 100%)",
    border: "1px solid #111",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    textDecoration: "none",
    cursor: "pointer",
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <img
      src="/logos/joc.png"
      alt="J. Ovando Cid & Arquitectos"
      style={{ height: 28, objectFit: "contain", filter: "invert(1)" }}
    />
    <div style={{ color: "#fff" }}>
      <div style={{ fontWeight: 800, fontSize: 14 }}>
        J. Ovando Cid & Arquitectos
      </div>
      <div style={{ opacity: 0.85, fontSize: 12, lineHeight: 1.2 }}>
        Conoce nuestros proyectos →
      </div>
    </div>
  </div>

  <span
    style={{
      color: "#fff",
      fontSize: 12,
      opacity: 0.85,
      whiteSpace: "nowrap",
    }}
  >
    Visitar sitio
  </span>
</a>

{/* Bloque redes bajo el banner (columna izquierda) */}

{/* Bloque redes para DESKTOP */}

<div className="redes-desktop" style={{
  marginTop: 8,
  padding: "8px",
  border: "1px solid #eaeaea",
  borderRadius: 10,
  background: "#fff",
  textAlign: "center"
}}>
  <div style={{ fontSize: 12, color: "#444", marginBottom: 6, fontWeight: 600 }}>
    Síguenos en redes sociales
  </div>
  <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
    <a href="https://www.instagram.com/jovandocid_arqs" target="_blank" rel="noopener noreferrer"
       onClick={() => window.gtag && window.gtag("event","click",{event_category:"Social",event_label:"Instagram (sidebar)"})}
       title="Instagram" aria-label="Instagram" style={{ color:"#111", textDecoration:"none" }}>
      {/* IG (SVG) */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM18 6.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
      </svg>
    </a>
    <a href="https://www.youtube.com/channel/UCcfN96iCWGcqP56pyz6X_eg" target="_blank" rel="noopener noreferrer"
       onClick={() => window.gtag && window.gtag("event","click",{event_category:"Social",event_label:"YouTube (sidebar)"})}
       title="YouTube" aria-label="YouTube" style={{ color:"#111", textDecoration:"none" }}>
      {/* YouTube (SVG) */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.5 7.2a3.1 3.1 0 0 0-2.2-2.2C19.4 4.5 12 4.5 12 4.5s-7.4 0-9.3.5A3.1 3.1 0 0 0 .5 7.2 32.2 32.2 0 0 0 0 12a32.2 32.2 0 0 0 .5 4.8 3.1 3.1 0 0 0 2.2 2.2c1.9.5 9.3.5 9.3.5s7.4 0 9.3-.5a3.1 3.1 0 0 0 2.2-2.2A32.2 32.2 0 0 0 24 12a32.2 32.2 0 0 0-.5-4.8zM9.75 15.02v-6l6 3-6 3z"/>
      </svg>
    </a>
    <a href="https://www.linkedin.com/in/jaime-ovando-cid-1a622a38/" target="_blank" rel="noopener noreferrer"
       onClick={() => window.gtag && window.gtag("event","click",{event_category:"Social",event_label:"LinkedIn (sidebar)"})}
       title="LinkedIn" aria-label="LinkedIn" style={{ color:"#111", textDecoration:"none" }}>
      {/* LinkedIn (SVG) */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.5 8.5h4.9V24H.5V8.5zM8.5 8.5h4.7v2.1h.1c.7-1.3 2.5-2.7 5.1-2.7 5.5 0 6.5 3.6 6.5 8.3V24h-4.9v-6.8c0-1.6 0-3.7-2.3-3.7s-2.6 1.8-2.6 3.6V24H8.5V8.5z"/>
      </svg>
    </a>
  </div>
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
<div className="redes-mobile">
  {/* iconos o links aquí */}
</div>

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
  contacto@jovandocid.com
  <br/><br/>

</div>


    </div>
  );
}

const wrap = { fontFamily:"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto", padding:"24px", maxWidth:1100, margin:"0 auto" };
const header = { display:"flex", alignItems:"center", gap:16, marginBottom:16, flexWrap:"wrap" };
const logos = { display:"flex", alignItems:"center", gap:10 };
const h1 = { fontSize:26, margin:0, lineHeight:1.1 };
const h3 = { fontSize:"clamp(14px, 3vw, 18px)", margin:"0 0 8px 0" };
const p  = { fontSize:"clamp(13px, 2.5vw, 16px)", margin:"6px 0", color:"#333" };
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
const ul = { margin:"6px 0 2px 0", paddingLeft:"20px", fontSize:"clamp(13px, 2.5vw, 15px)" };
const footer = { marginTop:28, color:"#666", fontSize:13, display:"flex", gap:6, flexWrap:"wrap" };



