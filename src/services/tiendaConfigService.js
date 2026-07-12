import { api } from './api'

export const tiendaConfigService = {
  get: () => api.get('/tienda/config'),
  update: ({ envioGratisActivo, envioGratisDesde, dominioStaff }) =>
    api.patch('/tienda/config', {
      envio_gratis_activo: envioGratisActivo,
      envio_gratis_desde: envioGratisDesde,
      dominio_staff: dominioStaff,
    }),
}
