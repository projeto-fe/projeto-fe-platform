"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import * as React from "react";

export type Tema = "claro" | "escuro" | "sistema";

export const CHAVE_DO_TEMA = "projetofe:tema";

/**
 * Roda antes da primeira pintura, direto no <head>.
 *
 * Sem isto a tela abre no tema do sistema e pisca para o tema escolhido
 * quando o JavaScript chega. É o clássico flash branco de quem prefere
 * escuro, e num portal que a coordenação usa à noite isso incomoda.
 */
export const SCRIPT_DO_TEMA = `try{var t=localStorage.getItem('${CHAVE_DO_TEMA}');if(t==='claro'){document.documentElement.setAttribute('data-theme','light')}else if(t==='escuro'){document.documentElement.setAttribute('data-theme','dark')}}catch(e){}`;

function carimbar(tema: Tema) {
  const raiz = document.documentElement;
  // Sem carimbo, prefers-color-scheme decide: é o que "sistema" significa.
  if (tema === "sistema") raiz.removeAttribute("data-theme");
  else raiz.setAttribute("data-theme", tema === "claro" ? "light" : "dark");
}

function lerTemaSalvo(): Tema {
  try {
    const salvo = localStorage.getItem(CHAVE_DO_TEMA);
    if (salvo === "claro" || salvo === "escuro") return salvo;
  } catch {
    // Navegador com armazenamento bloqueado: segue no tema do sistema.
  }
  return "sistema";
}

/**
 * A escolha vive no localStorage, que é externo ao React. Ler por
 * useSyncExternalStore evita o par "estado inicial errado no servidor + efeito
 * que corrige", que pisca e que o lint proíbe com razão.
 */
const ouvintes = new Set<() => void>();

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

const OPCOES: { valor: Tema; rotulo: string; icone: LucideIcon }[] = [
  { valor: "claro", rotulo: "Claro", icone: Sun },
  { valor: "escuro", rotulo: "Escuro", icone: Moon },
  { valor: "sistema", rotulo: "Sistema", icone: Monitor },
];

/**
 * Escolha de tema dentro do menu da conta.
 *
 * Existe porque as duas cenas de uso pedem coisas diferentes: coordenação à
 * mesa à noite e voluntário no celular na quadra, de dia. O padrão continua
 * sendo o do sistema; isto é só a saída para quem quer forçar um dos dois.
 */
export function SeletorDeTema() {
  const tema = React.useSyncExternalStore(assinar, lerTemaSalvo, () => "sistema" as Tema);

  function escolher(valor: string) {
    const novo = valor as Tema;
    carimbar(novo);
    try {
      localStorage.setItem(CHAVE_DO_TEMA, novo);
    } catch {
      // Sem armazenamento a escolha vale só nesta aba, o que já é melhor
      // que não deixar escolher.
    }
    for (const ouvinte of ouvintes) ouvinte();
  }

  return (
    <DropdownMenu.RadioGroup value={tema} onValueChange={escolher}>
      {OPCOES.map(({ valor, rotulo, icone: Icone }) => (
        <DropdownMenu.RadioItem
          key={valor}
          value={valor}
          className="group flex cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm font-semibold outline-none data-highlighted:bg-surface-sunken data-[state=checked]:text-brand-ink"
        >
          <Icone className="size-4 text-ink-subtle group-data-[state=checked]:text-brand" aria-hidden />
          {rotulo}
          <DropdownMenu.ItemIndicator className="ml-auto size-1.5 rounded-full bg-brand" />
        </DropdownMenu.RadioItem>
      ))}
    </DropdownMenu.RadioGroup>
  );
}
