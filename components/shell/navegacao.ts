import {
  Home,
  Star,
  Users,
  Network,
  ShieldCheck,
  UserCog,
  type LucideIcon,
} from "lucide-react";

export type ItemDeNavegacao = {
  href: string;
  rotulo: string;
  /** Nome curto para a barra inferior no celular. */
  rotuloCurto: string;
  icone: LucideIcon;
  grupo: "operacao" | "administracao";
  /** Só administrador enxerga. */
  somenteAdmin?: boolean;
  /** Aparece na barra inferior do celular (cabem cinco). */
  noCelular?: boolean;
  /** Só na barra do celular: no desktop o item vive no menu da conta. */
  somenteCelular?: boolean;
};

export const NAVEGACAO: ItemDeNavegacao[] = [
  { href: "/", rotulo: "Início", rotuloCurto: "Início", icone: Home, grupo: "operacao", noCelular: true },
  { href: "/criancas", rotulo: "Crianças", rotuloCurto: "Crianças", icone: Users, grupo: "operacao", noCelular: true },
  { href: "/jogai", rotulo: "IDE JOGAI", rotuloCurto: "JOGAI", icone: Star, grupo: "operacao", noCelular: true },
  { href: "/estrutura", rotulo: "Estrutura", rotuloCurto: "Estrutura", icone: Network, grupo: "administracao", noCelular: true },
  { href: "/pessoas", rotulo: "Pessoas e acessos", rotuloCurto: "Pessoas", icone: ShieldCheck, grupo: "administracao", somenteAdmin: true },
  // No desktop, conta e saída ficam no menu do rodapé da barra lateral.
  { href: "/conta", rotulo: "Minha conta", rotuloCurto: "Conta", icone: UserCog, grupo: "administracao", noCelular: true, somenteCelular: true },
];
