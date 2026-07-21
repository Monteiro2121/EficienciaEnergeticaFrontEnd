import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { cores, espacamento, tipografia } from '../theme/theme';
import { realizarEnquadramentoGrupoB } from '../api/client';
import { FaturaExtraida, ResultadoEnquadramentoGrupoB } from '../api/types';

type Props = {
  fatura: FaturaExtraida;
  horaAbertura: string;
  horaFechamento: string;
  funcionaFimDeSemana: boolean;
  aoVoltar: () => void;
};

export default function DashboardGrupoBScreen({
  fatura,
  horaAbertura,
  horaFechamento,
  funcionaFimDeSemana,
  aoVoltar,
}: Props) {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoEnquadramentoGrupoB | null>(null);

  useEffect(() => {
    realizarEnquadramentoGrupoB(fatura, horaAbertura, horaFechamento, funcionaFimDeSemana)
      .then(setResultado)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [fatura, horaAbertura, horaFechamento, funcionaFimDeSemana]);

  if (carregando) {
    return (
      <View style={estilos.centralizado}>
        <ActivityIndicator size="large" color={cores.primaria} />
        <Text style={estilos.textoCarregando}>Calculando Convencional x Tarifa Branca...</Text>
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

  return (
    <ScrollView contentContainerStyle={estilos.container}>
      <Text style={estilos.orgao}>{fatura.nome_orgao}</Text>
      <Text style={estilos.unidade}>{fatura.nome_unidade}</Text>
      <Text style={estilos.uc}>
        UC {fatura.uc} · Subgrupo {resultado.subgrupo ?? '—'}
      </Text>

      {resultado.faturamento_minimo && (
        <View style={estilos.avisoBox}>
          <Text style={estilos.avisoTexto}>
            Essa UC está no faturamento mínimo (Custo de Disponibilidade) -- trocar de tarifa
            normalmente NÃO compensa nesse caso, independente do número abaixo.
          </Text>
        </View>
      )}

      <View style={estilos.grade}>
        <View style={estilos.cartaoMetrica}>
          <Text style={estilos.labelMetrica}>Custo mensal Convencional</Text>
          <Text style={estilos.valorMetrica}>R$ {resultado.custo_mensal_convencional.toFixed(2)}</Text>
        </View>
        <View style={estilos.cartaoMetrica}>
          <Text style={estilos.labelMetrica}>Custo mensal Tarifa Branca</Text>
          <Text style={estilos.valorMetrica}>R$ {resultado.custo_mensal_branca.toFixed(2)}</Text>
        </View>
      </View>

      <View style={estilos.grade}>
        <View style={estilos.cartaoMetrica}>
          <Text style={estilos.labelMetrica}>Consumo médio mensal</Text>
          <Text style={estilos.valorMetrica}>{resultado.consumo_medio_mensal_kwh.toFixed(2)} kWh</Text>
          <Text style={estilos.legendaMetrica}>
            {resultado.qtd_meses_considerados} {resultado.qtd_meses_considerados === 1 ? 'mês' : 'meses'} considerados
          </Text>
        </View>
        <View style={estilos.cartaoMetrica}>
          <Text style={estilos.labelMetrica}>Diferença anual</Text>
          <Text
            style={[
              estilos.valorMetrica,
              resultado.diferenca_anual > 0 ? estilos.valorPositivo : estilos.valorNegativo,
            ]}
          >
            R$ {Math.abs(resultado.diferenca_anual).toFixed(2)}
          </Text>
          <Text style={estilos.legendaMetrica}>
            {resultado.diferenca_anual > 0 ? 'Branca economizaria' : 'Convencional é melhor'}
          </Text>
        </View>
      </View>

      <View style={estilos.cartaoRecomendacao}>
        <Text style={estilos.tituloRecomendacao}>Recomendação</Text>
        <Text style={estilos.textoRecomendacao}>{resultado.texto_recomendacao}</Text>
      </View>

      {resultado.avisos.map((aviso, i) => (
        <Text key={i} style={estilos.notaRodape}>
          {aviso}
        </Text>
      ))}

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

  avisoBox: {
    backgroundColor: '#FFF7E6',
    borderRadius: 10,
    padding: espacamento.sm,
    marginBottom: espacamento.md,
    borderWidth: 1,
    borderColor: cores.aviso,
  },
  avisoTexto: { color: '#7A5B00', fontSize: tipografia.legenda, lineHeight: 18 },

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
    marginBottom: espacamento.md,
  },
  tituloRecomendacao: { color: cores.textoClaro, fontWeight: '700', fontSize: tipografia.corpo, marginBottom: espacamento.xs },
  textoRecomendacao: { color: cores.textoClaro, fontSize: tipografia.corpo, lineHeight: 20 },

  notaRodape: {
    fontSize: 10,
    color: cores.textoSecundario,
    fontStyle: 'italic',
    lineHeight: 14,
    marginBottom: espacamento.xs,
    paddingHorizontal: espacamento.xs,
  },

  botaoSecundario: {
    backgroundColor: cores.cartao,
    borderRadius: 10,
    paddingVertical: espacamento.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: cores.borda,
    marginTop: espacamento.sm,
    marginBottom: espacamento.xl,
  },
  textoBotaoSecundario: { color: cores.textoSecundario, fontWeight: '600', fontSize: tipografia.corpo },
});