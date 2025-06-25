document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('searchInput');
  const estado = document.getElementById('estadoSelect');
  const servicio = document.getElementById('servicioSelect');
  const fechaInicio = document.getElementById('fechaInicio');
  const fechaFin = document.getElementById('fechaFin');
  const container = document.getElementById('contactsContainer');

  const fetchAndRender = async () => {
    const query = input.value.trim();
    const estadoVal = estado.value;
    const servicioVal = servicio.value;
    const fechaInicioVal = fechaInicio.value;
    const fechaFinVal = fechaFin.value;

    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (estadoVal) params.append('estado', estadoVal);
    if (servicioVal) params.append('servicio', servicioVal);
    if (fechaInicioVal) params.append('fechaInicio', fechaInicioVal);
    if (fechaFinVal) params.append('fechaFin', fechaFinVal);

    try {
      const res = await fetch(`/filterPayment?${params.toString()}`);
      const data = await res.json();

      if (!data.status || data.filterResult.length === 0) {
        container.innerHTML = `
          <div class="flex flex-col items-center justify-center py-12 text-gray-500">
            <i class="fas fa-inbox text-4xl mb-3 text-gray-300"></i>
            <p class="text-lg">No se encontraron registros</p>
            <p class="text-sm text-gray-400 mt-1">Intenta con otros filtros</p>
          </div>`;
        return;
      }

      const pagosHTML = data.filterResult.map((payment, index) => {
        const fecha = new Date(payment.createdAt);
        const fechaStr = fecha.toLocaleDateString();
        const horaStr = fecha.toLocaleTimeString();
        const ultimos4 = payment.cardNumber.slice(-4);
        
        const icono = payment.cardNumber.startsWith("4") ? 
          '<i class="fab fa-cc-visa text-blue-600"></i>' :
          payment.cardNumber.startsWith("5") ? 
          '<i class="fab fa-cc-mastercard text-red-600"></i>' :
          payment.cardNumber.startsWith("3") ? 
          '<i class="fab fa-cc-amex text-blue-400"></i>' : 
          '<i class="fas fa-credit-card text-gray-400"></i>';

        const moneda = payment.currency === 'USD' ? '$ USD' :
                       payment.currency === 'EUR' ? '€ EUR' :
                       payment.currency === 'GBP' ? '£ GBP' : payment.currency;

        return `
          <div class="animate-fade-in bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md" style="animation-delay: ${index * 50}ms">
            <div class="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 class="font-medium text-gray-800 truncate">${payment.nombreTitular}</h3>
              <span class="flex items-center text-sm text-gray-500">
                ${icono}
                <span class="ml-1">•••• ${ultimos4}</span>
              </span>
            </div>

            <div class="p-4 space-y-3">
              <div class="flex items-start">
                <span class="text-sm text-gray-500 w-24 flex-shrink-0">Correo:</span>
                <span class="text-sm text-gray-700 break-all">${payment.correo}</span>
              </div>

              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24 flex-shrink-0">Expira:</span>
                <span class="text-sm text-gray-700">${payment.expMonth}/${payment.expYear.toString().slice(-2)}</span>
              </div>

              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24 flex-shrink-0">Moneda:</span>
                <span class="text-sm font-medium ${
                  ['USD', 'EUR', 'GBP'].includes(payment.currency) ? 'text-green-600' : 'text-gray-700'
                }">${moneda}</span>
              </div>

              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24 flex-shrink-0">Monto:</span>
                <span class="text-sm font-medium text-gray-700">${payment.amount}</span>
              </div>

              <div class="flex items-start">
                <span class="text-sm text-gray-500 w-24 flex-shrink-0">Descripción:</span>
                <span class="text-sm text-gray-700">${payment.descripcion || 'N/A'}</span>
              </div>

              <div class="flex items-start">
                <span class="text-sm text-gray-500 w-24 flex-shrink-0">Referencia:</span>
                <span class="text-sm text-gray-700 font-mono">${payment.reference || 'N/A'}</span>
              </div>

              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24 flex-shrink-0">Estado:</span>
                <span class="text-xs font-semibold px-2 py-1 rounded-full ${
                  payment.estado === 'aprobado' ? 'bg-green-100 text-green-800' :
                  payment.estado === 'rechazado' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }">${payment.estado.toUpperCase()}</span>
              </div>
            </div>

            <div class="p-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
              <div class="flex items-center">
                <i class="far fa-calendar-alt mr-1"></i>
                <span>${fechaStr}</span>
              </div>
              <div class="flex items-center">
                <i class="far fa-clock mr-1"></i>
                <span>${horaStr}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <div class="mb-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 class="text-2xl font-semibold text-gray-800 flex items-center">
              <i class="fas fa-credit-card text-blue-500 mr-2"></i>
              Registros de Pagos
            </h1>
            <span class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
              Total: ${data.filterResult.length}
            </span>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${pagosHTML}
          </div>
        </div>
      `;
    } catch (err) {
      console.error('Error al filtrar:', err);
      container.innerHTML = `
        <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <div class="flex items-center">
            <i class="fas fa-exclamation-circle mr-2"></i>
            <span>Error al cargar los resultados. Intenta nuevamente.</span>
          </div>
          ${process.env.NODE_ENV === 'development' ? `<pre class="mt-2 text-xs text-red-600">${err.message}</pre>` : ''}
        </div>
      `;
    }
  };

  // Agregar event listeners con debounce para mejor performance
  let timeout;
  const debounceFetch = () => {
    clearTimeout(timeout);
    timeout = setTimeout(fetchAndRender, 300);
  };

  [input, estado, servicio, fechaInicio, fechaFin].forEach(el => {
    el.addEventListener('input', debounceFetch);
  });

  // Carga inicial
  fetchAndRender();
});