import { FaturaExtraida, FaturasExtraidasResponse, ResultadoEnquadramento } from './types';

/**
 * IMPORTANTE -- endereço do backend:
 * - Emulador Android: 'localhost' do PC NÃO funciona dentro do emulador.
 *   Use 10.0.2.2 (é como o emulador Android enxerga o localhost do seu PC).
 * - Simulador iOS: 'localhost' funciona normalmente.
 * - Celular físico (Expo Go): nem localhost nem 10.0.2.2 funcionam -- use
 *   o IP da sua máquina na rede local (ex: 192.168.0.15), com o celular
 *   na MESMA rede Wi-Fi do PC rodando o uvicorn.
 *
 * Troque a constante abaixo conforme onde você está testando.
 */
export const API_BASE_URL = 'http://10.0.2.2:8000'; // ajuste aqui

async function tratarResposta<T>(resposta: Response): Promise<T> {
  if (!resposta.ok) {
    let detalhe = `Erro HTTP ${resposta.status}`;
    try {
      const corpo = await resposta.json();
      detalhe = corpo.detail ? JSON.stringify(corpo.detail) : detalhe;
    } catch {
      // resposta não era JSON -- mantém a mensagem genérica
    }
    throw new Error(detalhe);
  }
  return resposta.json();
}

/** UC01/UC02 -- envia o PDF e recebe a(s) fatura(s) extraída(s). */
export async function extrairFaturas(uri: string, nomeArquivo: string): Promise<FaturasExtraidasResponse> {
  const formData = new FormData();
  // @ts-ignore -- formato exigido pelo fetch do React Native pra upload de arquivo
  formData.append('arquivo', {
    uri,
    name: nomeArquivo,
    type: 'application/pdf',
  });

  const resposta = await fetch(`${API_BASE_URL}/faturas/extrair`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return tratarResposta<FaturasExtraidasResponse>(resposta);
}

/** UC05/UC06 -- envia 1+ faturas conferidas de uma UC e recebe o enquadramento. */
export async function realizarEnquadramento(faturas: FaturaExtraida[]): Promise<ResultadoEnquadramento> {
  const resposta = await fetch(`${API_BASE_URL}/enquadramentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(faturas),
  });

  return tratarResposta<ResultadoEnquadramento>(resposta);
}
