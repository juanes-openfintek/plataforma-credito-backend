/**
 * Estados simplificados del crédito (para UI y reportes)
 * 
 * PERFILADO: El comercial completó el flujo pero no radicó
 * RADICADO: Se envió a la fábrica de crédito (analistas)
 * EN_ESTUDIO: Está siendo analizado por cualquiera de los analistas
 * DEVUELTO: Fue devuelto por algún analista
 * RECHAZADO: Fue rechazado por algún analista
 * DESEMBOLSADO: El crédito fue desembolsado
 */
export const SimplifiedCreditStatus = {
  PERFILADO: 'PERFILADO',
  RADICADO: 'RADICADO',
  EN_ESTUDIO: 'EN_ESTUDIO',
  DEVUELTO: 'DEVUELTO',
  RECHAZADO: 'RECHAZADO',
  DESEMBOLSADO: 'DESEMBOLSADO',
} as const;

export type SimplifiedCreditStatusType = typeof SimplifiedCreditStatus[keyof typeof SimplifiedCreditStatus];

// Estados internos del crédito - Sistema de analistas
// Estos estados se usan internamente para el flujo de trabajo
// pero en la UI se muestran como estados simplificados
export const CreditStatus = {
  // Estados legacy (compatibilidad)
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  disbursed: 'disbursed',
  paid: 'paid',
  closed: 'closed',
  
  // Estados simplificados (nuevos)
  PERFILADO: 'PERFILADO',
  RADICADO: 'RADICADO',
  EN_ESTUDIO: 'EN_ESTUDIO',
  DEVUELTO: 'DEVUELTO',
  RECHAZADO: 'RECHAZADO',
  DESEMBOLSADO: 'DESEMBOLSADO',

  // Estados internos del flujo de analistas
  // Estos se mapean a EN_ESTUDIO en la UI
  DRAFT: 'DRAFT',
  INCOMPLETE: 'INCOMPLETE',
  SUBMITTED: 'SUBMITTED', // Radicado, pendiente analista 1
  
  // Analista 1
  ANALYST1_REVIEW: 'ANALYST1_REVIEW',
  ANALYST1_APPROVED: 'ANALYST1_APPROVED',
  ANALYST1_RETURNED: 'ANALYST1_RETURNED',
  ANALYST1_VERIFICATION: 'ANALYST1_VERIFICATION',
  
  // Analista 2
  ANALYST2_REVIEW: 'ANALYST2_REVIEW',
  ANALYST2_APPROVED: 'ANALYST2_APPROVED',
  ANALYST2_RETURNED: 'ANALYST2_RETURNED',
  ANALYST2_VERIFICATION: 'ANALYST2_VERIFICATION',
  
  // Analista 3
  ANALYST3_REVIEW: 'ANALYST3_REVIEW',
  ANALYST3_APPROVED: 'ANALYST3_APPROVED',
  ANALYST3_RETURNED: 'ANALYST3_RETURNED',
  ANALYST3_VERIFICATION: 'ANALYST3_VERIFICATION',
  
  // Firma y desembolso
  PENDING_SIGNATURE: 'PENDING_SIGNATURE',
  READY_TO_DISBURSE: 'READY_TO_DISBURSE',
  DISBURSED: 'DISBURSED',

  // Devolución al comercial
  COMMERCIAL_RETURNED: 'COMMERCIAL_RETURNED',
  
  // Estados finales
  REJECTED: 'REJECTED',
  ACTIVE: 'ACTIVE',
  PAID: 'PAID',
  DEFAULTED: 'DEFAULTED',
} as const;

export type CreditStatusType = typeof CreditStatus[keyof typeof CreditStatus];

/**
 * Mapea cualquier estado interno al estado simplificado para UI
 */
export const mapToSimplifiedStatus = (status: string): SimplifiedCreditStatusType => {
  // Estados que son "Perfilado"
  const perfiladoStatuses = ['DRAFT', 'INCOMPLETE', 'iniciado', 'en-progreso', 'completado'];
  if (perfiladoStatuses.includes(status)) return SimplifiedCreditStatus.PERFILADO;

  // Estados que son "Radicado"
  const radicadoStatuses = ['SUBMITTED', 'radicado'];
  if (radicadoStatuses.includes(status)) return SimplifiedCreditStatus.RADICADO;

  // Estados que son "En estudio"
  const enEstudioStatuses = [
    'ANALYST1_REVIEW', 'ANALYST1_APPROVED', 'ANALYST1_VERIFICATION',
    'ANALYST2_REVIEW', 'ANALYST2_APPROVED', 'ANALYST2_VERIFICATION',
    'ANALYST3_REVIEW', 'ANALYST3_APPROVED', 'ANALYST3_VERIFICATION',
    'PENDING_SIGNATURE', 'READY_TO_DISBURSE',
    'pending', 'approved', 'validated', 'aprobado'
  ];
  if (enEstudioStatuses.includes(status)) return SimplifiedCreditStatus.EN_ESTUDIO;

  // Estados que son "Devuelto"
  const devueltoStatuses = [
    'ANALYST1_RETURNED', 'ANALYST2_RETURNED', 'ANALYST3_RETURNED',
    'COMMERCIAL_RETURNED'
  ];
  if (devueltoStatuses.includes(status)) return SimplifiedCreditStatus.DEVUELTO;

  // Estados que son "Rechazado"
  const rechazadoStatuses = ['REJECTED', 'denied', 'rechazado'];
  if (rechazadoStatuses.includes(status)) return SimplifiedCreditStatus.RECHAZADO;

  // Estados que son "Desembolsado"
  const desembolsadoStatuses = ['DISBURSED', 'ACTIVE', 'PAID', 'DEFAULTED', 'desembolsado', 'default'];
  if (desembolsadoStatuses.includes(status)) return SimplifiedCreditStatus.DESEMBOLSADO;

  // Por defecto
  if (Object.values(SimplifiedCreditStatus).includes(status as SimplifiedCreditStatusType)) {
    return status as SimplifiedCreditStatusType;
  }

  return SimplifiedCreditStatus.PERFILADO;
};
