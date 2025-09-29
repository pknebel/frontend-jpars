import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles.css';

export default function Fatoracao() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estados da aplicação
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [gramaticaFatorada, setGramaticaFatorada] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' ou 'error'
  const [isInputDisabled, setIsInputDisabled] = useState(false);

  // Buscar o workflow selecionado ao carregar a página
  useEffect(() => {
    const fetchSelectedWorkflow = async () => {
      setIsLoading(true);
      try {
        console.log('Iniciando busca de workflows...');
        
        // Buscar todos os workflows
        const response = await fetch('http://localhost:8080/jpars/workflow');
        console.log('Resposta do servidor:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Verificar se a resposta é realmente JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.warn('Resposta não é JSON:', contentType);
          const responseText = await response.text();
          console.log('Conteúdo da resposta:', responseText.substring(0, 200));
          throw new Error('Backend retornou HTML em vez de JSON. Verifique se o endpoint está funcionando.');
        }
        
        const workflows = await response.json();
        console.log('Workflows recebidos:', workflows);
        
        // Buscar um workflow que tenha fatoração (possuiFatoracao = true)
        const workflowComFatoracao = workflows.find(w => w.possuiFatoracao === true);
        
        if (workflowComFatoracao) {
          setSelectedWorkflow(workflowComFatoracao);
          console.log('Workflow com fatoração carregado:', workflowComFatoracao);
        } else {
          // Se não encontrar nenhum com fatoração, usar o primeiro
          setSelectedWorkflow(workflows[0]);
          console.log('Workflow padrão carregado:', workflows[0]);
        }
        
        setMessage('');
        setMessageType('');
        
      } catch (error) {
        console.error('Erro ao carregar workflow:', error);
        setMessage('Erro ao carregar a gramática selecionada. Verifique se o backend está rodando.');
        setMessageType('error');
        console.log('Detalhes do erro:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSelectedWorkflow();
  }, []);

  // Função para validar a gramática fatorada
  const handleValidate = async () => {
    if (!gramaticaFatorada.trim()) {
      setMessage('Por favor, escreva a gramática fatorada no campo à direita.');
      setMessageType('error');
      return;
    }

    setIsValidating(true);
    setMessage('');

    try {
      const payload = {
        idWorkflow: selectedWorkflow.idWorkflow,
        gramaticaEntrada: gramaticaFatorada.replace(/\r?\n/g, '\n')
      };

      console.log('Enviando para validação:', payload);

      const response = await fetch('http://localhost:8080/jpars/gramatica/validar-fatoracao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        setMessage('Gramática validada com sucesso');
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
      setMessage('Você deve validar a gramática primeiro');
      setMessageType('error');
      return;
    }

    // Redirecionar para a tela de First/Follow (próxima etapa)
    navigate('/calculo-first-follow');
  };

  if (isLoading) {
    return (
      <div className="fatoracao">
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando gramática...</p>
        </div>
      </div>
    );
  }

  if (!selectedWorkflow) {
    return (
      <div className="fatoracao">
        <div className="error">
          <h2>Erro</h2>
          <p>Não foi possível carregar a gramática.</p>
          <button onClick={() => window.location.reload()}>Tentar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fatoracao">
      {/* Título da Tela */}
      <header className="header">
        <h1>Fatoração de Gramática</h1>
      </header>

      <main className="main-content">
        {/* Explicação sobre Fatoração */}
        <section className="info-section">
          <h2>O que é Fatoração</h2>
          <div className="info-box">
            <p>
              A fatoração é uma técnica usada para eliminar ambiguidades em gramáticas, 
              especialmente quando há múltiplas produções que começam com o mesmo símbolo. 
              Por exemplo, se temos <code>A → aB | aC</code>, podemos fatorar para 
              <code>A → aA'</code> e <code>A' → B | C</code>.
            </p>
          </div>
        </section>

        {/* Explicação sobre como fazer fatoração */}
        <section className="info-section">
          <h2>Como fazer fatoração</h2>
          <div className="info-box">
            <p>
              Quando uma gramática tem produções que começam com o mesmo símbolo, 
              como <code>A → aB | aC | aD</code>, ela precisa ser fatorada.
            </p>
            <p>A transformação consiste em:</p>
            <div className="code-example">
              <code>A → aA'</code><br />
              <code>A' → B | C | D</code>
            </div>
            <p>
              Assim, a ambiguidade é removida e a gramática se torna adequada para análise preditiva.
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
              src="https://www.youtube.com/embed/zY4w4_W30aQ?start=1200"
              title="Fatoração de Gramática"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        {/* Área de prática */}
        <section className="practice-section">
          <h2>Agora pratique com a gramática que escolheu:</h2>
          
          <div className="practice-grid">
            {/* Quadro 1: Gramática selecionada */}
            <div className="grammar-card">
              <h3>Gramática Original</h3>
              <div className="grammar-content">
                {selectedWorkflow.gramatica.split('\n').map((line, index) => (
                  <div key={index} className="grammar-line">
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Seta entre os quadros */}
            <div className="arrow">→</div>

            {/* Quadro 2: Área de texto editável */}
            <div className="grammar-card">
              <h3>Gramática Fatorada</h3>
              <div className="grammar-content">
                <textarea
                  value={gramaticaFatorada}
                  onChange={(e) => setGramaticaFatorada(e.target.value)}
                  placeholder="Escreva aqui a gramática fatorada..."
                  disabled={isInputDisabled}
                  className="grammar-textarea"
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
