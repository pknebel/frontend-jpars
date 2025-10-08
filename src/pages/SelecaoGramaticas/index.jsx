import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGramatica } from '../../contexts/GramaticaContext';
import './styles.css';

export const SelecaoGramaticas = () => {
  const navigate = useNavigate();
  const { selecionarGramatica, gramaticaSelecionada } = useGramatica();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(gramaticaSelecionada);
  const [collapsedCategories, setCollapsedCategories] = useState({
    'Fácil': false,
    'Intermediário': false,
    'Difícil': false
  });

  // Buscar workflows da API
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/jpars/workflow');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setWorkflows(data);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar as gramáticas. Verifique se o backend está rodando.');
        console.error('Erro ao buscar workflows:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  // Agrupar workflows por nível
  const workflowsPorNivel = workflows.reduce((acc, workflow) => {
    const nivel = workflow.nivel;
    if (!acc[nivel]) {
      acc[nivel] = [];
    }
    acc[nivel].push(workflow);
    return acc;
  }, {});

  // Alternar estado de colapso de uma categoria
  const toggleCategory = (categoria) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoria]: !prev[categoria]
    }));
  };

  // Selecionar um workflow e redirecionar baseado nas propriedades
  const handleSelectWorkflow = (workflow) => {
    setSelectedWorkflow(workflow);
    // Salvar a gramática no contexto global
    selecionarGramatica(workflow);
    console.log('Workflow selecionado:', workflow);
    console.log('ID da gramática armazenado:', workflow.idWorkflow);
    
    // Verificação de Recursão (prioridade máxima)
    if (workflow.possuiRecursao) {
      console.log('Gramática possui recursão. Redirecionando para Remoção de Recursão...');
      navigate('/remocao-recursao-esquerda');
      return;
    }
    
    // Verificação de Fatoração (quando não há recursão)
    if (workflow.possuiFatoracao) {
      console.log('Gramática possui fatoração. Redirecionando para Fatoração...');
      navigate('/fatoracao-esquerda');
      return;
    }
    
    // Caminho Final (quando não há recursão nem fatoração)
    console.log('Gramática não possui recursão nem fatoração. Redirecionando para First/Follow...');
    navigate('/calculo-first-follow');
  };

  // Formatar a gramática para exibição
  const formatarGramatica = (gramatica) => {
    return gramatica.split('\n').map((linha, index) => (
      <div key={index} className="gramatica-linha">
        {linha}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="selecao-gramaticas">
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando gramáticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="selecao-gramaticas">
        <div className="error">
          <h2>Erro</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Tentar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="selecao-gramaticas">
      <div className="header">
        <h1>Seleção da Gramática</h1>
        {selectedWorkflow && (
          <div className="selected-info">
            <span>✓ Gramática selecionada: {selectedWorkflow.gramatica.split('\n')[0]}</span>
            <div className="next-step-info">
              {selectedWorkflow.possuiRecursao ? (
                <span>Próximo passo: Remoção de Recursão</span>
              ) : selectedWorkflow.possuiFatoracao ? (
                <span>Próximo passo: Fatoração</span>
              ) : (
                <span>Próximo passo: Cálculo First/Follow</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="categories-container">
        {['Fácil', 'Intermediário', 'Difícil'].map((categoria) => {
          const workflowsCategoria = workflowsPorNivel[categoria] || [];
          
          return (
            <div key={categoria} className="category-lane">
              <div 
                className="category-header"
                onClick={() => toggleCategory(categoria)}
              >
                <h2>{categoria}</h2>
                <span className="toggle-icon">
                  {collapsedCategories[categoria] ? '▼' : '▲'}
                </span>
                <span className="workflow-count">
                  {workflowsCategoria.length} gramática{workflowsCategoria.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {!collapsedCategories[categoria] && (
                <div className="workflows-container">
                  {workflowsCategoria.length > 0 ? (
                    workflowsCategoria.map((workflow) => (
                      <div key={workflow.idWorkflow} className="workflow-card">
                        <div className="gramatica-content">
                          <h3>Gramática {workflow.idWorkflow}</h3>
                          <div className="gramatica-text">
                            {formatarGramatica(workflow.gramatica)}
                          </div>
                          <div className="workflow-properties">
                            <span className={`property ${workflow.possuiRecursao ? 'true' : 'false'}`}>
                              Recursão: {workflow.possuiRecursao ? 'Sim' : 'Não'}
                            </span>
                            <span className={`property ${workflow.possuiFatoracao ? 'true' : 'false'}`}>
                              Fatoração: {workflow.possuiFatoracao ? 'Sim' : 'Não'}
                            </span>
                          </div>
                        </div>
                        <button 
                          className="select-button"
                          onClick={() => handleSelectWorkflow(workflow)}
                        >
                          Selecionar
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="no-workflows">
                      <p>Nenhuma gramática disponível para este nível.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelecaoGramaticas;
