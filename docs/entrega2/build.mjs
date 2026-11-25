// Arma entrega2.html con el mismo diseño del entregable 1 y lo convierte a PDF con Chrome.
// Uso: node build.mjs   (desde docs/entrega2)
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath, pathToFileURL } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const estado = JSON.parse(fs.readFileSync(path.join(dir, "estado.json"), "utf8"));

// CSS del entregable 1 (desde <head> hasta antes de </style>)
const j1 = fs.readFileSync(path.join(dir, "../entregable_j1/entregable_j1.html"), "utf8");
const head = j1.slice(0, j1.indexOf("</style>")).replace(/<title>.*<\/title>/, "<title>Entrega 2 · Alta, edición y baja</title>");

const extraCss = `
  /* Recortes de capturas de Postman: región x 360-1410 px de una captura de 1456x819 */
  .crop{ position:relative; overflow:hidden; border:1px solid #222; margin:4px 0 4px; background:#1e1e1e; }
  .crop img{ position:absolute; width:138.667%; left:-34.286%; }
  .crop-tall{ aspect-ratio:1050/565; } .crop-tall img{ top:-15.04%; }
  .crop-short{ aspect-ratio:1050/515; } .crop-short img{ top:-16.50%; }
  .content ol li, .content ul li{ font-size:10.5pt; }
`;

const chrome = (inner, n, kind) => `
<section class="page">
  <img class="wm" src="assets/marca_agua.png" alt="">
  <img class="logo-l" src="assets/logo_tecnm.png" alt="TecNM">
  <img class="logo-r" src="assets/logo_itc.png" alt="ITC">
  ${inner}
  ${kind === "normal" ? `<div class="pnum">${n}</div>` : ""}
  <div class="foot">AGOSTO-DICIEMBRE 2026.</div>
</section>`;

let body = fs.readFileSync(path.join(dir, "body.html"), "utf8");
for (const [k, v] of Object.entries(estado)) body = body.replaceAll(`{{${k}}}`, v);

let n = 0;
body = body.replace(/<section class="page( cover-page| sep-page)?">([\s\S]*?)<\/section>/g, (_m, kind, inner) => {
  n += 1;
  return chrome(inner, n, kind ? "special" : "normal");
});

const html = `${head}${extraCss}</style>\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
const out = path.join(dir, "entrega2.html");
fs.writeFileSync(out, html);

const pdf = path.resolve(dir, "../../Entrega2_Alta_Edicion_Baja.pdf");
const chromeExe = "C:/Program Files/Google/Chrome/Application/chrome.exe";
execFileSync(chromeExe, [
  "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=8000",
  `--print-to-pdf=${pdf}`, pathToFileURL(out).href,
], { stdio: "ignore" });
console.log(`OK ${n} páginas → ${pdf}`);
