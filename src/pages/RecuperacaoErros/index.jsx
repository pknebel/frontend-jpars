import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGramatica } from '../../contexts/GramaticaContext';
import HelpModal from '../../components/HelpModal';
import MessageBox from '../../components/MessageBox';
import Button from '../../components/Button';
import './styles.css';

export default function RecuperacaoErros() {
  const navigate = useNavigate();
  const { gramaticaSelecionada, hasGramaticaSelecionada, idWorkflow } = useGramatica();
  
  // Estados da aplicação
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [ll1Grammar, setLl1Grammar] = useState('');
  const [tabelaSintaticaData, setTabelaSintaticaData] = useState(null);
  const [userInputs, setUserInputs] = useState({});
  const [isValidated, setIsValidated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  
  // Estados para controle de tentativas e modal de ajuda
  const [tentativasIncorretas, setTentativasIncorretas] = useState(0);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);

  // Carregar dados ao iniciar a página
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Verificar se há uma gramática selecionada no contexto
      if (!hasGramaticaSelecionada() || !gramaticaSelecionada) {
        console.log('Nenhuma gramática selecionada. Redirecionando para seleção...');
        setMessage('Por favor, selecione uma gramática primeiro.');
        setMessageType('error');
        setTimeout(() => {
          navigate('/selecao-gramatica');
        }, 2000);
        return;
      }

      try {
        console.log('Usando gramática do contexto:', gramaticaSelecionada);
        setSelectedWorkflow(gramaticaSelecionada);
        
        // Buscar a gramática LL(1)
        console.log(`Buscando gramática LL(1) para o workflow ID: ${idWorkflow}`);
        const grammarResponse = await fetch(`http://localhost:8080/jpars/gramatica/ll1/${idWorkflow}`);

        if (!grammarResponse.ok) {
          throw new Error(`Erro ao buscar gramática LL(1): HTTP ${grammarResponse.status}`);
        }

        const grammarText = await grammarResponse.text();
        setLl1Grammar(grammarText);
        console.log('Gramática LL(1) recebida:', grammarText);

        // Buscar tabela sintática (para exibição)
        console.log(`Buscando tabela sintática para o workflow ID: ${idWorkflow}`);
        const tabelaResponse = await fetch(`http://localhost:8080/jpars/tabela-sintatica/${idWorkflow}`);

        if (!tabelaResponse.ok) {
          throw new Error(`Erro ao buscar tabela sintática: HTTP ${tabelaResponse.status}`);
        }

        const tabelaJson = await tabelaResponse.json();
        setTabelaSintaticaData(tabelaJson);
        console.log('Tabela sintática recebida:', tabelaJson);
        
        // Inicializar os inputs do usuário vazios apenas para células sem produção
        const initialInputs = {};
        if (tabelaJson.rows && Array.isArray(tabelaJson.rows)) {
          tabelaJson.rows.forEach(row => {
            row.columns.forEach(col => {
              const key = `${row.index}-${col.index}`;
              // Inicializar como vazio (o usuário pode adicionar Sync se necessário)
              initialInputs[key] = '';
            });
          });
        }
        setUserInputs(initialInputs);
        console.log('Inputs inicializados:', initialInputs);

        setMessage('');
        setMessageType('');
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setMessage('Erro ao carregar os dados. Verifique se o backend está rodando.');
        setMessageType('error');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [gramaticaSelecionada, hasGramaticaSelecionada, idWorkflow, navigate]);

  // Função para verificar se uma célula tem produção original (não editável)
  const getCellProducao = (rowIndex, colIndex) => {
    if (!tabelaSintaticaData || !tabelaSintaticaData.rows) return null;
    
    const row = tabelaSintaticaData.rows.find(r => r.index === rowIndex);
    if (!row) return null;
    
    const col = row.columns.find(c => c.index === colIndex);
    if (!col || !col.producao || !col.producao.naoTerminal) return null;
    
    return col.producao;
  };

  // Função para alternar entre vazio e "Sync" ao clicar na célula
  const handleCellClick = (rowIndex, colIndex) => {
    if (isInputDisabled) return; // Não permite alteração após validação
    
    // Verificar se a célula tem produção original (não é editável)
    const producao = getCellProducao(rowIndex, colIndex);
    if (producao) return; // Células com produção não são editáveis
    
    const key = `${rowIndex}-${colIndex}`;
    const currentValue = userInputs[key] || '';
    const newValue = currentValue === 'Sync' ? '' : 'Sync';
    
    console.log(`Toggle célula - Row: ${rowIndex}, Col: ${colIndex}, Key: ${key}, Valor anterior: "${currentValue}", Novo valor: "${newValue}"`);
    
    setUserInputs(prev => ({
      ...prev,
      [key]: newValue
    }));
  };

  // Função para formatar a produção
  const formatProducao = (producao) => {
    if (!producao || !producao.naoTerminal || !producao.elementosTransicao) {
      return '';
    }
    return `${producao.naoTerminal} = ${producao.elementosTransicao.join(' ')}`;
  };

  // Função para buscar a resposta correta do backend (tabela sintática completa)
  const buscarRespostaCorreta = async () => {
    setIsLoadingAnswer(true);
    try {
      console.log(`Buscando tabela sintática correta para o workflow ID: ${idWorkflow}`);
      
      // Buscar a tabela sintática completa
      const response = await fetch(`http://localhost:8080/jpars/tabela-sintatica/${idWorkflow}`);
      
      console.log(`Response status: ${response.status}`);
      console.log(`Response ok: ${response.ok}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar tabela sintática: HTTP ${response.status}`);
      }
      
      const respostaCorreta = await response.json();
      console.log('Tabela sintática recebida:', respostaCorreta);
      console.log('Estrutura da resposta:', JSON.stringify(respostaCorreta, null, 2));
      return respostaCorreta;
    } catch (error) {
      console.error('Erro detalhado ao buscar resposta:', error);
      setMessage(`Erro ao buscar a resposta correta: ${error.message}`);
      setMessageType('error');
      return null;
    } finally {
      setIsLoadingAnswer(false);
    }
  };

  // Função para quando o usuário aceitar ver a resposta
  const handleAcceptHelp = async () => {
    setShowHelpModal(false);
    const resposta = await buscarRespostaCorreta();
    
    if (resposta && resposta.rows) {
      console.log('Processando tabela sintática correta...');
      console.log('Total de linhas na resposta:', resposta.rows.length);
      
      // Percorrer o JSON retornado e identificar onde o backend colocou os Syncs
      const newInputs = {};
      resposta.rows.forEach((row, rowIdx) => {
        console.log(`Processando linha ${rowIdx}: ${row.naoTerminal}`);
        row.columns.forEach((col, colIdx) => {
          const key = `${row.index}-${col.index}`;
          
          // Verificar se essa célula tem uma produção na tabela original (não editável)
          const producaoOriginal = getCellProducao(row.index, col.index);
          
          if (producaoOriginal) {
            // Célula tem produção original da tabela sintática (não editável)
            console.log(`  Célula [${row.index},${col.index}]: Produção original (não editável)`);
            newInputs[key] = '';
          } else {
            // Célula vazia na tabela original - verificar se o backend retornou "Sync"
            let valorCelula = '';
            
            // Verificar diferentes formas que o backend pode retornar "Sync"
            if (col.producao && col.producao.naoTerminal) {
              const producaoText = formatProducao(col.producao);
              console.log(`  Célula [${row.index},${col.index}]: Produção retornada = "${producaoText}"`);
              
              // Se a produção formatada é exatamente "Sync", marcar
              if (producaoText === 'Sync' || producaoText.trim().toLowerCase() === 'sync') {
                valorCelula = 'Sync';
                console.log(`    -> É Sync! Marcando.`);
              }
            } else if (col.sync === true || col.sync === 'Sync' || col.sync === 'sync') {
              // Verificar se existe um campo "sync" direto
              console.log(`  Célula [${row.index},${col.index}]: Campo sync = ${col.sync}`);
              valorCelula = 'Sync';
              console.log(`    -> Marcando como Sync.`);
            } else {
              console.log(`  Célula [${row.index},${col.index}]: Vazia (sem Sync)`);
            }
            
            newInputs[key] = valorCelula;
          }
        });
      });
      
      console.log('Inputs finais após processamento:', newInputs);
      setUserInputs(newInputs);
      setMessage('Resposta correta preenchida! Clique em "Validar" para continuar.');
      setMessageType('success');
      setTentativasIncorretas(0);
    } else {
      console.error('Resposta inválida ou sem rows:', resposta);
      setMessage('Erro ao processar a resposta do servidor.');
      setMessageType('error');
    }
  };

  // Função para quando o usuário rejeitar a ajuda
  const handleRejectHelp = () => {
    setShowHelpModal(false);
    setMessage('Você tem mais 3 tentativas. Boa sorte!');
    setMessageType('info');
    setTentativasIncorretas(0);
  };

  // Função para validar a recuperação de erros
  const handleValidate = async () => {
    setIsValidating(true);
    setMessage('');

    try {
      // Montar o payload no formato esperado pelo backend
      const values = [];
      
      if (tabelaSintaticaData && tabelaSintaticaData.rows) {
        tabelaSintaticaData.rows.forEach(row => {
          row.columns.forEach(col => {
            const key = `${row.index}-${col.index}`;
            const producao = getCellProducao(row.index, col.index);
            
            // Se tem produção, enviar a produção formatada
            // Se não tem produção, enviar o valor do input (vazio ou "Sync")
            let value = '';
            if (producao) {
              value = formatProducao(producao);
            } else {
              value = userInputs[key] || '';
            }
            
            values.push({
              rowIndex: row.index,
              columnIndex: col.index,
              value: value
            });
          });
        });
      }

      const payload = {
        idWorkflow: idWorkflow,
        values: values
      };

      console.log('Enviando para validação:', payload);

      const response = await fetch('http://localhost:8080/jpars/tabela-sintatica/validar-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await response.json();
        setMessage('Recuperação de erros validada com sucesso!');
        setMessageType('success');
        setIsValidated(true);
        setIsInputDisabled(true);
        setTentativasIncorretas(0);
      } else {
        const errorData = await response.json();
        
        // Incrementar contador de tentativas incorretas
        const novasTentativas = tentativasIncorretas + 1;
        setTentativasIncorretas(novasTentativas);
        
        console.log(`Tentativa incorreta ${novasTentativas}/3`);
        
        // Verificar se atingiu 3 tentativas
        if (novasTentativas >= 3) {
          setShowHelpModal(true);
        }
        
        throw new Error(errorData.message || 'Erro na validação');
      }
    } catch (error) {
      console.error('Erro na validação:', error);
      setMessage(`Erro: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsValidating(false);
    }
  };

  // Função para navegar para a próxima tela
  const handleNext = () => {
    if (!isValidated) {
      setMessage('Você deve validar a recuperação de erros primeiro');
      setMessageType('error');
      return;
    }

    // Redirecionar para a próxima tela (validação de sentença)
    navigate('/validacao-sentenca');
  };

  if (isLoading) {
    return (
      <div className="recuperacao-erros">
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!selectedWorkflow) {
    return (
      <div className="recuperacao-erros">
        <div className="error">
          <h2>Erro</h2>
          <p>Não foi possível carregar a gramática.</p>
          <button onClick={() => window.location.reload()}>Tentar novamente</button>
        </div>
      </div>
    );
  }

  // Extrair terminais únicos das colunas
  const terminais = tabelaSintaticaData?.rows?.[0]?.columns?.map(col => col.terminal) || [];

  return (
    <div className="recuperacao-erros">
      {/* Título da Tela */}
      <header className="header">
        <h1>Adição de Recuperação de Erros</h1>
      </header>

      <main className="main-content">
        {/* Explicação sobre Recuperação de Erros */}
        <section className="info-section">
          <h2>O que é Recuperação de Erros</h2>
          <div className="info-box">
            <p>
              A <strong>Recuperação de Erros</strong> é um mecanismo essencial em analisadores sintáticos 
              que permite ao parser continuar a análise mesmo após detectar erros sintáticos. Isso é 
              fundamental para fornecer múltiplas mensagens de erro em uma única passada pelo código fonte.
            </p>
            <ul>
              <li>
                <strong>Modo Pânico:</strong> Descarta símbolos de entrada até encontrar um símbolo de 
                sincronização (geralmente delimitadores como ; , $ )
              </li>
              <li>
                <strong>Sincronização:</strong> Define pontos na gramática onde o parser pode retomar 
                a análise após um erro
              </li>
              <li>
                <strong>Follow Set:</strong> Os conjuntos FOLLOW são frequentemente usados para determinar 
                pontos de sincronização apropriados
              </li>
            </ul>
          </div>
        </section>

        {/* Explicação sobre como adicionar */}
        <section className="info-section">
          <h2>Como adicionar Recuperação de Erros</h2>
          <div className="info-box">
            <p>
              Para adicionar recuperação de erros à tabela sintática, você deve marcar as células 
              vazias (erros) com <code>Sync</code> nos seguintes casos:
            </p>
            <ol>
              <li>
                Se o terminal está no conjunto <strong>FOLLOW</strong> do não-terminal, marque como 
                <code>Sync</code> clicando na célula vazia
              </li>
              <li>
                <strong>Clique em uma célula vazia</strong> para adicionar "Sync"
              </li>
              <li>
                <strong>Clique em uma célula com "Sync"</strong> para removê-lo e voltar ao estado vazio
              </li>
              <li>
                Isso permite que o parser "sincronize" quando encontrar um erro, pulando para um 
                ponto seguro na análise
              </li>
              <li>
                As células que não são sincronização permanecem vazias, indicando erros sem recuperação
              </li>
            </ol>
            <p style={{ marginTop: '15px' }}>
              <strong>Importante:</strong> Adicione <code>Sync</code> apenas onde o terminal pertence 
              ao FOLLOW do não-terminal correspondente. Isso garante uma recuperação apropriada.
            </p>
          </div>
        </section>

        {/* Material de apoio (vídeo) */}
        <section className="info-section">
          <h2>Material de Apoio</h2>
          <div className="video-container">
            <iframe
              width="100%"
              height="315"
              src="https://www.youtube.com/embed/zY4w4_W30aQ?start=1800"
              title="Recuperação de Erros"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        {/* Área de prática */}
        <section className="practice-section">
          <h2>Adicione recuperação de erros à tabela sintática:</h2>
          
          {/* Gramática LL(1) */}
          <div className="grammar-display">
            <h3>Gramática LL(1)</h3>
            <div className="grammar-content">
              {ll1Grammar.split('\n').map((line, index) => (
                <div key={index} className="grammar-line">
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Tabela Sintática com Recuperação de Erros */}
          {tabelaSintaticaData && tabelaSintaticaData.rows && (
            <div className="tabela-sintatica-container">
              <h3>Tabela Sintática - Clique nas células vazias para adicionar "Sync"</h3>
              <div className="table-wrapper">
                <table className="tabela-sintatica">
                  <thead>
                    <tr>
                      <th className="header-cell">Não-Terminal</th>
                      {terminais.map((terminal, index) => (
                        <th key={`terminal-${terminal}-${index}`} className="header-cell terminal-header">
                          {terminal}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tabelaSintaticaData.rows.map((row) => (
                      <tr key={`row-${row.index}`}>
                        <td className="non-terminal-cell">{row.naoTerminal}</td>
                        {row.columns.map((col) => {
                          const key = `${row.index}-${col.index}`;
                          const producao = getCellProducao(row.index, col.index);
                          const hasProducao = !!producao;
                          
                          // Se tem produção, exibir a produção (não editável)
                          if (hasProducao) {
                            const producaoText = formatProducao(producao);
                            return (
                              <td 
                                key={`cell-${row.index}-${col.index}`} 
                                className="filled-cell"
                                title="Célula preenchida (não editável)"
                              >
                                {producaoText}
                              </td>
                            );
                          }
                          
                          // Caso contrário, permitir toggle de Sync
                          const cellValue = userInputs[key] || '';
                          const hasSync = cellValue === 'Sync';
                          
                          return (
                            <td 
                              key={`cell-${row.index}-${col.index}`} 
                              className={`clickable-cell ${hasSync ? 'has-sync' : 'empty-cell'} ${isInputDisabled ? 'disabled' : ''}`}
                              onClick={() => handleCellClick(row.index, col.index)}
                              title={isInputDisabled ? '' : (hasSync ? 'Clique para remover Sync' : 'Clique para adicionar Sync')}
                            >
                              {cellValue}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="action-buttons">
            <Button
              variant="primary"
              onClick={handleValidate}
              disabled={isInputDisabled}
              loading={isValidating}
            >
              {isValidating ? 'Validando...' : 'Validar'}
            </Button>
            
            <Button
              variant="success"
              onClick={handleNext}
              disabled={!isValidated}
            >
              Próximo
            </Button>
          </div>

          {/* Mensagens de feedback */}
          <MessageBox
            type={messageType}
            message={message}
          />
        </section>
      </main>

      {/* Modal de Ajuda */}
      <HelpModal
        isOpen={showHelpModal}
        onAccept={handleAcceptHelp}
        onReject={handleRejectHelp}
        tentativas={3}
      />

      {/* Overlay de carregamento quando buscar resposta */}
      {isLoadingAnswer && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Buscando resposta correta...</p>
        </div>
      )}
    </div>
  );
}

