import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, View, Text } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { cores } from './src/theme/theme';
import UploadScreen from './src/screens/UploadScreen';
import ConferenciaScreen from './src/screens/ConferenciaScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import { FaturaExtraida } from './src/api/types';

type Tela = 'UPLOAD' | 'CONFERENCIA' | 'DASHBOARD';

export default function App() {
  const [tela, setTela] = useState<Tela>('UPLOAD');
  const [faturasExtraidas, setFaturasExtraidas] = useState<FaturaExtraida[]>([]);
  const [faturaConfirmada, setFaturaConfirmada] = useState<FaturaExtraida | null>(null);

  function reiniciar() {
    setFaturasExtraidas([]);
    setFaturaConfirmada(null);
    setTela('UPLOAD');
  }

  return (
    <SafeAreaView style={estilos.safeArea}>
      <ExpoStatusBar style="light" />
      <View style={estilos.header}>
        <Text style={estilos.headerTexto}>SEAD · Enquadramento Tarifário</Text>
      </View>

      {tela === 'UPLOAD' && (
        <UploadScreen
          aoExtrairComSucesso={(faturas) => {
            setFaturasExtraidas(faturas);
            setTela('CONFERENCIA');
          }}
        />
      )}

      {tela === 'CONFERENCIA' && (
        <ConferenciaScreen
          faturas={faturasExtraidas}
          aoVoltar={reiniciar}
          aoConfirmar={(fatura) => {
            setFaturaConfirmada(fatura);
            setTela('DASHBOARD');
          }}
        />
      )}

      {tela === 'DASHBOARD' && faturaConfirmada && (
        <DashboardScreen fatura={faturaConfirmada} aoVoltar={reiniciar} />
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: cores.primaria,
    paddingTop: StatusBar.currentHeight ?? 0,
  },
  header: {
    backgroundColor: cores.primaria,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerTexto: {
    color: cores.textoClaro,
    fontSize: 16,
    fontWeight: '700',
  },
});
