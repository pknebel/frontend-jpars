import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGramatica } from '../../contexts/GramaticaContext';
import HelpModal from '../../components/HelpModal';
import MessageBox from '../../components/MessageBox';
import Button from '../../components/Button';
import './styles.css';

export default function RemocaoRecursao() {
  const navigate = useNavigate();
  const { gramaticaSelecionada, hasGramaticaSelecionada, idWorkflow } = useGramatica();
  
  // Estados da aplicação
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [gramaticaTransformada, setGramaticaTransformada] = useState('');
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
      const response = await fetch(`http://localhost:8080/jpars/gramatica/sem-recursao/${idWorkflow}`);
      
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
      setGramaticaTransformada(resposta);
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
