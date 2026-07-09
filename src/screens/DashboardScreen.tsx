import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { cores, espacamento, tipografia } from '../theme/theme';
import { realizarEnquadramento } from '../api/client';
import { FaturaExtraida, ResultadoEnquadramento } from '../api/types';

type Props = {
  fatura: FaturaExtraida;
  aoVoltar: () => void;
};

type Modalidade = 'VERDE' | 'AZUL';

export default function DashboardScreen({ fatura, aoVoltar }: Props) {
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

  return (
    <ScrollView contentContainerStyle={estilos.container}>
      <Text style={estilos.orgao}>{fatura.nome_orgao}</Text>
      <Text style={estilos.unidade}>{fatura.nome_unidade}</Text>
      <Text style={estilos.uc}>UC {fatura.uc} · Venc. {fatura.vencimento}</Text>

      {avisoEstimativa && (
        <View style={estilos.avisoEstimativa}>
          <Text style={estilos.textoAvisoEstimativa}>
            Estimativa baseada em {resultado.qtd_meses_considerados}{' '}
            {resultado.qtd_meses_considerados === 1 ? 'mês' : 'meses'} de fatura. A precisão
            aumenta conforme mais meses dessa UC forem enviados.
          </Text>
        </View>
      )}

      {/* Toggle Verde / Azul */}
      <View style={estilos.toggle}>
        <TouchableOpacity
          style={[estilos.toggleBotao, modalidade === 'VERDE' && estilos.toggleBotaoAtivoVerde]}
          onPress={() => setModalidade('VERDE')}
        >
          <Text style={[estilos.toggleTexto, modalidade === 'VERDE' && estilos.toggleTextoAtivo]}>
            Tarifa Verde
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[estilos.toggleBotao, estilos.toggleBotaoDesabilitado]} disabled>
          <Text style={estilos.toggleTextoDesabilitado}>Tarifa Azul (em breve)</Text>
        </TouchableOpacity>
      </View>

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
  uc: { fontSize: tipografia.legenda, color: cores.textoSecundario, marginTop: 2, marginBottom: espacamento.md },

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
  toggleBotaoAtivoVerde: { backgroundColor: cores.secundaria },
  toggleBotaoDesabilitado: { opacity: 0.5 },
  toggleTexto: { fontWeight: '600', color: cores.textoSecundario, fontSize: tipografia.legenda },
  toggleTextoAtivo: { color: cores.textoClaro },
  toggleTextoDesabilitado: { color: cores.textoSecundario, fontSize: tipografia.legenda },

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
  textoBotaoSecundario: { color: cores.textoSecundario, fontWeight: '600', fontSize: tipografia.corpo },
});
