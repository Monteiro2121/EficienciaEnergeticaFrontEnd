import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { cores, espacamento, tipografia } from '../theme/theme';
import { extrairFaturas } from '../api/client';
import { FaturaExtraida } from '../api/types';

type Props = {
  aoExtrairComSucesso: (faturas: FaturaExtraida[]) => void;
};

export default function UploadScreen({ aoExtrairComSucesso }: Props) {
  const [carregando, setCarregando] = useState(false);
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);

  async function selecionarEEnviarPdf() {
    const resultado = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (resultado.canceled || !resultado.assets?.[0]) return;

    const arquivo = resultado.assets[0];
    setNomeArquivo(arquivo.name);
    setCarregando(true);

    try {
      const resposta = await extrairFaturas(arquivo.uri, arquivo.name);
      if (!resposta.sucesso || resposta.faturas.length === 0) {
        Alert.alert('Não foi possível extrair', resposta.erro ?? 'Nenhuma fatura encontrada nesse PDF.');
        return;
      }
      aoExtrairComSucesso(resposta.faturas);
    } catch (erro: any) {
      Alert.alert('Erro ao enviar', erro.message ?? 'Falha desconhecida ao conectar com o backend.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={estilos.container}>
      <View style={estilos.cartao}>
        <Text style={estilos.titulo}>Entrada de Dados</Text>
        <Text style={estilos.subtitulo}>
          Envie o PDF da fatura Energisa. Se for uma "Fatura Unificada" (várias UCs no mesmo
          arquivo), todas serão extraídas de uma vez.
        </Text>

        <TouchableOpacity
          style={estilos.botaoPrimario}
          onPress={selecionarEEnviarPdf}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color={cores.textoClaro} />
          ) : (
            <Text style={estilos.textoBotaoPrimario}>Selecionar PDF</Text>
          )}
        </TouchableOpacity>

        {nomeArquivo && !carregando && (
          <Text style={estilos.nomeArquivo}>Último arquivo: {nomeArquivo}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: cores.fundo,
    padding: espacamento.md,
    justifyContent: 'center',
  },
  cartao: {
    backgroundColor: cores.cartao,
    borderRadius: 12,
    padding: espacamento.lg,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  titulo: {
    fontSize: tipografia.titulo,
    fontWeight: '700',
    color: cores.primaria,
    marginBottom: espacamento.sm,
  },
  subtitulo: {
    fontSize: tipografia.corpo,
    color: cores.textoSecundario,
    marginBottom: espacamento.lg,
    lineHeight: 20,
  },
  botaoPrimario: {
    backgroundColor: cores.primaria,
    borderRadius: 10,
    paddingVertical: espacamento.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoPrimario: {
    color: cores.textoClaro,
    fontSize: tipografia.subtitulo,
    fontWeight: '600',
  },
  nomeArquivo: {
    marginTop: espacamento.md,
    fontSize: tipografia.legenda,
    color: cores.textoSecundario,
    textAlign: 'center',
  },
});
