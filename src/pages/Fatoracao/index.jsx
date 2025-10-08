import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGramatica } from '../../contexts/GramaticaContext';
import HelpModal from '../../components/HelpModal';
import './styles.css';

export default function Fatoracao() {
  const navigate = useNavigate();
  const { gramaticaSelecionada, hasGramaticaSelecionada, idWorkflow } = useGramatica();
  
  // Estados da aplicação
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [gramaticaFatorada, setGramaticaFatorada] = useState('');
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
    setIsLoading(true);
    
    // Verificar se há uma gramática selecionada no contexto
    if (hasGramaticaSelecionada() && gramaticaSelecionada) {
      console.log('Usando gramática do contexto:', gramaticaSelecionada);
      setSelectedWorkflow(gramaticaSelecionada);
      setMessage('');
      setMessageType('');
      setIsLoading(false);
    } else {
      // Se não há gramática no contexto, redirecionar para seleção
      console.log('Nenhuma gramática selecionada. Redirecionando para seleção...');
      setMessage('Por favor, selecione uma gramática primeiro.');
      setMessageType('error');
      setTimeout(() => {
        navigate('/selecao-gramatica');
      }, 2000);
    }
  }, [gramaticaSelecionada, hasGramaticaSelecionada, navigate]);

  // Função para buscar a resposta correta do backend
  const buscarRespostaCorreta = async () => {
    setIsLoadingAnswer(true);
    try {
      console.log(`Buscando resposta correta para gramática ID: ${idWorkflow}`);
      const response = await fetch(`http://localhost:8080/jpars/gramatica/ll1/${idWorkflow}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar resposta correta');
      }
      
      const respostaCorreta = await response.text();
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
    
    if (resposta) {
      setGramaticaFatorada(resposta);
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
        await response.json();
        setMessage('Gramática validada com sucesso');
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
