import React, { createContext, useContext, useState, useEffect } from 'react';

// Criar o contexto
const GramaticaContext = createContext();

// Hook personalizado para usar o contexto
export const useGramatica = () => {
  const context = useContext(GramaticaContext);
  if (!context) {
    throw new Error('useGramatica deve ser usado dentro de um GramaticaProvider');
  }
  return context;
};

// Provider do contexto
export const GramaticaProvider = ({ children }) => {
  // Estado para armazenar a gramática selecionada
  const [gramaticaSelecionada, setGramaticaSelecionada] = useState(() => {
    // Tentar recuperar do localStorage ao inicializar
    const saved = localStorage.getItem('gramaticaSelecionada');
    return saved ? JSON.parse(saved) : null;
  });

  // Salvar no localStorage sempre que mudar
  useEffect(() => {
    if (gramaticaSelecionada) {
      localStorage.setItem('gramaticaSelecionada', JSON.stringify(gramaticaSelecionada));
    } else {
      localStorage.removeItem('gramaticaSelecionada');
    }
  }, [gramaticaSelecionada]);

  // Função para selecionar uma gramática
  const selecionarGramatica = (workflow) => {
    setGramaticaSelecionada(workflow);
    console.log('Gramática armazenada no contexto:', workflow);
  };

  // Função para limpar a seleção
  const limparGramatica = () => {
    setGramaticaSelecionada(null);
    localStorage.removeItem('gramaticaSelecionada');
  };

  // Função para obter apenas o ID
  const getIdGramatica = () => {
    return gramaticaSelecionada?.idWorkflow || null;
  };

  // Função para verificar se há uma gramática selecionada
  const hasGramaticaSelecionada = () => {
    return gramaticaSelecionada !== null;
  };

  const value = {
    gramaticaSelecionada,
    selecionarGramatica,
    limparGramatica,
    getIdGramatica,
    hasGramaticaSelecionada,
    idWorkflow: gramaticaSelecionada?.idWorkflow || null,
    gramatica: gramaticaSelecionada?.gramatica || null,
    nivel: gramaticaSelecionada?.nivel || null,
    possuiRecursao: gramaticaSelecionada?.possuiRecursao || false,
    possuiFatoracao: gramaticaSelecionada?.possuiFatoracao || false,
  };

  return (
    <GramaticaContext.Provider value={value}>
      {children}
    </GramaticaContext.Provider>
  );
};

export default GramaticaContext;

