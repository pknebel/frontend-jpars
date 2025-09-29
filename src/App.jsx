import './App.css';
import Sidebar from './components/Sidebar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SelecaoGramaticas from './pages/SelecaoGramaticas';
import Fatoracao from './pages/Fatoracao';
import RemocaoRecursao from './pages/RemocaoRecursao';
import FirstFollow from './pages/FirstFollow';
import GeracaoTabelaSintatica from './pages/GeracaoTabelaSintatica';
import RecuperacaoErros from './pages/RecuperacaoErros';
import ValidacaoSentenca from './pages/ValidacaoSentenca';
import Feedback from './pages/Feedback';
import Manual from './pages/Manual';

function App() {
  return (
    <Router>
      <Sidebar />
      <Routes>
        <Route path='/selecao-gramatica' element={<SelecaoGramaticas />} />
        <Route path='/remocao-recursao-esquerda' element={<RemocaoRecursao />} />
        <Route path='/fatoracao-esquerda' element={<Fatoracao />} />
        <Route path='/calculo-first-follow' element={<FirstFollow />} />
        <Route path='/geracao-tabela' element={<GeracaoTabelaSintatica />} />
        <Route path='/adicao-recuperacao-erros' element={<RecuperacaoErros />} />
        <Route path='/validacao-sentenca' element={<ValidacaoSentenca />} />
        <Route path='/feedback' element={<Feedback />} />
        <Route path='/manual' element={<Manual />} />
      </Routes>
    </Router>
  );
}

export default App;
