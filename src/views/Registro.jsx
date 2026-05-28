// src/views/Registro.jsx
import React, { useState } from "react";

const initialClientForm = {
  nombre: "", telefono: "", correo: "", cedula: "",
};
const initialVehiculoForm = {
  placa: "", marca: "", modelo: "", año: "", color: "",
};

export const Registro = ({ clientes, vehiculos, onAgregarCliente, onAgregarVehiculo, onCrearOrden, onNavigate }) => {
  const [step, setStep] = useState(1); // 1: Cliente, 2: Vehiculo, 3: Confirmar
  const [clienteExistente, setClienteExistente] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [clienteForm, setClienteForm] = useState(initialClientForm);
  const [modoCliente, setModoCliente] = useState("nuevo"); // nuevo | existente
  const [vehiculoForm, setVehiculoForm] = useState(initialVehiculoForm);
  const [vehiculoExistente, setVehiculoExistente] = useState(null);
  const [modoVehiculo, setModoVehiculo] = useState("nuevo");
  const [errors, setErrors] = useState({});
  const [ordenCreada, setOrdenCreada] = useState(null);

  const clienteFiltrado = clientes.filter(
    (c) =>
      c.cedula.includes(busqueda) ||
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.telefono.includes(busqueda)
  );

  const validateCliente = () => {
    const e = {};
    if (modoCliente === "nuevo") {
      if (!clienteForm.nombre.trim()) e.nombre = "Requerido";
      if (!clienteForm.telefono.trim()) e.telefono = "Requerido";
      if (!clienteForm.cedula.trim()) e.cedula = "Requerido";
    } else {
      if (!clienteExistente) e.clienteExistente = "Selecciona un cliente";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateVehiculo = () => {
    const e = {};
    if (modoVehiculo === "nuevo") {
      if (!vehiculoForm.placa.trim()) e.placa = "Requerido";
      if (!vehiculoForm.marca.trim()) e.marca = "Requerido";
      if (!vehiculoForm.modelo.trim()) e.modelo = "Requerido";
      if (!vehiculoForm.año) e.año = "Requerido";
    } else {
      if (!vehiculoExistente) e.vehiculoExistente = "Selecciona un vehículo";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNextStep1 = () => {
    if (!validateCliente()) return;
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!validateVehiculo()) return;
    setStep(3);
  };

  const handleConfirmar = () => {
    let cliente = clienteExistente;
    if (modoCliente === "nuevo") {
      cliente = onAgregarCliente(clienteForm);
    }

    let vehiculo = vehiculoExistente;
    if (modoVehiculo === "nuevo") {
      vehiculo = onAgregarVehiculo({ ...vehiculoForm, clienteId: cliente.id });
    }

    const orden = onCrearOrden(cliente.id, vehiculo.id);
    setOrdenCreada(orden);
    setStep(4);
  };

  const clienteActual = modoCliente === "existente" ? clienteExistente : (step >= 2 ? { ...clienteForm, id: "nuevo" } : null);
  const vehiculosCliente = clienteActual ? vehiculos.filter((v) => v.clienteId === clienteActual.id) : [];

  if (step === 4 && ordenCreada) {
    return (
      <div style={{ animation: "slideUp 0.3s ease", maxWidth: 560, margin: "0 auto", textAlign: "center", paddingTop: 48 }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(16,185,129,0.15)",
          border: "2px solid rgba(16,185,129,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, color: "#34d399", margin: "0 auto 24px"
        }}>
          <i className="bi bi-check-lg"></i>
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          ¡Orden Creada!
        </h2>
        <p style={{ color: "var(--ag-text-muted)", marginBottom: 8 }}>
          La orden de servicio fue registrada exitosamente.
        </p>
        <div style={{
          background: "var(--ag-card)", border: "1px solid var(--ag-border)",
          borderRadius: "var(--radius)", padding: "20px 24px", marginBottom: 28, textAlign: "left"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "var(--ag-text-muted)", fontSize: 13 }}>Número de Orden</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--ag-accent)" }}>
              #{ordenCreada.id.slice(-8).toUpperCase()}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "var(--ag-text-muted)", fontSize: 13 }}>Estado Inicial</span>
            <span style={{ color: "#60a5fa" }}>Recibido</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--ag-text-muted)", fontSize: 13 }}>Fecha</span>
            <span>{ordenCreada.fechaIngreso}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="ag-btn ag-btn-ghost" onClick={() => {
            setStep(1); setOrdenCreada(null); setClienteForm(initialClientForm);
            setVehiculoForm(initialVehiculoForm); setClienteExistente(null);
            setVehiculoExistente(null); setModoCliente("nuevo"); setModoVehiculo("nuevo");
          }}>
            <i className="bi bi-plus-lg"></i> Nuevo Ingreso
          </button>
          <button className="ag-btn ag-btn-primary" onClick={() => onNavigate("ordenes", ordenCreada.id)}>
            <i className="bi bi-arrow-right"></i> Ver Orden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: "slideUp 0.3s ease" }}>
      <div className="ag-topbar">
        <div>
          <h1 className="ag-page-title">Nuevo Ingreso</h1>
          <p className="ag-page-subtitle">Registro de cliente, vehículo y orden de servicio</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="ag-card mb-4">
        <div style={{ display: "flex", alignItems: "center" }}>
          {["Cliente", "Vehículo", "Confirmar"].map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ textAlign: "center", flex: i < 2 ? "none" : 1 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 600, fontSize: 14, transition: "all 0.2s",
                  background: step > i + 1 ? "var(--ag-success)" : step === i + 1 ? "var(--ag-accent)" : "var(--ag-dark-3)",
                  color: step > i + 1 ? "white" : step === i + 1 ? "var(--ag-dark)" : "var(--ag-text-muted)",
                  border: `2px solid ${step > i + 1 ? "var(--ag-success)" : step === i + 1 ? "var(--ag-accent)" : "var(--ag-border)"}`,
                }}>
                  {step > i + 1 ? <i className="bi bi-check" style={{ fontSize: 14 }}></i> : i + 1}
                </div>
                <div style={{ fontSize: 11, color: step === i + 1 ? "var(--ag-accent)" : "var(--ag-text-muted)", marginTop: 4 }}>{s}</div>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? "var(--ag-success)" : "var(--ag-border)", margin: "0 8px 16px" }}></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="ag-card" style={{ maxWidth: 640 }}>
        {/* STEP 1: Cliente */}
        {step === 1 && (
          <div>
            <h5 className="font-display mb-1" style={{ fontSize: 18, fontWeight: 700 }}>Datos del Cliente</h5>
            <p style={{ color: "var(--ag-text-muted)", fontSize: 14, marginBottom: 24 }}>¿El cliente ya está registrado?</p>

            <div style={{ display: "flex", background: "var(--ag-dark-3)", borderRadius: 10, padding: 4, marginBottom: 24 }}>
              {["nuevo", "existente"].map((m) => (
                <button key={m} onClick={() => { setModoCliente(m); setErrors({}); }}
                  style={{ flex: 1, padding: "8px", border: "none", borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
                    background: modoCliente === m ? "var(--ag-accent)" : "transparent",
                    color: modoCliente === m ? "var(--ag-dark)" : "var(--ag-text-muted)" }}>
                  {m === "nuevo" ? "Cliente Nuevo" : "Cliente Existente"}
                </button>
              ))}
            </div>

            {modoCliente === "nuevo" ? (
              <div className="row g-3">
                {[["nombre","Nombre Completo","text","Ej: Juan Pérez"], ["telefono","Teléfono","tel","8888-0000"], ["correo","Correo Electrónico","email","correo@email.com"], ["cedula","Cédula","text","1-1234-5678"]].map(([field, label, type, placeholder]) => (
                  <div key={field} className={field === "nombre" || field === "correo" ? "col-12" : "col-6"}>
                    <div className="ag-form-group" style={{ marginBottom: 0 }}>
                      <label className="ag-label">{label}</label>
                      <input className={`ag-input ${errors[field] ? "border-danger" : ""}`} type={type} placeholder={placeholder}
                        value={clienteForm[field]}
                        onChange={(e) => setClienteForm({ ...clienteForm, [field]: e.target.value })} />
                      {errors[field] && <div style={{ fontSize: 12, color: "#f87171", marginTop: 4 }}>{errors[field]}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="ag-form-group">
                  <label className="ag-label">Buscar por nombre, cédula o teléfono</label>
                  <div className="ag-search-wrap">
                    <i className="bi bi-search"></i>
                    <input className="ag-input" placeholder="Buscar cliente..."
                      value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                  </div>
                </div>
                <div style={{ maxHeight: 220, overflowY: "auto" }}>
                  {clienteFiltrado.map((c) => (
                    <div key={c.id} onClick={() => setClienteExistente(c)}
                      style={{ padding: "12px 16px", borderRadius: 8, cursor: "pointer", marginBottom: 6, transition: "all 0.15s",
                        border: `1px solid ${clienteExistente?.id === c.id ? "var(--ag-accent)" : "var(--ag-border)"}`,
                        background: clienteExistente?.id === c.id ? "var(--ag-accent-light)" : "var(--ag-card)" }}>
                      <div style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                        {clienteExistente?.id === c.id && <i className="bi bi-check-circle-fill text-accent" style={{ fontSize: 14 }}></i>}
                        {c.nombre}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ag-text-muted)" }}>{c.cedula} · {c.telefono}</div>
                    </div>
                  ))}
                  {clienteFiltrado.length === 0 && <p style={{ color: "var(--ag-text-muted)", fontSize: 13 }}>Sin resultados</p>}
                </div>
                {errors.clienteExistente && <div style={{ fontSize: 12, color: "#f87171", marginTop: 4 }}>{errors.clienteExistente}</div>}
              </div>
            )}

            <hr className="ag-divider" />
            <div className="d-flex justify-content-end">
              <button className="ag-btn ag-btn-primary" onClick={handleNextStep1}>
                Continuar <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Vehículo */}
        {step === 2 && (
          <div>
            <h5 className="font-display mb-1" style={{ fontSize: 18, fontWeight: 700 }}>Datos del Vehículo</h5>
            <p style={{ color: "var(--ag-text-muted)", fontSize: 14, marginBottom: 24 }}>
              {vehiculosCliente.length > 0 ? "¿Ingresar un vehículo ya registrado o uno nuevo?" : "Registre el vehículo del cliente."}
            </p>

            {vehiculosCliente.length > 0 && (
              <div style={{ display: "flex", background: "var(--ag-dark-3)", borderRadius: 10, padding: 4, marginBottom: 24 }}>
                {["existente", "nuevo"].map((m) => (
                  <button key={m} onClick={() => { setModoVehiculo(m); setErrors({}); }}
                    style={{ flex: 1, padding: "8px", border: "none", borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
                      background: modoVehiculo === m ? "var(--ag-accent)" : "transparent",
                      color: modoVehiculo === m ? "var(--ag-dark)" : "var(--ag-text-muted)" }}>
                    {m === "existente" ? "Vehículo del Cliente" : "Vehículo Nuevo"}
                  </button>
                ))}
              </div>
            )}

            {modoVehiculo === "existente" && vehiculosCliente.length > 0 ? (
              <div>
                {vehiculosCliente.map((v) => (
                  <div key={v.id} onClick={() => setVehiculoExistente(v)}
                    style={{ padding: "14px 16px", borderRadius: 8, cursor: "pointer", marginBottom: 8, transition: "all 0.15s",
                      border: `1px solid ${vehiculoExistente?.id === v.id ? "var(--ag-accent)" : "var(--ag-border)"}`,
                      background: vehiculoExistente?.id === v.id ? "var(--ag-accent-light)" : "var(--ag-card)" }}>
                    <div style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                      {vehiculoExistente?.id === v.id && <i className="bi bi-check-circle-fill text-accent"></i>}
                      <i className="bi bi-car-front-fill" style={{ color: "var(--ag-accent)" }}></i>
                      {v.marca} {v.modelo} ({v.año})
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ag-text-muted)", marginTop: 2 }}>
                      Placa: <strong style={{ color: "var(--ag-accent)" }}>{v.placa}</strong> · {v.color}
                    </div>
                  </div>
                ))}
                {errors.vehiculoExistente && <div style={{ fontSize: 12, color: "#f87171", marginTop: 4 }}>{errors.vehiculoExistente}</div>}
              </div>
            ) : (
              <div className="row g-3">
                {[["placa","Placa","text","AAA-000"], ["marca","Marca","text","Toyota"], ["modelo","Modelo","text","Corolla"], ["año","Año","number","2020"], ["color","Color","text","Plateado"]].map(([field, label, type, placeholder]) => (
                  <div key={field} className={field === "placa" || field === "color" ? "col-6" : "col-6"}>
                    <div className="ag-form-group" style={{ marginBottom: 0 }}>
                      <label className="ag-label">{label}</label>
                      <input className={`ag-input ${errors[field] ? "border-danger" : ""}`} type={type} placeholder={placeholder}
                        value={vehiculoForm[field]}
                        onChange={(e) => setVehiculoForm({ ...vehiculoForm, [field]: e.target.value })} />
                      {errors[field] && <div style={{ fontSize: 12, color: "#f87171", marginTop: 4 }}>{errors[field]}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <hr className="ag-divider" />
            <div className="d-flex justify-content-between">
              <button className="ag-btn ag-btn-ghost" onClick={() => setStep(1)}>
                <i className="bi bi-arrow-left"></i> Atrás
              </button>
              <button className="ag-btn ag-btn-primary" onClick={handleNextStep2}>
                Continuar <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirmar */}
        {step === 3 && (
          <div>
            <h5 className="font-display mb-1" style={{ fontSize: 18, fontWeight: 700 }}>Confirmar Ingreso</h5>
            <p style={{ color: "var(--ag-text-muted)", fontSize: 14, marginBottom: 24 }}>Revisa los datos antes de crear la orden.</p>

            {[
              { title: "Cliente", icon: "bi-person-fill", fields: modoCliente === "nuevo" ? [["Nombre", clienteForm.nombre], ["Teléfono", clienteForm.telefono], ["Correo", clienteForm.correo || "—"], ["Cédula", clienteForm.cedula]] : [["Nombre", clienteExistente?.nombre], ["Teléfono", clienteExistente?.telefono], ["Cédula", clienteExistente?.cedula]] },
              { title: "Vehículo", icon: "bi-car-front-fill", fields: modoVehiculo === "nuevo" ? [["Placa", vehiculoForm.placa], ["Marca/Modelo", `${vehiculoForm.marca} ${vehiculoForm.modelo}`], ["Año", vehiculoForm.año], ["Color", vehiculoForm.color || "—"]] : [["Placa", vehiculoExistente?.placa], ["Marca/Modelo", `${vehiculoExistente?.marca} ${vehiculoExistente?.modelo}`], ["Año", vehiculoExistente?.año]] }
            ].map(({ title, icon, fields }) => (
              <div key={title} style={{ background: "var(--ag-card)", border: "1px solid var(--ag-border)", borderRadius: "var(--radius)", padding: "16px 20px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontWeight: 600, fontFamily: "var(--font-display)" }}>
                  <i className={`bi ${icon} text-accent`}></i> {title}
                </div>
                {fields.map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "var(--ag-text-muted)", fontSize: 13 }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>
            ))}

            <div style={{ background: "var(--ag-accent-light)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "var(--radius)", padding: "12px 16px", fontSize: 13, color: "var(--ag-accent)", marginBottom: 24 }}>
              <i className="bi bi-info-circle me-2"></i>
              Al confirmar, se creará una Orden de Servicio con estado <strong>Recibido</strong>.
            </div>

            <hr className="ag-divider" />
            <div className="d-flex justify-content-between">
              <button className="ag-btn ag-btn-ghost" onClick={() => setStep(2)}>
                <i className="bi bi-arrow-left"></i> Atrás
              </button>
              <button className="ag-btn ag-btn-primary" onClick={handleConfirmar}>
                <i className="bi bi-check-lg"></i> Crear Orden de Servicio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
