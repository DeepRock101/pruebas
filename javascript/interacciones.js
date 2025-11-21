// Variables globales
let map;
let marcadores = {};
let capasGeoJSON = [];
let popup = L.popup();

// Aca se puede realizar la modificacion del texto por departamente, se trabaja con el nombre del json para 
// poder identificar  algún texto especifico del departamento
const textosPersonalizados = {
    Guatemala: {
        "Alta Verapaz": "Esto unicamente es un prueba jajaj.",
        "Huehuetenango": "Esto unicamente es un prueba jaja",
    },
    
    "Municipios Guatemala": {
    "Mixco": "Mixco es uno de los municipios más poblados...",
    "Villa Nueva": "Villa Nueva se caracteriza por...",

},

    
    "El Salvador": {
        "San Salvador": "Texto para San Salvador, El Salvador...",
        "La Libertad": "Texto para La Libertad, El Salvador...",
    },
};

// Función mejorada para determinar si un punto está dentro de un polígono
function puntoEnPoligono(point, polygons) {
    const x = point.lat;
    const y = point.lng;
    
    let inside = false;
    
    // Para cada polígono (puede ser multipolígono)
    polygons.forEach(polygon => {
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];
            
            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            
            if (intersect) inside = !inside;
        }
    });
    
    return inside;
}

// Función mejorada para contar marcadores en cada departamento/municipio
function contarMarcadoresEnDepartamento(feature) {
    let contador = 0;
    
    Object.values(marcadores).forEach((marcador) => {
        const latlng = marcador.elemento.getLatLng();
        const point = [latlng.lng, latlng.lat]; // [longitud, latitud] para GeoJSON
        
        // Verificar si el punto está en el polígono
        if (estaPuntoEnFeature(point, feature)) {
            contador++;
        }
    });
    
    return contador;
}

// Función para verificar si un punto está en una feature
function estaPuntoEnFeature(point, feature) {
    if (!feature.geometry || !feature.geometry.coordinates) return false;
    
    const coords = feature.geometry.coordinates;
    const [lng, lat] = point;
    
    // Para Polygon
    if (feature.geometry.type === 'Polygon') {
        return puntoEnPoligonoCoords([lat, lng], coords);
    }
    // Para MultiPolygon
    else if (feature.geometry.type === 'MultiPolygon') {
        for (let polygon of coords) {
            if (puntoEnPoligonoCoords([lat, lng], polygon)) {
                return true;
            }
        }
    }
    
    return false;
}

// Función para punto en polígono con coordenadas GeoJSON
function puntoEnPoligonoCoords(point, polygons) {
    const x = point[0]; // lat
    const y = point[1]; // lng
    
    let inside = false;
    
    for (let polygon of polygons) {
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][1], yi = polygon[i][0]; // [lng, lat] -> [lat, lng]
            const xj = polygon[j][1], yj = polygon[j][0];
            
            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            
            if (intersect) inside = !inside;
        }
    }
    
    return inside;
}

// Inicialización del mapa, lo trabajamos con tanto con openstreedmap como con librerias de leaflet
function inicializarMapa() {
    map = L.map("mapa").setView([15.5, -90.25], 7);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    inicializarMarcadores();
    configurarEventos();
    cargarCapasGeoJSON();
}

// Inicializar marcadores
function inicializarMarcadores() {
    // En este parte se puede trabajar unicamente con los marcadores predeterminados de Leaflet
    // Se puede ordenar tanto por tipo como por categoria para que filtro funcione
    marcadores = {
        prueba: {
            categoria: "conservacion",
            elemento: L.marker([14.538806, -90.596888])
                .addTo(map)
                .bindPopup("<b>Prueba de proyecto de conservación</b><br>Solo soy una prueba <img></b> ."),
        },
        prueba2: {
            categoria: "mitigacion",
            elemento: L.marker([14.537701, -90.5919])
                .addTo(map)
                .bindPopup(`<b>Prueba de proyecto de mitigación </b><br>Solo soy una prueba2.<br>
                  <a href="mee.org">
              <img src="Imagenes/planeta-tierra.png"
                style=" height: 40px; vertical-align: middle; margin-right: 4px; width: 40px;"/>`)
        },
        prueba3: {
            categoria: "mitigacion",
            elemento: L.marker([14.536173, -90.597553])
                .addTo(map)
                .bindPopup(`<b>Prueba de proyecto de mitigación </b><br>Solo soy una prueba2.<br>
                  <a href="https://meegt.org/">
              <img src="Imagenes/planeta-tierra.png"
                style=" height: 40px; vertical-align: middle; margin-right: 4px; width: 40px;"/>`)
        },
        prueba4: {   
            categoria: "gestion",
            elemento: L.marker([14.533922, -90.590339])
                .addTo(map)
                .bindPopup(`<b>Prueba de proyecto de gestion </b><br>Solo soy una prueba4.<br>
                  <a href="mee.org">
              <img src="Imagenes/planeta-tierra.png"
                style=" height: 40px; vertical-align: middle; margin-right: 4px; width: 40px;"/>`)
        },
        prueba5: {
            categoria: "adaptacion",
            elemento: L.marker([15.561014, -90.052634])
                .addTo(map)
                .bindPopup("<b>Prueba3</b><br>Soy un subtexto3."),
        },
        prueba6: {
            categoria: "educacion",
            elemento: L.marker([15.616060, -91.759186])
                .addTo(map)
                .bindPopup("<b>Prueba3</b><br>Soy un subtexto3."),
        },
        prueba7: {
            categoria: "educacion",
            elemento: L.marker([15.027475, -91.372142
])
                .addTo(map)
                .bindPopup("<b>Prueba3</b><br>Soy un subtexto3."),
        },
    };

    // En este parte se puede trabajar unicamente con los marcadores personalizados 
    // Tiene la misma funcionalidad de los marcadores preterminados unicamente, se puede ponder una imagen para cambiar el marcador
    // y mejor el entorno visual
    var Ubicacion = L.icon({
        iconUrl: "imagenes/ubicacion (1).png",
        iconSize: [38, 55],
        iconAnchor: [26, 54],
        popupAnchor: [-3, -76],
    });

    marcadores["personalizado1"] = {
        categoria: "gestion",
        elemento: L.marker([14.540018, -90.572786], { icon: Ubicacion })
            .addTo(map)
            .bindPopup(
                "<b>Prueba5 </b><br><a href='https://meegt.org/' target='_blank'>https://meegt.org/</a>"
            ),
    };
    marcadores["personalizado2"] = {
    
        categoria: "adaptacion",
        elemento: L.marker([14.539566, -90.572624], { icon: Ubicacion })
            .addTo(map)
            .bindPopup(
                "<b>Prueba6 </b><br><a href='https://meegt.org/' target='_blank'>https://meegt.org/</a>"
            ),
    };
    marcadores["personalizado3"] = {
        categoria: "adaptacion",
        elemento: L.marker([14.539897, -90.573583], { icon: Ubicacion })
            .addTo(map)
            .bindPopup(
                "<b>Prueba7 </b><br><a href='https://meegt.org/' target='_blank'>https://meegt.org/</a>"
            ),
    };
}

// Configurar eventos
function configurarEventos() {


    map.on("click", onMapClick);


    document.querySelectorAll('#filtros input[type="checkbox"]').forEach((checkbox) => {
        checkbox.addEventListener("change", aplicarFiltros);
    });

    // Botón Mostrar todos, sirve para poder mostrar todos los eventos sin importanar su categoria mostrando todo
    document.getElementById("btn-reset").addEventListener("click", function () {
        document.querySelectorAll('#filtros input[type="checkbox"]').forEach((checkbox) => {
            checkbox.checked = true;
        });
        aplicarFiltros();
    });

    // Botón Quitar todos, sirve para quitar todos los eventos sin importar su categoria mostrando todo
    document.getElementById("btn-quitar-todos").addEventListener("click", function () {
        document.querySelectorAll('#filtros input[type="checkbox"]').forEach((checkbox) => {
            checkbox.checked = false;
        });
        aplicarFiltros();
    });

    // Botón toggle filtros, este boton sirve para la interacción movil para que salga un menu
    // estilo hambuerguesa y se muestre los filtros
    document.getElementById("btn-toggle-filtros").addEventListener("click", () => {
        document.getElementById("filtros").classList.toggle("mostrar");
    });
}



// Funición perteneciente al uso del filtro 
function aplicarFiltros() {
    const filtros = obtenerEstadoFiltros();
    
    Object.keys(marcadores).forEach((key) => {
        const marcador = marcadores[key];
        const mostrar = evaluarSoloCategoria(marcador, filtros);
        actualizarVisibilidadMarcador(marcador, mostrar);
    });
}

function obtenerEstadoFiltros() {
    return {
        // Solo categorías de los botones
        conservacion: document.getElementById("categoria-conservacion").checked,
        mitigacion: document.getElementById("categoria-mitigacion").checked,
        gestion: document.getElementById("categoria-gestion").checked,
        adaptacion: document.getElementById("categoria-adaptacion").checked,
        educacion: document.getElementById("categoria-educacion").checked
    };
}

function evaluarSoloCategoria(marcador, filtros) {
    // Mapa directo de categorías a filtros
    const mapaCategorias = {
        "conservacion": filtros.conservacion,
        "mitigacion": filtros.mitigacion,
        "gestion": filtros.gestion,
        "adaptacion": filtros.adaptacion,
        "educacion": filtros.educacion
    };
    
    // Verificar si la categoría del marcador está activa
    return mapaCategorias[marcador.categoria] || false;
}

function actualizarVisibilidadMarcador(marcador, mostrar) {
    if (mostrar) {
        map.addLayer(marcador.elemento);
    } else {
        map.removeLayer(marcador.elemento);
    }
}

    // Funcion para mostrar coordenadas al hacer click en el mapa, unicamente funciona en la capa donde
    // no se tiene un mapa coroplético
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent(
            "Coordenadas: " +
            e.latlng.lat.toFixed(6) +
            ", " +
            e.latlng.lng.toFixed(6)
        )
        .openOn(map);
}

// Funciones para el mapa coroplético
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: "#666",
        dashArray: "",
        fillOpacity: 0.7,
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function resetHighlight(e) {
    var layer = e.target;
    var cantidadMarcadores = contarMarcadoresEnDepartamento(layer.feature);

    layer.setStyle({
        fillColor: getColorPorMarcadores(cantidadMarcadores),
        weight: 2,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.7,
    });
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature,
    });
}

function getColorPorMarcadores(cantidad) {
    return cantidad >= 15 ? "#8B0000"    // Extremo - Rojo oscuro intenso
        : cantidad >= 12 ? "#B22222"     // Muy alto - Rojo fuego
        : cantidad >= 9  ? "#DC143C"     // Alto - Rojo carmesí
        : cantidad >= 7  ? "#FF4500"     // Medio-alto - Rojo naranja
        : cantidad >= 5  ? "#FF6347"     // Medio - Rojo tomate
        : cantidad >= 3  ? "#FF7F50"     // Moderado bajo - Rojo coral
        : cantidad >= 1  ? "#FFA07A"     // Bajo - Rojo salmón claro
        : "#cccccc";                     // Gris para territorios sin proyectos
}


//---------------------------------------------------------------------------------------------------------------------

// Función auxiliar para crear capa GeoJSON
function crearCapaGeoJSON(url, propiedades) {
    return fetch(url)
        .then((response) => response.json())
        .then((data) => {
            var capa = L.geoJSON(data, {
                style: function (feature) {
                    const cantidadMarcadores = contarMarcadoresEnDepartamento(feature);

                    return {
                        fillColor: getColorPorMarcadores(cantidadMarcadores),
                        weight: 3, // Aumentamos el peso para mejor visualización de bordes
                        opacity: 1,
                        color: "white",
                        dashArray: "3",
                        fillOpacity: 0.7,
                    };
                },
                onEachFeature: function (feature, layer) {
                    const cantidadMarcadores = contarMarcadoresEnDepartamento(feature);

                    // Guardar el estilo original en la capa
                    layer._originalStyle = {
                        fillColor: getColorPorMarcadores(cantidadMarcadores),
                        weight: 3,
                        opacity: 1,
                        color: "white",
                        dashArray: "3",
                        fillOpacity: 0.7,
                    };

                    // Obtener texto personalizado
                    const textoPersonalizado = textosPersonalizados[propiedades.pais]?.[feature.properties.name];

                    // Obtener nombre de la feature
                    const nombreFeature = feature.properties.name || feature.properties.NOMBRE || 'Sin nombre';

                    // Este aparatado es para la configuración de popup de marcadores 
                    // se puede configurar los mensajes personalizados de acuerdo a la
                    // mismas estructurua que se tiene dentro de la linea 7
                    const popupContent = `
                        <div style="min-width: 250px;">
                            <h3 style="color: #2c3e50; margin-bottom: 10px; border-bottom: 2px solid #3498db; padding-bottom: 5px;">
                                ${nombreFeature}
                            </h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                                <div style="background: #e8f4fd; padding: 8px; border-radius: 5px;">
                                    <strong>Proyectos</strong><br>
                                    <span style="font-size: 18px; color: #2c3e50;">${cantidadMarcadores}</span>
                                </div>
                                <div style="background: #e8f4fd; padding: 8px; border-radius: 5px;">
                                    <strong>Tipo</strong><br>
                                    <span style="color: #2c3e50;">${propiedades.pais === "Municipios Guatemala" ? "Municipio" : "Departamento"}</span>
                                </div>
                            </div>
                            <p style="margin: 5px 0;"><strong>País:</strong> ${propiedades.pais === "Municipios Guatemala" ? "Guatemala" : propiedades.pais}</p>
                            ${textoPersonalizado ? `
                                <div style="margin-top: 10px; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px;">
                                    <p style="margin: 0; font-size: 13px; color: #856404;">
                                        <strong>Información:</strong><br>
                                        ${textoPersonalizado}
                                    </p>
                                </div>
                            ` : ""}
                        </div>
                    `;

                    layer.bindPopup(popupContent);

                    // Mantener las interacciones
                    layer.on({
                        mouseover: highlightFeature,
                        mouseout: resetHighlight,
                        click: zoomToFeature,
                    });
                },
            });

            // Guardar la capa en el array global
            capasGeoJSON.push(capa);
            return capa;
        });
}

// Cargar capas GeoJSON de esta manera sirve para solo usar la capa que deseamos ver
function cargarCapasGeoJSON() {
    // Definir capas base principal
    var osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
    });



    // De momento esta es la idea de la segunda capa base pero, la encuentro trabajando con otro mapa
    // y no queda cmo deseo , recuerda de querer eliminar esta capa tiene que elimianr tod lo OSMHOT
    var osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'});

    


// variables de las capas, recordatoria si se van añadir más capas es necesario que se guarde como mapa__ y diminutivo del pais
// se puede usar de ejemplo las variables actuales. 
// en dado caso se pueden agregar tantas capas como se deseed, aca usamos los que son los geojson
    var mapagt = L.layerGroup();
    var mapagtm = L.layerGroup();
   //var mapasv = L.layerGroup();
    var capaGeneralTodos = L.layerGroup();

    // Cargar de departamentos Guatemala
    crearCapaGeoJSON("jsons/mapa2.gt.geojson", { pais: "Guatemala" }).then((capaGT) => {
        capaGT.addTo(mapagt);
        capaGT.addTo(capaGeneralTodos);
    });

    // Cargar de municipios Guatemala - USAR "municipiosgt" es el nombre del archivo
    crearCapaGeoJSON("jsons/municipiosgt.geojson", { pais: "Municipios Guatemala" }).then((capaMunicipios) => {
        capaMunicipios.addTo(mapagtm);
        capaMunicipios.addTo(capaGeneralTodos);
    });


    // Cargar El Salvador recurda que ahorita la capa para hn se encuentra comentada puede ver liena 399 y 
    //el archivo donde se extraen los datos los tienes como archivo.json, el nombre correcto es el sv.json
    crearCapaGeoJSON("jsons/sv.json", { pais: "El Salvador" }).then((capaSV) => {
        capaSV.addTo(mapasv);
        capaSV.addTo(capaGeneralTodos);
    });

    // Definir capas para el control
    var baseLayers = {
        "OpenStreetMap Estándar": osm,  
        "Mapa HOT": osmHOT,
    };

    var overlayLayers = {
        "Todos los Países": capaGeneralTodos,
        "Departentos": mapagt,
        "Municipios": mapagtm,
        //"El Salvador": mapasv,
    };

    // Añadir control de capas
    L.control
        .layers(baseLayers, overlayLayers, {
            position: "topright",
        })
        .addTo(map);

    // Añadir las capas iniciales al mapa
    osm.addTo(map);
    osmHOT.addTo(map);
    capaGeneralTodos.addTo(map);
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    inicializarMapa();
});





