import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Vídeos sobre análise sintática
  const videos = [
    {
      id: 'video1',
      title: 'Introdução à Análise Léxica',
      url: 'https://www.youtube.com/watch?v=uj00_gvCSKk&t=54s',
      description: 'Conceitos fundamentais da análise léxica'
    },
    {
      id: 'video2',
      title: 'Tabelas LL(1)',
      url: 'https://www.youtube.com/embed/OBZw-XpDbhA',
      description: 'Como construir tabelas de análise LL(1)'
    },
    {
      id: 'video3',
      title: 'Árvores Sintáticas',
      url: 'https://www.youtube.com/embed/bxpc9Pp5pZM',
      description: 'Construção de árvores de derivação'
    },
    {
      id: 'video4',
      title: 'Recuperação de Erros',
      url: 'https://www.youtube.com/embed/9pX3HWBFXT4',
      description: 'Técnicas de recuperação de erros sintáticos'
    }
  ];

  // Materiais complementares (PDFs)
  const materiais = [
    {
      id: 'pdf1',
      title: 'Análise Léxica - Introdução',
      description: 'Fundamentos da análise léxica e reconhecimento de tokens',
      icon: '📄',
      url: '#' // Substituir com URL real quando disponível
    },
    {
      id: 'pdf2',
      title: 'Gramáticas Livres de Contexto',
      description: 'Conceitos sobre gramáticas, produções e derivações',
      icon: '📚',
      url: '#'
    },
    {
      id: 'pdf3',
      title: 'Tabelas de Análise Sintática',
      description: 'Guia completo sobre construção de tabelas LL(1)',
      icon: '📊',
      url: '#'
    },
    {
      id: 'pdf4',
      title: 'Exercícios Práticos',
      description: 'Exercícios resolvidos e propostos sobre análise sintática',
      icon: '✏️',
      url: '#'
    }
  ];

  const handlePrevVideo = () => {
    setCurrentVideoIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  const handleNextVideo = () => {
    setCurrentVideoIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };

  const handleIniciarPratica = () => {
    navigate('/selecao-gramatica');
  };

  return (
    <div className="landing-page">
      <section className="intro-section">
        <div className="intro-content">
          <h2>Bem-vindo ao JPARS</h2>
          <p>
            Aprenda os fundamentos da compilação explorando conceitos de análise léxica 
            e sintática com materiais didáticos e prática interativa. Nossa ferramenta 
            oferece um ambiente completo para estudar gramáticas livres de contexto, 
            construir tabelas de análise sintática e validar sentenças.
          </p>
          <p>
            Explore os materiais teóricos, assista aos vídeos explicativos e pratique 
            com exemplos reais para dominar os conceitos essenciais da teoria de compiladores.
          </p>
        </div>
      </section>

      {/* Carrossel de Vídeos */}
      <section className="video-section">
        <div className="section-header">
          <h2>Vídeos Educativos</h2>
          <p>Aprenda com vídeos explicativos sobre os principais conceitos</p>
        </div>
        
        <div className="video-carousel">
          <button 
            className="carousel-btn prev-btn" 
            onClick={handlePrevVideo}
            aria-label="Vídeo anterior"
          >
            ‹
          </button>
          
          <div className="video-container">
            <div className="video-wrapper">
              <iframe
                src={videos[currentVideoIndex].url}
                title={videos[currentVideoIndex].title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="video-info">
              <h3>{videos[currentVideoIndex].title}</h3>
              <p>{videos[currentVideoIndex].description}</p>
            </div>
          </div>
          
          <button 
            className="carousel-btn next-btn" 
            onClick={handleNextVideo}
            aria-label="Próximo vídeo"
          >
            ›
          </button>
        </div>

        <div className="video-indicators">
          {videos.map((video, index) => (
            <button
              key={video.id}
              className={`indicator ${index === currentVideoIndex ? 'active' : ''}`}
              onClick={() => setCurrentVideoIndex(index)}
              aria-label={`Ir para vídeo ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Materiais Complementares */}
      <section className="materiais-section">
        <div className="section-header">
          <h2>Materiais Complementares</h2>
          <p>Documentos e recursos para aprofundar seus conhecimentos</p>
        </div>
        
        <div className="materiais-grid">
          {materiais.map((material) => (
            <div key={material.id} className="material-card">
              <div className="material-icon">{material.icon}</div>
              <h3>{material.title}</h3>
              <p>{material.description}</p>
              <a 
                href={material.url} 
                className="material-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download PDF
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Botão Principal */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Pronto para começar?</h2>
          <p>Coloque em prática o que você aprendeu com nossa ferramenta interativa</p>
          <button className="cta-button" onClick={handleIniciarPratica}>
            Iniciar Prática
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>JPARS - Ferramenta Educacional de Análise Sintática</p>
        <p>Desenvolvido para estudantes de Compiladores</p>
      </footer>
    </div>
  );
};

export default LandingPage;

