/**
 * js/notes-studio.js - Dev Studio & Bloc-Notes Playground
 * Playground multi-langages (Python, C, Java, Oz, JS, Bash), Terminal interactif & Markdown Studio
 */

(function () {
  'use strict';

  // ========================================================
  // 1. MODÈLES DE CODE PAR DÉFAUT & SNIPPETS
  // ========================================================
  const STARTER_SNIPPETS = {
    python: {
      default: `# Sandbox Python 3.11\ndef fibonacci(n):\n    """Génère la suite de Fibonacci jusqu au rang n"""\n    a, b = 0, 1\n    seq = []\n    for _ in range(n):\n        seq.append(a)\n        a, b = b, a + b\n    return seq\n\nprint("Suite de Fibonacci (10 termes) :", fibonacci(10))\nprint("Carrés des nombres pairs :", [x**2 for x in range(12) if x % 2 == 0])\n`,
      quicksort: `def quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + middle + quicksort(right)\n\ndata = [38, 27, 43, 3, 9, 82, 10]\nprint("Tableau initial :", data)\nprint("Tri rapide :", quicksort(data))\n`,
      stats: `import statistics\n\nnotes = [14.5, 12.0, 18.0, 9.5, 16.0, 15.5, 11.0]\nprint(f"Nombre de notes : {len(notes)}")\nprint(f"Moyenne : {statistics.mean(notes):.2f}/20")\nprint(f"Médiane : {statistics.median(notes):.2f}/20")\nprint(f"Écart-type : {statistics.stdev(notes):.2f}")\n`
    },
    c: {
      default: `// Sandbox C (GCC 13.2)\n#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\nint main(void) {\n    int x = 42, y = 1337;\n    printf("Avant swap : x = %d, y = %d\\n", x, y);\n    swap(&x, &y);\n    printf("Après swap : x = %d, y = %d\\n", x, y);\n    \n    int sum = 0;\n    for (int i = 1; i <= 10; i++) sum += i;\n    printf("Somme des entiers de 1 à 10 : %d\\n", sum);\n    return 0;\n}\n`,
      pointers: `#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    int n = 5;\n    int *tab = malloc(n * sizeof(int));\n    if (!tab) return 1;\n    \n    for (int i = 0; i < n; i++) {\n        tab[i] = (i + 1) * 10;\n    }\n    \n    printf("Contenu alloué dynamiquement :\\n");\n    for (int i = 0; i < n; i++) {\n        printf("tab[%d] = %d (adresse : %p)\\n", i, tab[i], (void*)&tab[i]);\n    }\n    free(tab);\n    return 0;\n}\n`,
      factorial: `#include <stdio.h>\n\nlong long factorielle(int n) {\n    if (n <= 1) return 1;\n    return n * factorielle(n - 1);\n}\n\nint main(void) {\n    for (int i = 0; i <= 10; i++) {\n        printf("%d! = %lld\\n", i, factorielle(i));\n    }\n    return 0;\n}\n`
    },
    java: {
      default: `// Sandbox Java (OpenJDK 21)\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("⚡ Bienvenue dans le Playground Java !");\n        \n        int[] numbers = {12, 45, 67, 2, 89, 34};\n        int max = numbers[0];\n        for (int num : numbers) {\n            if (num > max) max = num;\n        }\n        System.out.println("Maximum trouvé : " + max);\n    }\n}\n`,
      stream: `import java.util.*;\nimport java.util.stream.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        List<String> names = Arrays.asList("Ada Lovelace", "Alan Turing", "Peter Van Roy", "Grace Hopper");\n        \n        List<String> filtered = names.stream()\n            .filter(s -> s.length() > 10)\n            .map(String::toUpperCase)\n            .collect(Collectors.toList());\n            \n        System.out.println("Noms filtrés & majuscules : " + filtered);\n    }\n}\n`
    },
    oz: {
      default: `% Sandbox Oz (Mozart Programming System - UCLouvain CTM)\ndeclare\nfun {Fact N}\n   if N == 0 then 1\n   else N * {Fact N - 1}\n   end\nend\n\n{Browse {Fact 5}}\n{Browse {Fact 7}}\n`,
      list: `% Manipulation récursive de listes en Oz\ndeclare\nfun {SumList L}\n   case L\n   of nil then 0\n   [] H|T then H + {SumList T}\n   end\nend\n\n{Browse {SumList [10 20 30 40]}}\n`,
      fib: `% Suite de Fibonacci en Oz\ndeclare\nfun {Fib N}\n   if N =< 1 then N\n   else {Fib N - 1} + {Fib N - 2}\n   end\nend\n\n{Browse {Fib 9}}\n`,
      double: `% Doublement des éléments d une liste\ndeclare\nfun {DoubleAll L}\n   case L\n   of nil then nil\n   [] H|T then (H * 2) | {DoubleAll T}\n   end\nend\n\n{Browse {DoubleAll [1 2 3 4 5]}}\n`
    },
    javascript: {
      default: `// Sandbox JavaScript (V8 Engine)\nconsole.log("⚡ Sandbox JavaScript actif");\n\nconst users = [\n  { name: "Alice", role: "Dev", score: 92 },\n  { name: "Bob", role: "Admin", score: 85 },\n  { name: "Charlie", role: "Dev", score: 96 }\n];\n\nconst topDevs = users\n  .filter(u => u.role === "Dev")\n  .sort((a, b) => b.score - a.score);\n\nconsole.log("Top Développeurs :", topDevs);\n`,
      async: `console.log("Calcul asynchrone...");\n\nasync function simulateWork() {\n  const results = await Promise.all([\n    Promise.resolve(42),\n    Promise.resolve("Cyberdeck v4.0")\n  ]);\n  console.log("Résultats reçus :", results);\n}\nsimulateWork();\n`
    },
    bash: {
      default: `#!/usr/bin/env bash\necho "⚡ Script Bash interactif"\necho "Date actuelle : $(date)"\necho "Utilisateur : $(whoami)"\n\nfor i in {1..5}; do\n  echo "Itération $i/5..."\ndone\n`
    }
  };

  // Fichiers initiaux par défaut
  const DEFAULT_BUFFERS = [
    { id: 'main-py', name: 'main.py', lang: 'python', content: STARTER_SNIPPETS.python.default },
    { id: 'algo-c', name: 'algo.c', lang: 'c', content: STARTER_SNIPPETS.c.default },
    { id: 'program-oz', name: 'program.oz', lang: 'oz', content: STARTER_SNIPPETS.oz.default },
    { id: 'solution-java', name: 'Solution.java', lang: 'java', content: STARTER_SNIPPETS.java.default },
    { id: 'notes-md', name: 'notes.md', lang: 'markdown', content: `# 📝 Bloc-Notes & Scratchpad\n\n- [x] Réviser l'algorithmique en C\n- [x] Tester les fonctions récursives en Oz\n- [ ] Compléter le projet Dashboard\n\n> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra\n` }
  ];

  // ========================================================
  // 2. MOTEUR D'ÉVALUATION OZ INTÉGRÉ (AST IN-BROWSER)
  // ========================================================
  function evaluateOzCode(code, printFn) {
    // 1. Tokenizer
    const tokens = [];
    let i = 0;
    while (i < code.length) {
      const c = code[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === '%') { while (i < code.length && code[i] !== '\n') i++; continue; }
      if (c === '/' && code[i + 1] === '*') {
        i += 2;
        while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) i++;
        i += 2;
        continue;
      }
      if (code.slice(i, i + 2) === '[]') { tokens.push({ type: '[]', text: '[]' }); i += 2; continue; }
      if (code.slice(i, i + 2) === '==') { tokens.push({ type: 'OP', text: '==' }); i += 2; continue; }
      if (code.slice(i, i + 2) === '=<') { tokens.push({ type: 'OP', text: '=<' }); i += 2; continue; }
      if (code.slice(i, i + 2) === '>=') { tokens.push({ type: 'OP', text: '>=' }); i += 2; continue; }
      if (code.slice(i, i + 2) === '\\=') { tokens.push({ type: 'OP', text: '\\=' }); i += 2; continue; }
      if ('{}[]()|+-*/'.includes(c)) { tokens.push({ type: c, text: c }); i++; continue; }
      if (c === '"') {
        let s = ''; i++;
        while (i < code.length && code[i] !== '"') { s += code[i]; i++; }
        i++;
        tokens.push({ type: 'STR', val: s });
        continue;
      }
      if (/[0-9]/.test(c) || (c === '~' && /[0-9]/.test(code[i + 1]))) {
        let num = '';
        if (c === '~') { num = '-'; i++; }
        while (i < code.length && /[0-9.]/.test(code[i])) { num += code[i]; i++; }
        tokens.push({ type: 'NUM', val: parseFloat(num) });
        continue;
      }
      if (/[a-zA-Z_]/.test(c)) {
        let w = '';
        while (i < code.length && /[a-zA-Z0-9_.]/.test(code[i])) { w += code[i]; i++; }
        tokens.push({ type: 'WORD', text: w });
        continue;
      }
      i++;
    }

    // 2. Parser
    let pos = 0;
    const peek = () => tokens[pos];
    const next = () => tokens[pos++];
    const match = (type, text) => {
      const t = peek();
      if (t && (!type || t.type === type) && (!text || t.text === text)) return next();
      return null;
    };

    function parsePrimary() {
      const t = peek();
      if (!t) return null;
      if (t.type === 'NUM') return { type: 'Lit', val: next().val };
      if (t.type === 'STR') return { type: 'Lit', val: next().val };
      if (t.type === '[') {
        next();
        const elements = [];
        while (peek() && peek().type !== ']') {
          elements.push(parseExpr());
        }
        match(']');
        return { type: 'List', elements };
      }
      if (t.type === '(') {
        next();
        const e = parseExpr();
        match(')');
        return e;
      }
      if (t.type === '{') {
        next();
        const fnName = next().text;
        const args = [];
        while (peek() && peek().type !== '}') {
          args.push(parseExpr());
        }
        match('}');
        return { type: 'Call', fnName, args };
      }
      if (t.type === 'WORD') {
        const w = next().text;
        if (w === 'nil') return { type: 'Lit', val: null };
        if (w === 'true') return { type: 'Lit', val: true };
        if (w === 'false') return { type: 'Lit', val: false };
        if (w === 'if') {
          const cond = parseExpr();
          if (peek() && peek().text === 'then') next();
          const thenBranch = parseExpr();
          let elseBranch = null;
          if (peek() && peek().text === 'else') {
            next();
            elseBranch = parseExpr();
          }
          if (peek() && peek().text === 'end') next();
          return { type: 'If', cond, thenBranch, elseBranch };
        }
        if (w === 'case') {
          const target = parseExpr();
          if (peek() && peek().text === 'of') next();
          const branches = [];
          while (peek() && peek().text !== 'end') {
            if (peek().type === '[]') next();
            const p = peek();
            if (p && p.text === 'nil') {
              next();
              if (peek() && peek().text === 'then') next();
              const body = parseExpr();
              branches.push({ pattern: 'nil', body });
            } else if (p && p.type === 'WORD') {
              const h = next().text;
              if (peek() && peek().type === '|') {
                next();
                const tail = next().text;
                if (peek() && peek().text === 'then') next();
                const body = parseExpr();
                branches.push({ pattern: 'cons', h, tail, body });
              }
            } else {
              next();
            }
          }
          if (peek() && peek().text === 'end') next();
          return { type: 'Case', target, branches };
        }
        return { type: 'Var', name: w };
      }
      return null;
    }

    function parseExpr() {
      let left = parsePrimary();
      while (peek()) {
        const op = peek();
        if (op.type === 'OP' || op.type === '+' || op.type === '-' || op.type === '*' || op.type === '/' || op.type === '|') {
          next();
          const right = parsePrimary();
          left = { type: 'Binary', op: op.text, left, right };
        } else {
          break;
        }
      }
      return left;
    }

    const astStatements = [];
    while (pos < tokens.length) {
      const t = peek();
      if (!t) break;
      if (t.text === 'declare') {
        next();
        continue;
      }
      if (t.text === 'fun' || t.text === 'proc') {
        next();
        match('{');
        const fnName = next().text;
        const params = [];
        while (peek() && peek().type !== '}') {
          params.push(next().text);
        }
        match('}');
        const body = parseExpr();
        if (peek() && peek().text === 'end') next();
        astStatements.push({ type: 'Def', fnName, params, body });
        continue;
      }
      const e = parseExpr();
      if (e) astStatements.push({ type: 'Stmt', expr: e });
      else next();
    }

    // 3. Evaluator
    const env = {
      Browse: (args) => {
        printFn('Browse: ' + formatOz(args[0]), 'oz-browse');
        return null;
      },
      Show: (args) => {
        printFn('Show: ' + formatOz(args[0]), 'oz-browse');
        return null;
      },
      'System.showInfo': (args) => {
        printFn(formatOz(args[0]), 'stdout');
        return null;
      }
    };

    function formatOz(v) {
      if (v === null || v === undefined) return 'nil';
      if (Array.isArray(v)) return '[' + v.map(formatOz).join(' ') + ']';
      if (typeof v === 'number' && v < 0) return '~' + Math.abs(v);
      return String(v);
    }

    function evaluate(node, ctx) {
      if (!node) return null;
      switch (node.type) {
        case 'Lit': return node.val;
        case 'List': return node.elements.map(e => evaluate(e, ctx));
        case 'Var': {
          if (node.name in ctx) return ctx[node.name];
          if (node.name in env) return env[node.name];
          return node.name;
        }
        case 'Binary': {
          const l = evaluate(node.left, ctx);
          const r = evaluate(node.right, ctx);
          switch (node.op) {
            case '+': return l + r;
            case '-': return l - r;
            case '*': return l * r;
            case '/': return l / r;
            case '==': return l === r;
            case '=<': return l <= r;
            case '>=': return l >= r;
            case '\\=': return l !== r;
            case '|': return [l, ...(Array.isArray(r) ? r : (r === null ? [] : [r]))];
            default: return 0;
          }
        }
        case 'If': {
          const cond = evaluate(node.cond, ctx);
          return cond ? evaluate(node.thenBranch, ctx) : evaluate(node.elseBranch, ctx);
        }
        case 'Case': {
          const target = evaluate(node.target, ctx);
          for (const b of node.branches) {
            if (b.pattern === 'nil' && (!target || (Array.isArray(target) && target.length === 0))) {
              return evaluate(b.body, ctx);
            }
            if (b.pattern === 'cons' && Array.isArray(target) && target.length > 0) {
              const subCtx = Object.create(ctx);
              subCtx[b.h] = target[0];
              subCtx[b.tail] = target.slice(1);
              return evaluate(b.body, subCtx);
            }
          }
          return null;
        }
        case 'Call': {
          const fn = ctx[node.fnName] || env[node.fnName];
          if (typeof fn !== 'function') throw new Error('Fonction non reconnue : ' + node.fnName);
          const evaluatedArgs = node.args.map(a => evaluate(a, ctx));
          return fn(evaluatedArgs);
        }
        default:
          return null;
      }
    }

    let statementCount = 0;
    for (const stmt of astStatements) {
      statementCount++;
      if (stmt.type === 'Def') {
        env[stmt.fnName] = (callArgs) => {
          const subCtx = Object.create(env);
          stmt.params.forEach((p, idx) => { subCtx[p] = callArgs[idx]; });
          return evaluate(stmt.body, subCtx);
        };
      } else if (stmt.type === 'Stmt') {
        evaluate(stmt.expr, env);
      }
    }
    return statementCount;
  }

  // ========================================================
  // 2b. MOTEUR PYTHON EMBARQUÉ CLIENT (SKULPT 100% LOCAL)
  // ========================================================
  function executeInBrowserPython(code, printFn) {
    return new Promise((resolve, reject) => {
      if (!window.Sk) {
        reject(new Error('Moteur Python embarqué (Skulpt) non initialisé.'));
        return;
      }

      let lineBuffer = '';
      window.Sk.configure({
        output: (text) => {
          lineBuffer += text;
          if (lineBuffer.endsWith('\n')) {
            printFn(lineBuffer.replace(/\n$/, ''), 'stdout');
            lineBuffer = '';
          }
        },
        read: (x) => {
          if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles['files'][x] === undefined) {
            throw new Error(`Module Python introuvable : ${x}`);
          }
          return window.Sk.builtinFiles['files'][x];
        },
        __future__: window.Sk.python3
      });

      window.Sk.misceval.asyncToPromise(() => {
        return window.Sk.importMainWithBody('<stdin>', false, code, true);
      }).then(() => {
        if (lineBuffer.length > 0) {
          printFn(lineBuffer, 'stdout');
        }
        resolve();
      }).catch(err => {
        reject(err);
      });
    });
  }
  async function executeWandbox(compiler, code, stdin = '') {
    const payload = {
      compiler: compiler,
      code: code,
      stdin: stdin,
      'compiler-option-raw': compiler.includes('gcc') ? '-O2 -Wall' : ''
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erreur serveur HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  // ========================================================
  // 3b. MOTEUR D'EXÉCUTION LOCAL ULTRA-RAPIDE (runner.py)
  // ========================================================
  let localRunnerUrl = null;
  let localRunnerTools = null;

  async function probeLocalRunner() {
    const endpoints = [
      '', // Same-origin (si exécuté via ./runner.py directement)
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'http://127.0.0.1:8080',
      'http://localhost:8080'
    ];

    for (const base of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 200);
        const res = await fetch(`${base}/api/status`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.engine === 'local-native') {
            localRunnerUrl = base;
            localRunnerTools = data.tools || {};
            updateLocalRunnerBadge(true);
            return true;
          }
        }
      } catch {
        // Suivant
      }
    }
    localRunnerUrl = null;
    localRunnerTools = null;
    updateLocalRunnerBadge(false);
    return false;
  }

  function updateLocalRunnerBadge(isOnline) {
    let indicator = document.getElementById('terminal-local-indicator');
    if (!indicator) {
      const titleWrap = document.querySelector('.terminal-title');
      if (titleWrap) {
        indicator = document.createElement('span');
        indicator.id = 'terminal-local-indicator';
        indicator.className = 'term-local-pill';
        titleWrap.appendChild(indicator);
      }
    }
    if (indicator) {
      if (isOnline) {
        indicator.hidden = false;
        indicator.innerHTML = '<span class="status-dot" style="background:#34d399;box-shadow:0 0 8px #34d399;width:6px;height:6px;border-radius:50%;display:inline-block;"></span> Moteur Local (10ms)';
        indicator.title = 'Moteur local actif : vos compilateurs système sont utilisés directement.';
      } else {
        indicator.hidden = true;
      }
    }
  }

  async function executeLocalRunner(lang, code, stdin = '') {
    const res = await fetch(`${localRunnerUrl}/api/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang, code, stdin })
    });
    if (!res.ok) throw new Error(`Erreur serveur local HTTP ${res.status}`);
    return await res.json();
  }

  // ========================================================
  // 4. ÉTAT ET CONTRÔLEUR PRINCIPAL DU STUDIO
  // ========================================================
  let buffers = [];
  let activeBufferId = 'main-py';
  let currentMode = 'code'; // 'code', 'notes', 'split'
  let currentLang = 'python';

  // DOM Elements
  let editorEl, lineNumbersEl, previewEl, tabsBarEl;
  let termScreenEl, termInputEl, termBadgeEl, termStatusLabelEl, termExecTimeEl;
  let langSelectEl, snippetSelectEl, runBtnEl, modeStatusEl;
  let cursorPosEl, statsInfoEl, linesCountEl, saveStatusTextEl;
  let mdToolbarEl;

  function loadSavedBuffers() {
    try {
      const saved = localStorage.getItem('startpage_code_buffers_v3');
      if (saved) {
        buffers = JSON.parse(saved);
      }
    } catch {
      buffers = [];
    }

    if (!Array.isArray(buffers) || buffers.length === 0) {
      buffers = JSON.parse(JSON.stringify(DEFAULT_BUFFERS));
    }

    // Assurer la synchronisation avec l'ancien scratchpad de notes
    const legacyNotes = localStorage.getItem('startpage_scratchpad_v2') || localStorage.getItem('startpage_scratchpad');
    if (legacyNotes) {
      const notesBuf = buffers.find(b => b.id === 'notes-md');
      if (notesBuf && (!notesBuf.content || notesBuf.content === DEFAULT_BUFFERS[4].content)) {
        notesBuf.content = legacyNotes;
      }
    }

    const savedActiveId = localStorage.getItem('startpage_studio_active_tab');
    if (savedActiveId && buffers.some(b => b.id === savedActiveId)) {
      activeBufferId = savedActiveId;
    } else {
      activeBufferId = buffers[0].id;
    }
  }

  function saveBuffers() {
    try {
      localStorage.setItem('startpage_code_buffers_v3', JSON.stringify(buffers));
      const activeBuf = getActiveBuffer();
      if (activeBuf && activeBuf.id === 'notes-md') {
        localStorage.setItem('startpage_scratchpad_v2', activeBuf.content);
        localStorage.setItem('startpage_scratchpad', activeBuf.content);
      }
    } catch (e) {
      console.warn('[Studio] Échec de la persistance locale :', e);
    }
  }

  function getActiveBuffer() {
    return buffers.find(b => b.id === activeBufferId) || buffers[0];
  }

  function renderTabs() {
    if (!tabsBarEl) return;
    tabsBarEl.innerHTML = '';

    const langIcons = {
      python: 'fa-brands fa-python text-amber',
      c: 'fa-solid fa-c text-accent',
      java: 'fa-brands fa-java text-coral',
      oz: 'fa-solid fa-wand-magic-sparkles text-purple',
      javascript: 'fa-brands fa-js text-warning',
      bash: 'fa-solid fa-terminal text-success',
      markdown: 'fa-brands fa-markdown text-accent'
    };

    buffers.forEach(buf => {
      const tab = document.createElement('div');
      tab.className = `studio-tab ${buf.id === activeBufferId ? 'active' : ''}`;
      tab.dataset.bufId = buf.id;

      const iconClass = langIcons[buf.lang] || 'fa-solid fa-file-code';
      tab.innerHTML = `
        <i class="${iconClass}"></i>
        <span class="tab-title">${buf.name}</span>
        ${buffers.length > 1 ? `<span class="tab-close-btn" data-close-id="${buf.id}" title="Fermer le fichier">&times;</span>` : ''}
      `;

      tab.addEventListener('click', (e) => {
        if (e.target.closest('.tab-close-btn')) return;
        switchTab(buf.id);
      });

      const closeBtn = tab.querySelector('.tab-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          closeTab(buf.id);
        });
      }

      tabsBarEl.appendChild(tab);
    });
  }

  function switchTab(bufId) {
    const activeBuf = getActiveBuffer();
    if (activeBuf && editorEl) {
      activeBuf.content = editorEl.value;
      saveBuffers();
    }

    activeBufferId = bufId;
    localStorage.setItem('startpage_studio_active_tab', bufId);

    const newBuf = getActiveBuffer();
    if (!newBuf) return;

    if (editorEl) {
      editorEl.value = newBuf.content;
      editorEl.selectionStart = 0;
      editorEl.selectionEnd = 0;
    }

    // Sync langue
    if (newBuf.lang !== 'markdown') {
      currentLang = newBuf.lang;
      if (langSelectEl) langSelectEl.value = currentLang;
      updateSnippetOptions(currentLang);
      updateTerminalBadge();
    } else {
      setStudioMode('notes');
    }

    renderTabs();
    updateEditorStats();
    updateLineNumbers();
  }

  function closeTab(bufId) {
    if (buffers.length <= 1) return;
    const index = buffers.findIndex(b => b.id === bufId);
    if (index === -1) return;

    buffers.splice(index, 1);
    if (activeBufferId === bufId) {
      const nextBuf = buffers[Math.max(0, index - 1)];
      activeBufferId = nextBuf.id;
    }
    saveBuffers();
    renderTabs();
    const curr = getActiveBuffer();
    if (editorEl && curr) {
      editorEl.value = curr.content;
    }
    updateLineNumbers();
    updateEditorStats();
  }

  function createNewTab() {
    const name = prompt('Nom du nouveau fichier (ex: test.py, maths.oz, notes.md, demo.c) :', 'script.py');
    if (!name || !name.trim()) return;

    const trimmed = name.trim();
    let lang = 'python';
    if (trimmed.endsWith('.c')) lang = 'c';
    else if (trimmed.endsWith('.java')) lang = 'java';
    else if (trimmed.endsWith('.oz')) lang = 'oz';
    else if (trimmed.endsWith('.js')) lang = 'javascript';
    else if (trimmed.endsWith('.sh') || trimmed.endsWith('.bash')) lang = 'bash';
    else if (trimmed.endsWith('.md') || trimmed.endsWith('.txt')) lang = 'markdown';

    const starter = STARTER_SNIPPETS[lang] ? STARTER_SNIPPETS[lang].default : '';
    const newBuf = {
      id: 'buf-' + Date.now(),
      name: trimmed,
      lang: lang,
      content: starter
    };

    buffers.push(newBuf);
    saveBuffers();
    switchTab(newBuf.id);
  }

  // ========================================================
  // 5. GESTION DES NUMÉROS DE LIGNES & STATS
  // ========================================================
  function updateLineNumbers() {
    if (!editorEl || !lineNumbersEl) return;
    const lines = editorEl.value.split('\n').length;
    let nums = '';
    for (let k = 1; k <= lines; k++) {
      nums += k + '\n';
    }
    lineNumbersEl.textContent = nums;
    if (linesCountEl) {
      linesCountEl.textContent = `${lines} ${lines > 1 ? 'lignes' : 'ligne'}`;
    }
  }

  function updateEditorStats() {
    if (!editorEl) return;
    const text = editorEl.value || '';
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;

    if (statsInfoEl) {
      statsInfoEl.textContent = `${words} ${words > 1 ? 'mots' : 'mot'} • ${chars} car.`;
    }

    // Cursor position
    const pos = editorEl.selectionStart || 0;
    const linesUpToPos = text.substring(0, pos).split('\n');
    const lineNum = linesUpToPos.length;
    const colNum = linesUpToPos[linesUpToPos.length - 1].length + 1;

    if (cursorPosEl) {
      cursorPosEl.textContent = `Ln ${lineNum}, Col ${colNum}`;
    }
  }

  // ========================================================
  // 6. TERMINAL CYBERDECK (SORTIE, PROMPT & COMMANDES)
  // ========================================================
  function printToTerminal(text, type = 'stdout') {
    if (!termScreenEl) return;

    const line = document.createElement('div');
    line.className = `term-line ${type}`;

    if (type === 'cmd') {
      line.innerHTML = `<span class="terminal-prompt-symbol">❯</span> <span style="color:#ffffff;">${escapeHtml(text)}</span>`;
    } else if (type === 'oz-browse') {
      line.innerHTML = `<span class="term-line oz-browse"><i class="fa-solid fa-wand-magic-sparkles"></i> ${escapeHtml(text)}</span>`;
    } else {
      line.textContent = text;
    }

    termScreenEl.appendChild(line);
    termScreenEl.scrollTop = termScreenEl.scrollHeight;
  }

  function clearTerminal() {
    if (!termScreenEl) return;
    termScreenEl.innerHTML = `
      <div class="term-banner">
┌─────────────────────────────────────────────────────────────┐
│ ⚡ Violet Dev Studio // Interactive Cyberdeck Terminal v1.0 │
│ C (GCC 13), Java 21, Python 3.11, Oz (CTM), JS, Bash      │
└─────────────────────────────────────────────────────────────┘
      </div>
    `;
    printToTerminal("Terminal prêt. Tapez 'run' pour lancer ou 'help' pour la liste des commandes.", 'system');
  }

  function updateTerminalBadge() {
    const badge = document.getElementById('terminal-tab-title');
    if (!badge) return;

    const langNames = {
      python: 'python@cpython-3.11',
      c: 'gcc@13.2.0-c',
      java: 'java@openjdk-21',
      oz: 'oz@mozart-engine-ctm',
      javascript: 'node@v8-sandbox',
      bash: 'bash@linux-shell'
    };

    badge.textContent = `tty1 • ${langNames[currentLang] || currentLang}`;
  }

  function setExecutionStatus(state, durationMs = 0) {
    if (!termBadgeEl || !termStatusLabelEl) return;

    termBadgeEl.className = `term-status-badge ${state}`;
    if (state === 'running') {
      termStatusLabelEl.textContent = 'Exécution en cours...';
      if (runBtnEl) {
        runBtnEl.classList.add('running');
        runBtnEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Calcul...</span>';
      }
    } else if (state === 'ready') {
      termStatusLabelEl.textContent = 'Prêt';
      if (runBtnEl) {
        runBtnEl.classList.remove('running');
        runBtnEl.innerHTML = '<i class="fa-solid fa-play"></i> <span>Exécuter</span> <kbd>Ctrl+↵</kbd>';
      }
    } else if (state === 'success') {
      termStatusLabelEl.textContent = 'Terminé avec succès';
      if (runBtnEl) {
        runBtnEl.classList.remove('running');
        runBtnEl.innerHTML = '<i class="fa-solid fa-play"></i> <span>Exécuter</span> <kbd>Ctrl+↵</kbd>';
      }
    } else if (state === 'error') {
      termStatusLabelEl.textContent = 'Erreur d\'exécution';
      if (runBtnEl) {
        runBtnEl.classList.remove('running');
        runBtnEl.innerHTML = '<i class="fa-solid fa-play"></i> <span>Exécuter</span> <kbd>Ctrl+↵</kbd>';
      }
    }

    if (termExecTimeEl && durationMs > 0) {
      termExecTimeEl.textContent = `${durationMs} ms`;
    }
  }

  // ========================================================
  // 7. EXÉCUTEUR MULTI-LANGAGES PRINCIPAL
  // ========================================================
  async function executeCurrentCode() {
    if (!editorEl) return;
    const code = editorEl.value;
    if (!code.trim()) {
      printToTerminal('Code vide. Écrivez une fonction ou chargez un modèle.', 'warning');
      return;
    }

    const startTime = performance.now();
    setExecutionStatus('running');
    printToTerminal(`--- Lancement de l'exécution [${currentLang.toUpperCase()}] ---`, 'system');

    try {
      // 1. PRIORITÉ ABSOLUE : Moteur local natif (runner.py) si actif
      const hasLocal = (localRunnerUrl !== null) || (await probeLocalRunner());
      if (hasLocal && localRunnerUrl) {
        printToTerminal(`[Moteur Local] Exécution avec vos compilateurs système (${currentLang.toUpperCase()})...`, 'system');
        const res = await executeLocalRunner(currentLang, code, '');

        if (res.compiler_error) {
          const compMsg = res.compiler_error.trim();
          if (compMsg) {
            printToTerminal('--- Sortie du compilateur ---', 'error');
            printToTerminal(compMsg, 'error');
          }
        }

        if (res.program_output) {
          printToTerminal(res.program_output.trimEnd(), 'stdout');
        }

        if (res.program_error) {
          printToTerminal(res.program_error.trimEnd(), 'error');
        }

        const elapsed = res.time_ms !== undefined ? res.time_ms : Math.round(performance.now() - startTime);
        if (res.status === 0) {
          setExecutionStatus('success', elapsed);
          printToTerminal(`✔ Exécution locale réussie (${res.engine || 'natif'}) en ${elapsed} ms.`, 'success');
        } else {
          setExecutionStatus('error', elapsed);
          printToTerminal(`✖ Code retour d'erreur : ${res.status} (en ${elapsed} ms)`, 'error');
        }
        return;
      }

      // 2. FALLBACK 1 : Oz et JavaScript tournent à 100% dans le navigateur
      if (currentLang === 'oz') {
        // Exécution Oz locale dans le navigateur
        const count = evaluateOzCode(code, (msg, type) => {
          printToTerminal(msg, type);
        });
        const elapsed = Math.round(performance.now() - startTime);
        setExecutionStatus('success', elapsed);
        printToTerminal(`✔ Programme Oz exécuté avec succès en ${elapsed} ms (${count} instructions).`, 'success');
      } else if (currentLang === 'javascript') {
        // Exécution JS sandboxée avec redirection de la console
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        try {
          console.log = (...args) => printToTerminal(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '), 'stdout');
          console.warn = (...args) => printToTerminal(args.join(' '), 'warning');
          console.error = (...args) => printToTerminal(args.join(' '), 'error');

          const fn = new Function(code);
          const result = fn();
          if (result !== undefined) {
            printToTerminal(`Retour : ${typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}`, 'success');
          }
        } finally {
          console.log = originalLog;
          console.warn = originalWarn;
          console.error = originalError;
        }

        const elapsed = Math.round(performance.now() - startTime);
        setExecutionStatus('success', elapsed);
        printToTerminal(`✔ Exécution JS terminée en ${elapsed} ms.`, 'success');
      } else if (currentLang === 'python') {
        // Exécution Python locale embarquée via Skulpt (zéro délai réseau, ~20ms)
        await executeInBrowserPython(code, (msg, type) => {
          printToTerminal(msg, type);
        });
        const elapsed = Math.round(performance.now() - startTime);
        setExecutionStatus('success', elapsed);
        printToTerminal(`✔ Programme Python exécuté avec succès en ${elapsed} ms (moteur local).`, 'success');
      } else {
        // 3. FALLBACK 2 : Cloud Wandbox pour C et Java (si runner local pas allumé)
        printToTerminal(`[Mode Cloud] Moteur local non détecté. Connexion au cluster distant...`, 'system');
        printToTerminal(`💡 Pour exécuter directement sur votre machine en 10ms (comme VS Code) : lancez './runner.py' dans votre terminal !`, 'system');

        let compilerKey = 'cpython-3.11.10';
        let codeToSend = code;

        if (currentLang === 'c') {
          compilerKey = 'gcc-13.2.0-c';
        } else if (currentLang === 'java') {
          compilerKey = 'openjdk-jdk-21+35';
          if (!code.includes('class ')) {
            codeToSend = `public class Main {\n    public static void main(String[] args) {\n${code}\n    }\n}`;
          } else if (code.includes('public class ') && !code.includes('public class Main')) {
            codeToSend = code.replace(/public\s+class\s+([A-Za-z0-9_]+)/, 'class $1');
          }
        } else if (currentLang === 'bash') {
          compilerKey = 'bash';
        }

        const res = await executeWandbox(compilerKey, codeToSend);

        if (res.compiler_error || res.compiler_message) {
          const compMsg = (res.compiler_error || res.compiler_message).trim();
          if (compMsg) {
            printToTerminal('--- Erreur de compilation ---', 'error');
            printToTerminal(compMsg, 'error');
          }
        }

        if (res.program_output) {
          printToTerminal(res.program_output.trimEnd(), 'stdout');
        }

        if (res.program_error) {
          printToTerminal(res.program_error.trimEnd(), 'error');
        }

        const elapsed = Math.round(performance.now() - startTime);
        if (res.status === '0') {
          setExecutionStatus('success', elapsed);
          printToTerminal(`✔ Processus terminé (Code retour: 0) en ${elapsed} ms`, 'success');
        } else {
          setExecutionStatus('error', elapsed);
          printToTerminal(`✖ Processus terminé avec le code erreur : ${res.status || 'inconnu'}`, 'error');
        }
      }
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      setExecutionStatus('error', elapsed);
      printToTerminal(`Erreur : ${err.message}`, 'error');
      if (err.name === 'AbortError' || err.message.includes('fetch')) {
        printToTerminal('[Astuce] Wandbox est inaccessible ou vous êtes hors-ligne. Vous pouvez toujours tester vos fonctions en Oz et en JavaScript directement sans connexion !', 'system');
      }
    }
  }

  // ========================================================
  // 8. INTERACTION TERMINAL CLI PROMPT
  // ========================================================
  function handleTerminalCommand(rawCmd) {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    printToTerminal(cmd, 'cmd');

    const parts = cmd.split(/\s+/);
    const action = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').toLowerCase();

    switch (action) {
      case 'run':
        executeCurrentCode();
        break;
      case 'clear':
      case 'cls':
        clearTerminal();
        break;
      case 'help':
        printToTerminal(`Commandes disponibles :
  run            - Exécute le code actuellement ouvert
  clear          - Efface la console du terminal
  status         - État du moteur local vs cloud
  lang <nom>     - Bascule le langage (ex: lang oz, lang c, lang python, lang java)
  template <nom> - Charge un modèle (ex: template quicksort, template list)
  date           - Affiche l'heure et la date système
  about          - Informations sur le studio de code
  help           - Affiche ce menu d'aide`, 'stdout');
        break;
      case 'status':
      case 'engine':
      case 'local':
        if (localRunnerUrl) {
          printToTerminal(`⚡ MOTEUR LOCAL ACTIF sur ${localRunnerUrl}
Compilateurs système connectés : GCC, Python 3, Java (javac), Oz (ozc/ozengine), Bash.
Vos exécutions tournent à vitesse native (~10-50ms) sur votre processeur.`, 'success');
        } else {
          printToTerminal(`Moteur Local inactif. Le studio utilise le mode hybride (Oz & JS en local, C/Java via fallback cloud).
💡 Pour tout exécuter sur votre PC à la vitesse de VS Code :
Lancez './runner.py' dans votre terminal !`, 'warning');
        }
        break;
      case 'lang':
        if (['python', 'c', 'java', 'oz', 'javascript', 'bash'].includes(arg)) {
          currentLang = arg;
          if (langSelectEl) langSelectEl.value = currentLang;
          updateSnippetOptions(currentLang);
          updateTerminalBadge();
          printToTerminal(`Langage actif basculé vers : ${currentLang.toUpperCase()}`, 'success');
        } else {
          printToTerminal(`Langage inconnu : '${arg}'. Choix possibles : python, c, java, oz, javascript, bash`, 'warning');
        }
        break;
      case 'oz':
      case 'python':
      case 'c':
      case 'java':
      case 'js':
        const map = { js: 'javascript' };
        currentLang = map[action] || action;
        if (langSelectEl) langSelectEl.value = currentLang;
        updateSnippetOptions(currentLang);
        updateTerminalBadge();
        printToTerminal(`Langage actif : ${currentLang.toUpperCase()}`, 'success');
        break;
      case 'date':
        printToTerminal(new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'medium' }), 'stdout');
        break;
      case 'about':
        printToTerminal('Violet Dev Studio // Conçu pour les cours de programmation (C, Oz, Java, Python). Support complet des fonctions, structures récursives et tests rapides.', 'system');
        break;
      default:
        printToTerminal(`Commande inconnue : '${action}'. Tapez 'help' pour voir les commandes disponibles.`, 'warning');
    }
  }

  // ========================================================
  // 9. MODES DU STUDIO (Code Playground / Bloc-Notes MD / Split)
  // ========================================================
  function setStudioMode(mode) {
    currentMode = mode;
    const bodyEl = document.querySelector('.studio-body');
    const mdToolbar = document.getElementById('studio-md-toolbar');
    const langPickerGroup = document.getElementById('studio-lang-picker-group');
    const snippetPickerGroup = document.getElementById('studio-snippet-picker-group');
    const runBtn = document.getElementById('studio-run-btn');

    document.querySelectorAll('.studio-mode-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.studioMode === mode);
    });

    if (mode === 'notes') {
      if (bodyEl) bodyEl.classList.add('mode-notes-only');
      if (mdToolbar) mdToolbar.hidden = false;
      if (langPickerGroup) langPickerGroup.style.display = 'none';
      if (snippetPickerGroup) snippetPickerGroup.style.display = 'none';
      if (runBtn) runBtn.style.display = 'none';
      if (modeStatusEl) modeStatusEl.textContent = 'Mode Bloc-Notes & Markdown';

      // Basculer sur le buffer notes.md si disponible
      const notesBuf = buffers.find(b => b.id === 'notes-md' || b.lang === 'markdown');
      if (notesBuf && activeBufferId !== notesBuf.id) {
        switchTab(notesBuf.id);
      }
    } else if (mode === 'code') {
      if (bodyEl) bodyEl.classList.remove('mode-notes-only');
      if (mdToolbar) mdToolbar.hidden = true;
      if (langPickerGroup) langPickerGroup.style.display = 'flex';
      if (snippetPickerGroup) snippetPickerGroup.style.display = 'flex';
      if (runBtn) runBtn.style.display = 'inline-flex';
      if (modeStatusEl) modeStatusEl.textContent = 'Mode Code Playground';

      // Si on était sur notes.md, repasser sur le premier buffer code
      const curr = getActiveBuffer();
      if (curr && curr.lang === 'markdown') {
        const codeBuf = buffers.find(b => b.lang !== 'markdown');
        if (codeBuf) switchTab(codeBuf.id);
      }
    } else if (mode === 'split') {
      if (bodyEl) bodyEl.classList.remove('mode-notes-only');
      if (mdToolbar) mdToolbar.hidden = false;
      if (langPickerGroup) langPickerGroup.style.display = 'flex';
      if (snippetPickerGroup) snippetPickerGroup.style.display = 'flex';
      if (runBtn) runBtn.style.display = 'inline-flex';
      if (modeStatusEl) modeStatusEl.textContent = 'Mode Vue Scindée & Terminal';
    }
  }

  // ========================================================
  // 10. SNIPPETS & CHEATSHEET
  // ========================================================
  function updateSnippetOptions(lang) {
    if (!snippetSelectEl) return;
    snippetSelectEl.innerHTML = '<option value="" disabled selected>📂 Modèles & Snippets...</option>';

    const snippets = STARTER_SNIPPETS[lang] || {};
    Object.keys(snippets).forEach(key => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = key.charAt(0).toUpperCase() + key.slice(1);
      snippetSelectEl.appendChild(opt);
    });
  }

  function renderCheatsheet(lang) {
    const container = document.getElementById('cheatsheet-content');
    const titleEl = document.getElementById('cheatsheet-title');
    if (!container) return;

    document.querySelectorAll('.lang-tag-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.memoLang === lang);
    });

    if (lang === 'oz') {
      if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles text-accent"></i> Mémo Syntaxe : Oz & Mozart (CTM)';
      container.innerHTML = `
        <div class="memo-snippet-box" data-insert="declare\nfun {Fact N}\n   if N == 0 then 1\n   else N * {Fact N - 1}\n   end\nend\n{Browse {Fact 5}}">
          <div class="memo-snippet-head">
            <span>Fonction récursive (Fact)</span>
            <span class="memo-insert-pill">Insérer</span>
          </div>
          <pre>fun {Fact N}
   if N == 0 then 1
   else N * {Fact N - 1} end
end</pre>
        </div>
        <div class="memo-snippet-box" data-insert="declare\nfun {SumList L}\n   case L\n   of nil then 0\n   [] H|T then H + {SumList T}\n   end\nend\n{Browse {SumList [1 2 3 4]}}">
          <div class="memo-snippet-head">
            <span>Pattern Matching sur Liste (H|T)</span>
            <span class="memo-insert-pill">Insérer</span>
          </div>
          <pre>case L
of nil then 0
[] H|T then H + {SumList T} end</pre>
        </div>
        <div class="memo-snippet-box" data-insert="local X Y in\n   X = 10\n   Y = 20\n   {Browse X + Y}\nend">
          <div class="memo-snippet-head">
            <span>Portée locale (local ... in ... end)</span>
            <span class="memo-insert-pill">Insérer</span>
          </div>
          <pre>local X Y in
   X = 10 Y = 20
   {Browse X + Y}
end</pre>
        </div>
      `;
    } else if (lang === 'c') {
      if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-c text-accent"></i> Mémo C : Pointeurs, Tableaux & Alloc';
      container.innerHTML = `
        <div class="memo-snippet-box" data-insert="void swap(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}">
          <div class="memo-snippet-head">
            <span>Passage par pointeur (swap)</span>
            <span class="memo-insert-pill">Insérer</span>
          </div>
          <pre>void swap(int *a, int *b) {
    int temp = *a;
    *a = *b; *b = temp;
}</pre>
        </div>
        <div class="memo-snippet-box" data-insert="int *tab = malloc(n * sizeof(int));\nif (!tab) return 1;\n// ...\nfree(tab);">
          <div class="memo-snippet-head">
            <span>Allocation dynamique (malloc/free)</span>
            <span class="memo-insert-pill">Insérer</span>
          </div>
          <pre>int *tab = malloc(n * sizeof(int));
free(tab);</pre>
        </div>
      `;
    } else if (lang === 'python') {
      if (titleEl) titleEl.innerHTML = '<i class="fa-brands fa-python text-accent"></i> Mémo Python : Listes & Fonctions';
      container.innerHTML = `
        <div class="memo-snippet-box" data-insert="carres = [x**2 for x in range(10) if x % 2 == 0]\nprint(carres)">
          <div class="memo-snippet-head">
            <span>List Comprehension</span>
            <span class="memo-insert-pill">Insérer</span>
          </div>
          <pre>[x**2 for x in range(10) if x % 2 == 0]</pre>
        </div>
        <div class="memo-snippet-box" data-insert="def memoize(f):\n    memo = {}\n    def helper(x):\n        if x not in memo:\n            memo[x] = f(x)\n        return memo[x]\n    return helper">
          <div class="memo-snippet-head">
            <span>Décorateur & Mémoïsation</span>
            <span class="memo-insert-pill">Insérer</span>
          </div>
          <pre>memo = {}
if x not in memo: memo[x] = f(x)</pre>
        </div>
      `;
    } else if (lang === 'java') {
      if (titleEl) titleEl.innerHTML = '<i class="fa-brands fa-java text-accent"></i> Mémo Java : Classe & Main';
      container.innerHTML = `
        <div class="memo-snippet-box" data-insert="public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello World!\");\n    }\n}">
          <div class="memo-snippet-head">
            <span>Squelette Main Standard</span>
            <span class="memo-insert-pill">Insérer</span>
          </div>
          <pre>public static void main(String[] args) {
    System.out.println("Hello");
}</pre>
        </div>
      `;
    }

    container.querySelectorAll('.memo-snippet-box').forEach(box => {
      box.addEventListener('click', () => {
        const toInsert = box.dataset.insert;
        if (toInsert && editorEl) {
          insertAtCursor(toInsert);
          if (typeof showToast === 'function') showToast('Extrait inséré dans le code !', 'success');
        }
      });
    });
  }

  // ========================================================
  // 11. OUTILS ÉDITEUR (TABULATION, INDENTATION, MARKDOWN)
  // ========================================================
  function insertAtCursor(text) {
    if (!editorEl) return;
    const start = editorEl.selectionStart;
    const end = editorEl.selectionEnd;
    const val = editorEl.value;
    editorEl.value = val.substring(0, start) + text + val.substring(end);
    editorEl.selectionStart = editorEl.selectionEnd = start + text.length;
    editorEl.focus();
    updateLineNumbers();
    updateEditorStats();
  }

  function handleEditorKeydown(e) {
    // 1. Raccourci Ctrl+Entrée / Cmd+Entrée pour exécuter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeCurrentCode();
      return;
    }

    // 2. Touche Tab pour insérer des espaces sans perdre le focus
    if (e.key === 'Tab') {
      e.preventDefault();
      const indent = currentLang === 'python' ? '    ' : '  ';
      insertAtCursor(indent);
      return;
    }

    // 3. Touche Entrée pour préserver l'indentation de la ligne courante
    if (e.key === 'Enter') {
      const start = editorEl.selectionStart;
      const text = editorEl.value;
      const currentLine = text.substring(0, start).split('\n').pop();
      const match = currentLine.match(/^\s+/);
      let indent = match ? match[0] : '';

      // Auto-indent supplémentaire après ':' ou '{' ou 'then'
      if (/[:{\[]\s*$/.test(currentLine) || /\b(then|else|do)\s*$/.test(currentLine)) {
        indent += (currentLang === 'python' ? '    ' : '  ');
      }

      if (indent.length > 0) {
        e.preventDefault();
        insertAtCursor('\n' + indent);
      }
    }
  }

  function formatCurrentCode() {
    if (!editorEl) return;
    const val = editorEl.value;
    if (currentLang === 'javascript') {
      try {
        // Simple alignement des blocs
        const lines = val.split('\n');
        let indentLevel = 0;
        const formatted = lines.map(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
            indentLevel = Math.max(0, indentLevel - 1);
          }
          const res = '  '.repeat(indentLevel) + trimmed;
          if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
            indentLevel++;
          }
          return res;
        }).join('\n');
        editorEl.value = formatted;
        if (typeof showToast === 'function') showToast('Code formaté', 'info');
      } catch {
        // no-op
      }
    } else {
      // Nettoyer les espaces de fin de ligne
      const cleaned = val.split('\n').map(l => l.trimEnd()).join('\n');
      editorEl.value = cleaned;
      if (typeof showToast === 'function') showToast('Espaces nettoyés', 'info');
    }
    updateLineNumbers();
    updateEditorStats();
  }

  function insertMarkdownSyntax(type) {
    if (!editorEl) return;
    const start = editorEl.selectionStart;
    const end = editorEl.selectionEnd;
    const val = editorEl.value;
    const selected = val.substring(start, end) || 'texte';

    let replacement = '';
    switch (type) {
      case 'bold': replacement = `**${selected}**`; break;
      case 'italic': replacement = `*${selected}*`; break;
      case 'heading': replacement = `\n## ${selected}\n`; break;
      case 'code': replacement = `\n\`\`\`${currentLang || 'python'}\n${selected}\n\`\`\`\n`; break;
      case 'inline-code': replacement = `\`${selected}\``; break;
      case 'link': replacement = `[${selected}](https://example.com)`; break;
      case 'task': replacement = `\n- [ ] ${selected}\n`; break;
      case 'list': replacement = `\n- ${selected}\n`; break;
      case 'quote': replacement = `\n> ${selected}\n`; break;
      case 'hr': replacement = `\n\n---\n\n`; break;
      default: replacement = selected;
    }

    editorEl.value = val.substring(0, start) + replacement + val.substring(end);
    editorEl.selectionStart = start + replacement.length;
    editorEl.selectionEnd = start + replacement.length;
    editorEl.focus();
    updateLineNumbers();
    updateEditorStats();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // ========================================================
  // 12. INITIALISATION GLOBALE DU STUDIO
  // ========================================================
  function initStudio() {
    editorEl = document.getElementById('notes-editor');
    lineNumbersEl = document.getElementById('studio-line-numbers');
    previewEl = document.getElementById('notes-preview');
    tabsBarEl = document.getElementById('studio-file-tabs');
    termScreenEl = document.getElementById('terminal-screen');
    termInputEl = document.getElementById('terminal-input');
    termBadgeEl = document.getElementById('terminal-status-badge');
    termStatusLabelEl = document.getElementById('terminal-status-label');
    termExecTimeEl = document.getElementById('terminal-exec-time');
    langSelectEl = document.getElementById('studio-lang-select');
    snippetSelectEl = document.getElementById('studio-snippet-select');
    runBtnEl = document.getElementById('studio-run-btn');
    modeStatusEl = document.getElementById('studio-mode-status');
    cursorPosEl = document.getElementById('studio-cursor-pos');
    statsInfoEl = document.getElementById('notes-stats-info');
    linesCountEl = document.getElementById('studio-lines-count');
    saveStatusTextEl = document.getElementById('notes-status-text');
    mdToolbarEl = document.getElementById('studio-md-toolbar');

    if (!editorEl) return;

    loadSavedBuffers();
    renderTabs();

    const activeBuf = getActiveBuffer();
    if (activeBuf) {
      editorEl.value = activeBuf.content;
      currentLang = activeBuf.lang === 'markdown' ? 'python' : activeBuf.lang;
      if (langSelectEl) langSelectEl.value = currentLang;
      updateSnippetOptions(currentLang);
    }

    updateLineNumbers();
    updateEditorStats();
    clearTerminal();
    updateTerminalBadge();
    renderCheatsheet('oz');
    probeLocalRunner();

    // Événements Éditeur
    let autoSaveTimer = null;
    editorEl.addEventListener('input', () => {
      updateLineNumbers();
      updateEditorStats();
      const curr = getActiveBuffer();
      if (curr) curr.content = editorEl.value;

      clearTimeout(autoSaveTimer);
      if (saveStatusTextEl) saveStatusTextEl.textContent = 'Enregistrement...';
      autoSaveTimer = setTimeout(() => {
        saveBuffers();
        if (saveStatusTextEl) saveStatusTextEl.textContent = 'Sauvegardé en local';
      }, 350);
    });

    editorEl.addEventListener('scroll', () => {
      if (lineNumbersEl) lineNumbersEl.scrollTop = editorEl.scrollTop;
    });

    editorEl.addEventListener('keydown', handleEditorKeydown);
    editorEl.addEventListener('keyup', updateEditorStats);
    editorEl.addEventListener('click', updateEditorStats);

    // Événements Boutons Mode
    document.querySelectorAll('.studio-mode-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        setStudioMode(pill.dataset.studioMode);
      });
    });

    // Sélecteur de langue
    if (langSelectEl) {
      langSelectEl.addEventListener('change', () => {
        currentLang = langSelectEl.value;
        const curr = getActiveBuffer();
        if (curr && curr.lang !== 'markdown') {
          curr.lang = currentLang;
        }
        updateSnippetOptions(currentLang);
        updateTerminalBadge();
        renderTabs();
        renderCheatsheet(currentLang);
        printToTerminal(`Environnement actif basculé : ${currentLang.toUpperCase()}`, 'system');
      });
    }

    // Sélecteur de modèle
    if (snippetSelectEl) {
      snippetSelectEl.addEventListener('change', () => {
        const snippetKey = snippetSelectEl.value;
        const langSnippets = STARTER_SNIPPETS[currentLang] || {};
        if (langSnippets[snippetKey]) {
          editorEl.value = langSnippets[snippetKey];
          const curr = getActiveBuffer();
          if (curr) curr.content = editorEl.value;
          saveBuffers();
          updateLineNumbers();
          updateEditorStats();
          if (typeof showToast === 'function') showToast(`Modèle ${snippetKey} chargé`, 'success');
        }
        snippetSelectEl.value = '';
      });
    }

    // Bouton Run
    if (runBtnEl) {
      runBtnEl.addEventListener('click', executeCurrentCode);
    }

    // Onglet nouveau fichier
    const newTabBtn = document.getElementById('studio-new-tab-btn');
    if (newTabBtn) newTabBtn.addEventListener('click', createNewTab);

    // Bouton Format
    const formatBtn = document.getElementById('studio-format-btn');
    if (formatBtn) formatBtn.addEventListener('click', formatCurrentCode);

    // Entrée Terminal CLI
    if (termInputEl) {
      termInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          handleTerminalCommand(termInputEl.value);
          termInputEl.value = '';
        }
      });
    }

    const termSendBtn = document.getElementById('terminal-send-btn');
    if (termSendBtn && termInputEl) {
      termSendBtn.addEventListener('click', () => {
        handleTerminalCommand(termInputEl.value);
        termInputEl.value = '';
      });
    }

    // Actions Terminal
    const termClearBtn = document.getElementById('terminal-clear-btn');
    if (termClearBtn) termClearBtn.addEventListener('click', clearTerminal);

    const termCopyBtn = document.getElementById('terminal-copy-btn');
    if (termCopyBtn && termScreenEl) {
      termCopyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(termScreenEl.innerText);
          if (typeof showToast === 'function') showToast('Logs du terminal copiés !', 'success');
        } catch {
          if (typeof showToast === 'function') showToast('Copie impossible', 'error');
        }
      });
    }

    // Toolbar Markdown
    document.querySelectorAll('.md-tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        insertMarkdownSyntax(btn.dataset.md);
      });
    });

    // Bascule Aperçu Markdown
    const mdToggleBtn = document.getElementById('notes-markdown-toggle');
    if (mdToggleBtn) {
      let isPreview = false;
      mdToggleBtn.addEventListener('click', () => {
        isPreview = !isPreview;
        if (isPreview && previewEl) {
          const renderFn = window.renderMarkdownToHtml || ((t) => `<div class="md-content"><pre>${escapeHtml(t)}</pre></div>`);
          previewEl.innerHTML = renderFn(editorEl.value);
          previewEl.hidden = false;
          mdToggleBtn.classList.add('active');
          if (saveStatusTextEl) saveStatusTextEl.textContent = 'Mode Aperçu Markdown';
        } else if (previewEl) {
          previewEl.hidden = true;
          mdToggleBtn.classList.remove('active');
          if (saveStatusTextEl) saveStatusTextEl.textContent = 'Sauvegardé en local';
          editorEl.focus();
        }
      });
    }

    // Bouton Copier le code/texte
    const copyBtn = document.getElementById('notes-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        if (!editorEl.value.trim()) return;
        try {
          await navigator.clipboard.writeText(editorEl.value);
          if (typeof showToast === 'function') showToast('Contenu copié dans le presse-papier !', 'success');
        } catch {
          editorEl.select();
          document.execCommand('copy');
          if (typeof showToast === 'function') showToast('Copié !', 'success');
        }
      });
    }

    // Bouton Télécharger
    const downloadBtn = document.getElementById('notes-download-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (!editorEl.value.trim()) return;
        const curr = getActiveBuffer();
        const extMap = { python: 'py', c: 'c', java: 'java', oz: 'oz', javascript: 'js', bash: 'sh', markdown: 'md' };
        const ext = extMap[curr ? curr.lang : currentLang] || 'txt';
        const filename = curr && curr.name ? curr.name : `code_${Date.now()}.${ext}`;

        const blob = new Blob([editorEl.value], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    }

    // Bouton Effacer
    const clearBtn = document.getElementById('notes-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (!editorEl.value.trim()) return;
        if (confirm('Voulez-vous vraiment effacer le contenu de ce fichier ?')) {
          editorEl.value = '';
          const curr = getActiveBuffer();
          if (curr) curr.content = '';
          saveBuffers();
          updateLineNumbers();
          updateEditorStats();
          if (previewEl) previewEl.innerHTML = '';
          if (typeof showToast === 'function') showToast('Fichier effacé', 'info');
        }
      });
    }

    // Chips du cheatsheet
    document.querySelectorAll('.lang-tag-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        renderCheatsheet(chip.dataset.memoLang);
      });
    });
  }

  // Démarrage au chargement du DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStudio);
  } else {
    initStudio();
  }

  // Exposer les méthodes utiles pour l'écosystème global
  window.initStudio = initStudio;
  window.executeCurrentCode = executeCurrentCode;
})();
