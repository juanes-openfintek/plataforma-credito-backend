export interface JwtPayload {
  uid?: string; // Para usuarios de Firebase
  sub?: string; // Para usuarios comerciales (JWT estándar)
  usuario?: string; // Usuario comercial
  roles?: string[]; // Roles del usuario
}
