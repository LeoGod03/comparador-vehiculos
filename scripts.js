
// Importar Supabase correctamente
// Crear el cliente de Supabase correctamente
const supabase = window.supabase.createClient(
    'https://ivvregyexgtkkqahveum.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2dnJlZ3lleGd0a2txYWh2ZXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NDE5ODYsImV4cCI6MjA2NDQxNzk4Nn0.twDkCOdE4rUErbH4bAY1GMQEzpz4dnZqLfT-iz8Zj4U'
);

console.log("✅ Supabase inicializado correctamente");
// Variables para almacenar los vehículos seleccionados
let selectedVci = null;
let selectedVe = null;

        // Constantes para cálculos
const gasolinaPrecio = 24; // pesos/litro
const electricidadPrecio = 3.95; // pesos/kWh
const gasolinaDensidad = 0.723; // kg/litro
const gasolinaFactorEmision = 2.265; // kgCO2/litro
const electricidadFactorEmision = 0.12; // kgCO2/kWh (promedio en México)

// Inicializar los selectores
document.addEventListener('DOMContentLoaded', () => {
    populateBrands('vci-brand', 'VCI'); // Cargar marcas de vehículos de combustión interna
    populateBrands('ve-brand', 'VE');   // Cargar marcas de vehículos eléctricos
});

async function populateBrands(selectId, tipo) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Seleccione Marca</option>'; // Limpia el selector antes de llenarlo

    let { data: vehiculos, error } = await supabase.from('vehiculos')
                                                    .select('marca')
                                                    .eq('tipo', tipo);

    if (error) {
        console.error('Error al obtener marcas:', error);
        return;
    }

            const brands = [...new Set(vehiculos.map(item => item.marca))];

            brands.forEach(brand => {
                const option = document.createElement('option');
                option.value = brand;
                option.textContent = brand;
                select.appendChild(option);
            });
        }


        async function updateVciSubbrands() {
            const brandSelect = document.getElementById('vci-brand');
            const subbrandSelect = document.getElementById('vci-subbrand');
            const modelSelect = document.getElementById('vci-model');

            // Limpiar selects
            subbrandSelect.innerHTML = '<option value="">Seleccione Submarca</option>';
            modelSelect.innerHTML = '<option value="">Seleccione Modelo</option>';

            if (!brandSelect.value) return;

            // Obtener submarcas desde Supabase
            let { data: submarcas, error } = await supabase
                .from('vehiculos')
                .select('submarca')
                .eq('marca', brandSelect.value)
                .eq('tipo', 'VCI');

            if (error) {
                console.error('Error al obtener submarcas:', error);
                return;
            }

            // Filtrar y llenar el selector
            const uniqueSubbrands = [...new Set(submarcas.map(item => item.submarca))];
            uniqueSubbrands.forEach(submarca => {
                const option = document.createElement('option');
                option.value = submarca;
                option.textContent = submarca;
                subbrandSelect.appendChild(option);
            });
        }

        async function updateVciModels() {
            const brandSelect = document.getElementById('vci-brand');
            const subbrandSelect = document.getElementById('vci-subbrand');
            const modelSelect = document.getElementById('vci-model');

            // Limpiar el selector de modelos
            modelSelect.innerHTML = '<option value="">Seleccione Modelo</option>';

            if (!brandSelect.value || !subbrandSelect.value) return;

            // Consultar Supabase para obtener los modelos de la marca y submarca seleccionadas
            let { data: modelos, error } = await supabase
                .from('vehiculos')
                .select('modelo')
                .eq('marca', brandSelect.value)
                .eq('submarca', subbrandSelect.value)
                .eq('tipo', 'VCI');

            if (error) {
                console.error('Error al obtener modelos:', error);
                return;
            }

            // Llenar el select con los modelos obtenidos
            modelos.forEach(({ modelo }) => {
                const option = document.createElement('option');
                option.value = modelo;
                option.textContent = modelo;
                modelSelect.appendChild(option);
            });
        }

        async function showVciDetails() {
            const brandSelect = document.getElementById('vci-brand');
            const subbrandSelect = document.getElementById('vci-subbrand');
            const modelSelect = document.getElementById('vci-model');

            if (!brandSelect.value || !subbrandSelect.value || !modelSelect.value) return;

            // Consultar Supabase para obtener los detalles del vehículo seleccionado
            let { data: vehiculo, error } = await supabase
                .from('vehiculos')
                .select('*')
                .eq('marca', brandSelect.value)
                .eq('submarca', subbrandSelect.value)
                .eq('modelo', modelSelect.value)
                .eq('tipo', 'VCI')
                .single();

            if (error || !vehiculo) {
                console.error('Error al obtener detalles:', error);
                return;
            }

            // Mostrar detalles en la interfaz
            const detailsDiv = document.getElementById('vci-details');
            detailsDiv.innerHTML = `
                <h2>${vehiculo.marca} ${vehiculo.submarca} ${vehiculo.modelo}</h2>
                <table>
                    <tr><th>Potencia</th><td>${vehiculo.potencia} HP</td></tr>
                    <tr><th>Rendimiento</th><td>${vehiculo.rendimiento} km/l</td></tr>
                    <tr><th>Pasajeros</th><td>${vehiculo.pasajeros}</td></tr>
                    <tr><th>Características</th><td>${vehiculo.caracteristicas}</td></tr>
                    <tr><th>Combustible</th><td>${vehiculo.combustible}</td></tr>
                    <tr><th>Transmisión</th><td>${vehiculo.transmision}</td></tr>
                    <tr><th>Cilindros</th><td>${vehiculo.cilindros}</td></tr>
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
                .eq('marca', brandSelect.value)
                .eq('tipo', 'VE');

            if (error) {
                console.error('Error al obtener submarcas:', error);
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
                .eq('tipo', 'VE');

            if (error) {
                console.error('Error al obtener modelos:', error);
                return;
            }

            // Llenar el select con los modelos obtenidos
            modelos.forEach(({ modelo }) => {
                const option = document.createElement('option');
                option.value = modelo;
                option.textContent = modelo;
                modelSelect.appendChild(option);
            });
        }

        // Función para mostrar los detalles del VE seleccionado
        async function showVeDetails() {
            const brandSelect = document.getElementById('ve-brand');
            const subbrandSelect = document.getElementById('ve-subbrand');
            const modelSelect = document.getElementById('ve-model');

            if (!brandSelect.value || !subbrandSelect.value || !modelSelect.value) return;

            // Consultar Supabase para obtener los detalles del vehículo seleccionado
            let { data: vehiculo, error } = await supabase
                .from('vehiculos')
                .select('*')
                .eq('marca', brandSelect.value)
                .eq('submarca', subbrandSelect.value)
                .eq('modelo', modelSelect.value)
                .eq('tipo', 'VE')
                .single();

            if (error || !vehiculo) {
                console.error('Error al obtener detalles:', error);
                return;
            }

            // Mostrar detalles en la interfaz
            const detailsDiv = document.getElementById('ve-details');
            detailsDiv.innerHTML = `
                <h2>${vehiculo.marca} ${vehiculo.submarca} ${vehiculo.modelo}</h2>
                <table>
                    <tr><th>Potencia</th><td>${vehiculo.potencia} HP</td></tr>
                    <tr><th>Rendimiento</th><td>${vehiculo.rendimiento} km/kWh</td></tr>
                    <tr><th>Autonomía</th><td>${vehiculo.autonomia} km</td></tr>
                    <tr><th>Capacidad de batería</th><td>${vehiculo.bateria} kWh</td></tr>
                    <tr><th>Carga rápida</th><td>${vehiculo.carga_rapida ? vehiculo.carga_rapida + ' kW' : 'No'}</td></tr>
                    <tr><th>Pasajeros</th><td>${vehiculo.pasajeros}</td></tr>
                    <tr><th>Características</th><td>${vehiculo.caracteristicas}</td></tr>
                </table>
            `;

            // Mostrar comparación si ambos vehículos están seleccionados
            if (selectedVci && selectedVe) {
                showComparison();
            }
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
            const vciRendimiento = selectedVci.rendimiento || 1; // Fallback para evitar división por 0
            const veRendimiento = selectedVe.rendimiento || 1;

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