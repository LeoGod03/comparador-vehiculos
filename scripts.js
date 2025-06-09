
// Extraer la función `createClient` correctamente
const { createClient } = window.supabase;
// Inicializar Supabase
const supabase = createClient(
    'https://ivvregyexgtkkqahveum.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2dnJlZ3lleGd0a2txYWh2ZXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NDE5ODYsImV4cCI6MjA2NDQxNzk4Nn0.twDkCOdE4rUErbH4bAY1GMQEzpz4dnZqLfT-iz8Zj4U'
);

console.log(" Supabase inicializado correctamente:", supabase);
// Variables para almacenar los vehículos seleccionados
let selectedVci = null;
let selectedVe = null;

        // Constantes para cálculos
const gasolinaPrecio = 24; // pesos/litro
const electricidadPrecio = 3.95; // pesos/kWh
const gasolinaDensidad = 0.723; // kg/litro
const gasolinaFactorEmision = 2.265; // kgCO2/litro
const electricidadFactorEmision = 0.12; // kgCO2/kWh (promedio en México)

async function populateBrands() {
    let { data, error } = await supabase
        .from('vehiculos')
        .select('marca, tipo');  // Obtenemos marcas y tipo

    if (error) {
        console.error("🚨 Error al obtener marcas:", error);
        return;
    }

    console.log("🔍 Datos obtenidos:", data); // Confirmar datos en la consola

    const vciBrandSelect = document.getElementById("vci-brand");
    const veBrandSelect = document.getElementById("ve-brand");

    if (!vciBrandSelect || !veBrandSelect) {
        console.error("🚨 No se encontraron los selectores 'vci-brand' o 've-brand'");
        return;
    }

    vciBrandSelect.innerHTML = '<option value="">Seleccione Marca</option>';
    veBrandSelect.innerHTML = '<option value="">Seleccione Marca</option>';

    // Usar Set() con nombres limpios y en mayúsculas para evitar duplicados ocultos
    const vciBrands = new Set();
    const veBrands = new Set();

    data.forEach(vehicle => {
        const cleanedMarca = vehicle.marca.trim().toUpperCase(); // Eliminar espacios y unificar nombres

        if (vehicle.tipo === "VCI") {
            vciBrands.add(cleanedMarca);
        } else if (vehicle.tipo === "VE") {
            veBrands.add(cleanedMarca);
        }
    });

    // Agregar marcas únicas al selector de VCI
    vciBrands.forEach(marca => {
        let optionVCI = document.createElement("option");
        optionVCI.value = marca;
        optionVCI.textContent = marca;
        vciBrandSelect.appendChild(optionVCI);
    });

    // Agregar marcas únicas al selector de VE
    veBrands.forEach(marca => {
        let optionVE = document.createElement("option");
        optionVE.value = marca;
        optionVE.textContent = marca;
        veBrandSelect.appendChild(optionVE);
    });

    console.log("✅ Marcas agregadas sin repetir.");
}
document.addEventListener("DOMContentLoaded", () => {
    console.log("⚡ DOM cargado, ejecutando carga de marcas...");

    // Llenar marcas en los selectores de VCI y VE
    populateBrands();

    // Asignar eventos para actualizar detalles al cambiar modelo
    document.getElementById('vci-model').addEventListener('change', showVciOptions);

    document.getElementById('ve-model').addEventListener('change', async () => {
        selectedVe = await fetchVeDetails(
            document.getElementById('ve-brand').value,
            document.getElementById('ve-subbrand').value,
            document.getElementById('ve-model').value
        );
    });
});


async function updateVciModels() {
    const brandSelect = document.getElementById('vci-brand');
    const subbrandSelect = document.getElementById('vci-subbrand');
    const modelSelect = document.getElementById('vci-model');

    // Limpiar el selector de modelos
    modelSelect.innerHTML = '<option value="">Seleccione Modelo</option>';

    if (!brandSelect.value || !subbrandSelect.value) return;

    // Consultar Supabase para obtener los modelos de la marca y submarca seleccionadas
    let { data: modelos, error } = await supabase
        .from('vehiculos')  // Usamos la tabla principal
        .select('modelo')   // Solo obtenemos el modelo
        .eq('marca', brandSelect.value)
        .eq('submarca', subbrandSelect.value)
        .eq('tipo', 'VCI');  // Filtramos solo vehículos de combustión interna

    if (error) {
        console.error('🚨 Error al obtener modelos:', error);
        return;
    }

    console.log("🔍 Modelos obtenidos:", modelos); // Confirmar datos en la consola

    // Llenar el select con los modelos obtenidos
    modelos.forEach(({ modelo }) => {
        const option = document.createElement('option');
        option.value = modelo;
        option.textContent = modelo;
        modelSelect.appendChild(option);
    });

    console.log("✅ Modelos agregados al selector.");
}

async function showVciDetails() {
    const brandSelect = document.getElementById('vci-brand');
    const subbrandSelect = document.getElementById('vci-subbrand');
    const modelSelect = document.getElementById('vci-model');

    if (!brandSelect.value || !subbrandSelect.value || !modelSelect.value) return;

    // Consultar Supabase para obtener los detalles del vehículo seleccionado
    let { data: vehiculo, error } = await supabase
        .from('vehiculos')
        .select(`
            id, marca, submarca, modelo, version,
            vehiculos_vci(transmision, combustible, cilindros, potencia_hp, tamano, categoria, 
                          rendimiento_ciudad, rendimiento_carretera, rendimiento_combinado, rendimiento_ajustado, 
                          co2_g_km, nox_mg_km, calificacion)
        `)
        .eq('marca', brandSelect.value)
        .eq('submarca', subbrandSelect.value)
        .eq('modelo', modelSelect.value)
        .eq('tipo', 'VCI')
        .single();

    if (error || !vehiculo) {
        console.error('🚨 Error al obtener detalles:', error);
        return;
    }

    console.log("🔍 Detalles obtenidos:", vehiculo);

    // Mostrar detalles en la interfaz
    const detailsDiv = document.getElementById('vci-details');
    detailsDiv.innerHTML = `
        <h2>${vehiculo.marca} ${vehiculo.submarca} ${vehiculo.modelo}</h2>
        <table>
            <tr><th>Versión</th><td>${vehiculo.version}</td></tr>
            <tr><th>Potencia</th><td>${vehiculo.vehiculos_vci.potencia_hp} HP</td></tr>
            <tr><th>Rendimiento Ciudad</th><td>${vehiculo.vehiculos_vci.rendimiento_ciudad} km/l</td></tr>
            <tr><th>Rendimiento Carretera</th><td>${vehiculo.vehiculos_vci.rendimiento_carretera} km/l</td></tr>
            <tr><th>Rendimiento Combinado</th><td>${vehiculo.vehiculos_vci.rendimiento_combinado} km/l</td></tr>
            <tr><th>Rendimiento Ajustado</th><td>${vehiculo.vehiculos_vci.rendimiento_ajustado} km/l</td></tr>
            <tr><th>CO₂</th><td>${vehiculo.vehiculos_vci.co2_g_km} g/km</td></tr>
            <tr><th>NOx</th><td>${vehiculo.vehiculos_vci.nox_mg_km} mg/km</td></tr>
            <tr><th>Calificación</th><td>${vehiculo.vehiculos_vci.calificacion}</td></tr>
            <tr><th>Combustible</th><td>${vehiculo.vehiculos_vci.combustible}</td></tr>
            <tr><th>Transmisión</th><td>${vehiculo.vehiculos_vci.transmision}</td></tr>
            <tr><th>Cilindros</th><td>${vehiculo.vehiculos_vci.cilindros}</td></tr>
            <tr><th>Tamaño</th><td>${vehiculo.vehiculos_vci.tamano}</td></tr>
            <tr><th>Categoría</th><td>${vehiculo.vehiculos_vci.categoria}</td></tr>
        </table>
    `;

    // Mostrar comparación si ambos vehículos están seleccionados
    if (selectedVci && selectedVe) {
        showComparison();
    }
}

async function updateVeSubbrands() {
    const brandSelect = document.getElementById('ve-brand');
    const subbrandSelect = document.getElementById('ve-subbrand');
    const modelSelect = document.getElementById('ve-model');

    // Limpiar selects
    subbrandSelect.innerHTML = '<option value="">Seleccione Submarca</option>';
    modelSelect.innerHTML = '<option value="">Seleccione Modelo</option>';

    if (!brandSelect.value) return;

    // Obtener submarcas desde Supabase
    let { data: submarcas, error } = await supabase
        .from('vehiculos')
        .select('submarca')
        .eq('marca', brandSelect.value.toUpperCase())
        .eq('tipo', 'VE');  // Filtrar vehículos eléctricos

    if (error) {
        console.error('🚨 Error al obtener submarcas:', error);
        return;
    }

    console.log("🔍 Submarcas obtenidas:", submarcas); // Confirmar datos en consola

    // Filtrar y llenar el selector con valores únicos
    const uniqueSubbrands = [...new Set(submarcas.map(item => item.submarca))];
    uniqueSubbrands.forEach(submarca => {
        const option = document.createElement('option');
        option.value = submarca;
        option.textContent = submarca;
        subbrandSelect.appendChild(option);
    });
}

async function updateVciSubbrands() {
    const brandSelect = document.getElementById('vci-brand');
    const subbrandSelect = document.getElementById('vci-subbrand');
    const modelSelect = document.getElementById('vci-model');

    // Limpiar selects antes de llenarlos
    subbrandSelect.innerHTML = '<option value="">Seleccione Submarca</option>';
    modelSelect.innerHTML = '<option value="">Seleccione Modelo</option>';

    if (!brandSelect.value) return;

    // Obtener submarcas desde Supabase, filtrando por marca y tipo VCI
    let { data: submarcas, error } = await supabase
        .from('vehiculos')
        .select('submarca')
        .eq('marca', brandSelect.value.toUpperCase())
        .eq('tipo', 'VCI');

    console.log("🔍 Datos recibidos de Supabase:", submarcas); // Ver qué está recibiendo realmente

    if (error) {
        console.error("🚨 Error al obtener submarcas:", error);
        return;
    }
    // Filtrar y llenar el selector con valores únicos
    const uniqueSubbrands = [...new Set(submarcas.map(item => item.submarca))];
    uniqueSubbrands.forEach(submarca => {
        const option = document.createElement('option');
        option.value = submarca;
        option.textContent = submarca;
        subbrandSelect.appendChild(option);
    });
}

async function updateVeModels() {
    const brandSelect = document.getElementById('ve-brand');
    const subbrandSelect = document.getElementById('ve-subbrand');
    const modelSelect = document.getElementById('ve-model');

    // Limpiar el selector de modelos
    modelSelect.innerHTML = '<option value="">Seleccione Modelo</option>';

    if (!brandSelect.value || !subbrandSelect.value) return;

    // Consultar Supabase para obtener los modelos de la marca y submarca seleccionadas
    let { data: modelos, error } = await supabase
        .from('vehiculos')
        .select('modelo')
        .eq('marca', brandSelect.value)
        .eq('submarca', subbrandSelect.value)
        .eq('tipo', 'VE');  // Filtrar vehículos eléctricos

    if (error) {
        console.error('🚨 Error al obtener modelos:', error);
        return;
    }

    console.log("🔍 Modelos obtenidos:", modelos); // Confirmar datos en consola

    // Llenar el select con los modelos obtenidos
    modelos.forEach(({ modelo }) => {
        const option = document.createElement('option');
        option.value = modelo;
        option.textContent = modelo;
        modelSelect.appendChild(option);
    });
}

async function showVeDetails() {
    const brandSelect = document.getElementById('ve-brand');
    const subbrandSelect = document.getElementById('ve-subbrand');
    const modelSelect = document.getElementById('ve-model');

    if (!brandSelect.value || !subbrandSelect.value || !modelSelect.value) return;

    // Consultar Supabase para obtener los detalles del vehículo seleccionado
    let { data: vehiculo, error } = await supabase
        .from('vehiculos')
        .select(`
            id, marca, submarca, modelo, version,
            vehiculos_ev(potencia_hp, capacidad_bateria_kwh, autonomia_km, rendimiento_km_kwh, 
                         pasajeros, caracteristicas)
        `)
        .eq('marca', brandSelect.value)
        .eq('submarca', subbrandSelect.value)
        .eq('modelo', modelSelect.value)
        .eq('tipo', 'VE')
        .single();

    if (error || !vehiculo) {
        console.error('🚨 Error al obtener detalles:', error);
        return;
    }

    console.log("🔍 Detalles obtenidos:", vehiculo);

    // Mostrar detalles en la interfaz
    const detailsDiv = document.getElementById('ve-details');
    detailsDiv.innerHTML = `
        <h2>${vehiculo.marca} ${vehiculo.submarca} ${vehiculo.modelo}</h2>
        <table>
            <tr><th>Versión</th><td>${vehiculo.version}</td></tr>
            <tr><th>Potencia</th><td>${vehiculo.vehiculos_ev.potencia_hp} HP</td></tr>
            <tr><th>Capacidad de batería</th><td>${vehiculo.vehiculos_ev.capacidad_bateria_kwh} kWh</td></tr>
            <tr><th>Autonomía</th><td>${vehiculo.vehiculos_ev.autonomia_km} km</td></tr>
            <tr><th>Rendimiento</th><td>${vehiculo.vehiculos_ev.rendimiento_km_kwh} km/kWh</td></tr>
            <tr><th>Pasajeros</th><td>${vehiculo.vehiculos_ev.pasajeros}</td></tr>
            <tr><th>Características</th><td>${vehiculo.vehiculos_ev.caracteristicas}</td></tr>
        </table>
    `;

    // Mostrar comparación si ambos vehículos están seleccionados
    if (selectedVci && selectedVe) {
        showComparison();
    }
}

async function getVciVehicles() {
    let { data: vehiculos, error } = await supabase
        .from('vehiculos')
        .select('*')
        .eq('marca', document.getElementById('vci-brand').value)
        .eq('submarca', document.getElementById('vci-subbrand').value)
        .eq('modelo', document.getElementById('vci-model').value)
        .eq('tipo', 'VCI')
        .order('calificacion', { ascending: false });  // Ordenar por calificación de mayor a menor

    if (error) {
        console.error("🚨 Error al obtener vehículos:", error);
        return [];
    }

    console.log("🔍 Vehículos ordenados por calificación:", vehiculos);
    return vehiculos;
}

async function showVciOptions() {
    const selectionDiv = document.getElementById('vehicle-selection');

    if (!selectionDiv) {
        console.error("🚨 No se encontró el elemento 'vehicle-selection' en el DOM.");
        return;
    }

    let vehiculos = await getVciVehicles();

    if (!vehiculos || vehiculos.length === 0) {
        selectionDiv.innerHTML = '<p>No se encontraron vehículos.</p>';
        return;
    }

    selectionDiv.style.display = 'block';
    selectionDiv.innerHTML = '<label for="vehicle-select">Seleccione el vehículo por calificación:</label>';
    
    let select = document.createElement("select");
    select.id = "vehicle-select";
    select.innerHTML = '<option value="">Seleccione...</option>'; 

    vehiculos.forEach((vehiculo) => {
        let option = document.createElement("option");
        option.value = vehiculo.id;
        option.textContent = `${vehiculo.version} - Calificación: ${vehiculo.calificacion}`;
        select.appendChild(option);
    });

    select.addEventListener("change", () => {
        let selectedVehicle = vehiculos.find(v => v.id == select.value);
        if (selectedVehicle) showVehicleDetails(selectedVehicle);
    });

    selectionDiv.appendChild(select);
}

function showVehicleDetails(vehiculo) {
    const detailsDiv = document.getElementById('vci-details');
    detailsDiv.innerHTML = `
        <h2>${vehiculo.marca} ${vehiculo.submarca} ${vehiculo.modelo} (${vehiculo.version})</h2>
        <table>
            <tr><th>Transmisión</th><td>${vehiculo.transmision}</td></tr>
            <tr><th>Combustible</th><td>${vehiculo.combustible}</td></tr>
            <tr><th>Cilindros</th><td>${vehiculo.cilindros}</td></tr>
            <tr><th>Potencia</th><td>${vehiculo.potencia_hp} HP</td></tr>
            <tr><th>Rendimiento</th><td>${vehiculo.rendimiento_combinado} km/l</td></tr>
            <tr><th>CO₂</th><td>${vehiculo.co2_g_km} g/km</td></tr>
            <tr><th>Calificación</th><td>${vehiculo.calificacion}</td></tr>
        </table>
    `;
}


async function fetchVeDetails(brand, subbrand, model) {
    let { data: vehiculo, error } = await supabase
        .from('vehiculos')
        .select(`
            id, marca, submarca, modelo, version,
            vehiculos_ev(potencia_hp, capacidad_bateria_kwh, autonomia_km, rendimiento_km_kwh, 
                         pasajeros, caracteristicas)
        `)
        .eq('marca', brand)
        .eq('submarca', subbrand)
        .eq('modelo', model)
        .eq('tipo', 'VE')
        .single();

    if (error || !vehiculo) {
        console.error("🚨 Error al obtener detalles de VE:", error);
        return null;
    }

    return vehiculo;
}


        // Función para mostrar la comparación
async function showComparison() {
    if (!selectedVci || !selectedVe) return;

    // Mostrar la tabla de comparación
    document.getElementById('comparison-table').style.display = 'block';

    // Actualizar nombres en la tabla de comparación
    document.getElementById('vci-comp-name').textContent = `${selectedVci.marca} ${selectedVci.submarca}`;
    document.getElementById('ve-comp-name').textContent = `${selectedVe.marca} ${selectedVe.submarca}`;

    // Validar datos numéricos antes de cálculos para evitar errores
    const vciRendimiento = selectedVci.rendimiento || 1; // Evita división por 0 o valores incorrectos
    const veRendimiento = selectedVe.rendimiento || 1;

    // Calcular consumo de energía por km
    const vciEnergyConsumption = (1 / vciRendimiento) * gasolinaDensidad * 39.53 / 3.6; // kWh/km
    const veEnergyConsumption = 1 / veRendimiento; // kWh/km

    document.getElementById('vci-energy-consumption').textContent = vciEnergyConsumption.toFixed(4) + ' kWh/km';
    document.getElementById('ve-energy-consumption').textContent = veEnergyConsumption.toFixed(4) + ' kWh/km';

            // Calcular costo por km
    const vciCostPerKm = (1 / vciRendimiento) * gasolinaPrecio;
    const veCostPerKm = veEnergyConsumption * electricidadPrecio;

    document.getElementById('vci-cost-per-km').textContent = '$' + vciCostPerKm.toFixed(2) + ' MXN/km';
    document.getElementById('ve-cost-per-km').textContent = '$' + veCostPerKm.toFixed(2) + ' MXN/km';

            // Calcular emisiones de CO2
    const vciEmissions = (1 / vciRendimiento) * gasolinaFactorEmision;
    const veEmissions = veEnergyConsumption * electricidadFactorEmision;

    document.getElementById('vci-emissions').textContent = vciEmissions.toFixed(4) + ' kgCO2/km';
    document.getElementById('ve-emissions').textContent = veEmissions.toFixed(4) + ' kgCO2/km';
}

// Función para calcular los totales según el kilometraje
async function calculateTotals() {
    if (!selectedVci || !selectedVe) {
        alert('Por favor seleccione ambos vehículos para comparar.');
        return;
    }

    const mileageInput = document.getElementById('total-mileage');
    const mileage = parseFloat(mileageInput.value);

    if (isNaN(mileage) || mileage <= 0) {
        alert('Por favor ingrese un kilometraje válido.');
        return;
    }

    // Mostrar la sección de resultados totales
    const resultsDiv = document.getElementById('total-results');
    resultsDiv.style.display = 'block';

    // Actualizar nombres en la tabla de totales
    document.getElementById('vci-total-name').textContent = `${selectedVci.marca} ${selectedVci.submarca}`;
    document.getElementById('ve-total-name').textContent = `${selectedVe.marca} ${selectedVe.submarca}`;

    // Validar datos antes de cálculos
    const vciRendimiento = selectedVci.vehiculos_vci.rendimiento_combinado || 1;
    const veRendimiento = selectedVe.vehiculos_ev.rendimiento_km_kwh || 1;

    // Calcular consumo de energía total
    const vciEnergyConsumption = (1 / vciRendimiento) * gasolinaDensidad * 39.53 / 3.6; // kWh/km
    const vciTotalEnergy = vciEnergyConsumption * mileage;
    const veEnergyConsumption = 1 / veRendimiento; // kWh/km
    const veTotalEnergy = veEnergyConsumption * mileage;

    document.getElementById('vci-total-energy').textContent = vciTotalEnergy.toFixed(2) + ' kWh';
    document.getElementById('ve-total-energy').textContent = veTotalEnergy.toFixed(2) + ' kWh';

    // Calcular costos totales
    const vciCostPerKm = (1 / vciRendimiento) * gasolinaPrecio;
    const vciTotalCost = vciCostPerKm * mileage;
    const veCostPerKm = veEnergyConsumption * electricidadPrecio;
    const veTotalCost = veCostPerKm * mileage;

    document.getElementById('vci-total-cost').textContent = '$' + vciTotalCost.toFixed(2) + ' MXN';
    document.getElementById('ve-total-cost').textContent = '$' + veTotalCost.toFixed(2) + ' MXN';

    // Calcular emisiones totales
    const vciEmissions = (1 / vciRendimiento) * gasolinaFactorEmision;
    const vciTotalEmissions = vciEmissions * mileage;
    const veEmissions = veEnergyConsumption * electricidadFactorEmision;
    const veTotalEmissions = veEmissions * mileage;

    document.getElementById('vci-total-emissions').textContent = vciTotalEmissions.toFixed(2) + ' kgCO2';
    document.getElementById('ve-total-emissions').textContent = veTotalEmissions.toFixed(2) + ' kgCO2';
}