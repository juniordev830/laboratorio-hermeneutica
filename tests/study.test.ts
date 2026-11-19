import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blankStudy, examples, exportStudy, fields, findStudies, parseSavedStudies, validate } from '../src/study.ts';

test('busca une termos da passagem e do conteúdo', () => {
  const lesson = { ...blankStudy(), passage: 'João 15:1–8', observation: 'Oração e unidade' };
  const other = { ...blankStudy(), passage: 'Efésios 4:1–6', observation: 'Oração' };
  assert.deepEqual(findStudies([lesson, other], 'joao oracao'), [lesson]);
  assert.deepEqual(findStudies([lesson, other], ''), [other, lesson]);
});

test('carrega fichas existentes e detecta registros incompletos e IDs duplicados', () => {
  const study = examples[0].study;
  assert.deepEqual(parseSavedStudies(JSON.stringify([study])), [study]);
  for (const raw of ['{}', '[null]', JSON.stringify([study, study]), JSON.stringify([{ ...study, observation: 123 }])]) {
    assert.throws(() => parseSavedStudies(raw), /Formato inválido/);
  }
});

test('uma ficha exige passagem e observação separada', () => {
  assert.match(validate(blankStudy()), /passagem/);
  assert.match(validate({ ...blankStudy(), passage: 'João 15', hypothesis: 'Interpretação' }), /observação/);
});
test('valida tamanho de entrada e gênero', () => {
  const study = { ...examples[0].study };
  assert.match(validate({ ...study, observation: 'a'.repeat(6001) }), /6.000/);
  assert.match(validate({ ...study, passage: 'a'.repeat(121) }), /passagem/);
});
test('exporta observação, interpretação e aplicação em seções na ordem da ficha', () => {
  const text = exportStudy(examples[0].study);
  assert.match(text, /# Estudo de João 15:1–8/);
  assert.match(text, /Observação textual[\s\S]+Hipótese interpretativa[\s\S]+Aplicação/);
  assert.equal(text.split('\n## ').length, fields.length + 1);
});
test('exemplos têm perguntas, comentários e fichas completas', () => {
  assert.equal(new Set(examples.map(example => example.study.id)).size, examples.length);
  for (const example of examples) {
    assert.equal(validate(example.study), '');
    assert.ok(example.prompt && example.guide);
  }
});
