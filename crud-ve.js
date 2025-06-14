const { createClient } = window.supabase;
// Inicializar Supabase
const supabase = createClient(
    'https://ivvregyexgtkkqahveum.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2dnJlZ3lleGd0a2txYWh2ZXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NDE5ODYsImV4cCI6MjA2NDQxNzk4Nn0.twDkCOdE4rUErbH4bAY1GMQEzpz4dnZqLfT-iz8Zj4U'
);

console.log(" Supabase inicializado correctamente:", supabase);


async function saveVe() {
    const vehiculoId = document.getElementById('ve-id').value;
    const vehiculoData = {
        marca: document.getElementById('ve-marca').value.toUpperCase(),
        submarca: document.getElementById('ve-submarca').value.toUpperCase(),
        modelo: document.getElementById('ve-modelo').value.toUpperCase(),
        version: document.getElementById('ve-version').value.toUpperCase(),
        tipo: 'VE'
    };

    const veData = {
        potencia_hp: parseInt(document.getElementById('ve-potencia').value),
        capacidad_bateria_kwh: parseFloat(document.getElementById('ve-bateria').value),
        autonomia_km: parseInt(document.getElementById('ve-autonomia').value),
        rendimiento_km_kwh: parseFloat(document.getElementById('ve-rendimiento').value),
        pasajeros: parseInt(document.getElementById('ve-pasajeros').value),
        caracteristicas: document.getElementById('ve-caracteristicas').value
    };

    if (vehiculoId) {
        await updateVe(vehiculoId, vehiculoData, veData);
    } else {
        await createVe(vehiculoData, veData);
    }
}

async function createVe(vehiculoData, veData) {
    const { data: vehiculo, error: errorVehiculo } = await supabase
        .from('vehiculos')
        .insert([vehiculoData])
        .select();

    if (errorVehiculo) {
        showMessageModal("❌ Error al guardar el vehículo.");
        return;
    }

    veData.vehiculo_id = vehiculo[0].id;

    const { error: errorVe } = await supabase
        .from('vehiculos_ev')
        .insert([veData]);

    if (errorVe) {
        showMessageModal("❌ Error al guardar los datos del VE.");
        return;
    }

    showMessageModal("✅ Vehículo VE agregado correctamente.");
    listVe();
}

async function updateVe(vehiculoId, vehiculoData, veData) {
    await supabase.from('vehiculos').update(vehiculoData).eq('id', vehiculoId);
    await supabase.from('vehiculos_ev').update(veData).eq('vehiculo_id', vehiculoId);

    showMessageModal("✅ Vehículo VE actualizado correctamente.");
    listVe();
}

async function listVe() {
    const listDiv = document.getElementById('ve-list');
    listDiv.innerHTML = "";

    let { data: vehiculos, error } = await supabase.from('vista_ve_completa').select('*');

    if (error) {
        showMessageModal("❌ Error al listar vehículos VE.");
        return;
    }

    vehiculos.forEach(ve => {
        let item = document.createElement("div");
        item.innerHTML = `
            <div class="ve-details">
                <strong>${ve.marca} ${ve.submarca} ${ve.modelo} - ${ve.version}</strong><br>
                <b>Potencia:</b> ${ve.potencia_hp} hp | <b>Capacidad:</b> ${ve.capacidad_bateria_kwh} kWh | <b>Autonomía:</b> ${ve.autonomia_km} km<br>
                <b>Rendimiento:</b> ${ve.rendimiento_km_kwh} km/kWh | <b>Pasajeros:</b> ${ve.pasajeros}<br>
                <b>Características:</b> ${ve.caracteristicas}
            </div>
            <div class="ve-actions">
                <button onclick='showCreateForm(${JSON.stringify(ve)})'>Editar</button>
                <button onclick="openDeleteModal(${ve.vehiculo_id})">Eliminar</button>
            </div>`;
        item.classList.add("ve-entry");
        listDiv.appendChild(item);
    });
}

document.addEventListener("DOMContentLoaded", listVe);