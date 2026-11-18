import { useState } from 'react';
import type { FormEvent } from 'react';
import { download } from './download.ts';
import { blankStudy, examples, exportStudy, fields, genres, parseSavedStudies, validate } from './study.ts';
import type { Genre, Study } from './study.ts';
import { useLocalState } from './storage.ts';

export default function App() {
  const [studies, setStudies, storageError] = useLocalState<Study[]>('hermeneutica-v1', [], parseSavedStudies);
  const [draft, setDraft] = useState(blankStudy);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [template, setTemplate] = useState('');

  function edit(study: Study) {
    setDraft(study);
    setError('');
    setStatus('');
  }

  function save(event: FormEvent) {
    event.preventDefault();
    const issue = validate(draft);
    if (issue) { setError(issue); setStatus(''); return; }
    const saved = { ...draft, id: draft.id || crypto.randomUUID(), passage: draft.passage.trim() };
    setStudies(previous => [...previous.filter(study => study.id !== saved.id), saved]);
    edit(saved);
    setStatus('Estudo salvo.');
  }

  return <div className="split">
    <section className="panel stack" id="ficha" tabIndex={-1}>
      <div className="row between"><h2>Ficha de estudo</h2><button onClick={() => edit(blankStudy())}>Nova ficha</button></div>
      <form className="form" onSubmit={save}>
        <div className="two collapse">
          <label>Passagem<input value={draft.passage} onChange={e => setDraft({ ...draft, passage: e.target.value })} required maxLength={120} placeholder="João 15:1–8" /></label>
          <label>Gênero literário<select value={draft.genre} onChange={e => setDraft({ ...draft, genre: e.target.value as Genre })}>{genres.map(genre => <option key={genre}>{genre}</option>)}</select></label>
        </div>
        {fields.map(([key, label, guide], i) => <label className={key === 'observation' || key === 'hypothesis' || key === 'application' ? 'study-key' : ''} key={key}>
          {label}<small id={'field-guide-' + i}>{guide}</small>
          <textarea value={draft[key]} required={key === 'observation'} maxLength={6000}
            aria-describedby={'field-guide-' + i} onChange={event => setDraft({ ...draft, [key]: event.target.value })} />
        </label>)}
        {(error || storageError) && <p role="alert" className="error">{error || storageError}</p>}
        {status && <p role="status">{storageError ? 'Estudo disponível nesta sessão.' : status}</p>}
        <div className="row">
          <button className="primary">Salvar estudo</button>
          <button type="button" disabled={Boolean(validate(draft))} onClick={() => download('estudo-biblico.md', exportStudy(draft), 'text/markdown')}>Exportar Markdown</button>
        </div>
      </form>
    </section>
    <aside className="stack">
      <section className="panel stack" id="exemplos" tabIndex={-1}>
        <h2>Exemplos comentados</h2>
        <ul className="list">{examples.map(({ study, prompt, guide }) => <li className="subtle" key={study.id}>
          <details>
            <summary>{study.passage} · {study.genre}</summary>
            <div className="stack">
              <p><strong>Exercício.</strong> {prompt}</p>
              <p><strong>Comentário.</strong> {guide}</p>
              <p><strong>Observação de exemplo.</strong> {study.observation}</p>
              <p><strong>Hipótese de exemplo.</strong> {study.hypothesis}</p>
              {template === study.id ? <div className="row">
                <button className="primary" onClick={() => { edit({ ...study, id: '' }); setTemplate(''); }}>Carregar na ficha</button>
                <button onClick={() => setTemplate('')}>Cancelar</button>
              </div> : <button onClick={() => setTemplate(study.id)}>Usar exemplo</button>}
              {template === study.id && <small>Carregar substitui o preenchimento atual da ficha.</small>}
            </div>
          </details>
        </li>)}</ul>
      </section>
      <section className="panel stack" id="estudos" tabIndex={-1}>
        <h2>Estudos salvos</h2>
        {!studies.length && <p className="muted">Seus estudos aparecem aqui após salvar.</p>}
        <ul className="list">{[...studies].reverse().map(study => <li key={study.id}><button className="selection" onClick={() => edit(study)}>{study.passage} · {study.genre}</button></li>)}</ul>
      </section>
    </aside>
  </div>;
}
