import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { cores, espacamento, tipografia } from '../theme/theme';
import { FaturaExtraida } from '../api/types';

type Props = {
  faturas: FaturaExtraida[];
  aoConfirmar: (fatura: FaturaExtraida) => void;
  aoVoltar: () => void;
};

function Campo({ label, valor }: { label: string; valor: string | number | null }) {
  return (
    <View style={estilos.linhaCampo}>
      <Text style={estilos.labelCampo}>{label}</Text>
      <Text style={estilos.valorCampo}>{valor ?? '—'}</Text>
    </View>
  );
}

function abreviarMes(mesReferencia: string | null | undefined): string {
  if (!mesReferencia) return '?';
  const [nome, ano] = mesReferencia.split('/');
  if (!nome || !ano) return mesReferencia;
  return `${nome.slice(0, 3).toUpperCase()}/${ano.slice(-2)}`;
}

/** Gráfico de barras do histórico de Consumo Fora Ponta (12 meses da página 2
 * + o mês da fatura atual) -- feito só com View, sem lib de gráfico nenhuma
 * (mesma decisão do GraficoScreen: victory-native não roda no Expo Go). */
function GraficoConsumoHistorico({ fatura }: { fatura: FaturaExtraida }) {
  const historico = fatura.historico_12_meses ?? [];
  if (historico.length === 0) return null;

  const pontos = [
    ...historico.map((h) => ({ mes: h.mes, valor: h.consumo_fora_ponta_kwh ?? 0 })),
    { mes: abreviarMes(fatura.mes_referencia), valor: fatura.consumo_fora_ponta_kwh ?? 0 },
  ];
  const maiorValor = Math.max(...pontos.map((p) => p.valor), 1);
  const ALTURA_MAXIMA = 100;

  return (
    <View style={estilos.cartao}>
      <Text style={estilos.tituloSecao}>Histórico de consumo </Text>
      <Text style={estilos.legendaGraficoHist}>Média de consumo igual a: X</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={estilos.areaGraficoHist}>
          {pontos.map((p, i) => (
            <View key={`${p.mes}-${i}`} style={estilos.colunaMesHist}>
              <View
                style={[
                  estilos.barraHist,
                  { height: (p.valor / maiorValor) * ALTURA_MAXIMA },
                  i === pontos.length - 1 && estilos.barraHistAtual,
                ]}
              />
              <Text style={estilos.labelMesHist}>{p.mes}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <Text style={estilos.legendaGraficoHist}>Demanda Contratada (Fora Ponta kWh)</Text>
    </View>
  );
}

export default function ConferenciaScreen({ faturas, aoConfirmar, aoVoltar }: Props) {
  const [selecionada, setSelecionada] = useState<FaturaExtraida | null>(
    faturas.length === 1 ? faturas[0] : null
  );
  const [demandaCorrigida, setDemandaCorrigida] = useState<string>(
    faturas.length === 1 ? String(faturas[0].demanda_contratada_fora_ponta_kw ?? '') : ''
  );

  // Tela de seleção -- só aparece quando o PDF trouxe mais de 1 fatura (Fatura Unificada)
  if (!selecionada) {
    return (
      <ScrollView contentContainerStyle={estilos.container}>
        <Text style={estilos.titulo}>Selecione a UC</Text>
        <Text style={estilos.subtitulo}>
          Esse PDF contém {faturas.length} faturas. Escolha qual conferir primeiro.
        </Text>
        {faturas.map((f, i) => (
          <TouchableOpacity
            key={i}
            style={estilos.itemLista}
            onPress={() => {
              setSelecionada(f);
              setDemandaCorrigida(String(f.demanda_contratada_fora_ponta_kw ?? ''));
            }}
          >
            <Text style={estilos.itemListaTitulo}>{f.nome_unidade ?? 'Unidade sem nome'}</Text>
            <Text style={estilos.itemListaSub}>
              UC {f.uc ?? '—'} · {f.grupo_tarifario === 'A' ? 'Grupo A' : 'Grupo B'} · R$ {f.valor_total_pagar?.toFixed(2)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  const f = selecionada;

  return (
    <ScrollView contentContainerStyle={estilos.container}>
      {faturas.length > 1 && (
        <TouchableOpacity onPress={() => setSelecionada(null)}>
          <Text style={estilos.linkVoltar}>← Escolher outra UC</Text>
        </TouchableOpacity>
      )}

      <Text style={estilos.titulo}>Conferência de Dados</Text>
      <Text style={estilos.subtitulo}>
        Confira os dados extraídos do PDF antes de prosseguir. Corrija o que estiver errado.
      </Text>

      <View style={estilos.cartao}>
        <Text style={estilos.tituloSecao}>Identificação</Text>
        <Campo label="Órgão" valor={f.nome_orgao} />
        <Campo label="Unidade" valor={f.nome_unidade} />
        <Campo label="UC" valor={f.uc} />
        <Campo label="Documento" valor={f.documento_raw ? `${f.tipo_documento}: ${f.documento_raw}` : null} />
        <Campo label="Grupo tarifário" valor={f.grupo_tarifario === 'A' ? 'A (alta tensão)' : 'B (baixa tensão)'} />
      </View>

      <View style={estilos.cartao}>
        <Text style={estilos.tituloSecao}>Fatura</Text>
        <Campo label="Mês de referência" valor={f.mes_referencia} />
        <Campo label="Vencimento" valor={f.vencimento} />
        <Campo label="Total a pagar" valor={f.valor_total_pagar != null ? `R$ ${f.valor_total_pagar.toFixed(2)}` : null} />
      </View>

      <View style={estilos.cartao}>
        <Text style={estilos.tituloSecao}>Carga tributária</Text>
        <Campo label="PIS" valor={f.pis_valor != null ? `R$ ${f.pis_valor.toFixed(2)} (${f.pis_aliquota_pct}%)` : null} />
        <Campo label="COFINS" valor={f.cofins_valor != null ? `R$ ${f.cofins_valor.toFixed(2)} (${f.cofins_aliquota_pct}%)` : null} />
        <Campo label="ICMS" valor={f.icms_valor != null ? `R$ ${f.icms_valor.toFixed(2)} (${f.icms_aliquota_pct}%)` : null} />
        {f.icms_fcp_valor != null && (
          <Campo label="ICMS FCP" valor={`R$ ${f.icms_fcp_valor.toFixed(2)} (${f.icms_fcp_aliquota_pct}%)`} />
        )}
      </View>

      {f.grupo_tarifario === 'A' ? (
        <>
          <View style={estilos.cartao}>
            <Text style={estilos.tituloSecao}>Consumo e demanda</Text>
            <Campo label="Consumo Ponta" valor={f.consumo_ponta_kwh != null ? `${f.consumo_ponta_kwh} kWh` : null} />
            <Campo label="Consumo Fora Ponta" valor={f.consumo_fora_ponta_kwh != null ? `${f.consumo_fora_ponta_kwh} kWh` : null} />
            <Campo label="Demanda medida (Fora Ponta)" valor={f.demanda_medida_fora_ponta_kw != null ? `${f.demanda_medida_fora_ponta_kw} kW` : null} />

            <View style={estilos.linhaCampoEditavel}>
              <Text style={estilos.labelCampo}>Demanda contratada (Fora Ponta)</Text>
              <TextInput
                style={estilos.input}
                value={demandaCorrigida}
                onChangeText={setDemandaCorrigida}
                keyboardType="numeric"
              />
            </View>
          </View>

          <GraficoConsumoHistorico fatura={f} />
        </>
      ) : (
        <View style={estilos.avisoGrupoB}>
          <Text style={estilos.textoAvisoGrupoB}>
            Essa UC é Grupo B (baixa tensão) -- não existe Verde/Azul pra comparar, então não há
            enquadramento a fazer aqui. Os dados acima já estão conferidos.
          </Text>
        </View>
      )}

      <View style={estilos.botoesRodape}>
        <TouchableOpacity style={estilos.botaoSecundario} onPress={aoVoltar}>
          <Text style={estilos.textoBotaoSecundario}>Voltar</Text>
        </TouchableOpacity>

        {f.grupo_tarifario === 'A' && (
          <TouchableOpacity
            style={estilos.botaoPrimario}
            onPress={() =>
              aoConfirmar({
                ...f,
                demanda_contratada_fora_ponta_kw: parseFloat(demandaCorrigida) || f.demanda_contratada_fora_ponta_kw,
              })
            }
          >
            <Text style={estilos.textoBotaoPrimario}>Realizar Enquadramento</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: cores.fundo, padding: espacamento.md },
  titulo: { fontSize: tipografia.titulo, fontWeight: '700', color: cores.primaria, marginBottom: espacamento.xs },
  subtitulo: { fontSize: tipografia.corpo, color: cores.textoSecundario, marginBottom: espacamento.md, lineHeight: 20 },
  linkVoltar: { color: cores.primaria, fontSize: tipografia.corpo, marginBottom: espacamento.md, fontWeight: '600' },

  itemLista: {
    backgroundColor: cores.cartao,
    borderRadius: 12,
    padding: espacamento.md,
    marginBottom: espacamento.sm,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  itemListaTitulo: { fontSize: tipografia.corpo, fontWeight: '700', color: cores.textoPrimario },
  itemListaSub: { fontSize: tipografia.legenda, color: cores.textoSecundario, marginTop: espacamento.xs },

  cartao: {
    backgroundColor: cores.cartao,
    borderRadius: 12,
    padding: espacamento.md,
    marginBottom: espacamento.md,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  tituloSecao: {
    fontSize: tipografia.subtitulo,
    fontWeight: '700',
    color: cores.textoPrimario,
    marginBottom: espacamento.sm,
  },
  linhaCampo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: espacamento.xs,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  linhaCampoEditavel: {
    paddingVertical: espacamento.xs,
  },
  labelCampo: { fontSize: tipografia.legenda, color: cores.textoSecundario, flex: 1 },
  valorCampo: { fontSize: tipografia.corpo, color: cores.textoPrimario, fontWeight: '600', flex: 1, textAlign: 'right' },
  input: {
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 8,
    padding: espacamento.sm,
    marginTop: espacamento.xs,
    fontSize: tipografia.corpo,
  },

  areaGraficoHist: { flexDirection: 'row', alignItems: 'flex-end', paddingTop: espacamento.sm },
  colunaMesHist: { alignItems: 'center', marginHorizontal: -2.7, width: 34, marginBottom: 10, marginTop: -15 },
  barraHist: { width: 14, backgroundColor: cores.azulTarifa, opacity: 0.5, borderRadius: 2 },
  barraHistAtual: { backgroundColor: cores.primaria, opacity: 1 },
  labelMesHist: { fontSize: 8, color: cores.textoSecundario, marginTop: 10, transform: [{ rotate: '-45deg' }] },
  legendaGraficoHist: { fontSize: 10, color: cores.textoSecundario, fontStyle: 'italic', marginTop: 8 },

  avisoGrupoB: {
    backgroundColor: '#FFF7E6',
    borderRadius: 12,
    padding: espacamento.md,
    marginBottom: espacamento.md,
    borderWidth: 1,
    borderColor: cores.aviso,
  },
  textoAvisoGrupoB: { color: '#7A5B00', fontSize: tipografia.corpo, lineHeight: 20 },

  botoesRodape: { flexDirection: 'row', gap: espacamento.sm, marginTop: espacamento.sm, marginBottom: espacamento.xl },
  botaoPrimario: {
    flex: 1,
    backgroundColor: cores.secundaria,
    borderRadius: 10,
    paddingVertical: espacamento.md,
    alignItems: 'center',
  },
  textoBotaoPrimario: { color: cores.textoClaro, fontWeight: '700', fontSize: tipografia.corpo },
  botaoSecundario: {
    flex: 1,
    backgroundColor: cores.cartao,
    borderRadius: 10,
    paddingVertical: espacamento.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: cores.borda,
  },
  textoBotaoSecundario: { color: cores.textoSecundario, fontWeight: '600', fontSize: tipografia.corpo },
});