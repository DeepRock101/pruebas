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
    "Honduras": {
        "Francisco Morazán": "Texto para Francisco Morazán, Honduras...",
        "Cortés": "Texto para Cortés, Honduras...",
    },
    "El Salvador": {
        "San Salvador": "Texto para San Salvador, El Salvador...",
        "La Libertad": "Texto para La Libertad, El Salvador...",
    },
};

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
            tipo: "marcador",
            categoria: "conservacion",
            elemento: L.marker([14.538806, -90.596888])
                .addTo(map)
                .bindPopup("<b>Prueba de proyecto de conservación</b><br>Solo soy una prueba <img></b> ."),
        },
        prueba2: {
            tipo: "marcador",
            categoria: "mitigacion",
            elemento: L.marker([14.537701, -90.5919])
                .addTo(map)
                .bindPopup(`<b>Prueba de proyecto de mitigación </b><br>Solo soy una prueba2.<br>
                  <a href="mee.org">
              <img src="Imagenes/planeta-tierra.png"
                style=" height: 40px; vertical-align: middle; margin-right: 4px; width: 40px;"/>`)
        },
        prueba3: {
            tipo: "marcador",
            categoria: "mitigacion",
            elemento: L.marker([14.536173, -90.597553])
                .addTo(map)
                .bindPopup(`<b>Prueba de proyecto de mitigación </b><br>Solo soy una prueba2.<br>
                  <a href="https://meegt.org/">
              <img src="Imagenes/planeta-tierra.png"
                style=" height: 40px; vertical-align: middle; margin-right: 4px; width: 40px;"/>`)
        },
        prueba4: {
            tipo: "marcador",
            categoria: "gestion",
            elemento: L.marker([14.533922, -90.590339])
                .addTo(map)
                .bindPopup(`<b>Prueba de proyecto de gestion </b><br>Solo soy una prueba4.<br>
                  <a href="mee.org">
              <img src="Imagenes/planeta-tierra.png"
                style=" height: 40px; vertical-align: middle; margin-right: 4px; width: 40px;"/>`)
        },
        prueba5: {
            tipo: "marcador",
            categoria: "prueba4",
            elemento: L.marker([15.561014, -90.052634])
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
        tipo: "marcador",
        categoria: "gestion",
        elemento: L.marker([14.540018, -90.572786], { icon: Ubicacion })
            .addTo(map)
            .bindPopup(
                "<b>Prueba5 </b><br><a href='https://meegt.org/' target='_blank'>https://meegt.org/</a>"
            ),
    };
    marcadores["personalizado2"] = {
        tipo: "marcador",
        categoria: "prueba4",
        elemento: L.marker([14.539566, -90.572624], { icon: Ubicacion })
            .addTo(map)
            .bindPopup(
                "<b>Prueba6 </b><br><a href='https://meegt.org/' target='_blank'>https://meegt.org/</a>"
            ),
    };
    marcadores["personalizado3"] = {
        tipo: "circulo",
        categoria: "prueba4",
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

    // La configuracion para filtros
    document.querySelectorAll('#filtros input[type="checkbox"]').forEach((checkbox) => {
        checkbox.addEventListener("change", aplicarFiltros);
    });

    // Botón Mostrar todos, sirve para poder mostrar todos los eventos sin importanar su categoria o tipo
    document.getElementById("btn-reset").addEventListener("click", function () {
        document.querySelectorAll('#filtros input[type="checkbox"]').forEach((checkbox) => {
            checkbox.checked = true;
        });
        aplicarFiltros();
    });

    // Botón Quitar todos, sirve para quitar todos los eventos sin importar su categoria o evento
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

// Función para aplicar filtros
function aplicarFiltros() {
    const conservacion = document.getElementById("categoria-conservacion").checked;
    const mitigacion = document.getElementById("categoria-mitigacion").checked;
    const gestion = document.getElementById("categoria-gestion").checked;
    const adaptacion = document.getElementById("categoria-prueba4").checked;
    const iniciados = document.getElementById("tipo-marcador").checked;
    const terminados = document.getElementById("tipo-marcadorR").checked;
    const replicados = document.getElementById("tipo-circulo").checked;

    Object.keys(marcadores).forEach((key) => {
        const marcador = marcadores[key];
        let mostrar = false;

        if (marcador.tipo === "circulo") {
            if (replicados) {
                mostrar = true;
            }
        } else if (marcador.tipo === "marcador") {
            if (
                (marcador.categoria === "conservacion" && conservacion) ||
                (marcador.categoria === "mitigacion" && mitigacion) ||
                (marcador.categoria === "gestion" && gestion)
            ) {
                if (iniciados) {
                    mostrar = true;
                }
            } else if (marcador.categoria === "prueba4" && adaptacion) {
                if (terminados) {
                    mostrar = true;
                }
            }
        }
        if (mostrar) {
            map.addLayer(marcador.elemento);
        } else {
            map.removeLayer(marcador.elemento);
        }
    });
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
    var layerBounds = L.geoJSON(layer.feature).getBounds();
    var cantidadMarcadores = contarMarcadoresEnDepartamento(layerBounds);

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

// Función para contar marcadores en cada departamento
function contarMarcadoresEnDepartamento(departamentoBounds) {
    let contador = 0;
    Object.values(marcadores).forEach((marcador) => {
        const latlng = marcador.elemento.getLatLng();
        if (departamentoBounds.contains(latlng)) {
            contador++;
        }
    });
    return contador;
}

// Función para obtener color según cantidad de marcadores que se encuentren en el mapa
function getColorPorMarcadores(cantidad) {
    return cantidad > 10
        ? "#ff4444" // Rojo
        : cantidad > 5
        ? "#ff8844" // Naranja
        : cantidad > 2
        ? "#ffff44" // Amarillo
        : cantidad > 0
        ? "#44ff44" // Verde
        : "#cccccc"; // Gris
}

// Función auxiliar para crear capa GeoJSON
function crearCapaGeoJSON(url, propiedades) {
    return fetch(url)
        .then((response) => response.json())
        .then((data) => {
            var capa = L.geoJSON(data, {
                style: function (feature) {
                    const layerBounds = L.geoJSON(feature).getBounds();
                    const cantidadMarcadores = contarMarcadoresEnDepartamento(layerBounds);

                    return {
                        fillColor: getColorPorMarcadores(cantidadMarcadores),
                        weight: 2,
                        opacity: 1,
                        color: "white",
                        dashArray: "3",
                        fillOpacity: 0.7,
                    };
                },
                onEachFeature: function (feature, layer) {
                    const layerBounds = L.geoJSON(feature).getBounds();
                    const cantidadMarcadores = contarMarcadoresEnDepartamento(layerBounds);

                    // Guardar el estilo original en la capa
                    layer._originalStyle = {
                        fillColor: getColorPorMarcadores(cantidadMarcadores),
                        weight: 2,
                        opacity: 1,
                        color: "white",
                        dashArray: "3",
                        fillOpacity: 0.7,
                    };

                    // Obtener texto personalizado
                    const textoPersonalizado = textosPersonalizados[propiedades.pais]?.[feature.properties.name];

                    // Ventana emergente con información, el mensaje se puede configutar en desde la linea 7 del codigo
                    // esto segun cada apartado que se desee
                    layer.bindPopup(`
                        <div style="min-width: 200px;">
                            <h3 style="color: #2c3e50; margin-bottom: 10px;">${feature.properties.name}</h3>
                            <p><strong>Proyectos realizados:</strong> ${cantidadMarcadores}</p>
                            <p><strong>País:</strong> ${propiedades.pais}</p>
                            ${textoPersonalizado ? `
                                <div style="margin-top: 10px; padding: 8px; background: #f0f8ff; border-left: 4px solid #3498db; border-radius: 3px;">
                                    <p style="margin: 0; font-size: 14px; color: #2c3e50;">${textoPersonalizado}</p>
                                </div>
                            ` : ""}
                            <div style="margin-top: 10px; padding: 5px; background: #f8f9fa; border-radius: 3px;">
                                <small>Color indica cantidad de proyectos</small>
                            </div>
                        </div>
                    `);

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
    // Definir capas base
    var osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
    });


// variables de las capas, recordatoria si se van añadir más capas es necesario que se guarde como mapa__ y diminutivo del pais
// se puede usar de ejemplo las variables actuales. 
// en dado caso se pueden agregar tantas capas como se deseeb
    var mapagt = L.layerGroup();
    var mapahn = L.layerGroup();
    var mapasv = L.layerGroup();
    var capaGeneralTodos = L.layerGroup();

    // Cargar Guatemala
    crearCapaGeoJSON("jsons/gt.json", { pais: "Guatemala" }).then((capaGT) => {
        capaGT.addTo(mapagt);
        capaGT.addTo(capaGeneralTodos);
    });

    // Cargar Honduras, recurda que ahorita la capa para hn se encuentra comentada puede ver liena 398 y 
    //el archivo donde se extraen los datos los tienes como archivo.json, el nombre correcto es el hn.json
    crearCapaGeoJSON("jsons/archivo.json", { pais: "Honduras" }).then((capaHN) => {
        capaHN.addTo(mapahn);
        capaHN.addTo(capaGeneralTodos);
    });

    // Cargar El Salvador recurda que ahorita la capa para hn se encuentra comentada puede ver liena 399 y 
    //el archivo donde se extraen los datos los tienes como archivo.json, el nombre correcto es el sv.json
    crearCapaGeoJSON("jsons/archivojson", { pais: "El Salvador" }).then((capaSV) => {
        capaSV.addTo(mapasv);
        capaSV.addTo(capaGeneralTodos);
    });

    // Definir capas para el control
    var baseLayers = {
        "OpenStreetMap Estándar": osm,
    };

    var overlayLayers = {
        "Todos los Países": capaGeneralTodos,
        "Guatemala": mapagt,
        //"Honduras": mapahn,
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
    capaGeneralTodos.addTo(map);
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    inicializarMapa();
});