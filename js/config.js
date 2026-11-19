/* ============================= CONFIGURACIÓN API ============================= */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxogLtZlqgk6wkzD6AjpM-WFJa19YjMwTI0pzx1bWwDLIIKMVZTWb5zqlUjiiaGazgH/exec"; 
/* ============================================================================== */

const RECEPTORES = ["Luli Echenique","Mati Comello","Mili Masloski","Pauli García"];

const DEFAULT_CONFIG = { ...PARAMETROS_FERIA, costoTotal: 120000, alias: "gmpinceles2026", pin: "0406", ventasCerradas: false };

const DEFAULT_RECETA = [
  {cat:"Ingredientes", ing:"Carne - kg", c50:15.3}, {cat:"Ingredientes", ing:"Cebolla - kg", c50:15.3}, {cat:"Ingredientes", ing:"Papa - kg", c50:4.5}, {cat:"Ingredientes", ing:"Verdeo - kg", c50:1.1}, {cat:"Ingredientes", ing:"Huevo - maple", c50:2.25}, {cat:"Ingredientes", ing:"Aceituna - kg", c50:2.75}, {cat:"Ingredientes", ing:"Tapa empanadas - doc", c50:50}, {cat:"Ingredientes", ing:"Pimentón - g", c50:250}, {cat:"Ingredientes", ing:"Comino - g", c50:80}, {cat:"Ingredientes", ing:"Pimienta - g", c50:80}, {cat:"Ingredientes", ing:"Sal - g", c50:450}, {cat:"Ingredientes", ing:"Aceite - L", fixed:2},
  {cat:"Descartables", ing:"Cajas docena - u", fixed:150}, {cat:"Descartables", ing:"Cajas media - u", fixed:100}, {cat:"Descartables", ing:"Films - u", c50:50}, {cat:"Descartables", ing:"Guantes nitrilo - u", fixed:100}, {cat:"Descartables", ing:"Bolsas - u", fixed:150}, {cat:"Descartables", ing:"Cofias - u", fixed:100},
  {cat:"Limpieza", ing:"Detergente - L", fixed:2}, {cat:"Limpieza", ing:"Desengrasante - L", fixed:2}, {cat:"Limpieza", ing:"Esponjas - u", fixed:2}, {cat:"Limpieza", ing:"Esponjas metálicas - u", fixed:6},
  {cat:"Otros", ing:"Otros gastos / Extras", c50:null}
];
