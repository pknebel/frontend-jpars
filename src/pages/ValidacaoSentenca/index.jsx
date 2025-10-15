import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGramatica } from '../../contexts/GramaticaContext';
import './styles.css';

export default function ValidacaoSentenca() {
  const navigate = useNavigate();
  const { gramaticaSelecionada, hasGramaticaSelecionada, idWorkflow } = useGramatica();
  
  // Estados da aplicação
  const [sentencas, setSentencas] = useState([]);
  const [sentencaSelecionada, setSentencaSelecionada] = useState('');
  const [simbolosSelecionados, setSimbolosSelecionados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  // Estados para análise
  const [pilha, setPilha] = useState([]);
  const [tabelaSintatica, setTabelaSintatica] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [hasStartedValidation, setHasStartedValidation] = useState(false);
  const [sentencaCompleta, setSentencaCompleta] = useState([]);
  const [indexSentenca, setIndexSentenca] = useState(0);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [isValidationComplete, setIsValidationComplete] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentValidationMessage, setCurrentValidationMessage] = useState('');

  useEffect(() => {
    const loadSentencas = async () => {
      // Verificar se há uma gramática selecionada
      if (!hasGramaticaSelecionada()) {
        console.log('Nenhuma gramática selecionada. Redirecionando...');
        navigate('/selecao-gramatica');
        return;
      }

      setIsLoading(true);
      try {
        console.log(`Buscando sentenças para o workflow ID: ${idWorkflow}`);
        const response = await fetch(`http://localhost:8080/jpars/sentenca/${idWorkflow}`);
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar sentenças: HTTP ${response.status}: ${response.statusText}`);
        }

        const sentencasData = await response.json();
        console.log('Sentenças recebidas:', sentencasData);
        setSentencas(sentencasData);
        
        if (sentencasData.length === 0) {
          setMessage('Nenhuma sentença disponível para validação.');
          setMessageType('info');
        } else {
          setMessage('');
          setMessageType('');
        }
        
      } catch (error) {
        console.error('Erro ao carregar sentenças:', error);
        setMessage('Erro ao carregar as sentenças. Verifique se o backend está rodando.');
        setMessageType('error');
      } finally {
        setIsLoading(false);
      }
    };

    loadSentencas();
  }, [hasGramaticaSelecionada, idWorkflow, navigate]);

  // Carregar tabela sintática quando o workflow for carregado
  useEffect(() => {
    const loadTabelaSintatica = async () => {
      if (!idWorkflow) return;
      
      try {
        console.log(`Buscando tabela sintática para o workflow ID: ${idWorkflow}`);
        const response = await fetch(`http://localhost:8080/jpars/tabela-sintatica/${idWorkflow}`);
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar tabela sintática: HTTP ${response.status}: ${response.statusText}`);
        }

        const tabelaData = await response.json();
        console.log('Tabela sintática recebida:', tabelaData);
        setTabelaSintatica(tabelaData);
        
      } catch (error) {
        console.error('Erro ao carregar tabela sintática:', error);
        setMessage('Erro ao carregar a tabela sintática. Verifique se o backend está rodando.');
        setMessageType('error');
      }
    };

    loadTabelaSintatica();
  }, [idWorkflow]);

  // Função para lidar com a mudança de seleção
  const handleSentencaChange = (event) => {
    const valorSelecionado = event.target.value;
    setSentencaSelecionada(valorSelecionado);
    setMessage('');
    setMessageType('');
    
    // Encontrar a sentença selecionada e extrair seus símbolos
    if (valorSelecionado) {
      const sentencaEncontrada = sentencas.find(sentenca => 
        sentenca.simbolosLiteral === valorSelecionado
      );
      if (sentencaEncontrada) {
        setSimbolosSelecionados(sentencaEncontrada.simbolos);
        console.log('Símbolos da sentença selecionada:', sentencaEncontrada.simbolos);
      }
    } else {
      setSimbolosSelecionados([]);
    }
  };

  // Função para validar a sentença selecionada
  const handleValidar = async () => {
    if (!sentencaSelecionada) {
      setMessage('Por favor, selecione uma sentença para validar.');
      setMessageType('error');
      return;
    }

    if (simbolosSelecionados.length === 0) {
      setMessage('Nenhum símbolo encontrado para validação.');
      setMessageType('error');
      return;
    }

    // Encontrar o ID da sentença selecionada
    const sentencaEncontrada = sentencas.find(sentenca => 
      sentenca.simbolosLiteral === sentencaSelecionada
    );

    if (!sentencaEncontrada) {
      setMessage('Sentença selecionada não encontrada.');
      setMessageType('error');
      return;
    }

    setIsValidating(true);
    setMessage('');

    try {
      console.log(`Iniciando validação da sentença ID: ${sentencaEncontrada.idSentenca}`);
      const response = await fetch(`http://localhost:8080/jpars/sentenca/iniciar-validacao/${idWorkflow}/${sentencaEncontrada.idSentenca}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao iniciar validação: HTTP ${response.status}: ${response.statusText}`);
      }

      const validationData = await response.json();
      console.log('Dados de validação recebidos:', validationData);

      // Atualizar estados com os dados da validação
      setPilha(validationData.pilha || []);
      setSentencaCompleta(validationData.sentenca || []);
      setIndexSentenca(validationData.indexSentenca || 0);
      setHasStartedValidation(true);
      setIsValidationComplete(false);
      setSuccessMessage('');
      setCurrentValidationMessage('');

      if (validationData.pilha && validationData.pilha.length > 0) {
        setMessage('Validação iniciada com sucesso!');
        setMessageType('success');
      } else {
        setMessage('Nenhuma pilha foi retornada para esta sentença.');
        setMessageType('error');
      }

    } catch (error) {
      console.error('Erro na validação:', error);
      setMessage('Erro ao iniciar a validação. Verifique se o backend está rodando.');
      setMessageType('error');
    } finally {
      setIsValidating(false);
    }
  };

  // Função para avançar para o próximo passo da validação
  const handleNext = async () => {
    if (isValidationComplete || !hasStartedValidation) {
      return;
    }

    setIsNextLoading(true);
    setMessage('');

    try {
      console.log('Avançando para o próximo passo da validação');
      const response = await fetch('http://localhost:8080/jpars/sentenca/validar');
      
      if (!response.ok) {
        throw new Error(`Erro ao avançar validação: HTTP ${response.status}: ${response.statusText}`);
      }

      const nextStepData = await response.json();
      console.log('Dados do próximo passo:', nextStepData);

      // Atualizar estados com os novos dados
      setPilha(nextStepData.pilha || []);
      setSentencaCompleta(nextStepData.sentenca || []);
      setIndexSentenca(nextStepData.indexSentenca || 0);

      // Processar lógica de validação de terminais
      processValidationLogic(nextStepData);

      // Verificar se a validação foi concluída
      if (nextStepData.mensagemSucesso) {
        setIsValidationComplete(true);
        setSuccessMessage(nextStepData.mensagemSucesso);
        setMessage(`Validação concluída: ${nextStepData.mensagemSucesso}`);
        setMessageType('success');
      } else if (nextStepData.pilha && nextStepData.pilha.length === 0) {
        setIsValidationComplete(true);
        setMessage('A análise foi concluída.');
        setMessageType('info');
      } else {
        setMessage('Próximo passo executado com sucesso!');
        setMessageType('info');
      }

    } catch (error) {
      console.error('Erro ao avançar validação:', error);
      setMessage('Erro ao avançar a validação. Verifique se o backend está rodando.');
      setMessageType('error');
    } finally {
      setIsNextLoading(false);
    }
  };

  // Função para processar a lógica de validação
  const processValidationLogic = (data) => {
    const { pilha, sentenca, indexSentenca } = data;
    
    if (!pilha || pilha.length === 0) {
      setCurrentValidationMessage('');
      return;
    }

    const topoPilha = pilha[pilha.length - 1];
    const isNonTerminal = /^[A-Z]$/.test(topoPilha);
    const isTerminal = /^[a-z]$/.test(topoPilha);

    if (isTerminal) {
      // Lógica para validação de terminais
      if (indexSentenca < sentenca.length) {
        const elementoAtual = sentenca[indexSentenca];
        
        if (topoPilha === elementoAtual) {
          const validationMessage = `Elemento ${elementoAtual} validado`;
          setCurrentValidationMessage(validationMessage);
          console.log('Validação de terminal:', validationMessage);
        } else {
          setCurrentValidationMessage('');
        }
      } else {
        setCurrentValidationMessage('');
      }
    } else if (isNonTerminal) {
      // Para não-terminais, limpar mensagem de validação de terminal
      setCurrentValidationMessage('');
    } else {
      setCurrentValidationMessage('');
    }
  };

  // Função para determinar a cor do símbolo baseado no índice atual
  const getSymbolColor = (index) => {
    if (!hasStartedValidation) return 'default';
    if (index < indexSentenca) return 'processed'; // Verde - já processado
    if (index === indexSentenca) return 'current'; // Vermelho - atual
    return 'pending'; // Cinza - pendente
  };

  // Função para verificar se uma célula da tabela deve ser destacada
  const shouldHighlightCell = (rowIndex, colIndex) => {
    if (!hasStartedValidation || !tabelaSintatica || !tabelaSintatica.rows) {
      return false;
    }

    // Verificar se há pilha e se o topo é um não-terminal (letra maiúscula)
    if (pilha.length === 0) return false;
    
    const topoPilha = pilha[pilha.length - 1]; // Último elemento da pilha (topo)
    const isNonTerminal = /^[A-Z]$/.test(topoPilha); // Verifica se é letra maiúscula
    
    if (!isNonTerminal) return false;

    // Verificar se o elemento atual da sentença corresponde à coluna
    if (indexSentenca >= sentencaCompleta.length) return false;
    
    const elementoAtual = sentencaCompleta[indexSentenca];
    const row = tabelaSintatica.rows[rowIndex];
    const column = row.columns[colIndex];
    
    // Verificar se o não-terminal da linha corresponde ao topo da pilha
    // e se o terminal da coluna corresponde ao elemento atual da sentença
    const shouldHighlight = row.naoTerminal === topoPilha && column.terminal === elementoAtual;
    
    // Debug log para verificar a lógica
    if (shouldHighlight) {
      console.log('Célula destacada:', {
        topoPilha,
        elementoAtual,
        naoTerminal: row.naoTerminal,
        terminal: column.terminal,
        rowIndex,
        colIndex
      });
    }
    
    return shouldHighlight;
  };

  if (isLoading) {
    return (
      <div className="validacao-sentenca">
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando sentenças...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="validacao-sentenca">
      {/* Título da Tela */}
      <header className="header">
        <h1>Teste de validação de entrada</h1>
      </header>

      <main className="main-content">
        {/* Explicação sobre a tela */}
        <section className="info-section">
          <div className="info-box">
            <p>
              Agora que você concluiu todas as etapas, é hora de testar sentenças e ver, na prática, 
              como ocorre o processo de análise sintática. Você poderá visualizar a montagem da pilha, 
              acompanhar as produções escolhidas com base na tabela sintática e observar como a sentença 
              é validada passo a passo.
            </p>
          </div>
        </section>

        {/* Área de seleção e validação */}
        <section className="validation-section">
          <h2>Selecione uma sentença para validar</h2>
          
          <div className="selection-container">
            <div className="combobox-container">
              <label htmlFor="sentenca-select">Selecione a sentença:</label>
              <select
                id="sentenca-select"
                value={sentencaSelecionada}
                onChange={handleSentencaChange}
                className="sentenca-select"
                disabled={sentencas.length === 0}
              >
                <option value="">
                  {sentencas.length === 0 ? 'Nenhuma sentença disponível' : 'Escolha uma entrada para ser validada'}
                </option>
                {sentencas.map((sentenca) => (
                  <option key={sentenca.idSentenca} value={sentenca.simbolosLiteral}>
                    {sentenca.simbolosLiteral}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              className="btn-validar"
              onClick={handleValidar}
              disabled={!sentencaSelecionada || sentencas.length === 0 || isValidating}
            >
              {isValidating ? 'Iniciando...' : 'Validar'}
            </button>
          </div>

          {/* Mensagens de feedback */}
          {message && (
            <div className={`feedback-message ${messageType}`}>
              {message}
            </div>
          )}
        </section>

        {/* Área de Exibição da Sentença */}
        <section className="sentence-display-section">
          <h2>Sentença Selecionada</h2>
          
          {simbolosSelecionados.length > 0 ? (
            <div className="sentence-display">
              <div className="symbols-container">
                {simbolosSelecionados.map((simbolo, index) => (
                  <div 
                    key={index} 
                    className={`symbol-block symbol-${getSymbolColor(index)}`}
                  >
                    {simbolo}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-sentence-message">
              <p>Selecione uma sentença para visualizar os símbolos.</p>
            </div>
          )}
        </section>

        {/* Área de Análise - Pilha e Tabela Sintática */}
        {hasStartedValidation && (
          <section className="analysis-section">
            <div className="analysis-container">
              {/* Coluna da Pilha */}
              <div className="stack-column">
                <h2>Pilha de Análise</h2>
                <div className="stack-container">
                  {pilha.length > 0 ? (
                    <div className="stack-display">
                      {pilha.slice().reverse().map((elemento, index) => (
                        <div 
                          key={index} 
                          className={`stack-element ${index === 0 ? 'stack-top' : ''}`}
                        >
                          {elemento}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-stack-message">
                      <p>A análise foi concluída.</p>
                    </div>
                  )}
                  
                  {/* Mensagem de validação atual */}
                  {currentValidationMessage && (
                    <div className="current-validation-message">
                      <p>{currentValidationMessage}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Coluna da Tabela Sintática */}
              <div className="table-column">
                <h2>Tabela Sintática LL(1)</h2>
                {tabelaSintatica && tabelaSintatica.rows ? (
                  <div className="syntactic-table-container">
                    <table className="syntactic-table">
                      <thead>
                        <tr>
                          <th className="non-terminal-header">Não Terminal</th>
                          {tabelaSintatica.rows[0]?.columns?.map((col, index) => (
                            <th key={index} className="terminal-header">
                              {col.terminal}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tabelaSintatica.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            <td className="non-terminal-cell">{row.naoTerminal}</td>
                            {row.columns.map((col, colIndex) => (
                              <td 
                                key={colIndex} 
                                className={`production-cell ${shouldHighlightCell(rowIndex, colIndex) ? 'highlighted-cell' : ''}`}
                              >
                                {col.sync ? (
                                  <span className="sync-text">synch</span>
                                ) : col.producao && col.producao.elementosTransicao.length > 0 ? (
                                  <span className="production-text">
                                    {col.producao.naoTerminal} → {col.producao.elementosTransicao.join(' ')}
                                  </span>
                                ) : (
                                  <span className="empty-text">—</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-table-message">
                    <p>Carregando tabela sintática...</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Botão Próximo - Fora da área de análise */}
        {hasStartedValidation && (
          <section className="next-section">
            <div className="next-button-container">
              <button
                className="btn-next"
                onClick={handleNext}
                disabled={isValidationComplete || !hasStartedValidation || isNextLoading}
              >
                {isNextLoading ? 'Processando...' : 'Próximo'}
              </button>
            </div>
          </section>
        )}

        {/* Mensagem quando ainda não iniciou validação */}
        {!hasStartedValidation && (
          <section className="analysis-section">
            <div className="analysis-container">
              <div className="no-validation-message">
                <p>Clique em "Validar" para iniciar a análise da sentença.</p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

