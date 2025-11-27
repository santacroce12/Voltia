import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    listarInstancias,
    listarCatalogoDispositivos,
    listarFunciones,
    listarProyectos,
    listarObras,
    type InstanciaDispositivo,
    type CatalogoDispositivo,
    type FuncionDispositivo,
    type Proyecto,
    type Obra,
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
    const [proyectoInfo, setProyectoInfo] = useState<Proyecto | null>(null);
    const [obraInfo, setObraInfo] = useState<Obra | null>(null);

    const [modalCatOpen, setModalCatOpen] = useState(false);
    const [modalFuncOpen, setModalFuncOpen] = useState(false);
    const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
    const [instanciaIdDetalle, setInstanciaIdDetalle] = useState<number | null>(null);
    const [catalogoIdSel, setCatalogoIdSel] = useState<number | null>(null);
    const [cargandoInicial, setCargandoInicial] = useState(true);

    const cargarDatos = () => {
        if (!pid) return;
        setCargandoInicial(true);
        Promise.all([listarInstancias(pid), listarCatalogoDispositivos(), listarFunciones(), listarProyectos(), listarObras()])
            .then(([i, c, f, proyectos, obras]) => {
                setInstancias(i);
                setCatalogo(c);
                setMasterFunciones(f);
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
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/ingenieria">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">
                    Carga de Dispositivos en Obra "{obraInfo?.nombre_obra || '...'}" proyecto "
                    {proyectoInfo?.nombre_proyecto || `#${pid}`}"
                </h1>
            </div>

            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InstanciaForm
                            proyectoId={pid}
                            catalogo={catalogo}
                            masterFunciones={masterFunciones}
                            onInstanciaCreada={handleInstanciaCreada}
                            onAbrirModalCatalogo={() => setModalCatOpen(true)}
                            onAbrirModalEditarFunciones={(id: number) => {
                                setCatalogoIdSel(id);
                                setModalFuncOpen(true);
                            }}
                        />
                        <BatchInstanciaForm
                            proyectoId={pid}
                            catalogo={catalogo}
                            masterFunciones={masterFunciones}
                            onInstanciasCreadas={handleLoteCreado}
                        />
                    </div>

                    <Separator />

                    <h3 className="text-xl font-semibold mt-8">Inventario del Proyecto</h3>
                    <InstanciaGroupedTable
                        instancias={instancias}
                        onRefresh={handleRefresh}
                        onVerDetalle={(id) => {
                            setInstanciaIdDetalle(id);
                            setModalDetalleOpen(true);
                        }}
                    />
                </div>

                <div className="space-y-6">
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
                onUpdateExitoso={handleRefresh}
            />

            <Modal isOpen={modalDetalleOpen} onClose={() => setModalDetalleOpen(false)} title="Detalle de Dispositivo">
                {instanciaIdDetalle && (
                    <InstanciaDetallePanel
                        instanciaId={instanciaIdDetalle}
                        masterFunciones={masterFunciones}
                        catalogo={catalogo}
                        onCerrar={() => setModalDetalleOpen(false)}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                        proyectoNombre={proyectoInfo?.nombre_proyecto}
                    />
                )}
            </Modal>
        </div>
    );
}
