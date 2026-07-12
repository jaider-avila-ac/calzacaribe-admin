import { api } from './api'

export const collaboratorService = {
  list: () => api.get('/admin-users'),
  create: ({ usuario, password, nombre, rol, apellido, telefono, cargo, tipoDocumento, numeroDocumento, fechaNacimiento }) =>
    api.post('/admin-users', {
      usuario, password, nombre, rol,
      apellido, telefono, cargo,
      tipo_documento: tipoDocumento, numero_documento: numeroDocumento, fecha_nacimiento: fechaNacimiento,
    }),
  update: (id, { nombre, apellido, telefono, cargo, tipoDocumento, numeroDocumento, fechaNacimiento }) =>
    api.patch(`/admin-users/${id}`, {
      nombre, apellido, telefono, cargo,
      tipo_documento: tipoDocumento, numero_documento: numeroDocumento, fecha_nacimiento: fechaNacimiento,
    }),
  setActivo: (id, activo) => api.patch(`/admin-users/${id}/activo`, { activo }),
}
