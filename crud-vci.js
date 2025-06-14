const { createClient } = window.supabase;
// Inicializar Supabase
const supabase = createClient(
    'https://ivvregyexgtkkqahveum.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2dnJlZ3lleGd0a2txYWh2ZXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NDE5ODYsImV4cCI6MjA2NDQxNzk4Nn0.twDkCOdE4rUErbH4bAY1GMQEzpz4dnZqLfT-iz8Zj4U'
);

console.log(" Supabase inicializado correctamente:", supabase);

async function saveVci() {
    const vehiculoId = document.getElementById('vci-id').value;
    const vehiculoData = {
        marca: document.getElementById('vci-marca').value,
        submarca: document.getElementById('vci-submarca').value,
        modelo: document.getElementById('vci-modelo').value,
        version: document.getElementById('vci-version').value,
        tipo: 'VCI'
    };

    const vciData = {
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
    };

    if (vehiculoId) {
        await updateVci(vehiculoId, vehiculoData, vciData);
    } else {
        await createVci(vehiculoData, vciData);
    }
}

async function createVci(vehiculoData, vciData) {
    const { data: vehiculo, error: errorVehiculo } = await supabase
        .from('vehiculos')
        .insert([vehiculoData])
        .select();

    if (errorVehiculo) {
        console.error("🚨 Error al guardar en 'vehiculos':", errorVehiculo);
        return;
    }

    vciData.vehiculo_id = vehiculo[0].id;

    const { error: errorVci } = await supabase
        .from('vehiculos_vci')
        .insert([vciData]);

    if (errorVci) {
        console.error("🚨 Error al guardar en 'vehiculos_vci':", errorVci);
        return;
    }

    alert("✅ Vehículo VCI agregado correctamente.");
    listVci();
}

async function updateVci(vehiculoId, vehiculoData, vciData) {
    await supabase
        .from('vehiculos')
        .update(vehiculoData)
        .eq('id', vehiculoId);

    await supabase
        .from('vehiculos_vci')
        .update(vciData)
        .eq('vehiculo_id', vehiculoId);

    alert("✅ Vehículo VCI actualizado correctamente.");
    listVci();
}

async function listVci() {
    const listDiv = document.getElementById('vci-list');
    listDiv.innerHTML = "";

    let { data: vehiculos, error } = await supabase.from('vista_vci_completa').select('*');

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
                Potencia: ${vci.potencia_hp} hp | Categoría: ${vci.categoria}
            </div>
            <div class="vci-actions">
                <button onclick='showCreateForm(${JSON.stringify(vci)})'>Editar</button>
                <button onclick="deleteVci(${vci.vehiculo_id})">Eliminar</button>
            </div>`;
        item.classList.add("vci-entry");
        listDiv.appendChild(item);
    });
}

function showCreateForm(vehiculo = null) {
    const modal = document.getElementById('modal-form');
    modal.style.display = "flex"; 

    if (vehiculo) {
        document.getElementById('vci-id').value = vehiculo.vehiculo_id;
        document.getElementById('vci-marca').value = vehiculo.marca;
        document.getElementById('vci-submarca').value = vehiculo.submarca;
        document.getElementById('vci-modelo').value = vehiculo.modelo;
        document.getElementById('vci-version').value = vehiculo.version;
        document.getElementById('vci-transmision').value = vehiculo.transmision;
        document.getElementById('vci-combustible').value = vehiculo.combustible;
        document.getElementById('vci-cilindros').value = vehiculo.cilindros;
        document.getElementById('vci-potencia').value = vehiculo.potencia_hp;
        document.getElementById('vci-tamano').value = vehiculo.tamano;
        document.getElementById('vci-categoria').value = vehiculo.categoria;
        document.getElementById('vci-rendimiento-ciudad').value = vehiculo.rendimiento_ciudad;
        document.getElementById('vci-rendimiento-carretera').value = vehiculo.rendimiento_carretera;
        document.getElementById('vci-rendimiento-combinado').value = vehiculo.rendimiento_combinado;
        document.getElementById('vci-co2').value = vehiculo.co2_g_km;
        document.getElementById('vci-nox').value = vehiculo.nox_mg_km;
        document.getElementById('vci-calificacion').value = vehiculo.calificacion;
    } else {
        document.getElementById('modal-form').reset();
        document.getElementById('vci-id').value = "";
    }
}

function closeModal() {
    document.getElementById('modal-form').style.display = "none"; // 🔧 Ahora sí se cierra correctamente
}

function closeModal() {
    document.getElementById('modal-form').style.display = "none";
}
document.addEventListener("DOMContentLoaded", listVci);
