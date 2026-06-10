import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
const levels = [
  { id: 'easy', label: 'Easy' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'hard', label: 'Hard' },
  { id: 'bring-it-together', label: 'Bring It Together' }
];
const practiceLevelId = 'bring-it-together';
const randomExerciseLessonIds = new Set(['lag-function']);
const workspaceComment = '-- You can have multiple SQL statements; place the cursor on a statement to run it.\n\n';

function App() {
  const [activeLevel, setActiveLevel] = useState('easy');
  const [lessonData, setLessonData] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [sql, setSql] = useState(workspaceComment);
  const [queryResult, setQueryResult] = useState(null);
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isAnswerOpen, setIsAnswerOpen] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLessons() {
      setError('');
      const response = await fetch(`${API_URL}/lessons/${activeLevel}`);
      if (!response.ok) {
        throw new Error('Could not load lessons.');
      }
      const data = await response.json();

      if (!cancelled) {
        setLessonData(prepareLessonData(data, activeLevel));
        setActiveLessonId(data.lessons[0]?.id ?? null);
      }
    }

    loadLessons().catch((loadError) => {
      if (!cancelled) {
        setError(loadError.message);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeLevel]);

  const activeLesson = useMemo(() => {
    return lessonData?.lessons.find((lesson) => lesson.id === activeLessonId) ?? null;
  }, [lessonData, activeLessonId]);

  const activeExercise = activeLesson?.exercises?.[activeExerciseIndex] ?? null;
  const isPracticeLevel = activeLevel === practiceLevelId;

  useEffect(() => {
    if (activeLesson) {
      setActiveExerciseIndex(0);
    }
  }, [activeLesson]);

  useEffect(() => {
    if (activeExercise) {
      setSql(workspaceComment);
      setQueryResult(null);
      setError('');
      setIsAnswerOpen(false);
    }
  }, [activeExercise]);

  useEffect(() => {
    if (!isAnswerOpen) return undefined;

    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setIsAnswerOpen(false);
      }
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isAnswerOpen]);

  function viewAnswer() {
    if (!activeExercise?.expectedSql) return;

    setIsAnswerOpen(true);
  }

  function handleLevelClick(levelId) {
    if (levelId === activeLevel && levelId === practiceLevelId) {
      randomizePracticeExercises();
      return;
    }

    setActiveLevel(levelId);
  }

  function handleLessonClick(lessonId) {
    setActiveLessonId(lessonId);
    randomizeLessonExercises(lessonId);
  }

  function randomizePracticeExercises() {
    randomizeLessonExercises(activeLessonId);
  }

  function randomizeLessonExercises(lessonId) {
    setLessonData((currentLessonData) => {
      if (!currentLessonData) {
        return currentLessonData;
      }

      return {
        ...currentLessonData,
        lessons: currentLessonData.lessons.map((lesson) => {
          if (lesson.id !== lessonId || !lesson.exercisePool) {
            return lesson;
          }

          return {
            ...lesson,
            exercises: pickRandomItems(lesson.exercisePool, 5)
          };
        })
      };
    });
    setActiveExerciseIndex(0);
  }

  async function runQuery(query = getCurrentStatement()) {
    if (!query.trim()) {
      setError('Place the cursor inside a SQL statement to run it.');
      setQueryResult(null);
      return null;
    }

    setIsRunning(true);
    setError('');
    setQueryResult(null);

    try {
      const response = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Query failed.');
      }

      setQueryResult(data);
      return data;
    } catch (runError) {
      setError(runError.message);
      return null;
    } finally {
      setIsRunning(false);
    }
  }

  async function checkAnswer() {
    if (!activeExercise?.expectedSql) return;

    const userResult = await runQuery(getCurrentStatement());
    if (!userResult) return;

    try {
      const response = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: activeExercise.expectedSql })
      });
      const expected = await response.json();

      if (!response.ok) {
        throw new Error(expected.error ?? 'Could not check answer.');
      }

      const matches = JSON.stringify(userResult.rows) === JSON.stringify(expected.rows);
      setQueryResult({ ...userResult, check: matches ? 'Correct result.' : 'Result does not match the expected answer yet.' });
    } catch (checkError) {
      setError(checkError.message);
    }
  }

  function getCurrentStatement() {
    const cursorIndex = editorRef.current?.selectionStart ?? sql.length;
    return getStatementAtCursor(sql, cursorIndex);
  }

  return (
    <main className="app-shell">
      <header className="top-nav" aria-label="Lesson navigation">
        <h1>SQL Dojo</h1>
        <div className="level-tabs">
          {levels.map((level) => (
            <button
              key={level.id}
              className={level.id === activeLevel ? 'active' : ''}
              onClick={() => handleLevelClick(level.id)}
            >
              {level.label}
            </button>
          ))}
        </div>

        <nav className="lesson-tabs">
          {lessonData?.lessons.map((lesson) => (
            <button
              key={lesson.id}
              className={lesson.id === activeLessonId ? 'lesson-link active' : 'lesson-link'}
              onClick={() => handleLessonClick(lesson.id)}
            >
              <span>{lesson.title}</span>
              <small>{lesson.summary}</small>
            </button>
          ))}
        </nav>
      </header>

      <div className="main-grid">
        <section className="lesson-panel">
          {activeLesson ? (
            <>
              <p className="level-label">{lessonData.title}</p>
              <h2>{activeLesson.title}</h2>
              <p>{activeLesson.explanation}</p>
              <h3>Example</h3>
              <pre className="example-code">{activeLesson.example}</pre>
              <div className="exercise-heading">
                <h3>Exercises</h3>
                <div className="exercise-heading-actions">
                  <span>{activeLesson.exercises.length} tasks</span>
                  {activeLesson.exercisePool && (
                    <button onClick={randomizePracticeExercises} type="button">
                      Random 5
                    </button>
                  )}
                </div>
              </div>
              <div className="exercise-list">
                {activeLesson.exercises.map((exercise, index) => (
                  <button
                    key={exercise.prompt}
                    className={index === activeExerciseIndex ? 'exercise-button active' : 'exercise-button'}
                    onClick={() => setActiveExerciseIndex(index)}
                  >
                    <span>Exercise {index + 1}</span>
                    <small>{exercise.prompt}</small>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p>Loading lessons...</p>
          )}
        </section>

        <section className="workspace">
          <div className="workspace-header">
            <div>
              <h2>Workspace</h2>
              {activeExercise && <p>{activeExercise.prompt}</p>}
            </div>
            <div className="workspace-actions">
              <button onClick={() => runQuery()} disabled={isRunning}>Run</button>
              <button onClick={checkAnswer} disabled={isRunning || !activeExercise}>Check answer</button>
              <button onClick={viewAnswer} disabled={isRunning || !activeExercise?.expectedSql}>View Answer</button>
            </div>
          </div>

          <textarea
            ref={editorRef}
            spellCheck="false"
            value={sql}
            onChange={(event) => setSql(event.target.value)}
            aria-label="SQL editor"
          />

          {error && <div className="error">{error}</div>}
          {queryResult?.check && <div className="check">{queryResult.check}</div>}

          <ResultTable result={queryResult} />
        </section>
      </div>

      {isAnswerOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setIsAnswerOpen(false)}
        >
          <div
            aria-labelledby="answer-modal-title"
            aria-modal="true"
            className="answer-modal"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="answer-modal-title">Correct SQL</h2>
              <button
                aria-label="Close answer"
                className="modal-close"
                onClick={() => setIsAnswerOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>
            <pre className="answer-code">{activeExercise?.expectedSql}</pre>
          </div>
        </div>
      )}
    </main>
  );
}

function ResultTable({ result }) {
  if (!result) {
    return <div className="results-empty">Run a SELECT query to see results.</div>;
  }

  if (!result.rows.length) {
    return <div className="results-empty">Query returned 0 rows.</div>;
  }

  return (
    <div className="results">
      <table>
        <thead>
          <tr>
            {result.fields.map((field) => (
              <th key={field}>{field}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, index) => (
            <tr key={index}>
              {result.fields.map((field) => (
                <td key={field}>{formatValue(row[field])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatValue(value) {
  if (value === null) return 'NULL';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function prepareLessonData(data, levelId) {
  return {
    ...data,
    lessons: data.lessons.map((lesson) => {
      if (levelId !== practiceLevelId && !randomExerciseLessonIds.has(lesson.id)) {
        return lesson;
      }

      return {
        ...lesson,
        exercisePool: lesson.exercises,
        exercises: pickRandomItems(lesson.exercises, 5)
      };
    })
  };
}

function pickRandomItems(items, count) {
  return [...items]
    .map((item) => ({ item, sortKey: Math.random() }))
    .sort((left, right) => left.sortKey - right.sortKey)
    .slice(0, count)
    .map(({ item }) => item);
}

function getStatementAtCursor(input, cursorIndex) {
  const statements = splitSqlStatements(input);

  if (!statements.length) {
    return '';
  }

  const containingStatement = statements.find((statement) => {
    return cursorIndex >= statement.start && cursorIndex <= statement.end;
  });

  if (containingStatement) {
    return containingStatement.text.trim();
  }

  return '';
}

function splitSqlStatements(input) {
  const statements = [];
  let start = 0;
  let state = 'normal';

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (state === 'line-comment') {
      if (char === '\n') {
        state = 'normal';
      }
      continue;
    }

    if (state === 'block-comment') {
      if (char === '*' && next === '/') {
        index += 1;
        state = 'normal';
      }
      continue;
    }

    if (state === 'single-quote') {
      if (char === "'" && next === "'") {
        index += 1;
      } else if (char === "'") {
        state = 'normal';
      }
      continue;
    }

    if (state === 'double-quote') {
      if (char === '"' && next === '"') {
        index += 1;
      } else if (char === '"') {
        state = 'normal';
      }
      continue;
    }

    if (char === '-' && next === '-') {
      index += 1;
      state = 'line-comment';
      continue;
    }

    if (char === '/' && next === '*') {
      index += 1;
      state = 'block-comment';
      continue;
    }

    if (char === "'") {
      state = 'single-quote';
      continue;
    }

    if (char === '"') {
      state = 'double-quote';
      continue;
    }

    if (char === ';') {
      addStatement(input, statements, start, index + 1);
      start = index + 1;
    }
  }

  addStatement(input, statements, start, input.length);
  return statements;
}

function addStatement(input, statements, start, end) {
  const text = input.slice(start, end);

  if (!hasRunnableSql(text)) {
    return;
  }

  const leadingWhitespaceLength = text.length - text.trimStart().length;
  const trailingWhitespaceLength = text.length - text.trimEnd().length;

  statements.push({
    start: start + leadingWhitespaceLength,
    end: end - trailingWhitespaceLength,
    text
  });
}

function hasRunnableSql(text) {
  return text
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim().length > 0;
}

createRoot(document.getElementById('root')).render(<App />);
