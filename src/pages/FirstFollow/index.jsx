import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGramatica } from '../../contexts/GramaticaContext';
import HelpModal from '../../components/HelpModal';
import './styles.css';

export default function FirstFollow() {
  const navigate = useNavigate();
  const { gramaticaSelecionada, hasGramaticaSelecionada, idWorkflow } = useGramatica();
  
  // Estados da aplicação
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [ll1Grammar, setLl1Grammar] = useState('');
  const [nonTerminals, setNonTerminals] = useState([]);
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

  // Carregar a gramática do contexto ao iniciar a página
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
        
        // Buscar a gramática LL(1) usando o ID do contexto
        console.log(`Buscando gramática LL(1) para o workflow ID: ${idWorkflow}`);
        const grammarResponse = await fetch(`http://localhost:8080/jpars/gramatica/ll1/${idWorkflow}`);

        if (!grammarResponse.ok) {
          throw new Error(`Erro ao buscar gramática LL(1): HTTP ${grammarResponse.status}: ${grammarResponse.statusText}`);
        }

        const grammarText = await grammarResponse.text();
        setLl1Grammar(grammarText);
        console.log('Gramática LL(1) recebida:', grammarText);

        // Buscar a estrutura dos não-terminais (sem as respostas)
        console.log(`Buscando estrutura dos não-terminais para o workflow ID: ${idWorkflow}`);
        const firstFollowResponse = await fetch(`http://localhost:8080/jpars/first-follow/${idWorkflow}`);

        if (!firstFollowResponse.ok) {
          throw new Error(`Erro ao buscar estrutura: HTTP ${firstFollowResponse.status}: ${firstFollowResponse.statusText}`);
        }

        const firstFollowJson = await firstFollowResponse.json();
        console.log('Estrutura recebida:', firstFollowJson);
        console.log('Rows do JSON:', firstFollowJson.rows);
        
        // Extrair apenas os não-terminais para criar os campos
        if (firstFollowJson.rows && Array.isArray(firstFollowJson.rows)) {
          const terminals = firstFollowJson.rows.map(row => row.naoTerminal);
          console.log('Não-terminais extraídos:', terminals);
          console.log('Total de não-terminais:', terminals.length);
          setNonTerminals(terminals);
          
          // Inicializar os campos vazios para cada não-terminal
          const initialInputs = {};
          terminals.forEach(nt => {
            initialInputs[nt] = { first: '', follow: '' };
          });
          console.log('Inputs inicializados:', initialInputs);
          setUserInputs(initialInputs);
        } else {
          console.error('Formato de resposta inválido - rows não é um array:', firstFollowJson);
          throw new Error('Formato de resposta inválido');
        }

        setMessage('');
        setMessageType('');
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setMessage('Erro ao carregar os dados. Verifique se o backend está rodando.');
        setMessageType('error');
        console.log('Detalhes do erro:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [gramaticaSelecionada, hasGramaticaSelecionada, idWorkflow, navigate]);

  // Função para atualizar os inputs do usuário
  const handleInputChange = (nonTerminal, field, value) => {
    setUserInputs(prev => ({
      ...prev,
      [nonTerminal]: {
        ...prev[nonTerminal],
        [field]: value
      }
    }));
  };

  // Função para buscar a resposta correta do backend
  const buscarRespostaCorreta = async () => {
    setIsLoadingAnswer(true);
    try {
      console.log(`Buscando resposta correta para o workflow ID: ${idWorkflow}`);
      const response = await fetch(`http://localhost:8080/jpars/first-follow/${idWorkflow}`);
      
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
        newInputs[row.naoTerminal] = {
          first: row.first,
          follow: row.follow
        };
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

  // Função para validar os conjuntos First e Follow
  const handleValidate = async () => {
    // Verificar se todos os campos foram preenchidos
    const allFilled = nonTerminals.every(nt => 
      userInputs[nt] && userInputs[nt].first.trim() && userInputs[nt].follow.trim()
    );

    if (!allFilled) {
      setMessage('Por favor, preencha todos os campos de FIRST e FOLLOW.');
      setMessageType('error');
      return;
    }

    setIsValidating(true);
    setMessage('');

    try {
      // Montar o payload no formato esperado pelo backend
      const rows = nonTerminals.map(nt => ({
        naoTerminal: nt,
        first: userInputs[nt].first.trim(),
        follow: userInputs[nt].follow.trim()
      }));

      const payload = {
        idWorkflow: idWorkflow,
        rows: rows
      };

      console.log('Enviando para validação:', payload);

      const response = await fetch('http://localhost:8080/jpars/first-follow/validar-conjuntos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await response.json();
        setMessage('Conjuntos FIRST e FOLLOW validados com sucesso!');
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
      setMessage('Você deve validar os conjuntos FIRST e FOLLOW primeiro');
      setMessageType('error');
      return;
    }

    // Redirecionar para a tela de Geração da Tabela Sintática (próxima etapa)
    navigate('/geracao-tabela');
  };

  if (isLoading) {
    return (
      <div className="first-follow">
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando gramática...</p>
        </div>
      </div>
    );
  }

  if (!selectedWorkflow) {
    return (
      <div className="first-follow">
        <div className="error">
          <h2>Erro</h2>
          <p>Não foi possível carregar a gramática.</p>
          <button onClick={() => window.location.reload()}>Tentar novamente</button>
        </div>
      </div>
    );
  }

  // Debug: log dos estados atuais
  console.log('Estado atual - nonTerminals:', nonTerminals);
  console.log('Estado atual - userInputs:', userInputs);

  return (
    <div className="first-follow">
      {/* Título da Tela */}
      <header className="header">
        <h1>Cálculo de First e Follow</h1>
      </header>

      <main className="main-content">
        {/* Explicação sobre First e Follow */}
        <section className="info-section">
          <h2>O que são os Conjuntos First e Follow</h2>
          <div className="info-box">
            <p>
              Os conjuntos <strong>First</strong> e <strong>Follow</strong> são fundamentais para a construção 
              de analisadores sintáticos preditivos. Eles ajudam a determinar qual produção usar 
              durante a análise.
            </p>
            <ul>
              <li><strong>First(A):</strong> Conjunto de terminais que podem iniciar cadeias derivadas de A</li>
              <li><strong>Follow(A):</strong> Conjunto de terminais que podem aparecer imediatamente após A</li>
            </ul>
          </div>
        </section>

        {/* Explicação sobre como calcular */}
        <section className="info-section">
          <h2>Como calcular First e Follow</h2>
          <div className="info-box">
            <p>
              <strong>First(A):</strong>
            </p>
            <ul>
              <li>Se A → aα, então a ∈ First(A)</li>
              <li>Se A → ε, então ε ∈ First(A)</li>
              <li>Se A → Bα, então First(B) ⊆ First(A)</li>
            </ul>
            
            <p>
              <strong>Follow(A):</strong>
            </p>
            <ul>
              <li>Se S é o símbolo inicial, então $ ∈ Follow(S)</li>
              <li>Se A → αBβ, então First(β) - {'{ε}'} ⊆ Follow(B)</li>
              <li>Se A → αB ou A → αBβ onde ε ∈ First(β), então Follow(A) ⊆ Follow(B)</li>
            </ul>
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
              title="Cálculo de First e Follow"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        {/* Área de prática */}
        <section className="practice-section">
          <h2>Agora calcule os conjuntos FIRST e FOLLOW para a gramática:</h2>
          
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

          {/* Tabela de First e Follow editável */}
          {nonTerminals.length > 0 ? (
            <div className="first-follow-table-container">
              <h3>Preencha os Conjuntos FIRST e FOLLOW</h3>
              <p style={{ textAlign: 'center', color: '#666', marginBottom: '10px' }}>
                Total de não-terminais: {nonTerminals.length}
              </p>
              <table className="first-follow-table">
                <thead>
                  <tr>
                    <th>Não-Terminal</th>
                    <th>Conjunto FIRST</th>
                    <th>Conjunto FOLLOW</th>
                  </tr>
                </thead>
                <tbody>
                  {nonTerminals.map((nt, index) => {
                    console.log(`Renderizando linha ${index + 1}: ${nt}`);
                    return (
                      <tr key={index}>
                        <td className="non-terminal">{nt}</td>
                        <td className="input-cell">
                          <input
                            type="text"
                            value={userInputs[nt]?.first || ''}
                            onChange={(e) => handleInputChange(nt, 'first', e.target.value)}
                            placeholder="Ex: a, b, &"
                            disabled={isInputDisabled}
                            className="table-input"
                          />
                        </td>
                        <td className="input-cell">
                          <input
                            type="text"
                            value={userInputs[nt]?.follow || ''}
                            onChange={(e) => handleInputChange(nt, 'follow', e.target.value)}
                            placeholder="Ex: $, e, t"
                            disabled={isInputDisabled}
                            className="table-input"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              <p>Carregando não-terminais...</p>
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
