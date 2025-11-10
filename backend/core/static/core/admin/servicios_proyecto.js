/**
 * Script para el admin de ServiciosProyecto.
 * Filtra los proyectos disponibles segun la obra elegida sin salir de la pagina.
 */
(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        const obraSelect = document.getElementById("id_obra");
        const proyectoSelect = document.getElementById("id_proyecto");

        if (!obraSelect || !proyectoSelect) {
            return;
        }

        const endpoint = obraSelect.dataset.projectsEndpoint || proyectoSelect.dataset.endpoint || "";
        const selectedProyecto = proyectoSelect.value;

        function renderOptions(proyectos, seleccionado) {
            proyectoSelect.innerHTML = "";
            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = "Seleccione un proyecto";
            proyectoSelect.appendChild(placeholder);

            proyectos.forEach((proyecto) => {
                const option = document.createElement("option");
                option.value = proyecto.id;
                option.textContent = proyecto.nombre_proyecto ?? proyecto.nombre;
                if (seleccionado && Number(seleccionado) === Number(proyecto.id)) {
                    option.selected = true;
                }
                proyectoSelect.appendChild(option);
            });
        }

        async function cargarProyectos(obraId, seleccionado) {
            if (!obraId || !endpoint) {
                renderOptions([], null);
                return;
            }

            try {
                const response = await fetch(`${endpoint}?obra=${obraId}`, {
                    credentials: "same-origin",
                    headers: {
                        "X-Requested-With": "XMLHttpRequest",
                        Accept: "application/json",
                    },
                });
                if (!response.ok) {
                    throw new Error("No se pudieron obtener proyectos para la obra seleccionada.");
                }
                const proyectos = await response.json();
                renderOptions(proyectos, seleccionado);
            } catch (error) {
                console.error(error);
                renderOptions([], null);
            }
        }

        obraSelect.addEventListener("change", function () {
            cargarProyectos(this.value, null);
        });

        if (obraSelect.value) {
            cargarProyectos(obraSelect.value, selectedProyecto);
        } else {
            renderOptions([], selectedProyecto);
        }
    });
})();
