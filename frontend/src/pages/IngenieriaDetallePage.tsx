import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    listarInstancias,
    listarCatalogoDispositivos,
    listarFunciones,
    listarProyectos,
    listarObras,
    listarAtributosMaestros,
    type InstanciaDispositivo,
    type CatalogoDispositivo,
    type FuncionDispositivo,
    type Proyecto,
    type Obra,
    type AtributoMaestro,
} from "../services/api";
import { InstanciaForm } from "@/components/InstanciaForm";
import { BatchInstanciaForm } from "@/components/BatchInstanciaForm";
import { InstanciaGroupedTable } from "@/components/InstanciaGroupedTable";
import { EstadisticasPanel } from "@/components/EstadisticasPanel";
import { Modal } from "@/components/Modal";
import { CatalogoFormModule } from "@/components/CatalogoFormModule";
import { EditarFuncionesModal } from "@/components/EditarFuncionesModal";
import { InstanciaDetallePanel } from "@/components/InstanciaDetallePanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function IngenieriaDetallePage() {
    const { proyectoId } = useParams<{ proyectoId: string }>();
    const pid = Number(proyectoId);

    const [instancias, setInstancias] = useState<InstanciaDispositivo[]>([]);
    const [catalogo, setCatalogo] = useState<CatalogoDispositivo[]>([]);
    const [masterFunciones, setMasterFunciones] = useState<FuncionDispositivo[]>([]);
    const [masterAtributos, setMasterAtributos] = useState<AtributoMaestro[]>([]);
    const [proyectoInfo, setProyectoInfo] = useState<Proyecto | null>(null);
    const [obraInfo, setObraInfo] = useState<Obra | null>(null);

    const [modalCatOpen, setModalCatOpen] = useState(false);
    const [modalFuncOpen, setModalFuncOpen] = useState(false);
    const [modalLoteOpen, setModalLoteOpen] = useState(false);
    const [instanciasSeleccionadas, setInstanciasSeleccionadas] = useState<InstanciaDispositivo[]>([]);
    const [catalogoIdSel, setCatalogoIdSel] = useState<number | null>(null);
    const [cargandoInicial, setCargandoInicial] = useState(true);

    const cargarDatos = () => {
        if (!pid) return;
        setCargandoInicial(true);
        Promise.all([
            listarInstancias(pid),
            listarCatalogoDispositivos(),
            listarFunciones(),
            listarAtributosMaestros(),
            listarProyectos(),
            listarObras(),
        ])
            .then(([i, c, f, attrs, proyectos, obras]) => {
                setInstancias(i);
                setCatalogo(c);
                setMasterFunciones(f);
                setMasterAtributos(attrs);
                const proj = proyectos.find((p) => p.id === pid) || null;
                setProyectoInfo(proj);
                if (proj) {
                    const obra = obras.find((o) => o.id === proj.obra) || null;
                    setObraInfo(obra);
                } else {
                    setObraInfo(null);
                }
            })
            .catch(console.error)
            .finally(() => setCargandoInicial(false));
    };

    useEffect(() => {
        cargarDatos();
    }, [pid]);

    const handleRefresh = () => cargarDatos();
    const handleInstanciaCreada = () => cargarDatos();
    const handleLoteCreado = () => cargarDatos();
    const handleCatalogoActualizado = (actualizado: CatalogoDispositivo) => {
        setCatalogo((prev) => prev.map((c) => (c.id === actualizado.id ? { ...c, ...actualizado } : c)));
    };

    const handleUpdate = (updatedInstance: InstanciaDispositivo) => {
        setInstancias((prev) => prev.map((i) => (i.id === updatedInstance.id ? updatedInstance : i)));
    };

    const handleDelete = (deletedId: number) => {
        setInstancias((prev) => prev.filter((i) => i.id !== deletedId));
    };

    if (cargandoInicial) {
        return <div className="p-8 text-center text-muted-foreground">Cargando datos del proyecto...</div>;
    }

    return (
        <div className="space-y-8 pb-10 min-h-screen overflow-x-hidden">
            <div className="flex items-center gap-4">
                <Link to="/ingenieria">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Ingeniería: {proyectoInfo?.nombre_proyecto || `Proyecto #${pid}`}
                    </h1>
                    <p className="text-muted-foreground">
                        Obra: {obraInfo?.nombre_obra || "Sin obra"} · Configuración de dispositivos.
                    </p>
                </div>
            </div>

            <div className="space-y-8">
                <div className="flex flex-col gap-3">
                    <h2 className="text-xl font-semibold">Carga Individual</h2>
                    <div className="max-w-6xl">
                        <InstanciaForm
                            proyectoId={pid}
                            catalogo={catalogo}
                            masterFunciones={masterFunciones}
                            masterAtributos={masterAtributos}
                            onInstanciaCreada={handleInstanciaCreada}
                            onAbrirModalCatalogo={() => setModalCatOpen(true)}
                            onAbrirModalEditarFunciones={(id: number) => {
                                setCatalogoIdSel(id);
                                setModalFuncOpen(true);
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 max-w-6xl">
                        <h2 className="text-xl font-semibold">Carga Masiva</h2>
                        <Button variant="default" size="sm" onClick={() => setModalLoteOpen(true)}>
                            Cargar por lote
                        </Button>
                    </div>
                </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-semibold">Inventario Cargado</h3>
                    <InstanciaGroupedTable
                        instancias={instancias}
                        onRefresh={handleRefresh}
                        onEdit={(grupo) => setInstanciasSeleccionadas(grupo)}
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Resumen</h3>
                    <EstadisticasPanel instancias={instancias} />
                </div>
            </div>

            <Modal isOpen={modalCatOpen} onClose={() => setModalCatOpen(false)} title="Nuevo Dispositivo de Catalogo">
                <CatalogoFormModule
                    onDispositivoCreado={() => {
                        cargarDatos();
                        setModalCatOpen(false);
                    }}
                />
            </Modal>

            <EditarFuncionesModal
                isOpen={modalFuncOpen}
                onClose={() => setModalFuncOpen(false)}
                dispositivo={catalogo.find((d) => d.id === catalogoIdSel) || null}
                masterFunciones={masterFunciones}
                onUpdateExitoso={handleCatalogoActualizado}
            />

            <Modal isOpen={modalLoteOpen} onClose={() => setModalLoteOpen(false)} title="Carga en Lote">
                <div className="w-full max-w-screen-2xl">
                    <BatchInstanciaForm
                        proyectoId={pid}
                        catalogo={catalogo}
                        masterFunciones={masterFunciones}
                        masterAtributos={masterAtributos}
                        onAbrirModalCatalogo={() => setModalCatOpen(true)}
                        onInstanciasCreadas={() => {
                            handleLoteCreado();
                            setModalLoteOpen(false);
                        }}
                    />
                </div>
            </Modal>

            <Modal
                isOpen={instanciasSeleccionadas.length > 0}
                onClose={() => setInstanciasSeleccionadas([])}
                title="Detalle de Dispositivo"
            >
                {instanciasSeleccionadas.length > 0 && (
                    <InstanciaDetallePanel
                        instancias={instanciasSeleccionadas}
                        masterFunciones={masterFunciones}
                        masterAtributos={masterAtributos}
                        onCerrar={() => setInstanciasSeleccionadas([])}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                    />
                )}
            </Modal>
        </div>
    );
}
