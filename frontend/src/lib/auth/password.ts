import bcrypt from "bcryptjs";

// Hachage du mot de passe administrateur (technical-architecture.md §8 point 4 :
// bcrypt recommandé). Implémentation via bcryptjs (même format de hash `$2a$`/`$2b$`,
// pur JavaScript — évite la compilation native du paquet `bcrypt` sur ce poste),
// substitution technique équivalente, l'arbitrage du document source portant sur
// l'algorithme (bcrypt vs argon2id), pas sur une bibliothèque précise.

const SALT_ROUNDS = 12;

export function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export function verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}
