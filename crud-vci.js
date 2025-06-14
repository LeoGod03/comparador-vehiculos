const { createClient } = window.supabase;
// Inicializar Supabase
const supabase = createClient(
    'https://ivvregyexgtkkqahveum.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2dnJlZ3lleGd0a2txYWh2ZXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NDE5ODYsImV4cCI6MjA2NDQxNzk4Nn0.twDkCOdE4rUErbH4bAY1GMQEzpz4dnZqLfT-iz8Zj4U'
);

console.log(" Supabase inicializado correctamente:", supabase);

async function createVci() {
    const { data: vehiculo, error: errorVehiculo } = await supabase
        .from('vehiculos')
        .insert([{
            marca: document.getElementById('vci-marca').value,
            submarca: document.getElementById('vci-submarca').value,
            modelo: document.getElementById('vci-modelo').value,
            version: document.getElementById('vci-version').value,
            tipo: 'VCI'
        }])
        .select();

    if (errorVehiculo) {
        console.error("🚨 Error al guardar en 'vehiculos':", errorVehiculo);
        return;
    }

    const vehiculoId = vehiculo[0].id;

    const { error: errorVci } = await supabase
        .from('vehiculos_vci')
        .insert([{
            vehiculo_id: vehiculoId,
            transmision: document.getElementById('vci-transmision').value,
            combustible: document.getElementById('vci-combustible').value,
            cilindros: document.getElementById('vci-cilindros').value,
            potencia_hp: parseInt(document.getElementById('vci-potencia').value),
            tamano: document.getElementById('vci-tamano').value,
            categoria: document.getElementById('vci-categoria').value,
            rendimiento_ciudad: parseFloat(document.getElementById('vci-rendimiento-ciudad').value),
            rendimiento_carretera: parseFloat(document.getElementById('vci-rendimiento-carretera').value),
            rendimiento_combinado: parseFloat(document.getElementById('vci-rendimiento-combinado').value),
            co2_g_km: parseFloat(document.getElementById('vci-co2').value),
            nox_mg_km: parseFloat(document.getElementById('vci-nox').value),
            calificacion: document.getElementById('vci-calificacion').value
        }]);

    if (errorVci) {
        console.error("🚨 Error al guardar en 'vehiculos_vci':", errorVci);
        return;
    }

    alert("✅ Vehículo VCI agregado correctamente.");
    listVci();
}

async function listVci() {
    const listDiv = document.getElementById('vci-list');
    listDiv.innerHTML = "";

    let { data: vehiculos, error } = await supabase
        .from('vista_vci_completa')
        .select('*');

    if (error) {
        console.error("🚨 Error al listar vehículos VCI:", error);
        return;
    }

    vehiculos.forEach(vci => {
        let item = document.createElement("div");
        item.innerHTML = `
            <div>
                <strong>${vci.marca} ${vci.submarca} ${vci.modelo} - ${vci.version}</strong><br>
                Transmisión: ${vci.transmision} | Combustible: ${vci.combustible} | Cilindros: ${vci.cilindros}<br>
                Potencia: ${vci.potencia_hp} hp | Tamaño: ${vci.tamano} | Categoría: ${vci.categoria}<br>
                Rendimiento Ciudad: ${vci.rendimiento_ciudad} km/l | Carretera: ${vci.rendimiento_carretera} km/l | Combinado: ${vci.rendimiento_combinado} km/l<br>
                Rendimiento Ajustado: ${vci.rendimiento_ajustado} km/l<br>
                CO₂: ${vci.co2_g_km} g/km | NOx: ${vci.nox_mg_km} mg/km<br>
                Calificación: ${vci.calificacion}
            </div>
            <div class="vci-actions">
                <button onclick="editVci(${vci.vehiculo_id})">Editar</button>
                <button onclick="deleteVci(${vci.vehiculo_id})">Eliminar</button>
            </div>
        `;
        item.classList.add("vci-entry");
        listDiv.appendChild(item);
    });
}
document.addEventListener("DOMContentLoaded", listVci);