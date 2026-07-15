import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { cores, espacamento, tipografia } from '../theme/theme';
import { ComparacaoModalidades } from '../api/types';

type Props = {
  comparacao: ComparacaoModalidades;
  aoVoltar: () => void;
};

const NOME_MODALIDADE: Record<string, string> = {
  verde: 'Verde',
  azul: 'Azul',
  optante_b: 'Optante B',
};

function formatarReais(valor: number | null): string {
  if (valor == null) return '—';
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Tabela "Gastos Totais (R$)" -- mesmo layout da planilha do professor:
 * uma linha por mês, uma coluna por modalidade, linha de Total destacada. */
function TabelaGastosMensais({ comparacao }: { comparacao: ComparacaoModalidades }) {
  return (
    <View style={estilos.cartaoTabela}>
      <View style={estilos.tabelaTituloFaixa}>
        <Text style={estilos.tabelaTitulo}>Gastos Totais (R$)</Text>
      </View>

      <View style={estilos.linhaTabela}>
        <View style={[estilos.celulaCabecalho, estilos.colPeriodo, { backgroundColor: cores.aviso }]}>
          <Text style={estilos.textoCabecalho}>Período</Text>
        </View>
        <View style={[estilos.celulaCabecalho, estilos.colValor, { backgroundColor: cores.secundaria }]}>
          <Text style={estilos.textoCabecalho}>Verde</Text>
        </View>
        <View style={[estilos.celulaCabecalho, estilos.colValor, { backgroundColor: cores.azulTarifa }]}>
          <Text style={estilos.textoCabecalho}>Azul</Text>
        </View>
        <View style={[estilos.celulaCabecalho, estilos.colValor, { backgroundColor: cores.optanteB }]}>
          <Text style={estilos.textoCabecalho}>Optante B</Text>
        </View>
      </View>

      {comparacao.meses.map((mes, i) => (
        <View key={mes} style={estilos.linhaTabela}>
          <View style={[estilos.celula, estilos.colPeriodo, { backgroundColor: cores.cartao }]}>
            <Text style={estilos.textoPeriodo}>{mes}</Text>
          </View>
          <View style={[estilos.celula, estilos.colValor, { backgroundColor: cores.pastelVerde }]}>
            <Text style={estilos.textoValor}>{formatarReais(comparacao.verde[i])}</Text>
          </View>
          <View style={[estilos.celula, estilos.colValor, { backgroundColor: cores.pastelAzul }]}>
            <Text style={estilos.textoValor}>{formatarReais(comparacao.azul[i])}</Text>
          </View>
          <View style={[estilos.celula, estilos.colValor, { backgroundColor: cores.pastelCinza }]}>
            <Text style={estilos.textoValor}>{formatarReais(comparacao.optante_b[i])}</Text>
          </View>
        </View>
      ))}

      <View style={estilos.linhaTabela}>
        <View style={[estilos.celula, estilos.colPeriodo, { backgroundColor: cores.aviso }]}>
          <Text style={estilos.textoTotalLabel}>Total</Text>
        </View>
        <View style={[estilos.celula, estilos.colValor, { backgroundColor: cores.secundaria }]}>
          <Text style={estilos.textoTotalValor}>R$ {formatarReais(comparacao.totais.verde)}</Text>
        </View>
        <View style={[estilos.celula, estilos.colValor, { backgroundColor: cores.azulTarifa }]}>
          <Text style={estilos.textoTotalValor}>R$ {formatarReais(comparacao.totais.azul)}</Text>
        </View>
        <View style={[estilos.celula, estilos.colValor, { backgroundColor: cores.optanteB }]}>
          <Text style={estilos.textoTotalValor}>R$ {formatarReais(comparacao.totais.optante_b)}</Text>
        </View>
      </View>
    </View>
  );
}

/** Tabela "Quadro comparativo" -- mesmo layout da planilha do professor. */
function TabelaQuadroComparativo({ comparacao }: { comparacao: ComparacaoModalidades }) {
  const linhas: { label: string; valor: number | null; cor: string }[] = [
    { label: 'Verde vs Azul', valor: comparacao.quadro_comparativo.verde_vs_azul, cor: cores.pastelVerde },
    { label: 'Verde vs Optante B', valor: comparacao.quadro_comparativo.verde_vs_optante_b, cor: cores.pastelVerde },
    { label: 'Azul vs Optante B', valor: comparacao.quadro_comparativo.azul_vs_optante_b, cor: cores.pastelAzul },
  ];

  return (
    <View style={estilos.cartaoTabela}>
      <View style={[estilos.tabelaTituloFaixa, { backgroundColor: cores.aviso }]}>
        <Text style={estilos.tabelaTitulo}>Quadro comparativo</Text>
      </View>
      {linhas.map((l) => (
        <View key={l.label} style={[estilos.linhaQuadro, { backgroundColor: l.cor }]}>
          <Text style={estilos.textoQuadroLabel}>{l.label}</Text>
          <Text style={estilos.textoQuadroValor}>
            {l.valor == null ? '—' : `R$ ${formatarReais(l.valor)}`}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Componente principal da tela -- é ISSO que estava faltando no seu arquivo.
 * Sem essa função (com "export default"), a tela não tem o que renderizar,
 * mesmo com as duas tabelas acima definidas certinho. */
export default function GraficoScreen({ comparacao, aoVoltar }: Props) {
  return (
    <ScrollView contentContainerStyle={estilos.container}>

      <TabelaGastosMensais comparacao={comparacao} />
      <TabelaQuadroComparativo comparacao={comparacao} />

      <View style={estilos.cartaoRecomendacao}>
        <Text style={estilos.tituloRecomendacao}>Grupo com menor custo total</Text>
        <Text style={estilos.textoRecomendacao}>
          {comparacao.novo_grupo_escolhido
            ? NOME_MODALIDADE[comparacao.novo_grupo_escolhido]
            : 'Ainda não é possível comparar'}
        </Text>
      </View>

      <TouchableOpacity style={estilos.botaoSecundario} onPress={aoVoltar}>
        <Text style={estilos.textoBotaoSecundario}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: cores.fundo, padding: espacamento.md },

  avisoBox: {
    backgroundColor: '#FFF7E6',
    borderRadius: 10,
    padding: espacamento.sm,
    marginBottom: espacamento.md,
    borderWidth: 1,
    borderColor: cores.aviso,
  },
  avisoTexto: { color: '#7A5B00', fontSize: tipografia.legenda, lineHeight: 18 },

  cartaoTabela: {
    backgroundColor: cores.cartao,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: espacamento.md,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  tabelaTituloFaixa: { backgroundColor: cores.primaria, paddingVertical: 8, alignItems: 'center' },
  tabelaTitulo: { color: cores.textoClaro, fontWeight: '700', fontSize: tipografia.corpo },

  linhaTabela: { flexDirection: 'row' },
  colPeriodo: { flex: 1.1 },
  colValor: { flex: 1 },
  celulaCabecalho: { paddingVertical: 6, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  celula: { paddingVertical: 6, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  textoCabecalho: { color: cores.textoClaro, fontWeight: '700', fontSize: 11 },
  textoPeriodo: { color: cores.textoPrimario, fontWeight: '600', fontSize: 11 },
  textoValor: { color: cores.textoPrimario, fontSize: 11 },
  textoTotalLabel: { color: cores.textoClaro, fontWeight: '700', fontSize: 11 },
  textoTotalValor: { color: cores.textoClaro, fontWeight: '700', fontSize: 11 },

  linhaQuadro: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: espacamento.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  textoQuadroLabel: { fontSize: tipografia.legenda, fontWeight: '700', color: cores.textoPrimario },
  textoQuadroValor: { fontSize: tipografia.legenda, fontWeight: '700', color: cores.textoPrimario },

  cartaoRecomendacao: {
    backgroundColor: cores.primaria,
    borderRadius: 12,
    padding: espacamento.md,
    marginBottom: espacamento.md,
  },
  tituloRecomendacao: { color: cores.textoClaro, fontWeight: '700', fontSize: tipografia.corpo, marginBottom: espacamento.xs },
  textoRecomendacao: { color: cores.textoClaro, fontSize: tipografia.titulo, fontWeight: '700' },

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