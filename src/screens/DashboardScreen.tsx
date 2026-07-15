import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { cores, espacamento, tipografia } from '../theme/theme';
import { realizarEnquadramento } from '../api/client';
import { FaturaExtraida, ResultadoEnquadramento } from '../api/types';

type Props = {
  fatura: FaturaExtraida;
  aoVoltar: () => void;
  aoVerGrafico: (resultado: ResultadoEnquadramento) => void;
};

type Modalidade = 'VERDE' | 'AZUL' | 'OPTANTE_B';

const NOME_MODALIDADE: Record<Modalidade, string> = {
  VERDE: 'Verde',
  AZUL: 'Azul',
  OPTANTE_B: 'Optante B',
};

export default function DashboardScreen({ fatura, aoVoltar, aoVerGrafico }: Props) {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoEnquadramento | null>(null);
  const [modalidade, setModalidade] = useState<Modalidade>('VERDE');

  useEffect(() => {
    realizarEnquadramento([fatura])
      .then(setResultado)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [fatura]);

  if (carregando) {
    return (
      <View style={estilos.centralizado}>
        <ActivityIndicator size="large" color={cores.primaria} />
        <Text style={estilos.textoCarregando}>Calculando enquadramento...</Text>
      </View>
    );
  }

  if (erro || !resultado) {
    return (
      <View style={estilos.centralizado}>
        <Text style={estilos.textoErro}>Não foi possível calcular: {erro}</Text>
        <TouchableOpacity style={estilos.botaoSecundario} onPress={aoVoltar}>
          <Text style={estilos.textoBotaoSecundario}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const avisoEstimativa = resultado.base_calculo !== 'ANO_FECHADO';
  const comparacao = resultado.comparacao_modalidades;

  const corConfianca = {
    BAIXA: cores.aviso,
    MEDIA: cores.azulTarifa,
    ALTA: cores.secundaria,
    MAXIMA: cores.secundaria,
  }[resultado.confianca];

  // Pra Azul/Optante B: diferença vs Verde (positivo = essa modalidade é mais barata)
  const diffVsVerde =
    modalidade === 'AZUL'
      ? comparacao.quadro_comparativo.verde_vs_azul
      : modalidade === 'OPTANTE_B'
      ? comparacao.quadro_comparativo.verde_vs_optante_b
      : null;

  const custoAnualModalidade =
    modalidade === 'VERDE'
      ? resultado.custo_total_anual_estimado
      : modalidade === 'AZUL'
      ? comparacao.totais.azul
      : comparacao.totais.optante_b;

  return (
    <ScrollView contentContainerStyle={estilos.container}>
      <Text style={estilos.orgao}>{fatura.nome_orgao}</Text>
      <Text style={estilos.unidade}>{fatura.nome_unidade}</Text>
      <Text style={estilos.uc}>UC {fatura.uc} · Venc. {fatura.vencimento}</Text>

      <View style={[estilos.selo, { borderColor: corConfianca }]}>
        <Text style={[estilos.textoSelo, { color: corConfianca }]}>
          Confiança da recomendação: {resultado.confianca}
        </Text>
      </View>

      {avisoEstimativa && (
        <View style={estilos.avisoEstimativa}>
          <Text style={estilos.textoAvisoEstimativa}>
            Estimativa baseada em {resultado.qtd_meses_considerados}{' '}
            {resultado.qtd_meses_considerados === 1 ? 'mês' : 'meses'} de fatura. A precisão
            aumenta conforme mais meses dessa UC forem enviados.
          </Text>
        </View>
      )}

      {/* Toggle Verde / Azul / Optante B */}
      <View style={estilos.toggle}>
        {(['VERDE', 'AZUL', 'OPTANTE_B'] as Modalidade[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[estilos.toggleBotao, modalidade === m && estilos.toggleBotaoAtivo]}
            onPress={() => setModalidade(m)}
          >
            <Text style={[estilos.toggleTexto, modalidade === m && estilos.toggleTextoAtivo]}>
              {NOME_MODALIDADE[m]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {modalidade === 'AZUL' && !comparacao.azul_confirmada && (
        <View>
        </View>
      )}
      {modalidade === 'OPTANTE_B' && (
        <View style={estilos.avisoEstimativa}>
          <Text style={estilos.textoAvisoEstimativa}>
            Confirme a elegibilidade antes de considerar essa troca.
          </Text>
        </View>
      )}

      {modalidade === 'VERDE' ? (
        <>
          <View style={estilos.grade}>
            <View style={estilos.cartaoMetrica}>
              <Text style={estilos.labelMetrica}>Demanda ideal</Text>
              <Text style={estilos.valorMetrica}>{resultado.demanda_ideal_fora_ponta_kw} kW</Text>
              <Text style={estilos.legendaMetrica}>atual: {resultado.demanda_atual_contratada_kw} kW</Text>
            </View>
            <View style={estilos.cartaoMetrica}>
              <Text style={estilos.labelMetrica}>Economia média mensal</Text>
              <Text style={[estilos.valorMetrica, estilos.valorPositivo]}>
                R$ {resultado.economia_media_mensal.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={estilos.grade}>
            <View style={estilos.cartaoMetrica}>
              <Text style={estilos.labelMetrica}>Economia total anual (estimada)</Text>
              <Text style={[estilos.valorMetrica, estilos.valorPositivo]}>
                R$ {resultado.economia_total_anual_estimada.toFixed(2)}
              </Text>
            </View>
            <View style={estilos.cartaoMetrica}>
              <Text style={estilos.labelMetrica}>Custo total anual (estimado)</Text>
              <Text style={estilos.valorMetrica}>R$ {resultado.custo_total_anual_estimado.toFixed(2)}</Text>
            </View>
          </View>

          <View style={estilos.cartaoRecomendacao}>
            <Text style={estilos.tituloRecomendacao}>Recomendação</Text>
            <Text style={estilos.textoRecomendacao}>{resultado.texto_recomendacao}</Text>
          </View>
        </>
      ) : (
        <>
          <View style={estilos.grade}>
            <View style={estilos.cartaoMetrica}>
              <Text style={estilos.labelMetrica}>Custo total anual ({NOME_MODALIDADE[modalidade]})</Text>
              <Text style={estilos.valorMetrica}>
                {custoAnualModalidade != null ? `R$ ${custoAnualModalidade.toFixed(2)}` : '—'}
              </Text>
            </View>
            <View style={estilos.cartaoMetrica}>
              <Text style={estilos.labelMetrica}>Diferença vs Verde</Text>
              <Text style={[estilos.valorMetrica, diffVsVerde != null && diffVsVerde > 0 ? estilos.valorPositivo : estilos.valorNegativo]}>
                {diffVsVerde != null ? `R$ ${Math.abs(diffVsVerde).toFixed(2)}` : '—'}
              </Text>
              <Text style={estilos.legendaMetrica}>
                {diffVsVerde != null ? (diffVsVerde > 0 ? 'mais barato que Verde' : 'mais caro que Verde') : ''}
              </Text>
            </View>
          </View>

          <View style={estilos.cartaoRecomendacao}>
            <Text style={estilos.tituloRecomendacao}>Comparação com Verde</Text>
            <Text style={estilos.textoRecomendacao}>
              {diffVsVerde == null
                ? 'Não foi possível comparar.'
                : diffVsVerde > 0
                ? `Trocar pra ${NOME_MODALIDADE[modalidade]} economizaria R$ ${diffVsVerde.toFixed(2)}/ano em relação à Verde.`
                : `Manter Verde é mais barato -- ${NOME_MODALIDADE[modalidade]} custaria R$ ${Math.abs(diffVsVerde).toFixed(2)}/ano a mais.`}
            </Text>
          </View>
        </>
      )}

      <TouchableOpacity style={estilos.botaoPrimarioVerde} onPress={() => aoVerGrafico(resultado)}>
        <Text style={estilos.textoBotaoPrimario}>Ver gráfico</Text>
      </TouchableOpacity>

      <TouchableOpacity style={estilos.botaoSecundario} onPress={aoVoltar}>
        <Text style={estilos.textoBotaoSecundario}>Nova fatura</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: cores.fundo, padding: espacamento.md },
  centralizado: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.fundo, padding: espacamento.lg },
  textoCarregando: { marginTop: espacamento.md, color: cores.textoSecundario },
  textoErro: { color: cores.alerta, textAlign: 'center', marginBottom: espacamento.md, fontSize: tipografia.corpo },

  orgao: { fontSize: tipografia.legenda, color: cores.textoSecundario, fontWeight: '600', textTransform: 'uppercase' },
  unidade: { fontSize: tipografia.titulo, color: cores.primaria, fontWeight: '700', marginTop: 2 },
  uc: { fontSize: tipografia.legenda, color: cores.textoSecundario, marginTop: 2, marginBottom: espacamento.sm },

  selo: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: espacamento.md,
  },
  textoSelo: { fontSize: 11, fontWeight: '700' },

  avisoEstimativa: {
    backgroundColor: '#FFF7E6',
    borderRadius: 10,
    padding: espacamento.sm,
    marginBottom: espacamento.md,
    borderWidth: 1,
    borderColor: cores.aviso,
  },
  textoAvisoEstimativa: { color: '#7A5B00', fontSize: tipografia.legenda, lineHeight: 18 },

  toggle: { flexDirection: 'row', backgroundColor: cores.cartao, borderRadius: 10, padding: 4, marginBottom: espacamento.md, borderWidth: 1, borderColor: cores.borda },
  toggleBotao: { flex: 1, paddingVertical: espacamento.sm, borderRadius: 8, alignItems: 'center' },
  toggleBotaoAtivo: { backgroundColor: cores.secundaria },
  toggleTexto: { fontWeight: '600', color: cores.textoSecundario, fontSize: tipografia.legenda },
  toggleTextoAtivo: { color: cores.textoClaro },

  grade: { flexDirection: 'row', gap: espacamento.sm, marginBottom: espacamento.sm },
  cartaoMetrica: {
    flex: 1,
    backgroundColor: cores.cartao,
    borderRadius: 12,
    padding: espacamento.md,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  labelMetrica: { fontSize: tipografia.legenda, color: cores.textoSecundario, marginBottom: espacamento.xs },
  valorMetrica: { fontSize: tipografia.subtitulo, fontWeight: '700', color: cores.textoPrimario },
  valorPositivo: { color: cores.secundaria },
  valorNegativo: { color: cores.alerta },
  legendaMetrica: { fontSize: 11, color: cores.textoSecundario, marginTop: 2 },

  cartaoRecomendacao: {
    backgroundColor: cores.primaria,
    borderRadius: 12,
    padding: espacamento.md,
    marginTop: espacamento.sm,
    marginBottom: espacamento.lg,
  },
  tituloRecomendacao: { color: cores.textoClaro, fontWeight: '700', fontSize: tipografia.corpo, marginBottom: espacamento.xs },
  textoRecomendacao: { color: cores.textoClaro, fontSize: tipografia.corpo, lineHeight: 20 },

  botaoSecundario: {
    backgroundColor: cores.cartao,
    borderRadius: 10,
    paddingVertical: espacamento.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: cores.borda,
    marginBottom: espacamento.xl,
  },
  botaoPrimarioVerde: {
    backgroundColor: cores.secundaria,
    borderRadius: 10,
    paddingVertical: espacamento.md,
    alignItems: 'center',
    marginBottom: espacamento.sm,
  },
  textoBotaoPrimario: { color: cores.textoClaro, fontWeight: '700', fontSize: tipografia.corpo },
  textoBotaoSecundario: { color: cores.textoSecundario, fontWeight: '600', fontSize: tipografia.corpo },
});