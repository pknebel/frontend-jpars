import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGramatica } from '../contexts/GramaticaContext';

const GeracaoTabelaSintatica = () => {
  const navigate = useNavigate();
  const { gramaticaSelecionada, idWorkflow, hasGramaticaSelecionada } = useGramatica();

  useEffect(() => {
    // Verificar se há uma gramática selecionada
    if (!hasGramaticaSelecionada()) {
      console.log('Nenhuma gramática selecionada. Redirecionando...');
      navigate('/selecao-gramatica');
    } else {
      console.log('ID da gramática disponível:', idWorkflow);
      // Aqui você pode fazer chamadas à API usando o idWorkflow
      // Exemplo: fetch(`http://localhost:8080/jpars/tabela-sintatica/${idWorkflow}`)
    }
  }, [hasGramaticaSelecionada, idWorkflow, navigate]);

  return (
    <div className='default'>
      <h1>Gerar Tabela Sintática</h1>
      {gramaticaSelecionada && (
        <div>
          <p>Gramática selecionada: ID {idWorkflow}</p>
          <pre>{gramaticaSelecionada.gramatica}</pre>
        </div>
      )}
    </div>
  );
};

export default GeracaoTabelaSintatica;
