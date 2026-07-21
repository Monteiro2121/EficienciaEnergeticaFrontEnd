import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, View, Text } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { cores } from './src/theme/theme';
import UploadScreen from './src/screens/UploadScreen';
import ConferenciaScreen from './src/screens/ConferenciaScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import DashboardGrupoBScreen from './src/screens/DashboardBScreen';
import GraficoScreen from './src/screens/GraphicScreen';
import { FaturaExtraida, ResultadoEnquadramento } from './src/api/types';

type Tela = 'UPLOAD' | 'CONFERENCIA' | 'DASHBOARD' | 'DASHBOARD_B' | 'GRAFICO';

export default function App() {
  const [tela, setTela] = useState<Tela>('UPLOAD');
  const [faturasExtraidas, setFaturasExtraidas] = useState<FaturaExtraida[]>([]);
  const [faturaConfirmada, setFaturaConfirmada] = useState<FaturaExtraida | null>(null);
  const [resultadoEnquadramento, setResultadoEnquadramento] = useState<ResultadoEnquadramento | null>(null);
  const [dadosGrupoB, setDadosGrupoB] = useState<{
    fatura: FaturaExtraida;
    horaAbertura: string;
    horaFechamento: string;
    funcionaFimDeSemana: boolean;
  } | null>(null);

  function reiniciar() {
    setFaturasExtraidas([]);
    setFaturaConfirmada(null);
    setResultadoEnquadramento(null);
    setDadosGrupoB(null);
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
          aoConfirmarGrupoB={(fatura, horaAbertura, horaFechamento, funcionaFimDeSemana) => {
            setDadosGrupoB({ fatura, horaAbertura, horaFechamento, funcionaFimDeSemana });
            setTela('DASHBOARD_B');
          }}
        />
      )}

      {tela === 'DASHBOARD' && faturaConfirmada && (
        <DashboardScreen
          fatura={faturaConfirmada}
          aoVoltar={reiniciar}
          aoVerGrafico={(resultado) => {
            setResultadoEnquadramento(resultado);
            setTela('GRAFICO');
          }}
        />
      )}

      {tela === 'DASHBOARD_B' && dadosGrupoB && (
        <DashboardGrupoBScreen
          fatura={dadosGrupoB.fatura}
          horaAbertura={dadosGrupoB.horaAbertura}
          horaFechamento={dadosGrupoB.horaFechamento}
          funcionaFimDeSemana={dadosGrupoB.funcionaFimDeSemana}
          aoVoltar={reiniciar}
        />
      )}

      {tela === 'GRAFICO' && resultadoEnquadramento && (
        <GraficoScreen
          comparacao={resultadoEnquadramento.comparacao_modalidades}
          aoVoltar={() => setTela('DASHBOARD')}
        />
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