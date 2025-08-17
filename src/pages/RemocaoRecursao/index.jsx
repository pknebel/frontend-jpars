import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles.css';

export default function RemocaoRecursao() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estados da aplicação
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [gramaticaTransformada, setGramaticaTransformada] = useState('');
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
        
        // Buscar um workflow que tenha recursão (possuiRecursao = true)
        const workflowComRecursao = workflows.find(w => w.possuiRecursao === true);
        
        if (workflowComRecursao) {
          setSelectedWorkflow(workflowComRecursao);
          console.log('Workflow com recursão carregado:', workflowComRecursao);
        } else {
          // Se não encontrar nenhum com recursão, usar o primeiro
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

  // Função para validar a gramática transformada
  const handleValidate = async () => {
    if (!gramaticaTransformada.trim()) {
      setMessage('Por favor, escreva a gramática transformada no campo à direita.');
      setMessageType('error');
      return;
    }

    setIsValidating(true);
    setMessage('');

    try {
      const payload = {
        idWorkflow: selectedWorkflow.idWorkflow,
        gramaticaEntrada: gramaticaTransformada.replace(/\r?\n/g, '\n')
      };

      console.log('Enviando para validação:', payload);

      const response = await fetch('http://localhost:8080/jpars/gramatica/validar-recursao', {
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

    // Verificar se o workflow tem fatoração para decidir o próximo passo
    if (selectedWorkflow.possuiFatoracao) {
      navigate('/fatoracao-esquerda');
    } else {
      navigate('/calculo-first-follow');
    }
  };

  if (isLoading) {
    return (
      <div className="remocao-recursao">
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando gramática...</p>
        </div>
      </div>
    );
  }

  if (!selectedWorkflow) {
    return (
      <div className="remocao-recursao">
        <div className="error">
          <h2>Erro</h2>
          <p>Não foi possível carregar a gramática.</p>
          <button onClick={() => window.location.reload()}>Tentar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="remocao-recursao">
      {/* Título da Tela */}
      <header className="header">
        <h1>Remoção da Recursão à Esquerda</h1>
      </header>

      <main className="main-content">
        {/* Explicação sobre Recursão à Esquerda */}
        <section className="info-section">
          <h2>O que é Recursão à Esquerda</h2>
          <div className="info-box">
            <p>
              Algumas gramáticas usam regras que se referem a si mesmas no início da produção, 
              por exemplo <code>A → A a</code> — isso é chamado de recursão à esquerda. 
              Como esse tipo de estrutura pode causar problemas em analisadores sintáticos, 
              é necessário reescrevê-la para que não comece com o mesmo símbolo.
            </p>
          </div>
        </section>

        {/* Explicação sobre como eliminar a recursão */}
        <section className="info-section">
          <h2>Como eliminar a recursão</h2>
          <div className="info-box">
            <p>
              Quando uma produção tem a forma: <code>A → Aα | β</code>, ela é recursiva à esquerda 
              e precisa ser reescrita.
            </p>
            <p>A transformação consiste em:</p>
            <div className="code-example">
              <code>A → β A'</code><br />
              <code>A' → α A' | ε</code>
            </div>
            <p>
              Assim, a recursão é removida e a gramática se torna adequada para análise preditiva.
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
              src="https://www.youtube.com/embed/zY4w4_W30aQ?start=832"
              title="Remoção de Recursão à Esquerda"
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
              <h3>Gramática Transformada</h3>
              <div className="grammar-content">
                <textarea
                  value={gramaticaTransformada}
                  onChange={(e) => setGramaticaTransformada(e.target.value)}
                  placeholder="Escreva aqui a gramática sem recursão à esquerda..."
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
