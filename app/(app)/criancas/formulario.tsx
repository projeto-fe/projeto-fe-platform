"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Campo,
  CampoSelecao,
  CampoTexto,
  GradeDeCampos,
  SecaoDoFormulario,
} from "@/components/ui/campo";
import { Card, CardBody, CardFooter } from "@/components/ui/card";

import { salvarCrianca, type EstadoDaCrianca } from "./actions";

const inicial: EstadoDaCrianca = {};

export type ValoresDaCrianca = {
  id?: string;
  nome_completo?: string;
  nome_jogador?: string;
  data_nascimento?: string;
  tem_problema_saude?: boolean;
  observacao_saude?: string | null;
  peso_kg?: number | null;
  altura_m?: number | null;
  numero_calcado?: number | null;
  uniforme?: string | null;
  observacoes_gerais?: string | null;
  atividades?: string[];
  sensiveis?: {
    cep?: string | null;
    logradouro?: string | null;
    numero?: string | null;
    complemento?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    uf?: string | null;
    telefone_principal?: string | null;
    telefone_secundario?: string | null;
    nome_mae?: string | null;
    nome_pai?: string | null;
    autorizacao_responsavel_nome?: string | null;
    autorizacao_data?: string | null;
  } | null;
};

export function FormularioDaCrianca({
  valores = {},
  atividades,
  podeVerSensiveis,
}: {
  valores?: ValoresDaCrianca;
  atividades: { id: string; nome: string; area: string }[];
  podeVerSensiveis: boolean;
}) {
  const [estado, acao, salvando] = useActionState(salvarCrianca, inicial);
  const [temSaude, setTemSaude] = useState(valores.tem_problema_saude ?? false);
  const [endereco, setEndereco] = useState({
    logradouro: valores.sensiveis?.logradouro ?? "",
    bairro: valores.sensiveis?.bairro ?? "",
    cidade: valores.sensiveis?.cidade ?? "Marília",
    uf: valores.sensiveis?.uf ?? "SP",
  });
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [avisoCep, setAvisoCep] = useState<string>();

  async function consultarCep(cep: string) {
    const limpo = cep.replace(/\D/g, "");
    if (limpo.length !== 8) return;

    setBuscandoCep(true);
    setAvisoCep(undefined);
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
      const dados = await resposta.json();
      if (dados.erro) {
        setAvisoCep("CEP não encontrado. Preencha o endereço à mão.");
        return;
      }
      setEndereco({
        logradouro: dados.logradouro ?? "",
        bairro: dados.bairro ?? "",
        cidade: dados.localidade ?? "",
        uf: dados.uf ?? "",
      });
    } catch {
      setAvisoCep("Não deu para consultar agora. Preencha o endereço à mão.");
    } finally {
      setBuscandoCep(false);
    }
  }

  const inscritaEm = new Set(valores.atividades ?? []);

  return (
    <form action={acao}>
      {valores.id ? <input type="hidden" name="id" value={valores.id} /> : null}

      <Card>
        <CardBody className="flex flex-col gap-5">
          <SecaoDoFormulario titulo="Identificação">
            <GradeDeCampos>
              <Campo
                id="nome_completo"
                name="nome_completo"
                rotulo="Nome completo"
                colunas={8}
                obrigatorio
                defaultValue={valores.nome_completo}
                autoComplete="off"
              />
              <Campo
                id="data_nascimento"
                name="data_nascimento"
                rotulo="Data de nascimento"
                type="date"
                colunas={4}
                obrigatorio
                defaultValue={valores.data_nascimento}
              />
              <Campo
                id="nome_jogador"
                name="nome_jogador"
                rotulo="Nome de jogador"
                colunas={6}
                obrigatorio
                maxLength={30}
                defaultValue={valores.nome_jogador}
                ajuda="É o único nome que aparece no ranking público. Evite o nome real."
              />
            </GradeDeCampos>
          </SecaoDoFormulario>

          <SecaoDoFormulario
            titulo="Atividades"
            descricao="A criança pode participar de mais de uma."
          >
            {atividades.length === 0 ? (
              <p className="text-sm text-ink-muted">
                Nenhuma atividade cadastrada.{" "}
                <Link href="/estrutura" className="font-semibold text-brand-ink underline">
                  Monte a estrutura primeiro
                </Link>
                .
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {atividades.map((atividade) => (
                  <label
                    key={atividade.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-sm border border-line px-3 py-2.5 hover:bg-surface-sunken has-checked:border-brand has-checked:bg-brand-soft"
                  >
                    <input
                      type="checkbox"
                      name="atividades"
                      value={atividade.id}
                      defaultChecked={inscritaEm.has(atividade.id)}
                      className="size-4 accent-brand"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{atividade.nome}</span>
                      <span className="block text-xs text-ink-muted">{atividade.area}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </SecaoDoFormulario>

          <SecaoDoFormulario
            titulo="Saúde"
            descricao="Informação usada pela equipe durante as atividades."
          >
            <GradeDeCampos>
              <CampoSelecao
                id="tem_problema_saude"
                name="tem_problema_saude"
                rotulo="Tem problema de saúde?"
                colunas={4}
                value={temSaude ? "sim" : "nao"}
                onChange={(e) => setTemSaude(e.target.value === "sim")}
              >
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </CampoSelecao>

              {temSaude ? (
                <Campo
                  id="observacao_saude"
                  name="observacao_saude"
                  rotulo="Qual"
                  colunas={8}
                  maxLength={300}
                  defaultValue={valores.observacao_saude ?? ""}
                  placeholder="Alergia, medicação de uso contínuo, restrição"
                />
              ) : null}
            </GradeDeCampos>
          </SecaoDoFormulario>

          <SecaoDoFormulario
            titulo="Medidas e uniforme"
            descricao="Usado para entrega de uniforme e calçado."
          >
            <GradeDeCampos>
              <Campo
                id="peso_kg"
                name="peso_kg"
                rotulo="Peso (kg)"
                colunas={3}
                metadeNoCelular
                type="number"
                step="0.1"
                inputMode="decimal"
                defaultValue={valores.peso_kg ?? ""}
              />
              <Campo
                id="altura_m"
                name="altura_m"
                rotulo="Altura (m)"
                colunas={3}
                metadeNoCelular
                type="number"
                step="0.01"
                inputMode="decimal"
                defaultValue={valores.altura_m ?? ""}
              />
              <Campo
                id="numero_calcado"
                name="numero_calcado"
                rotulo="Nº calçado"
                colunas={3}
                metadeNoCelular
                type="number"
                inputMode="numeric"
                defaultValue={valores.numero_calcado ?? ""}
              />
              <CampoSelecao
                id="uniforme"
                name="uniforme"
                rotulo="Uniforme"
                colunas={3}
                metadeNoCelular
                defaultValue={valores.uniforme ?? ""}
              >
                <option value="">—</option>
                {["PP", "P", "M", "G", "GG"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </CampoSelecao>
            </GradeDeCampos>
          </SecaoDoFormulario>

          {podeVerSensiveis ? (
            <>
              <SecaoDoFormulario
                titulo="Endereço"
                descricao="Digite o CEP e o resto é preenchido sozinho."
              >
                <GradeDeCampos>
                  <Campo
                    id="cep"
                    name="cep"
                    rotulo="CEP"
                    colunas={3}
                    metadeNoCelular
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="17500-000"
                    defaultValue={valores.sensiveis?.cep ?? ""}
                    onBlur={(e) => consultarCep(e.target.value)}
                    erro={avisoCep}
                    ajuda={buscandoCep ? "Consultando..." : undefined}
                  />
                  <Campo
                    id="numero"
                    name="numero"
                    rotulo="Número"
                    colunas={3}
                    metadeNoCelular
                    maxLength={12}
                    defaultValue={valores.sensiveis?.numero ?? ""}
                  />
                  <Campo
                    id="complemento"
                    name="complemento"
                    rotulo="Complemento"
                    colunas={6}
                    maxLength={80}
                    defaultValue={valores.sensiveis?.complemento ?? ""}
                    placeholder="Apto, bloco, referência"
                  />
                  <Campo
                    id="logradouro"
                    name="logradouro"
                    rotulo="Endereço"
                    colunas={9}
                    value={endereco.logradouro}
                    onChange={(e) => setEndereco((a) => ({ ...a, logradouro: e.target.value }))}
                  />
                  <Campo
                    id="bairro"
                    name="bairro"
                    rotulo="Bairro"
                    colunas={3}
                    value={endereco.bairro}
                    onChange={(e) => setEndereco((a) => ({ ...a, bairro: e.target.value }))}
                  />
                  <Campo
                    id="cidade"
                    name="cidade"
                    rotulo="Cidade"
                    colunas={9}
                    value={endereco.cidade}
                    onChange={(e) => setEndereco((a) => ({ ...a, cidade: e.target.value }))}
                  />
                  <Campo
                    id="uf"
                    name="uf"
                    rotulo="UF"
                    colunas={3}
                    maxLength={2}
                    value={endereco.uf}
                    onChange={(e) => setEndereco((a) => ({ ...a, uf: e.target.value.toUpperCase() }))}
                  />
                </GradeDeCampos>
              </SecaoDoFormulario>

              <SecaoDoFormulario titulo="Contato e responsáveis">
                <GradeDeCampos>
                  <Campo
                    id="telefone_principal"
                    name="telefone_principal"
                    rotulo="Telefone principal"
                    colunas={6}
                    type="tel"
                    placeholder="(14) 90000-0000"
                    defaultValue={valores.sensiveis?.telefone_principal ?? ""}
                  />
                  <Campo
                    id="telefone_secundario"
                    name="telefone_secundario"
                    rotulo="WhatsApp ou outro"
                    colunas={6}
                    type="tel"
                    defaultValue={valores.sensiveis?.telefone_secundario ?? ""}
                  />
                  <Campo
                    id="nome_mae"
                    name="nome_mae"
                    rotulo="Nome da mãe"
                    colunas={6}
                    defaultValue={valores.sensiveis?.nome_mae ?? ""}
                  />
                  <Campo
                    id="nome_pai"
                    name="nome_pai"
                    rotulo="Nome do pai"
                    colunas={6}
                    defaultValue={valores.sensiveis?.nome_pai ?? ""}
                  />
                </GradeDeCampos>
              </SecaoDoFormulario>

              <SecaoDoFormulario
                titulo="Autorização do responsável"
                descricao="O termo é assinado em papel. Aqui fica o registro de que ele existe."
              >
                <GradeDeCampos>
                  <Campo
                    id="autorizacao_responsavel_nome"
                    name="autorizacao_responsavel_nome"
                    rotulo="Quem autorizou"
                    colunas={7}
                    placeholder="Nome do responsável legal"
                    defaultValue={valores.sensiveis?.autorizacao_responsavel_nome ?? ""}
                  />
                  <Campo
                    id="autorizacao_data"
                    name="autorizacao_data"
                    rotulo="Data da assinatura"
                    colunas={5}
                    type="date"
                    defaultValue={valores.sensiveis?.autorizacao_data ?? ""}
                  />
                </GradeDeCampos>
              </SecaoDoFormulario>
            </>
          ) : (
            <SecaoDoFormulario titulo="Endereço, contato e autorização">
              <p className="rounded-sm bg-surface-sunken px-3 py-2.5 text-sm text-ink-muted">
                Estes dados ficam com a coordenação. Você consegue cadastrar a criança sem eles,
                e alguém da coordenação completa depois.
              </p>
            </SecaoDoFormulario>
          )}

          <SecaoDoFormulario titulo="Observações gerais">
            <GradeDeCampos>
              <CampoTexto
                id="observacoes_gerais"
                name="observacoes_gerais"
                rotulo="Qualquer coisa que a equipe precise saber"
                colunas={12}
                maxLength={1000}
                defaultValue={valores.observacoes_gerais ?? ""}
              />
            </GradeDeCampos>
          </SecaoDoFormulario>

          {estado.erro ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-sm bg-negative-soft px-3 py-2.5 text-sm text-negative-strong"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {estado.erro}
            </p>
          ) : null}
        </CardBody>

        <CardFooter className="flex-col-reverse gap-2 sm:flex-row">
          <span className="mr-auto text-xs text-ink-muted">
            Campos com <span className="text-brand">*</span> são obrigatórios.
          </span>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/criancas">Cancelar</Link>
          </Button>
          <Button type="submit" loading={salvando} className="w-full sm:w-auto">
            Salvar cadastro
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
