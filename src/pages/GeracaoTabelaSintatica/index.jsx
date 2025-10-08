import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGramatica } from '../../contexts/GramaticaContext';
import './styles.css';

export default function GeracaoTabelaSintatica() {
  const navigate = useNavigate();
  const { gramaticaSelecionada, idWorkflow, hasGramaticaSelecionada } = useGramatica();
  
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' ou 'error'

  useEffect(() => {
    setIsLoading(true);
    
    // Verificar se há uma gramática selecionada
    if (!hasGramaticaSelecionada()) {
      console.log('Nenhuma gramática selecionada. Redirecionando...');
      setMessage('Por favor, selecione uma gramática primeiro.');
      setMessageType('error');
      setTimeout(() => {
        navigate('/selecao-gramatica');
      }, 2000);
      return;
    } else {
      console.log('ID da gramática disponível:', idWorkflow);
      // Aqui você pode fazer chamadas à API usando o idWorkflow
      // Exemplo: fetch(`http://localhost:8080/jpars/tabela-sintatica/${idWorkflow}`)
      setIsLoading(false);
    }
  }, [hasGramaticaSelecionada, idWorkflow, navigate]);

  if (isLoading) {
    return (
      <div className="geracao-tabela-sintatica">
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='geracao-tabela-sintatica'>
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

        {/* Área de prática - será implementada posteriormente */}
        <section className="practice-section">
          <h2>Tabela Sintática da Gramática</h2>
          
          {gramaticaSelecionada && (
            <div className="grammar-info">
              <p><strong>Gramática selecionada:</strong> ID {idWorkflow}</p>
              <div className="grammar-display">
                <pre>{gramaticaSelecionada.gramatica}</pre>
              </div>
            </div>
          )}

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

