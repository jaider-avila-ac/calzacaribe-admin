import { api } from './api'

export const collaboratorService = {
  list: () => api.get('/admin-users'),
  create: ({ usuario, password, nombre, rol, sucursalId, apellido, telefono, tipoDocumento, numeroDocumento, fechaNacimiento }) =>
    api.post('/admin-users', {
      usuario, password, nombre, rol, sucursal_id: sucursalId,
      apellido, telefono,
      tipo_documento: tipoDocumento, numero_documento: numeroDocumento, fecha_nacimiento: fechaNacimiento,
    }),
  update: (id, { nombre, sucursalId, apellido, telefono, tipoDocumento, numeroDocumento, fechaNacimiento, password }) =>
    api.patch(`/admin-users/${id}`, {
      nombre, sucursal_id: sucursalId, apellido, telefono,
      tipo_documento: tipoDocumento, numero_documento: numeroDocumento, fecha_nacimiento: fechaNacimiento,
      // vacío = no se toca (ver AdminUserService.actualizar)
      password: password || null,
    }),
  setActivo: (id, activo) => api.patch(`/admin-users/${id}/activo`, { activo }),
}
