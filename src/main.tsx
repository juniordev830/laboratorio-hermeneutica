import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './style.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <a className="skip" href="#conteudo">Ir para o conteúdo</a>
    <header className="masthead">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">∴</span>
        <span>Laboratório de hermenêutica</span>
      </div>
      <span className="collection">Coleção de estudo bíblico</span>
    </header>
    <main id="conteudo">
      <div className="intro">
        <h1>Laboratório de hermenêutica</h1>
        <nav className="atalhos" aria-label="Seções desta página">
          <a href="#ficha">Ficha de estudo</a>
          <a href="#exemplos">Exemplos</a>
          <a href="#estudos">Estudos salvos</a>
        </nav>
      </div>
      <App />
    </main>
  </StrictMode>,
);
