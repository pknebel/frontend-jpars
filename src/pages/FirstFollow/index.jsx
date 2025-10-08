import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGramatica } from '../../contexts/GramaticaContext';
import './styles.css';

export default function FirstFollow() {
  const navigate = useNavigate();
  const { gramaticaSelecionada, hasGramaticaSelecionada, idWorkflow } = useGramatica();
  
  // Estados da aplicação
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [ll1Grammar, setLl1Grammar] = useState('');
  const [firstSets, setFirstSets] = useState('');
  const [followSets, setFollowSets] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' ou 'error'
  const [isInputDisabled, setIsInputDisabled] = useState(false);

  // Carregar a gramática do contexto ao iniciar a página
  useEffect(() => {
    const loadGrammarFromContext = async () => {
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

        setMessage('');
        setMessageType('');
        
      } catch (error) {
        console.error('Erro ao carregar gramática:', error);
        setMessage('Erro ao carregar a gramática LL(1). Verifique se o backend está rodando.');
        setMessageType('error');
        console.log('Detalhes do erro:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadGrammarFromContext();
  }, [gramaticaSelecionada, hasGramaticaSelecionada, idWorkflow, navigate]);

  // Função para validar os conjuntos First e Follow
  const handleValidate = async () => {
    if (!firstSets.trim() || !followSets.trim()) {
      setMessage('Por favor, preencha ambos os campos de First e Follow.');
      setMessageType('error');
      return;
    }

    setIsValidating(true);
    setMessage('');

    try {
      const payload = {
        idWorkflow: selectedWorkflow.idWorkflow,
        firstSets: firstSets.replace(/\r?\n/g, '\\n'),
        followSets: followSets.replace(/\r?\n/g, '\\n')
      };

      console.log('Enviando para validação:', payload);

      const response = await fetch('http://localhost:8080/jpars/gramatica/validar-first-follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await response.json();
        setMessage('Conjuntos First e Follow validados com sucesso');
        setMessageType('success');
        setIsValidated(true);
        setIsInputDisabled(true);
      } else {
        const errorData = await response.json();
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
      setMessage('Você deve validar os conjuntos First e Follow primeiro');
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
          <h2>Agora calcule os conjuntos First e Follow para a gramática:</h2>
          
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

          <div className="sets-grid">
            {/* Conjunto First */}
            <div className="set-card">
              <h3>Conjunto First</h3>
              <div className="set-content">
                <textarea
                  value={firstSets}
                  onChange={(e) => setFirstSets(e.target.value)}
                  placeholder="Digite aqui os conjuntos First..."
                  disabled={isInputDisabled}
                  className="set-textarea"
                />
              </div>
            </div>

            {/* Conjunto Follow */}
            <div className="set-card">
              <h3>Conjunto Follow</h3>
              <div className="set-content">
                <textarea
                  value={followSets}
                  onChange={(e) => setFollowSets(e.target.value)}
                  placeholder="Digite aqui os conjuntos Follow..."
                  disabled={isInputDisabled}
                  className="set-textarea"
                />
              </div>
            </div>
          </div>

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
    </div>
  );
}
