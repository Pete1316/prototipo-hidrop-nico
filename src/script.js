// ===== MODO DOCENTE =====
let modoDocenteActivo = false;

function toggleModoDocente() {
    modoDocenteActivo = !modoDocenteActivo;
    const explicaciones = document.querySelectorAll(".explicacion-docente");
    const boton = document.getElementById("btnDocente");
    
    explicaciones.forEach(exp => {
        exp.style.display = modoDocenteActivo ? "block" : "none";
    });
    
    // ✅ CORRECCIÓN: No cambiar el color de fondo del body
    // document.body.classList.toggle("modo-docente-activo");
    
    if (modoDocenteActivo) {
        boton.textContent = "Ocultar Información Técnica ";
        boton.setAttribute('aria-pressed', 'true');
        boton.classList.add('btn-outline-success');
    } else {
        boton.textContent = "Información Técnica";
        boton.setAttribute('aria-pressed', 'false');
        boton.classList.remove('btn-outline-success');
    }
}

// ===== CONFIGURACIÓN DE GRÁFICAS =====
let charts = {};
let chartData = {
    temperature: { labels: [], waterTemp: [], dhtTemp: [] },
    ph: { labels: [], pH: [] },
    ec: { labels: [], EC: [], TDS: [] },
    humidity: { labels: [], humidity: [] }
};

const maxDataPoints = 20;

function initCharts() {
    const tempCtx = document.getElementById('temperatureChart')?.getContext('2d');
    if (tempCtx) {
        charts.temperature = new Chart(tempCtx, {
            type: 'line',
            data: {
                labels: chartData.temperature.labels,
                datasets: [
                    {
                        label: 'Temp. Agua (°C)',
                        data: chartData.temperature.waterTemp,
                        borderColor: '#dc2626',
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        borderWidth: 3, fill: true, tension: 0.4,
                        pointRadius: 5, pointBackgroundColor: '#dc2626',
                        pointBorderColor: '#fff', pointBorderWidth: 2
                    },
                    {
                        label: 'Temp. Ambiente (°C)',
                        data: chartData.temperature.dhtTemp,
                        borderColor: '#f97316',
                        backgroundColor: 'rgba(249, 115, 22, 0.1)',
                        borderWidth: 3, fill: true, tension: 0.4,
                        pointRadius: 5, pointBackgroundColor: '#f97316',
                        pointBorderColor: '#fff', pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { font: { weight: 'bold', size: 12 } } } },
                scales: { y: { beginAtZero: false, title: { display: true, text: 'Temperatura (°C)' } } }
            }
        });
    }
    
    const phCtx = document.getElementById('phChart')?.getContext('2d');
    if (phCtx) {
        charts.ph = new Chart(phCtx, {
            type: 'line',
            data: {
                labels: chartData.ph.labels,
                datasets: [{
                    label: 'pH', data: chartData.ph.pH,
                    borderColor: '#0891b2', backgroundColor: 'rgba(8, 145, 178, 0.1)',
                    borderWidth: 3, fill: true, tension: 0.4,
                    pointRadius: 5, pointBackgroundColor: '#0891b2',
                    pointBorderColor: '#fff', pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { font: { weight: 'bold', size: 12 } } } },
                scales: { y: { min: 5, max: 8 } }
            }
        });
    }
    
    const ecCtx = document.getElementById('ecChart')?.getContext('2d');
    if (ecCtx) {
        charts.ec = new Chart(ecCtx, {
            type: 'line',
            data: {
                labels: chartData.ec.labels,
                datasets: [
                    {
                        label: 'EC (mS/cm)', data: chartData.ec.EC,
                        borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3, fill: true, tension: 0.4,
                        pointRadius: 5, pointBackgroundColor: '#10b981',
                        pointBorderColor: '#fff', pointBorderWidth: 2, yAxisID: 'y'
                    },
                    {
                        label: 'TDS (ppm)', data: chartData.ec.TDS,
                        borderColor: '#7c3aed', backgroundColor: 'rgba(124, 58, 237, 0.1)',
                        borderWidth: 3, fill: true, tension: 0.4,
                        pointRadius: 5, pointBackgroundColor: '#7c3aed',
                        pointBorderColor: '#fff', pointBorderWidth: 2, yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { font: { weight: 'bold', size: 12 } } } },
                scales: { y: { position: 'left' }, y1: { position: 'right', grid: { drawOnChartArea: false } } }
            }
        });
    }
    
    const humCtx = document.getElementById('humidityChart')?.getContext('2d');
    if (humCtx) {
        charts.humidity = new Chart(humCtx, {
            type: 'line',
            data: {
                labels: chartData.humidity.labels,
                datasets: [{
                    label: 'Humedad Relativa (%)', data: chartData.humidity.humidity,
                    borderColor: '#06b6d4', backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    borderWidth: 3, fill: true, tension: 0.4,
                    pointRadius: 5, pointBackgroundColor: '#06b6d4',
                    pointBorderColor: '#fff', pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { font: { weight: 'bold', size: 12 } } } },
                scales: { y: { min: 0, max: 100 } }
            }
        });
    }
}

function updateCharts(sensorData) {
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    if (!isNaN(sensorData.waterTemp) && !isNaN(sensorData.dhtTemp)) {
        chartData.temperature.labels.push(timestamp);
        chartData.temperature.waterTemp.push(parseFloat(sensorData.waterTemp));
        chartData.temperature.dhtTemp.push(parseFloat(sensorData.dhtTemp));
        if (chartData.temperature.labels.length > maxDataPoints) {
            chartData.temperature.labels.shift();
            chartData.temperature.waterTemp.shift();
            chartData.temperature.dhtTemp.shift();
        }
        if (charts.temperature) {
            charts.temperature.data.labels = chartData.temperature.labels;
            charts.temperature.data.datasets[0].data = chartData.temperature.waterTemp;
            charts.temperature.data.datasets[1].data = chartData.temperature.dhtTemp;
            charts.temperature.update();
        }
    }
    if (!isNaN(sensorData.ph)) {
        chartData.ph.labels.push(timestamp);
        chartData.ph.pH.push(parseFloat(sensorData.ph));
        if (chartData.ph.labels.length > maxDataPoints) {
            chartData.ph.labels.shift(); chartData.ph.pH.shift();
        }
        if (charts.ph) {
            charts.ph.data.labels = chartData.ph.labels;
            charts.ph.data.datasets[0].data = chartData.ph.pH;
            charts.ph.update();
        }
    }
    if (!isNaN(sensorData.ec) && !isNaN(sensorData.tds)) {
        chartData.ec.labels.push(timestamp);
        chartData.ec.EC.push(parseFloat(sensorData.ec));
        chartData.ec.TDS.push(parseFloat(sensorData.tds));
        if (chartData.ec.labels.length > maxDataPoints) {
            chartData.ec.labels.shift(); chartData.ec.EC.shift(); chartData.ec.TDS.shift();
        }
        if (charts.ec) {
            charts.ec.data.labels = chartData.ec.labels;
            charts.ec.data.datasets[0].data = chartData.ec.EC;
            charts.ec.data.datasets[1].data = chartData.ec.TDS;
            charts.ec.update();
        }
    }
    if (!isNaN(sensorData.hum)) {
        chartData.humidity.labels.push(timestamp);
        chartData.humidity.humidity.push(parseFloat(sensorData.hum));
        if (chartData.humidity.labels.length > maxDataPoints) {
            chartData.humidity.labels.shift(); chartData.humidity.humidity.shift();
        }
        if (charts.humidity) {
            charts.humidity.data.labels = chartData.humidity.labels;
            charts.humidity.data.datasets[0].data = chartData.humidity.humidity;
            charts.humidity.update();
        }
    }
}

// ===== CONFIGURACIÓN DE REPORTE =====
let modalReporte;
let datosReporte = {};

function generarReporte() {
    const modalEl = document.getElementById('modalConfigReporte');
    modalReporte = new bootstrap.Modal(modalEl);
    document.getElementById('nombreResponsable').value = '';
    document.getElementById('semestre').value = '';
    document.getElementById('paralelo').value = '';
    document.getElementById('observacionesTecnicas').value = '';
    document.getElementById('nombreCount').textContent = '0';
    document.getElementById('obsCount').textContent = '0';
    
    document.getElementById('nombreResponsable').addEventListener('input', function() {
        document.getElementById('nombreCount').textContent = this.value.length;
    });
    document.getElementById('observacionesTecnicas').addEventListener('input', function() {
        document.getElementById('obsCount').textContent = this.value.length;
    });
    modalReporte.show();
}

function confirmarYDescargarPDF() {
    const nombre = document.getElementById('nombreResponsable').value.trim();
    const semestre = document.getElementById('semestre').value.trim();
    const paralelo = document.getElementById('paralelo').value.trim();
    const observaciones = document.getElementById('observacionesTecnicas').value.trim();
    let errores = [];
    
    if (!nombre || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+$/.test(nombre)) {
        errores.push('❌ Nombre: Solo se permiten letras (sin números)');
        document.getElementById('nombreResponsable').classList.add('is-invalid');
    } else { document.getElementById('nombreResponsable').classList.remove('is-invalid'); }
    
    if (!semestre || !/^[1-9]$/.test(semestre)) {
        errores.push('❌ Semestre: Debe ser un número del 1 al 9');
        document.getElementById('semestre').classList.add('is-invalid');
    } else { document.getElementById('semestre').classList.remove('is-invalid'); }
    
    if (!paralelo || !/^[A-Za-z]$/.test(paralelo)) {
        errores.push('❌ Paralelo: Debe ser una sola letra (A-Z)');
        document.getElementById('paralelo').classList.add('is-invalid');
    } else { document.getElementById('paralelo').classList.remove('is-invalid'); }
    
    if (observaciones.length > 500) {
        errores.push('❌ Observaciones: Máximo 500 caracteres');
        document.getElementById('observacionesTecnicas').classList.add('is-invalid');
    } else { document.getElementById('observacionesTecnicas').classList.remove('is-invalid'); }
    
    if (errores.length > 0) {
        alert('⚠️ Por favor corrija los siguientes campos:\n' + errores.join('\n'));
        return;
    }
    datosReporte = { nombre, semestre, paralelo, observaciones };
    modalReporte?.hide();
    generarPDFConDatos();
}

function generarPDFConDatos() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    let yPos = 10;
    const ahora = new Date();
    const dias = parseInt(document.getElementById("diasTomate")?.value) || 0;
    const etapa = document.getElementById("etapaActual")?.textContent || "Vegetativa";
    
    doc.setFillColor(220, 38, 38); doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(24); doc.setFont("helvetica", "bold");
    doc.text("MONITOREO HIDROPONICO", 105, 18, { align: "center" });
    doc.setFontSize(12); doc.setFont("helvetica", "normal");
    doc.text("Reporte Tecnico del Cultivo de Tomate", 105, 28, { align: "center" });
    doc.setFillColor(16, 185, 129); doc.rect(20, 33, 170, 2, 'F');
    doc.setFontSize(9); doc.text("Generado: " + ahora.toLocaleString('es-ES'), 105, 42, { align: "center" });
    
    yPos = 58; doc.setTextColor(31, 41, 55);
    doc.setFillColor(240, 253, 244); doc.rect(15, yPos - 5, 180, 6, 'F');
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(16, 185, 129);
    doc.text(">> INFORMACION DEL RESPONSABLE", 20, yPos); yPos += 12;
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(31, 41, 55);
    
    const infoResponsable = [
        { label: "Responsable:", valor: datosReporte.nombre },
        { label: "Semestre:", valor: datosReporte.semestre },
        { label: "Paralelo:", valor: datosReporte.paralelo },
        { label: "Fecha de Reporte:", valor: ahora.toLocaleDateString('es-ES') }
    ];
    infoResponsable.forEach(item => {
        doc.setFont("helvetica", "bold"); doc.text(item.label, 20, yPos);
        doc.setFont("helvetica", "normal"); doc.text(String(item.valor), 60, yPos);
        yPos += 6;
    });
    yPos += 4;
    
    doc.setFillColor(240, 253, 244); doc.rect(15, yPos - 5, 180, 6, 'F');
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(16, 185, 129);
    doc.text(">> DATOS DEL CULTIVO", 20, yPos); yPos += 12;
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(31, 41, 55);
    
    const infoCultivo = [
        { label: "Cultivo:", valor: "Tomate Hidroponico" },
        { label: "Dias desde siembra:", valor: dias + " dias" },
        { label: "Etapa actual:", valor: etapa },
        { label: "Ciclo esperado:", valor: "120 dias" }
    ];
    infoCultivo.forEach(item => {
        doc.setFont("helvetica", "bold"); doc.text(item.label, 20, yPos);
        doc.setFont("helvetica", "normal"); doc.text(String(item.valor), 60, yPos);
        yPos += 6;
    });
    
    if (datosReporte.observaciones && datosReporte.observaciones.length > 0) {
        yPos += 4;
        doc.setFillColor(254, 243, 224); doc.rect(15, yPos - 5, 180, 6, 'F');
        doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(217, 119, 6);
        doc.text(">> OBSERVACIONES TECNICAS", 20, yPos); yPos += 8;
        doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(31, 41, 55);
        const obsLines = doc.splitTextToSize(datosReporte.observaciones, 170);
        doc.text(obsLines, 20, yPos); yPos += (obsLines.length * 4) + 4;
    }
    yPos += 3;
    
    let rangosIdeales = {}, infoEtapa = {};
    if (dias <= 20) {
        rangosIdeales = { ph: [5.5, 6.5], ec: [0.5, 1.5], tds: [0, 400], waterTemp: [18, 24], dhtTemp: [20, 28], hum: [60, 80] };
        infoEtapa = { nombre: "Semilla/Plantula", desc: "Germinacion y primeras hojas" };
    } else if (dias <= 40) {
        rangosIdeales = { ph: [5.5, 6.5], ec: [1.2, 2.2], tds: [400, 800], waterTemp: [18, 24], dhtTemp: [20, 28], hum: [50, 70] };
        infoEtapa = { nombre: "Vegetativa", desc: "Crecimiento y ramificacion" };
    } else {
        rangosIdeales = { ph: [5.8, 6.5], ec: [2.0, 3.0], tds: [800, 1200], waterTemp: [18, 24], dhtTemp: [22, 28], hum: [50, 65] };
        infoEtapa = { nombre: "Floracion/Produccion", desc: "Flores y fructificacion" };
    }
    
    doc.setFillColor(255, 237, 213); doc.rect(15, yPos - 5, 180, 6, 'F');
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(223, 107, 18);
    doc.text(">> RANGOS IDEALES - ETAPA: " + infoEtapa.nombre, 20, yPos); yPos += 6;
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139);
    doc.text(infoEtapa.desc, 20, yPos); yPos += 6;
    
    const leerValor = (id) => { const el = document.getElementById(id); return el ? el.textContent.trim() : "--"; };
    const sensores = [
        { nombre: "pH", valor: leerValor("phTop"), unidad: "", rango: rangosIdeales.ph },
        { nombre: "EC", valor: leerValor("ecTop"), unidad: "mS/cm", rango: rangosIdeales.ec },
        { nombre: "TDS", valor: leerValor("tdsTop"), unidad: "ppm", rango: rangosIdeales.tds },
        { nombre: "Temp. Agua", valor: leerValor("waterTempTop"), unidad: "C", rango: rangosIdeales.waterTemp },
        { nombre: "Temp. Ambiente", valor: leerValor("dhtTempTop"), unidad: "C", rango: rangosIdeales.dhtTemp },
        { nombre: "Humedad", valor: leerValor("humTop"), unidad: "%", rango: rangosIdeales.hum },
        { nombre: "Nivel Agua", valor: leerValor("nivelTop"), unidad: "", rango: ["Normal"] }
    ];
    
    function obtenerEstadoYColor(sensor) {
        if (sensor.valor === "--" || sensor.valor === "No disponible") {
            return { estado: "SIN DATOS", color: [229, 231, 235], textColor: [107, 114, 128] };
        }
        if (sensor.nombre === "Nivel Agua") {
            return sensor.valor === "Normal"
                ? { estado: "[OK]", color: [209, 250, 229], textColor: [5, 46, 22] }
                : { estado: "[!] RELLENAR", color: [254, 243, 224], textColor: [120, 53, 15] };
        }
        const num = parseFloat(sensor.valor); const [min, max] = sensor.rango;
        if (!isNaN(num) && !isNaN(min) && !isNaN(max)) {
            if (num >= min && num <= max) return { estado: "[OK]", color: [209, 250, 229], textColor: [5, 46, 22] };
            else if (num < min) return { estado: "[v] BAJO", color: [219, 234, 254], textColor: [7, 29, 73] };
            else return { estado: "[^] ALTO", color: [254, 226, 226], textColor: [127, 29, 29] };
        }
        return { estado: "SIN DATOS", color: [229, 231, 235], textColor: [107, 114, 128] };
    }
    
    doc.autoTable({
        startY: yPos + 2,
        head: [['Parametro', 'Valor Actual', 'Rango Ideal', 'Estado']],
        body: sensores.map(s => {
            const { estado, color } = obtenerEstadoYColor(s);
            return [
                { content: s.nombre, styles: { fontStyle: "bold", textColor: [31, 41, 55] } },
                { content: s.valor + (s.unidad ? " " + s.unidad : ""), styles: { textColor: [31, 41, 55] } },
                { content: (s.nombre === "Nivel Agua") ? s.rango[0] : s.rango[0] + " - " + s.rango[1] + (s.unidad ? " " + s.unidad : ""), styles: { textColor: [107, 114, 128] } },
                { content: estado, styles: { fillColor: color, textColor: [31, 41, 55], fontStyle: "bold" } }
            ];
        }),
        theme: 'striped',
        headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9, textColor: [31, 41, 55] },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 40 }, 2: { cellWidth: 50 }, 3: { cellWidth: 35, halign: 'center' } },
        margin: { left: 15, right: 15 }
    });
    
    yPos = doc.lastAutoTable.finalY + 8;
    const tieneAlertas = sensores.some(s => {
        const { estado } = obtenerEstadoYColor(s);
        return estado.includes("BAJO") || estado.includes("ALTO") || estado.includes("RELLENAR");
    });
    if (tieneAlertas) {
        doc.setFillColor(254, 243, 224); doc.rect(15, yPos - 5, 180, 6, 'F');
        doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(217, 119, 6);
        doc.text(">> ACCIONES RECOMENDADAS", 20, yPos); yPos += 8;
        doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(31, 41, 55);
        const recomendaciones = [];
        sensores.forEach(s => {
            const { estado } = obtenerEstadoYColor(s);
            if (estado.includes("BAJO")) recomendaciones.push("* " + s.nombre + ": Aumentar (valor bajo)");
            else if (estado.includes("ALTO")) recomendaciones.push("* " + s.nombre + ": Disminuir (valor alto)");
            else if (estado.includes("RELLENAR")) recomendaciones.push("* Rellenar tanque de agua inmediatamente");
        });
        if (recomendaciones.length > 0) {
            const recLines = doc.splitTextToSize(recomendaciones.join('\n'), 170);
            doc.text(recLines, 20, yPos);
        }
    }
    
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(220, 38, 38); doc.setLineWidth(0.5); doc.line(15, 285, 195, 285);
        doc.setFontSize(8); doc.setTextColor(107, 114, 128); doc.setFont("helvetica", "normal");
        doc.text("Sistema IoT Agropecuario | Cultivo Hidroponico de Tomate", 105, 290, { align: "center" });
        doc.text("Pagina " + i + " de " + pageCount, 105, 295, { align: "center" });
    }
    
    const nombreArchivo = "Reporte_Hidroponico_" + datosReporte.nombre.replace(/\s+/g, '_') + "_" + ahora.toISOString().slice(0,10) + ".pdf";
    doc.save(nombreArchivo);
}

// === FUNCIONES DEL DASHBOARD ===
function crearTabla(id, columnas, filas) {
    return `<div class="box"><div class="header-box"><h5 class="mb-0"><i class="fas fa-chart-line me-2"></i>${getSensorName(id)}</h5><div class="d-flex align-items-end gap-2"><span id="${id}Status" class="status me-3">--</span><span id="${id}Value" class="value">--</span></div></div><table class="table table-hover text-center" id="${id}Table"><thead class="table-light"><tr>${columnas.map(c=>`<th>${c}</th>`).join("")}</tr></thead><tbody>${filas.map(f=>`<tr data-min="${f.min}" data-max="${f.max}">${f.cols.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function getSensorName(id) {
    const names = { "nivel": "Nivel de Agua", "ph": "Nivel de pH", "ec": "Conductividad Eléctrica (EC)", "tds": "Sólidos Disueltos Totales (TDS)", "waterTemp": "Temperatura del Agua", "dhtTemp": "Temperatura Ambiente", "hum": "Humedad Relativa" };
    return names[id] || id;
}

function validarDias(input) {
    input.value = input.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
    let valor = parseInt(input.value);
    if (isNaN(valor)) { input.value = ''; return; }
    if (valor > 120) input.value = 120;
    actualizarDiagnostico();
}

const contenido = document.getElementById("contenido");
function agregarBloque(id, columnas, filas) { contenido.innerHTML += crearTabla(id, columnas, filas); }

function actualizarTabla(valor, id) {
    const filas = document.querySelectorAll(`#${id}Table tbody tr`);
    const status = document.getElementById(`${id}Status`);
    const value = document.getElementById(`${id}Value`);
    if (!status || !value) return;
    
    if (id === "nivel") { value.textContent = isNaN(valor) ? "--" : (valor === 0 ? "Normal" : "Bajo"); }
    else { value.textContent = isNaN(valor) ? "--" : valor.toFixed(2); }
    
    filas.forEach(f => {
        f.classList.remove("highlight");
        const min = parseFloat(f.dataset.min), max = parseFloat(f.dataset.max);
        if (!isNaN(valor) && valor >= min && valor < max) {
            f.classList.add("highlight");
            status.textContent = f.cells[1].textContent;
            status.style.marginBottom = "8px"; value.style.marginTop = "5px"; status.className = "status";
            if ((id === "ph" && valor >= 5.5 && valor <= 6.5) || (id === "ec" && valor >= 1 && valor <= 3.5) ||
                (id === "tds" && valor >= 400 && valor <= 1100) || ((id === "waterTemp" || id === "dhtTemp") && valor >= 15 && valor <= 30) ||
                (id === "hum" && valor >= 40 && valor <= 70) || (id === "nivel" && valor < 1)) {
                status.style.background = "linear-gradient(90deg, #e8f5e9, #c8e6c9)";
            } else { status.style.background = "linear-gradient(90deg, #ffebee, #ffcdd2)"; }
        }
    });
    actualizarDiagnostico();
}

const diasInput = document.getElementById("diasTomate");
const etapaElement = document.getElementById("etapaActual");
let ultimaEtapa = "Vegetativa";

diasInput.addEventListener("input", () => {
    const dias = parseInt(diasInput.value) || 0;
    if (dias <= 20) { etapaElement.textContent = "Semilla/Plántula"; etapaElement.className = "text-primary fw-bold"; ultimaEtapa = "Semilla/Plántula"; }
    else if (dias <= 40) { etapaElement.textContent = "Vegetativa"; etapaElement.className = "text-success fw-bold"; ultimaEtapa = "Vegetativa"; }
    else { etapaElement.textContent = "Floración/Producción"; etapaElement.className = "text-danger fw-bold"; ultimaEtapa = "Floración/Producción"; }
    actualizarDiagnostico();
});

function actualizarDiagnostico() {
    const phText = document.getElementById("phTop").textContent;
    const ecText = document.getElementById("ecTop").textContent;
    const tdsText = document.getElementById("tdsTop").textContent;
    const waterTempText = document.getElementById("waterTempTop").textContent;
    const dhtTempText = document.getElementById("dhtTempTop").textContent;
    const humText = document.getElementById("humTop").textContent;
    
    const ph = phText !== "--" ? parseFloat(phText) : NaN;
    const ec = ecText !== "--" ? parseFloat(ecText) : NaN;
    const tds = tdsText !== "--" ? parseFloat(tdsText) : NaN;
    const waterTemp = waterTempText !== "--" ? parseFloat(waterTempText) : NaN;
    const dhtTemp = dhtTempText !== "--" ? parseFloat(dhtTempText) : NaN;
    const hum = humText !== "--" ? parseFloat(humText) : NaN;
    
    const nivelText = document.getElementById("nivelTop").textContent;
    let nivel = nivelText === "Bajo" ? 0 : (nivelText === "Normal" ? 1 : NaN);
    
    const dias = parseInt(diasInput.value) || 0;
    let etapa = "", rangoIdeal = {};
    
    if (dias <= 20) {
        etapa = "Etapa semilla/plántula";
        rangoIdeal = { tds: [0, 400], ph: [5.5, 6.5], ec: [0.5, 1.5], waterTemp: [18, 24], dhtTemp: [20, 28], hum: [60, 80], nivel: [0, 0] };
    } else if (dias <= 40) {
        etapa = "Etapa vegetativa";
        rangoIdeal = { tds: [400, 800], ph: [5.5, 6.5], ec: [1.2, 2.2], waterTemp: [18, 24], dhtTemp: [20, 28], hum: [50, 70], nivel: [0, 0] };
    } else {
        etapa = "Etapa floración/producción";
        rangoIdeal = { tds: [800, 1200], ph: [5.8, 6.5], ec: [2.0, 3.0], waterTemp: [18, 24], dhtTemp: [22, 28], hum: [50, 65], nivel: [0, 0] };
    }
    
    if (etapa !== ultimaEtapa) {
        etapaElement.textContent = etapa.replace("Etapa ", "");
        etapaElement.className = etapa.includes("semilla") ? "text-primary fw-bold" : (etapa.includes("vegetativa") ? "text-success fw-bold" : "text-danger fw-bold");
        ultimaEtapa = etapa;
    }
    
    function generarFila(param, valor, rango, unidad = "") {
        if (isNaN(valor)) return { param, ideal: `${rango[0]} – ${rango[1]} ${unidad}`, valor: "No disponible", accion: "Esperando datos", highlight: false, claseAccion: "text-muted" };
        let accion = "Correcto", claseAccion = "correcto";
        if (valor < rango[0]) { accion = `↑ Incrementar`; claseAccion = "alerta"; }
        else if (valor > rango[1]) { accion = `↓ Reducir`; claseAccion = "alerta"; }
        const highlight = (valor >= rango[0] && valor <= rango[1]);
        return { param, ideal: `${rango[0]} – ${rango[1]}${unidad ? " " + unidad : ""}`, valor: valor.toFixed(1) + (unidad ? " " + unidad : ""), accion, highlight, claseAccion };
    }
    
    const filas = [];
    filas.push(generarFila("TDS", tds, rangoIdeal.tds, "ppm"));
    filas.push(generarFila("pH", ph, rangoIdeal.ph));
    filas.push(generarFila("EC", ec, rangoIdeal.ec, "mS/cm"));
    filas.push(generarFila("Temp. Agua", waterTemp, rangoIdeal.waterTemp, "°C"));
    filas.push(generarFila("Temp. Ambiente", dhtTemp, rangoIdeal.dhtTemp, "°C"));
    filas.push(generarFila("Humedad", hum, rangoIdeal.hum, "%"));
    
    if (!isNaN(nivel)) {
        filas.push({ param: "Nivel Agua", ideal: "16 cm", valor: nivel === 1 ? "Normal" : "Bajo", accion: nivel === 1 ? "Correcto" : "Rellenar tanque", highlight: nivel === 1, claseAccion: nivel === 1 ? "correcto" : "alerta" });
    } else {
        filas.push({ param: "Nivel Agua", ideal: "14 cm", valor: "No disponible", accion: "Esperando datos", highlight: false, claseAccion: "text-muted" });
    }
    
    const hayDatosValidos = filas.some(fila => fila.valor !== "No disponible" && fila.valor !== "--");
    if (!hayDatosValidos) {
        document.getElementById("diagnostico").innerHTML = `<div class="data-loading"><i class="fas fa-satellite-dish"></i><p>Esperando datos de los sensores para generar diagnóstico...</p><small class="text-muted">Verifique la conexión con los sensores y Firebase</small></div>`;
        return;
    }
    
    const tablaHTML = `<div class="table-responsive"><table class="table table-bordered table-hover text-center"><thead class="table-light"><tr><th>Parámetro</th><th>Rango Ideal</th><th>Valor Actual</th><th>Acción Recomendada</th></tr></thead><tbody>${filas.map(f => `<tr class="${f.highlight ? 'highlight' : ''}"><td><strong>${f.param}</strong></td><td>${f.ideal}</td><td>${f.valor}</td><td class="${f.claseAccion}">${f.accion}</td></tr>`).join("")}</tbody></table></div>`;
    document.getElementById("diagnostico").innerHTML = `<div class="alert alert-primary text-center"><h5><i class="fas fa-leaf me-2"></i>${etapa} (${dias} días)</h5></div>${tablaHTML}`;
}

// Activar pestañas por URL hash
document.addEventListener('DOMContentLoaded', function() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#')) {
        const tabTrigger = document.querySelector(`[data-bs-target="${hash}"]`);
        if (tabTrigger) { new bootstrap.Tab(tabTrigger).show(); }
    }
    document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tabEl => {
        tabEl.addEventListener('shown.bs.tab', function (event) {
            const target = event.target.getAttribute('data-bs-target');
            if (history.replaceState) history.replaceState(null, null, target);
        });
    });
    initCharts();
});

// ===== FIREBASE =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBXAal12oFlxKZ81PlaDNnar_y2-DiZRlU",
    authDomain: "esp32-a7ac9.firebaseapp.com",
    databaseURL: "https://esp32-a7ac9-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "esp32-a7ac9",
    storageBucket: "esp32-a7ac9.firebasestorage.app",
    messagingSenderId: "312730525959",
    appId: "1:312730525959:web:dae44f28a4149dcee165a2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const sensoresRef = ref(db, "sensores");
const connectionStatus = document.getElementById("connectionStatus");

onValue(sensoresRef, (snapshot) => {
    const d = snapshot.val();
    if (!d) {
        connectionStatus.className = "alert alert-warning text-center mb-0";
        connectionStatus.innerHTML = "<i class='fas fa-exclamation-triangle me-2'></i>No hay datos disponibles en la base de datos";
        return;
    }
    connectionStatus.className = "alert alert-success text-center mb-0";
    connectionStatus.innerHTML = "<i class='fas fa-check-circle me-2'></i>Conectado y recibiendo datos en tiempo real";
    
    function actualizarValor(elementId, valor, decimales = 2) {
        const elemento = document.getElementById(elementId);
        if (elemento && !isNaN(valor)) elemento.textContent = valor.toFixed(decimales);
    }
    
    if (!isNaN(parseFloat(d.nivel))) {
        const valorNivel = parseFloat(d.nivel);
        document.getElementById("nivelTop").textContent = valorNivel === 0 ? "Normal" : "Bajo";
    }
    if (!isNaN(parseFloat(d.ph))) actualizarValor("phTop", parseFloat(d.ph), 2);
    if (!isNaN(parseFloat(d.ec))) actualizarValor("ecTop", parseFloat(d.ec), 2);
    if (!isNaN(parseFloat(d.tds))) actualizarValor("tdsTop", parseFloat(d.tds));
    if (!isNaN(parseFloat(d.waterTemp))) actualizarValor("waterTempTop", parseFloat(d.waterTemp), 1);
    if (!isNaN(parseFloat(d.dhtTemp))) actualizarValor("dhtTempTop", parseFloat(d.dhtTemp), 1);
    if (!isNaN(parseFloat(d.hum))) actualizarValor("humTop", parseFloat(d.hum), 1);
    
    updateCharts({
        waterTemp: parseFloat(d.waterTemp), dhtTemp: parseFloat(d.dhtTemp),
        ph: parseFloat(d.ph), ec: parseFloat(d.ec), tds: parseFloat(d.tds), hum: parseFloat(d.hum)
    });
    
    // ✅ CORRECCIÓN: Actualizar diagnóstico CADA VEZ que lleguen datos nuevos
    actualizarDiagnostico();
    
}, (error) => {
    console.error("Error de Firebase:", error);
    connectionStatus.className = "alert alert-danger text-center mb-0";
    connectionStatus.innerHTML = `<i class='fas fa-exclamation-circle me-2'></i>Error de conexión: ${error.message || "No se pudo conectar con Firebase"}`;
    document.getElementById("diagnostico").innerHTML = `<div class="data-error"><i class="fas fa-exclamation-triangle me-2"></i>Error al conectar con la base de datos. Verifique su conexión a internet y la configuración de Firebase.</div>`;
});
