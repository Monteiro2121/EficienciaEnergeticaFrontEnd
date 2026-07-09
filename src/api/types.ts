/**
 * Tipos espelhando app/schemas/fatura.py e o retorno de
 * app/calculo/enquadramento.py no backend. Mantenha isso sincronizado
 * se o schema do backend mudar (foi exatamente isso que causou o 500
 * no /enquadramentos antes -- campo existe no backend mas não no tipo
 * usado no front).
 */
export interface FaturaExtraida {
  pagina_pdf: number | null;
  grupo_tarifario: 'A' | 'B' | null;
  classificacao_raw: string | null;

  nome_orgao: string | null;
  nome_unidade: string | null;

  uc: string | null;
  uc_formato: 'novo' | 'antigo' | null;
  codigo_instalacao: string | null;

  documento_raw: string | null;
  tipo_documento: 'CPF' | 'CNPJ' | null;

  mes_referencia: string | null;
  vencimento: string | null;
  valor_total_pagar: number | null;

  pis_base_calc: number | null;
  pis_aliquota_pct: number | null;
  pis_valor: number | null;

  cofins_base_calc: number | null;
  cofins_aliquota_pct: number | null;
  cofins_valor: number | null;

  icms_base_calc: number | null;
  icms_aliquota_pct: number | null;
  icms_valor: number | null;

  icms_fcp_base_calc: number | null;
  icms_fcp_aliquota_pct: number | null;
  icms_fcp_valor: number | null;

  leitura_anterior: number | null;
  leitura_atual: number | null;
  consumo_medido_kwh: number | null;
  consumo_faturado_kwh: number | null;

  demanda_medida_ponta_kw: number | null;
  demanda_medida_fora_ponta_kw: number | null;
  demanda_nao_consumida_ponta_kw: number | null;
  demanda_nao_consumida_fora_ponta_kw: number | null;
  demanda_contratada_ponta_kw: number | null;
  demanda_contratada_fora_ponta_kw: number | null;
  consumo_ponta_kwh: number | null;
  consumo_fora_ponta_kwh: number | null;

  tarifa_unit_demanda_fora_ponta: number | null;
  tarifa_unit_consumo_ponta: number | null;
  tarifa_unit_consumo_fora_ponta: number | null;
}

export interface FaturasExtraidasResponse {
  sucesso: boolean;
  faturas: FaturaExtraida[];
  total: number;
  erro: string | null;
}

export interface ResultadoEnquadramento {
  qtd_meses_considerados: number;
  base_calculo: 'EXTRAPOLADO_1_MES' | 'MEDIA_ACUMULADA' | 'ANO_FECHADO';
  tarifa_usada: {
    origem: string;
    demanda_ativa: number;
    demanda_ultrapassagem_assumida: number;
    consumo_ponta: number;
    consumo_fora_ponta: number;
  };
  demanda_atual_contratada_kw: number;
  demanda_ideal_fora_ponta_kw: number;
  custo_atual_no_periodo: number;
  custo_com_demanda_ideal_no_periodo: number;
  economia_media_mensal: number;
  economia_total_anual_estimada: number;
  custo_total_anual_estimado: number;
  texto_recomendacao: string;
}
