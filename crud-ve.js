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
        submarca: document.getElementById('ve-submarca').value,
        modelo: document.getElementById('ve-modelo').value,
        version: document.getElementById('ve-version').value,
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
    closeModal();
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

function showCreateForm(vehiculo = null) {
    const modal = document.getElementById('modal-form');
    modal.style.display = "flex";

    if (vehiculo) {
        document.getElementById('ve-id').value = vehiculo.vehiculo_id;
        document.getElementById('ve-marca').value = vehiculo.marca;
        document.getElementById('ve-submarca').value = vehiculo.submarca;
        document.getElementById('ve-modelo').value = vehiculo.modelo;
        document.getElementById('ve-version').value = vehiculo.version;
        document.getElementById('ve-potencia').value = vehiculo.potencia_hp;
        document.getElementById('ve-bateria').value = vehiculo.capacidad_bateria_kwh;
        document.getElementById('ve-autonomia').value = vehiculo.autonomia_km;
        document.getElementById('ve-rendimiento').value = vehiculo.rendimiento_km_kwh;
        document.getElementById('ve-pasajeros').value = vehiculo.pasajeros;
        document.getElementById('ve-caracteristicas').value = vehiculo.caracteristicas;
    } else {
        // Limpiar el formulario si es un nuevo vehículo
        document.getElementById('modal-form').reset();
        document.getElementById('ve-id').value = "";
    }
}

function closeModal() {
    document.getElementById('modal-form').style.display = "none";
}

function showMessageModal(message) {
    document.getElementById("message-text").innerText = message;
    document.getElementById("message-modal").style.display = "flex";
}

function closeMessageModal() {
    document.getElementById("message-modal").style.display = "none";
}

function openDeleteModal(vehiculoId) {
    document.getElementById("delete-id").value = vehiculoId;
    document.getElementById("confirm-modal").style.display = "flex";
}

function closeConfirmModal() {
    document.getElementById("confirm-modal").style.display = "none";
}

async function confirmDelete() {
    const vehiculoId = document.getElementById("delete-id").value;

    const { error: errorVci } = await supabase
        .from('vehiculos_ev')
        .delete()
        .eq('vehiculo_id', vehiculoId);

    if (errorVci) {
        console.error("Error al eliminar en 'vehiculos_ve':", errorVci);
        showMessageModal("Error al eliminar el vehículo.");
        return;
    }

    const { error: errorVehiculo } = await supabase
        .from('vehiculos')
        .delete()
        .eq('id', vehiculoId);

    if (errorVehiculo) {
        console.error("Error al eliminar en 'vehiculos':", errorVehiculo);
        showMessageModal("Error al eliminar los datos del vehículo.");
        return;
    }

    showMessageModal("Vehículo eliminado correctamente.");
    closeConfirmModal();
    listVe();
}

document.addEventListener("DOMContentLoaded", listVe);