import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const videos = [
    {
      id: 'video1',
      title: 'Introdução à Análise Léxica',
      url: 'https://www.youtube.com/embed/uj00_gvCSKk?start=54',
      description: 'Conceitos fundamentais da análise léxica.'
    },
    {
      id: 'video2',
      title: 'História e processo de compilação',
      url: 'https://www.youtube.com/embed/NVaO7v-cErM',
      description: 'História dos compiladores e funcionamento geral do processo de compilação.'
    },
    {
      id: 'video3',
      title: 'Introdução à Análise Sintática',
      url: 'https://www.youtube.com/embed/SegY2UEPCV4',
      description: 'Introdução à análise sintática e aos principais tipos de analisadores sintáticos.'
    },
    {
      id: 'video4',
      title: 'Analisador Sintático LL(1)',
      url: 'https://www.youtube.com/embed/yTgrbMkKk6M',
      description: 'Explicação sobre o analisador sintático LL(1), incluindo a construção da tabela e o processo de análise.'
    }
  ];

  const temas = [
    {
      id: 'tema1',
      title: 'Análise Léxica',
      description: 'Fundamentos da análise léxica e reconhecimento de tokens',
      icon: '📄',
      materiais: [
        {
          id: 'mat1',
          title: 'Apostila em PDF sobre Análise Léxica',
          type: 'PDF',
          icon: '📄',
          url: '#',
          description: 'Material completo com fundamentos teóricos e exemplos práticos'
        },
        {
          id: 'mat2',
          title: 'Vídeo Explicativo - Análise Léxica',
          type: 'Vídeo',
          icon: '🎥',
          url: '#',
          description: 'Aula em vídeo explicando os conceitos principais'
        },
        {
          id: 'mat3',
          title: 'Slides de Aula',
          type: 'Apresentação',
          icon: '📊',
          url: '#',
          description: 'Apresentação em PowerPoint com os principais tópicos'
        },
        {
          id: 'mat4',
          title: 'Artigo Complementar',
          type: 'Artigo',
          icon: '📰',
          url: '#',
          description: 'Link para artigo acadêmico sobre análise léxica'
        }
      ]
    },
    {
      id: 'tema2',
      title: 'Gramáticas Livres de Contexto',
      description: 'Conceitos sobre gramáticas, produções e derivações',
      icon: '📚',
      materiais: [
        {
          id: 'mat5',
          title: 'Apostila - Gramáticas Livres de Contexto',
          type: 'PDF',
          icon: '📄',
          url: '#',
          description: 'Guia completo sobre GLCs, produções e derivações'
        },
        {
          id: 'mat6',
          title: 'Vídeo - Introdução às GLCs',
          type: 'Vídeo',
          icon: '🎥',
          url: '#',
          description: 'Vídeo aula explicando gramáticas livres de contexto'
        },
        {
          id: 'mat7',
          title: 'Exercícios Práticos',
          type: 'Exercícios',
          icon: '✏️',
          url: '#',
          description: 'Lista de exercícios resolvidos sobre GLCs'
        },
        {
          id: 'mat8',
          title: 'Material Complementar',
          type: 'Artigo',
          icon: '📰',
          url: '#',
          description: 'Referências adicionais sobre o tema'
        }
      ]
    },
    {
      id: 'tema3',
      title: 'Tabelas de Análise Sintática',
      description: 'Guia completo sobre construção de tabelas LL(1)',
      icon: '📊',
      materiais: [
        {
          id: 'mat9',
          title: 'Apostila - Tabelas LL(1)',
          type: 'PDF',
          icon: '📄',
          url: '#',
          description: 'Material completo sobre construção de tabelas sintáticas'
        },
        {
          id: 'mat10',
          title: 'Vídeo - Construção de Tabelas',
          type: 'Vídeo',
          icon: '🎥',
          url: '#',
          description: 'Passo a passo para construir tabelas LL(1)'
        },
        {
          id: 'mat11',
          title: 'Exemplos Práticos',
          type: 'Exemplos',
          icon: '💡',
          url: '#',
          description: 'Casos de estudo com exemplos resolvidos'
        },
        {
          id: 'mat12',
          title: 'Referência Técnica',
          type: 'Referência',
          icon: '📖',
          url: '#',
          description: 'Documentação técnica sobre análise sintática'
        }
      ]
    },
    {
      id: 'tema4',
      title: 'Exercícios Práticos',
      description: 'Exercícios resolvidos e propostos sobre análise sintática',
      icon: '✏️',
      materiais: [
        {
          id: 'mat13',
          title: 'Coleção de Exercícios',
          type: 'PDF',
          icon: '📄',
          url: '#',
          description: 'Compilação de exercícios com soluções'
        },
        {
          id: 'mat14',
          title: 'Vídeo - Resolução de Exercícios',
          type: 'Vídeo',
          icon: '🎥',
          url: '#',
          description: 'Aulas resolvendo exercícios passo a passo'
        },
        {
          id: 'mat15',
          title: 'Lista de Problemas',
          type: 'Problemas',
          icon: '📝',
          url: '#',
          description: 'Lista de problemas propostos para prática'
        },
        {
          id: 'mat16',
          title: 'Fórum de Discussão',
          type: 'Fórum',
          icon: '💬',
          url: '#',
          description: 'Comunidade para discussão de exercícios'
        }
      ]
    },
    {
      id: 'tema5',
      title: 'Compiladores',
      description: 'Recursos sobre compiladores e processos de compilação',
      icon: '⚙️',
      materiais: [
        {
          id: 'mat17',
          title: 'Compiladores - Princípios, Técnicas e Ferramentas',
          type: 'Livro',
          icon: '📚',
          url: 'https://tsxvpsbr.dyndns.org/arquivos/UFFS/Compiladores%20-%20Princ%C3%ADpios%20T%C3%A9cnicas%20e%20Ferramentas.pdf',
          description: 'Livro clássico (Dragon Book) sobre teoria e prática de compiladores'
        },
        {
          id: 'mat18',
          title: 'Apostila - Introdução aos Compiladores',
          type: 'PDF',
          icon: '📄',
          url: '#',
          description: 'Material didático sobre os fundamentos de compiladores'
        },
        {
          id: 'mat19',
          title: 'Vídeo - Fases de Compilação',
          type: 'Vídeo',
          icon: '🎥',
          url: '#',
          description: 'Explicação sobre as principais fases do processo de compilação'
        },
        {
          id: 'mat20',
          title: 'Material Complementar',
          type: 'Referência',
          icon: '📖',
          url: '#',
          description: 'Recursos adicionais sobre teoria de compiladores'
        }
      ]
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

  const handleOpenModal = (tema) => {
    setSelectedMaterial(tema);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMaterial(null);
  };

  return (
    <div className="landing-page">
      <h2 className="main-welcome-title">Bem-vindo ao JPARS</h2>
      <section className="intro-section">
        <div className="intro-content">
          <p>
            O JPARS é uma ferramenta desenvolvida para quem deseja entender e praticar a análise sintática de forma simples e visual.
            Aqui, você encontrará materiais, vídeos e atividades interativas que ajudam a consolidar o aprendizado em Compiladores.
          </p>
          <p>
            Experimente remover recursões à esquerda, fatorar gramáticas, calcular FIRST e FOLLOW, montar a tabela sintática LL(1) e até simular o processamento de sentenças, acompanhando passo a passo como um analisador sintático funciona.
          </p>
          <p>
            Aprender compiladores nunca foi tão intuitivo!
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
            <div className="video-info">
              <h3>{videos[currentVideoIndex].title}</h3>
            </div>
            <div className="video-wrapper">
              <iframe
                src={videos[currentVideoIndex].url}
                title={videos[currentVideoIndex].title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="video-description">
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
          {temas.map((tema) => (
            <div 
              key={tema.id} 
              className="material-card"
              onClick={() => handleOpenModal(tema)}
              style={{ cursor: 'pointer' }}
            >
              <div className="material-icon">{tema.icon}</div>
              <h3>{tema.title}</h3>
              <p>{tema.description}</p>
              <button 
                className="material-link" 
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(tema);
                }}
              >
                Ver Materiais
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Modal de Materiais */}
      {isModalOpen && selectedMaterial && (
        <div className="materiais-modal-overlay" onClick={handleCloseModal}>
          <div className="materiais-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="materiais-modal-header">
              <h2>Materiais sobre {selectedMaterial.title}</h2>
              <button 
                className="materiais-modal-close"
                onClick={handleCloseModal}
                aria-label="Fechar modal"
              >
                ×
              </button>
            </div>
            <div className="materiais-modal-body">
              {selectedMaterial.materiais.map((material) => (
                <div key={material.id} className="material-item-card">
                  <div className="material-item-icon">{material.icon}</div>
                  <div className="material-item-info">
                    <h4>{material.title}</h4>
                    <p>{material.description}</p>
                    <span className="material-item-type">{material.type}</span>
                  </div>
                  <a 
                    href={material.url}
                    className="material-item-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Acessar →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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

