import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGramatica } from '../../contexts/GramaticaContext';
import HelpModal from '../../components/HelpModal';
import './styles.css';

export default function GeracaoTabelaSintatica() {
  const navigate = useNavigate();
  const { gramaticaSelecionada, hasGramaticaSelecionada, idWorkflow } = useGramatica();
  
  // Estados da aplicação
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [ll1Grammar, setLl1Grammar] = useState('');
  const [firstFollowData, setFirstFollowData] = useState(null);
  const [tabelaSintaticaData, setTabelaSintaticaData] = useState(null);
  const [userInputs, setUserInputs] = useState({});
  const [isValidated, setIsValidated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' ou 'error'
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

        // Buscar conjuntos FIRST e FOLLOW
        console.log(`Buscando conjuntos FIRST/FOLLOW para o workflow ID: ${idWorkflow}`);
        const firstFollowResponse = await fetch(`http://localhost:8080/jpars/first-follow/${idWorkflow}`);

        if (!firstFollowResponse.ok) {
          throw new Error(`Erro ao buscar FIRST/FOLLOW: HTTP ${firstFollowResponse.status}`);
        }

        const firstFollowJson = await firstFollowResponse.json();
        setFirstFollowData(firstFollowJson);
        console.log('FIRST/FOLLOW recebido:', firstFollowJson);

        // Buscar estrutura da tabela sintática (sem preencher as respostas)
        console.log(`Buscando tabela sintática para o workflow ID: ${idWorkflow}`);
        const tabelaResponse = await fetch(`http://localhost:8080/jpars/tabela-sintatica/${idWorkflow}`);

        if (!tabelaResponse.ok) {
          throw new Error(`Erro ao buscar tabela sintática: HTTP ${tabelaResponse.status}`);
        }

        const tabelaJson = await tabelaResponse.json();
        setTabelaSintaticaData(tabelaJson);
        console.log('Tabela sintática recebida:', tabelaJson);
        
        // Inicializar os inputs do usuário vazios
        const initialInputs = {};
        if (tabelaJson.rows && Array.isArray(tabelaJson.rows)) {
          tabelaJson.rows.forEach(row => {
            row.columns.forEach(col => {
              const key = `${row.index}-${col.index}`;
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

  // Função para atualizar os inputs do usuário
  const handleInputChange = (rowIndex, colIndex, value) => {
    const key = `${rowIndex}-${colIndex}`;
    setUserInputs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Função para formatar a produção
  const formatProducao = (producao) => {
    if (!producao || !producao.naoTerminal || !producao.elementosTransicao) {
      return '';
    }
    return `${producao.naoTerminal} = ${producao.elementosTransicao.join(' ')}`;
  };

  // Função para buscar a resposta correta do backend
  const buscarRespostaCorreta = async () => {
    setIsLoadingAnswer(true);
    try {
      console.log(`Buscando resposta correta para o workflow ID: ${idWorkflow}`);
      const response = await fetch(`http://localhost:8080/jpars/tabela-sintatica/${idWorkflow}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar resposta correta');
      }
      
      const respostaCorreta = await response.json();
      console.log('Resposta correta recebida:', respostaCorreta);
      return respostaCorreta;
    } catch (error) {
      console.error('Erro ao buscar resposta:', error);
      setMessage('Erro ao buscar a resposta correta. Tente novamente.');
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
      // Preencher os campos com a resposta correta
      const newInputs = {};
      resposta.rows.forEach(row => {
        row.columns.forEach(col => {
          const key = `${row.index}-${col.index}`;
          // Ignorar sync - apenas preencher produções
          if (col.producao && col.producao.naoTerminal) {
            newInputs[key] = formatProducao(col.producao);
          } else {
            newInputs[key] = '';
          }
        });
      });
      setUserInputs(newInputs);
      setMessage('Resposta correta preenchida! Clique em "Validar" para continuar.');
      setMessageType('success');
      setTentativasIncorretas(0); // Resetar contador
    }
  };

  // Função para quando o usuário rejeitar a ajuda
  const handleRejectHelp = () => {
    setShowHelpModal(false);
    setMessage('Você tem mais 3 tentativas. Boa sorte!');
    setMessageType('info');
    setTentativasIncorretas(0); // Resetar contador para próximo ciclo
  };

  // Função para validar a tabela sintática
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
            values.push({
              rowIndex: row.index,
              columnIndex: col.index,
              value: userInputs[key] || ''
            });
          });
        });
      }

      const payload = {
        idWorkflow: idWorkflow,
        values: values
      };

      console.log('Enviando para validação:', payload);

      const response = await fetch('http://localhost:8080/jpars/tabela-sintatica/validar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await response.json();
        setMessage('Tabela sintática validada com sucesso!');
        setMessageType('success');
        setIsValidated(true);
        setIsInputDisabled(true);
        setTentativasIncorretas(0); // Resetar contador em caso de sucesso
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
      setMessage('Você deve validar a tabela sintática primeiro');
      setMessageType('error');
      return;
    }

    // Redirecionar para a próxima tela (validação de sentença)
    navigate('/validacao-sentenca');
  };

  if (isLoading) {
    return (
      <div className="geracao-tabela-sintatica">
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!selectedWorkflow) {
    return (
      <div className="geracao-tabela-sintatica">
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
    <div className="geracao-tabela-sintatica">
      {/* Título da Tela */}
      <header className="header">
        <h1>Geração da Tabela Sintática</h1>
      </header>

      <main className="main-content">
        {/* Explicação sobre Tabela Sintática */}
        <section className="info-section">
          <h2>O que é a Tabela Sintática</h2>
          <div className="info-box">
            <p>
              A <strong>Tabela Sintática</strong> (ou Tabela de Análise Preditiva) é uma estrutura 
              fundamental para analisadores sintáticos do tipo LL(1). Ela determina qual produção 
              da gramática deve ser aplicada com base no não-terminal atual e no próximo símbolo 
              de entrada (lookahead).
            </p>
            <ul>
              <li>
                <strong>Linhas:</strong> Representam os não-terminais da gramática
              </li>
              <li>
                <strong>Colunas:</strong> Representam os terminais da gramática (incluindo $)
              </li>
              <li>
                <strong>Células:</strong> Contêm as produções a serem aplicadas ou ficam vazias 
                (indicando erro sintático)
              </li>
            </ul>
          </div>
        </section>

        {/* Explicação sobre como gerar */}
        <section className="info-section">
          <h2>Como gerar a Tabela Sintática</h2>
          <div className="info-box">
            <p>
              Para cada produção <code>A → α</code> da gramática:
            </p>
            <ol>
              <li>
                Para cada terminal <code>a</code> em <strong>First(α)</strong>, adicione 
                <code>A → α</code> na célula <code>M[A, a]</code>
              </li>
              <li>
                Se <code>ε</code> está em <strong>First(α)</strong>, então para cada terminal 
                <code>b</code> em <strong>Follow(A)</strong>, adicione <code>A → α</code> na 
                célula <code>M[A, b]</code>
              </li>
              <li>
                Se <code>ε</code> está em <strong>First(α)</strong> e <code>$</code> está em 
                <strong>Follow(A)</strong>, adicione <code>A → α</code> na célula <code>M[A, $]</code>
              </li>
            </ol>
            <p style={{ marginTop: '15px' }}>
              <strong>Observação:</strong> Todas as células não preenchidas representam 
              erros sintáticos. Uma gramática é LL(1) se nenhuma célula contém mais de uma produção.
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
              src="https://www.youtube.com/embed/zY4w4_W30aQ?start=1500"
              title="Geração da Tabela Sintática"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        {/* Área de prática */}
        <section className="practice-section">
          <h2>Agora construa a tabela sintática para a gramática:</h2>
          
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

          {/* Tabela FIRST e FOLLOW */}
          {firstFollowData && firstFollowData.rows && (
            <div className="first-follow-display">
              <h3>Conjuntos FIRST e FOLLOW</h3>
              <table className="first-follow-table">
                <thead>
                  <tr>
                    <th>Não-Terminal</th>
                    <th>FIRST</th>
                    <th>FOLLOW</th>
                  </tr>
                </thead>
                <tbody>
                  {firstFollowData.rows.map((row, index) => (
                    <tr key={index}>
                      <td className="non-terminal">{row.naoTerminal}</td>
                      <td className="first-set">{row.first}</td>
                      <td className="follow-set">{row.follow}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tabela Sintática Editável */}
          {tabelaSintaticaData && tabelaSintaticaData.rows && (
            <div className="tabela-sintatica-container">
              <h3>Preencha a Tabela Sintática</h3>
              <div className="table-wrapper">
                <table className="tabela-sintatica">
                  <thead>
                    <tr>
                      <th className="header-cell">Não-Terminal</th>
                      {terminais.map((terminal, index) => (
                        <th key={index} className="header-cell terminal-header">
                          {terminal}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tabelaSintaticaData.rows.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        <td className="non-terminal-cell">{row.naoTerminal}</td>
                        {row.columns.map((col, colIdx) => {
                          const key = `${row.index}-${col.index}`;
                          return (
                            <td key={colIdx} className="input-cell">
                              <input
                                type="text"
                                value={userInputs[key] || ''}
                                onChange={(e) => handleInputChange(row.index, col.index, e.target.value)}
                                placeholder=""
                                disabled={isInputDisabled}
                                className="table-input"
                              />
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
            <button 
              className="btn btn-validate" 
              onClick={handleValidate}
              disabled={isValidating || isInputDisabled}
            >
              {isValidating ? 'Validando...' : 'Validar'}
            </button>
            
            <button 
              className="btn btn-next" 
              onClick={handleNext}
              disabled={!isValidated}
            >
              Próximo
            </button>
          </div>

          {/* Mensagens de feedback */}
          {message && (
            <div className={`feedback-message ${messageType}`}>
              {message}
            </div>
          )}
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

