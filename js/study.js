/* =========================================================================
   FlashMind Pro v12.0 — Study Engine, AnkiDroid Toolbar, Brainscape CBR,
   Whiteboard Canvas, Undo Stack, Audio/TTS, Custom/Filtered Study & Importers
   ========================================================================= */

let isInStudyMode = false;
let lastStudiedDeckId = null;
let currentPlayingAudio = null;
let whiteboardActive = false;
let wbDrawing = false;
let wbCtx = null;

// ===== Smart Mix & Filtered / Custom Study Session Builder =====
function startQuickStudy() {
    const deckIds = Object.keys(state.decks);
    if (deckIds.length === 0) {
        createStarterDecks();
        renderHome();
        renderDecks();
        showToast(currentLang === 'fa' ? 'بسته‌های نمونه بارگذاری شدند! شروع مطالعه هوشمند...' : 'Starter decks loaded! Starting Smart Mix...', 'success');
    }
    startSmartMixStudy();
}

function startSmartMixStudy() {
    const allDeckIds = Object.keys(state.decks);
    if (!allDeckIds.length) {
        showImportModal();
        return;
    }
    startStudy('__ALL__', false);
}

function showCustomStudyModal() {
    const deckOptions = Object.keys(state.decks).map(id =>
        `<option value="${id}">${escapeHtml(state.decks[id].name)}</option>`
    ).join('');

    openModal(`
        <div class="modal-header-bar">
            <h2 class="modal-title">🎯 ${t('customStudy')}</h2>
            <button class="icon-btn" onclick="closeModalDirect()">✕</button>
        </div>
        <div class="form-group">
            <label>${t('deck')}</label>
            <select id="csDeckSelect">
                <option value="__ALL__">${t('allDecks')} (Smart Mix)</option>
                ${deckOptions}
            </select>
        </div>
        <div class="form-group">
            <label>${currentLang === 'fa' ? 'نوع فیلتر مطالعه سفارشی' : 'Session Filter Criteria'}</label>
            <select id="csFilterType">
                <option value="weak">${currentLang === 'fa' ? '⚠️ کارت‌های ضعیف (اطمینان ۱ و ۲)' : '⚠️ Weak Cards (Confidence 1–2)'}</option>
                <option value="due">${currentLang === 'fa' ? '⏰ فقط کارت‌های موعد مرور امروز' : '⏰ Due Cards Only'}</option>
                <option value="new">${currentLang === 'fa' ? '🆕 فقط کارت‌های جدید (پیش‌خوانی)' : '🆕 New Cards Only'}</option>
                <option value="flagged">${currentLang === 'fa' ? '🚩 کارت‌های پرچم‌دار (Flagged)' : '🚩 Flagged Cards Only'}</option>
                <option value="leech">${currentLang === 'fa' ? '🩸 کارت‌های فرّار (Leeches: خطا ≥ ۴)' : '🩸 Leech Cards (Lapses ≥ 4)'}</option>
                <option value="cram">${currentLang === 'fa' ? '⚡ مرور فشرده همه کارت‌ها (شب امتحان)' : '⚡ Cram All Cards (Ignore Schedule)'}</option>
            </select>
        </div>
        <div class="form-group">
            <label>${currentLang === 'fa' ? 'حداکثر تعداد کارت در این جلسه' : 'Maximum Cards in Session'}</label>
            <select id="csLimit">
                <option value="20">20</option>
                <option value="50" selected>50</option>
                <option value="100">100</option>
                <option value="250">250</option>
            </select>
        </div>
        <div class="form-group">
            <label>${currentLang === 'fa' ? 'فیلتر برچسب خاص (اختیاری)' : 'Filter by Tag (Optional)'}</label>
            <input type="text" id="csTagInput" placeholder="${currentLang === 'fa' ? 'مثلاً IELTS یا Anatomy' : 'e.g. IELTS, Anatomy'}"/>
        </div>
        <button class="btn btn-primary btn-full" onclick="launchCustomStudy()">🚀 ${t('studyNow')}</button>
    `);
}

function launchCustomStudy() {
    const deckId = document.getElementById('csDeckSelect').value;
    const filterType = document.getElementById('csFilterType').value;
    const limit = parseInt(document.getElementById('csLimit').value, 10) || 50;
    const tagFilter = (document.getElementById('csTagInput').value || '').trim().toLowerCase();

    const now = Date.now();
    let pool = [];

    for (const cid in state.cards) {
        const c = state.cards[cid];
        if (!c || c.suspended) continue;
        if (deckId !== '__ALL__' && c.deckId !== deckId && !isSubdeckOf(c.deckId, deckId)) continue;
        if (tagFilter) {
            const hasTag = (c.tags || []).some(tg => tg.toLowerCase().includes(tagFilter));
            if (!hasTag) continue;
        }

        const conf = getCardConfidenceScore(c);
        if (filterType === 'weak' && !(conf >= 1 && conf <= 2)) continue;
        if (filterType === 'due' && !((c.status === 'learning' || c.status === 'review') && (c.dueDate || 0) <= now)) continue;
        if (filterType === 'new' && c.status !== 'new') continue;
        if (filterType === 'flagged' && !c.flag) continue;
        if (filterType === 'leech' && (c.lapses || 0) < 4) continue;

        pool.push({ ...c, id: cid, type: c.status || 'review' });
    }

    if (pool.length === 0) {
        showToast(t('noCardsFound'), 'info');
        return;
    }

    if (state.settings.shuffle) pool = shuffleArray(pool);
    pool = pool.slice(0, limit);

    closeModalDirect();
    beginStudyWithPool(deckId, pool, filterType === 'cram' ? (currentLang === 'fa' ? 'مرور فشرده' : 'Cram Session') : t('customStudy'));
}

function startStudy(deckId, forceAll = false) {
    const isAll = deckId === '__ALL__';
    if (!isAll && !state.decks[deckId]) return;

    const now = Date.now();
    let dueCards = [];

    for (const cid in state.cards) {
        const card = state.cards[cid];
        if (!isCardAvailable(card)) continue;
        if (!isAll && card.deckId !== deckId && !isSubdeckOf(card.deckId, deckId)) continue;

        const st = card.status || 'new';
        if (forceAll) {
            dueCards.push({ ...card, id: cid, type: st });
        } else {
            if (st === 'new') dueCards.push({ ...card, id: cid, type: 'new' });
            else if (st === 'learning' && (card.dueDate || 0) <= now) dueCards.push({ ...card, id: cid, type: 'learning' });
            else if (st === 'review' && (card.dueDate || 0) <= now) dueCards.push({ ...card, id: cid, type: 'review' });
        }
    }

    const mode = state.settings.studyMode || 'brainscape';
    let studyCards = [...dueCards];

    if (!forceAll) {
        if (mode === 'cram') {
            // If cram mode selected and due cards are empty, include all available cards from deck
            if (studyCards.length === 0) {
                for (const cid in state.cards) {
                    const card = state.cards[cid];
                    if (!isCardAvailable(card)) continue;
                    if (!isAll && card.deckId !== deckId && !isSubdeckOf(card.deckId, deckId)) continue;
                    studyCards.push({ ...card, id: cid, type: card.status || 'review' });
                }
            }
            // Prioritize lower confidence first (Brainscape style)
            studyCards.sort((a, b) => getCardConfidenceScore(a) - getCardConfidenceScore(b));
            studyCards = studyCards.slice(0, 80);
        } else {
            const newPool = studyCards.filter(c => c.type === 'new');
            const lrnPool = studyCards.filter(c => c.type === 'learning');
            const revPool = studyCards.filter(c => c.type === 'review');

            const remNew = Math.max(0, (state.settings.newCardsPerDay || 20) - (state.stats.todayNewStudied || 0));
            const maxNew = forceAll ? newPool.length : remNew;
            const limitedNew = newPool.slice(0, maxNew);
            const limitedRev = revPool.slice(0, state.settings.reviewsPerDay || 200);

            studyCards = [...lrnPool, ...limitedNew, ...limitedRev];
        }
    }

    if (state.settings.shuffle) {
        studyCards = shuffleArray(studyCards);
    }

    // Learning cards appear early like AnkiDroid
    const priority = { learning: 0, review: 1, new: 2 };
    if (!state.settings.shuffle) {
        studyCards.sort((a, b) => (priority[a.type] ?? 1) - (priority[b.type] ?? 1));
    }

    const title = isAll
        ? t('smartMix')
        : (state.decks[deckId]?.name || t('decks'));

    beginStudyWithPool(deckId, studyCards, title);
}

function beginStudyWithPool(deckId, studyCards, sessionTitle) {
    lastStudiedDeckId = deckId;
    isInStudyMode = true;
    whiteboardActive = false;
    studyUndoStack = [];

    const header = document.getElementById('appHeader');
    if (header) header.classList.add('hidden');
    const nav = document.getElementById('bottomNav');
    if (nav) nav.classList.add('study-hidden');

    state.currentStudy = {
        deckId,
        title: sessionTitle,
        cards: studyCards,
        currentIndex: 0,
        answered: {},
        total: studyCards.length,
        startTime: Date.now(),
        xpEarned: 0,
        cardTimes: {},
        ratings: {},
        ratingsHistory: []
    };

    navigateTo('studyPage');

    if (studyCards.length === 0) {
        showStudyComplete(deckId);
        return;
    }

    renderStudyCard();
}

function exitStudy() {
    stopAllStudyAudio();
    state.currentStudy = null;
    isInStudyMode = false;
    whiteboardActive = false;
    studyUndoStack = [];

    const header = document.getElementById('appHeader');
    if (header) header.classList.remove('hidden');
    const nav = document.getElementById('bottomNav');
    if (nav) nav.classList.remove('study-hidden');

    navigateTo('homePage');
}

// ===== Render Active Flashcard =====
async function renderStudyCard() {
    const study = state.currentStudy;
    if (!study) return;
    if (study.currentIndex >= study.cards.length) {
        showStudyComplete(study.deckId);
        return;
    }

    const rawQueueCard = study.cards[study.currentIndex];
    const liveCard = state.cards[rawQueueCard.id] || rawQueueCard;
    const card = { ...liveCard, id: rawQueueCard.id, type: rawQueueCard.type || liveCard.status || 'new' };

    const container = document.getElementById('studyContainer');
    if (!container) return;

    const mediaFiles = [card.audioFile, card.audioFile2, card.audioFile3, card.imageFile].filter(Boolean);
    if (mediaFiles.length > 0) await preloadMediaUrls(mediaFiles);

    const mode = state.settings.studyMode || 'brainscape';
    const isMCQ = mode === 'mcq' || card.cardType === 'mcq';
    const isTyping = mode === 'typing';
    const isBrainscape = mode === 'brainscape' && !isMCQ && !isTyping;

    // Calculate Remaining Queue Counts
    const remaining = study.cards.slice(study.currentIndex);
    const remNew = remaining.filter(c => c.type === 'new').length;
    const remLrn = remaining.filter(c => c.type === 'learning').length;
    const remRev = remaining.filter(c => c.type !== 'new' && c.type !== 'learning').length;

    const progress = study.total > 0 ? Math.round((study.currentIndex / study.total) * 100) : 0;
    const colors = { 1: 'var(--cbr-1)', 2: 'var(--cbr-2)', 3: 'var(--cbr-3)', 4: 'var(--cbr-4)', 5: 'var(--cbr-5)' };
    const lastRating = study.ratingsHistory.length ? study.ratingsHistory[study.ratingsHistory.length - 1] : 0;
    const headerBarColor = (isBrainscape && lastRating) ? colors[lastRating] : 'var(--accent)';

    const flagIcons = { 1: '🚩', 2: '🟧', 3: '🟩', 4: '🟦' };
    const flagBadge = card.flag ? `<span class="card-flag-indicator" title="Flag ${card.flag}">${flagIcons[card.flag] || '🚩'}</span>` : '';

    const frontHtml = buildFrontCardHtml(card, isMCQ);
    const backHtml = buildBackCardHtml(card);

    container.innerHTML = `
        <div class="study-topbar">
            <div class="study-topbar-left">
                <button class="study-tool-btn" onclick="exitStudy()" title="${t('close')}">✕</button>
                <button class="study-tool-btn" onclick="undoLastReview()" ${studyUndoStack.length === 0 ? 'disabled' : ''} title="${t('undo')} (Ctrl+Z)">↩️</button>
            </div>
            <div class="study-deck-info">
                <div class="study-deck-name" dir="auto">${escapeHtml(study.title)}</div>
                <div class="study-queue-pills">
                    <span class="sq-new">${remNew}</span>
                    <span>•</span>
                    <span class="sq-lrn">${remLrn}</span>
                    <span>•</span>
                    <span class="sq-rev">${remRev}</span>
                </div>
            </div>
            <div class="study-topbar-right">
                <button class="study-tool-btn ${whiteboardActive ? 'active-tool' : ''}" id="wbToggleBtn" onclick="toggleWhiteboard()" title="${t('whiteboard')}">✍️</button>
                <button class="study-tool-btn" onclick="cycleCardFlag('${card.id}')" title="${t('flagCard')}">${card.flag ? flagIcons[card.flag] : '🏳️'}</button>
                <button class="study-tool-btn" onclick="openStudyCardActions('${card.id}')" title="More">⋮</button>
            </div>
        </div>

        <div class="study-progress">
            <div class="study-progress-bar"><div class="study-progress-fill" style="width:${progress}%"></div></div>
            <div class="study-progress-info">
                <span>${study.currentIndex + 1} / ${study.total}</span>
                <span>⚡ +${study.xpEarned} XP</span>
            </div>
        </div>

        ${isBrainscape ? `<div class="brainscape-rating-dots" id="ratingDots"></div>` : ''}

        <div class="flashcard-stage">
            <div class="flashcard-wrapper ${isBrainscape ? 'brainscape-mode' : ''}" id="flashcardWrapper">
                <div class="brainscape-header-bar" style="background:${headerBarColor}"></div>
                ${flagBadge}
                <div class="flashcard" id="flashcard" onclick="handleCardSurfaceTap(event)">
                    <div class="flashcard-face front">
                        ${frontHtml}
                    </div>
                    ${!isBrainscape ? `<div class="flashcard-face back back-3d">${backHtml}</div>` : ''}
                </div>
                ${isBrainscape ? `<div class="brainscape-back" id="flashcardBack" onclick="handleCardSurfaceTap(event)">${backHtml}</div>` : ''}

                <div class="whiteboard-overlay ${whiteboardActive ? 'active' : ''}" id="whiteboardOverlay">
                    <canvas class="whiteboard-canvas" id="whiteboardCanvas"></canvas>
                    <div class="whiteboard-controls">
                        <button class="editor-tool-chip" onclick="clearWhiteboard()">🧹 ${currentLang === 'fa' ? 'پاک کردن' : 'Clear'}</button>
                        <button class="editor-tool-chip" onclick="toggleWhiteboard()">✕</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="interactiveStudyZone"></div>

        <button class="show-answer-btn" id="showAnswerBtn" style="${(isMCQ || isTyping) ? 'display:none' : ''}" onclick="flipCard()">
            ${t('showAnswer')} <span class="kbd-hint" style="background:rgba(255,255,255,0.2);color:#fff;border:none;margin-inline-start:6px">Space</span>
        </button>

        <div class="answer-buttons-container" id="answerButtonsWrap" style="display:none">
            ${isBrainscape ? `<div class="brainscape-prompt-label">${t('howWellDidYouKnow')}</div>` : ''}
            <div class="answer-buttons ${isBrainscape ? 'brainscape-mode' : 'anki-mode'}" id="answerButtons"></div>
        </div>
    `;

    // Populate Brainscape History Dots
    if (isBrainscape) {
        const dotsContainer = document.getElementById('ratingDots');
        if (dotsContainer) {
            const recent = study.ratingsHistory.slice(-22);
            dotsContainer.innerHTML = recent.map(r => `<div class="brainscape-dot rated-${r}"></div>`).join('');
        }
    }

    if (isBrainscape) renderBrainscapeButtons(card);
    else if (mode === 'fsrs') renderFSRSButtons(card);
    else renderClassicButtons(card);

    if (isMCQ) renderMCQZone(card);
    else if (isTyping) renderTypingZone(card);

    if (whiteboardActive) initWhiteboardCanvas();

    // Auto-play pronunciation on Front
    if (state.settings.autoplay) {
        if (card.audioFile) {
            playCardAudio(card.audioFile, 'word');
        } else if (state.settings.ttsFallback) {
            const frontSpeak = card.word || card.front || '';
            if (frontSpeak && !hasClozeSyntax(frontSpeak)) {
                speakTTS(frontSpeak);
            }
        }
    }

    study.cardTimes[card.id] = Date.now();
}

function handleCardSurfaceTap(e) {
    if (whiteboardActive) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'button' || tag === 'input' || tag === 'a' || e.target.closest('button')) return;
    const mode = state.settings.studyMode || 'brainscape';
    const card = state.currentStudy?.cards[state.currentStudy.currentIndex];
    if (mode === 'mcq' || card?.cardType === 'mcq' || mode === 'typing') return;
    flipCard();
}

function buildFrontCardHtml(card, isMCQ) {
    const rawWord = card.word || card.front || '';
    const isCloze = card.cardType === 'cloze' || hasClozeSyntax(rawWord);
    const displayWord = isCloze ? renderClozeText(rawWord, false) : escapeHtml(rawWord);

    let html = `
        <div class="card-header-row">
            <span class="card-label">${t('question')}</span>
            <div class="card-meta-badges">
                ${card.wordNumber ? `<span class="card-tag">#${escapeHtml(card.wordNumber)}</span>` : ''}
                <span class="card-type-badge ${card.type}">${t(card.type)}</span>
            </div>
        </div>
        <div class="card-word-display">
            <div class="card-word-main" dir="auto">${displayWord}</div>
    `;

    const ipa = card.ipa || '';
    const canSpeak = Boolean(card.audioFile || (state.settings.ttsFallback && rawWord));
    if (ipa || canSpeak) {
        html += `<div class="card-word-ipa-row">`;
        if (ipa) html += `<span class="card-word-ipa">/${escapeHtml(ipa.replace(/^\/|\/$/g, ''))}/</span>`;
        if (card.audioFile) {
            html += `<button class="card-audio-inline" id="wordAudioBtn" type="button" onclick="event.stopPropagation();playCardAudio('${escapeHtml(card.audioFile)}','word')">🔊</button>`;
        } else if (state.settings.ttsFallback && rawWord && !isCloze) {
            html += `<button class="card-audio-inline tts-btn" type="button" title="TTS" onclick="event.stopPropagation();speakTTS(${JSON.stringify(rawWord).replace(/"/g, '&quot;')})">🗣️</button>`;
        }
        html += `</div>`;
    }

    if (card.imageFile && card.showImageOnFront) {
        const imgUrl = getMediaUrl(card.imageFile);
        if (imgUrl) {
            html += `<div class="card-media-container"><img class="card-image" src="${imgUrl}" alt="Card visual"></div>`;
        }
    }

    if (card.hint) {
        html += `
            <button class="hint-reveal-btn" type="button" onclick="event.stopPropagation();this.nextElementSibling.style.display='block';this.style.display='none'">
                💡 ${t('hint')}
            </button>
            <div class="hint-box" style="display:none" dir="auto">${escapeHtml(card.hint)}</div>
        `;
    }

    html += `</div>`;

    if (!isMCQ && state.settings.studyMode !== 'typing') {
        html += `<div class="card-hint-footer">👆 ${t('tapToReveal')}</div>`;
    }
    return html;
}

function buildBackCardHtml(card) {
    const rawWord = card.word || card.front || '';
    const isCloze = card.cardType === 'cloze' || hasClozeSyntax(rawWord);
    const meaning = card.meaning || card.back || '';

    let html = `
        <div class="card-header-row">
            <span class="card-label">${t('answer')}</span>
            <div class="card-meta-badges">
                ${(card.lapses || 0) >= 4 ? `<span class="card-type-badge" style="background:rgba(239,68,68,0.18);color:var(--danger)">🩸 ${t('leech')}</span>` : ''}
                <span class="card-tag">Ivl: ${card.interval ? formatSmartInterval(card) : t('new')}</span>
            </div>
        </div>
    `;

    if (isCloze) {
        html += `<div class="card-word-main" style="font-size:calc(1.25rem * var(--card-font-scale));margin-bottom:14px" dir="auto">${renderClozeText(rawWord, true)}</div>`;
    } else if (rawWord) {
        html += `<div style="font-size:calc(0.95rem * var(--card-font-scale));margin-bottom:10px;text-align:center;font-weight:700;color:var(--text-secondary)" dir="auto">${escapeHtml(rawWord)}</div>`;
    }

    if (meaning) {
        html += `
            <div class="card-section">
                <div class="card-meaning">
                    <div style="flex:1" dir="auto">${escapeHtml(meaning)}</div>
                    ${card.audioFile3
                        ? `<button class="card-audio-inline meaning-btn" type="button" onclick="event.stopPropagation();playCardAudio('${escapeHtml(card.audioFile3)}','meaning')">🔊</button>`
                        : (state.settings.ttsFallback ? `<button class="card-audio-inline tts-btn" type="button" onclick="event.stopPropagation();speakTTS(${JSON.stringify(meaning).replace(/"/g, '&quot;')})">🗣️</button>` : '')
                    }
                </div>
            </div>
        `;
    }

    if (card.example) {
        html += `
            <div class="card-section">
                <div class="card-example">
                    <div style="flex:1" dir="auto"><strong>${t('example')}:</strong> ${escapeHtml(card.example)}</div>
                    ${card.audioFile2
                        ? `<button class="card-audio-inline example-btn" type="button" onclick="event.stopPropagation();playCardAudio('${escapeHtml(card.audioFile2)}','example')">🔊</button>`
                        : (state.settings.ttsFallback ? `<button class="card-audio-inline tts-btn" type="button" onclick="event.stopPropagation();speakTTS(${JSON.stringify(card.example).replace(/"/g, '&quot;')})">🗣️</button>` : '')
                    }
                </div>
            </div>
        `;
    }

    if (card.extra) {
        html += `<div class="card-extra-notes" dir="auto">📌 ${escapeHtml(card.extra)}</div>`;
    }

    if (card.imageFile) {
        const imgUrl = getMediaUrl(card.imageFile);
        if (imgUrl) {
            html += `<div class="card-media-container"><img class="card-image" src="${imgUrl}" alt="${escapeHtml(rawWord)}"></div>`;
        }
    }

    if (card.tags && card.tags.length) {
        html += `<div class="card-tags">${card.tags.map(tg => `<span class="card-tag">#${escapeHtml(tg)}</span>`).join('')}</div>`;
    }

    const conf = getCardConfidenceScore(card);
    html += `<div style="display:flex;gap:4px;justify-content:center;margin-top:auto;padding-top:12px">`;
    for (let i = 1; i <= 5; i++) {
        const activeColor = i <= conf ? `var(--cbr-${conf})` : 'var(--bg-tertiary)';
        html += `<span style="width:18px;height:5px;border-radius:99px;background:${activeColor}"></span>`;
    }
    html += `</div>`;

    return html;
}

// ===== Answer Buttons Rendering =====
function renderBrainscapeButtons(card) {
    const container = document.getElementById('answerButtons');
    if (!container) return;
    const previews = [1, 2, 3, 4, 5].map(c => formatSmartInterval(applyBrainscape({ ...card }, c)));
    container.innerHTML = [1, 2, 3, 4, 5].map((c, idx) => `
        <button class="answer-btn c${c}" type="button" onclick="submitCardRating('brainscape', ${c})">
            <span class="rating">${c}</span>
            <span class="btn-label">${t('c' + c)}</span>
            <span class="interval">${previews[idx]}</span>
        </button>
    `).join('');
}

function renderFSRSButtons(card) {
    const container = document.getElementById('answerButtons');
    if (!container) return;
    const r1 = formatSmartInterval(applyFSRS({ ...card }, 1));
    const r2 = formatSmartInterval(applyFSRS({ ...card }, 2));
    const r3 = formatSmartInterval(applyFSRS({ ...card }, 3));
    const r4 = formatSmartInterval(applyFSRS({ ...card }, 4));
    container.innerHTML = `
        <button class="answer-btn again" type="button" onclick="submitCardRating('fsrs', 1)"><span>${t('again')}</span><span class="interval">${r1}</span></button>
        <button class="answer-btn hard" type="button" onclick="submitCardRating('fsrs', 2)"><span>${t('hard')}</span><span class="interval">${r2}</span></button>
        <button class="answer-btn good" type="button" onclick="submitCardRating('fsrs', 3)"><span>${t('good')}</span><span class="interval">${r3}</span></button>
        <button class="answer-btn easy" type="button" onclick="submitCardRating('fsrs', 4)"><span>${t('easy')}</span><span class="interval">${r4}</span></button>
    `;
}

function renderClassicButtons(card) {
    const container = document.getElementById('answerButtons');
    if (!container) return;
    const r1 = formatSmartInterval(applySM2({ ...card }, 'again'));
    const r2 = formatSmartInterval(applySM2({ ...card }, 'hard'));
    const r3 = formatSmartInterval(applySM2({ ...card }, 'good'));
    const r4 = formatSmartInterval(applySM2({ ...card }, 'easy'));
    container.innerHTML = `
        <button class="answer-btn again" type="button" onclick="submitCardRating('sm2', 'again')"><span>${t('again')}</span><span class="interval">${r1}</span></button>
        <button class="answer-btn hard" type="button" onclick="submitCardRating('sm2', 'hard')"><span>${t('hard')}</span><span class="interval">${r2}</span></button>
        <button class="answer-btn good" type="button" onclick="submitCardRating('sm2', 'good')"><span>${t('good')}</span><span class="interval">${r3}</span></button>
        <button class="answer-btn easy" type="button" onclick="submitCardRating('sm2', 'easy')"><span>${t('easy')}</span><span class="interval">${r4}</span></button>
    `;
}

// ===== Multiple Choice Interactive Mode =====
function renderMCQZone(card) {
    const zone = document.getElementById('interactiveStudyZone');
    if (!zone) return;

    const correctText = hasClozeSyntax(card.word || card.front)
        ? (extractClozeAnswers(card.word || card.front).join(', ') || card.meaning || card.back)
        : (card.meaning || card.back || '');

    let distractors = Array.isArray(card.wrongChoices) ? [...card.wrongChoices] : [];
    if (distractors.length < 3) {
        const otherMeanings = Object.values(state.cards)
            .filter(c => c && (c.meaning || c.back) && (c.meaning || c.back) !== correctText)
            .map(c => c.meaning || c.back);
        const uniqueOthers = [...new Set(otherMeanings)];
        const sampled = shuffleArray(uniqueOthers).slice(0, 3 - distractors.length);
        distractors = [...distractors, ...sampled];
    }

    while (distractors.length < 3) {
        const fallbacks = currentLang === 'fa'
            ? ['هیچ‌کدام از موارد', 'گزینه انحرافی ۱', 'نیازمند بررسی بیشتر']
            : ['None of the above', 'Alternative concept', 'Opposite definition'];
        distractors.push(fallbacks[distractors.length]);
    }

    const options = shuffleArray([
        { text: correctText, isCorrect: true },
        ...distractors.slice(0, 3).map(d => ({ text: d, isCorrect: false }))
    ]);

    zone.innerHTML = `
        <div class="mcq-options-grid">
            ${options.map((opt, idx) => `
                <button class="mcq-option-btn" type="button" data-correct="${opt.isCorrect}" onclick="selectMCQOption(this)">
                    <span class="kbd-hint">${idx + 1}</span>
                    <span style="flex:1" dir="auto">${escapeHtml(opt.text)}</span>
                </button>
            `).join('')}
        </div>
    `;
}

function selectMCQOption(btn) {
    const allBtns = document.querySelectorAll('.mcq-option-btn');
    allBtns.forEach(b => {
        b.disabled = true;
        if (b.dataset.correct === 'true') b.classList.add('correct');
    });

    const isRight = btn.dataset.correct === 'true';
    if (!isRight) btn.classList.add('wrong');
    playSound(isRight ? 'correct' : 'wrong');
    haptic(isRight ? 12 : 30);

    setTimeout(() => {
        flipCard(true);
    }, 550);
}

// ===== Type-Answer Mode with Character-Level Diff =====
function renderTypingZone(card) {
    const zone = document.getElementById('interactiveStudyZone');
    if (!zone) return;
    zone.innerHTML = `
        <div class="typing-overlay">
            <input type="text" class="typing-input" id="typingAnswerInput" placeholder="${t('typeAnswer')}" autocomplete="off" spellcheck="false" dir="auto"/>
            <button class="btn btn-primary btn-full" id="verifyTypingBtn" type="button" onclick="checkTypedAnswer()" style="margin-top:10px">${t('checkAnswer')}</button>
            <div id="typingFeedbackArea"></div>
        </div>
    `;
    setTimeout(() => {
        const inp = document.getElementById('typingAnswerInput');
        if (inp) {
            inp.focus();
            inp.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    checkTypedAnswer();
                }
            });
        }
    }, 80);
}

function buildCharDiffHtml(typed, expected) {
    let html = '';
    const maxLen = Math.max(typed.length, expected.length);
    for (let i = 0; i < maxLen; i++) {
        const tc = typed[i] || '';
        const ec = expected[i] || '';
        if (tc.toLowerCase() === ec.toLowerCase()) {
            html += `<span class="diff-ok">${escapeHtml(ec)}</span>`;
        } else if (tc && ec) {
            html += `<span class="diff-bad">${escapeHtml(tc)}</span><span class="diff-miss">${escapeHtml(ec)}</span>`;
        } else if (!tc && ec) {
            html += `<span class="diff-miss">${escapeHtml(ec)}</span>`;
        } else {
            html += `<span class="diff-bad">${escapeHtml(tc)}</span>`;
        }
    }
    return html;
}

function checkTypedAnswer() {
    const inp = document.getElementById('typingAnswerInput');
    const feedback = document.getElementById('typingFeedbackArea');
    const verifyBtn = document.getElementById('verifyTypingBtn');
    if (!inp || inp.disabled) return;

    const study = state.currentStudy;
    if (!study) return;
    const card = study.cards[study.currentIndex];

    const expectedRaw = hasClozeSyntax(card.word || card.front)
        ? (extractClozeAnswers(card.word || card.front)[0] || card.meaning || card.back || '')
        : (card.meaning || card.back || '');

    const cleanExpected = expectedRaw.split(/[،,/;/]/)[0].trim();
    const userVal = inp.value.trim();

    inp.disabled = true;
    if (verifyBtn) verifyBtn.style.display = 'none';
    state.stats.typingAnswers = (state.stats.typingAnswers || 0) + 1;

    const exactMatch = userVal.toLowerCase() === cleanExpected.toLowerCase() ||
        (userVal.length >= 3 && expectedRaw.toLowerCase().includes(userVal.toLowerCase()));

    const diffHtml = buildCharDiffHtml(userVal, cleanExpected);
    feedback.innerHTML = `
        <div class="typing-diff-box" dir="auto">
            <div style="margin-bottom:6px;font-weight:800;color:${exactMatch ? 'var(--success)' : 'var(--danger)'}">
                ${exactMatch ? '✅ ' + t('correct') : '❌ ' + t('incorrect')}
            </div>
            <div>${diffHtml}</div>
        </div>
    `;

    playSound(exactMatch ? 'correct' : 'wrong');
    flipCard(true);
}

// ===== Flip / Reveal Card (Fixed undefined bsPanel bug!) =====
async function flipCard(forceRevealOnly = false) {
    const wrapper = document.getElementById('flashcardWrapper');
    const flashcard = document.getElementById('flashcard');
    const showBtn = document.getElementById('showAnswerBtn');
    const answerWrap = document.getElementById('answerButtonsWrap');
    const study = state.currentStudy;
    if (!study) return;

    const card = study.cards[study.currentIndex];
    const mode = state.settings.studyMode || 'brainscape';
    const isMCQ = mode === 'mcq' || card?.cardType === 'mcq';
    const isTyping = mode === 'typing';
    const isBrainscape = mode === 'brainscape' && !isMCQ && !isTyping;

    const currentlyRevealed = isBrainscape
        ? wrapper?.classList.contains('revealed')
        : flashcard?.classList.contains('flipped');

    if (!currentlyRevealed) {
        if (isBrainscape && wrapper) wrapper.classList.add('revealed');
        else if (flashcard) flashcard.classList.add('flipped');

        if (showBtn) showBtn.style.display = 'none';
        if (answerWrap) answerWrap.style.display = 'block';
        playSound('flip');
        haptic(10);

        // Sequential Audio Playback on Reveal
        if (state.settings.autoplay && card) {
            if (state.settings.replayFrontAudio && card.audioFile) {
                await playAudioAndWait(card.audioFile);
            }
            if (card.audioFile3) {
                await playAudioAndWait(card.audioFile3);
            }
            if (card.audioFile2 && card.audioFile2 !== card.audioFile) {
                await playAudioAndWait(card.audioFile2);
            }
        }
    } else if (!forceRevealOnly) {
        if (isBrainscape && wrapper) wrapper.classList.remove('revealed');
        else if (flashcard) flashcard.classList.remove('flipped');

        if (showBtn) showBtn.style.display = '';
        if (answerWrap) answerWrap.style.display = 'none';
        stopAllStudyAudio();
    }
}

// ===== Submit Rating + Save Snapshot to Undo Stack =====
function submitCardRating(engine, value) {
    const study = state.currentStudy;
    if (!study) return;
    stopAllStudyAudio();

    const queueCard = study.cards[study.currentIndex];
    const cardId = queueCard.id;
    const prevCardSnapshot = JSON.parse(JSON.stringify(state.cards[cardId]));
    const prevStatsSnapshot = JSON.parse(JSON.stringify(state.stats));
    const prevQueueLength = study.cards.length;
    const prevXpEarned = study.xpEarned;

    studyUndoStack.push({
        cardId,
        prevIndex: study.currentIndex,
        prevCardSnapshot,
        prevStatsSnapshot,
        prevQueueLength,
        prevXpEarned,
        prevHistoryLen: study.ratingsHistory.length
    });
    if (studyUndoStack.length > 25) studyUndoStack.shift();

    const wasNew = (state.cards[cardId]?.status || 'new') === 'new';
    let updated;
    let xp = 5;
    let numericScore = 3;
    let shouldRequeue = false;

    if (engine === 'brainscape') {
        updated = applyBrainscape(state.cards[cardId], value);
        xp = value === 1 ? 2 : value === 2 ? 4 : value === 3 ? 6 : value === 4 ? 8 : 12;
        numericScore = value;
        shouldRequeue = value <= 2;
        study.ratingsHistory.push(value);
        study.answered[value] = (study.answered[value] || 0) + 1;
    } else if (engine === 'fsrs') {
        updated = applyFSRS(state.cards[cardId], value);
        xp = value === 1 ? 2 : value === 2 ? 5 : value === 3 ? 8 : 12;
        numericScore = value === 1 ? 1 : value === 2 ? 2 : value === 3 ? 4 : 5;
        shouldRequeue = value === 1;
        study.answered[value] = (study.answered[value] || 0) + 1;
    } else {
        updated = applySM2(state.cards[cardId], value);
        xp = value === 'again' ? 2 : value === 'hard' ? 5 : value === 'good' ? 8 : 12;
        numericScore = value === 'again' ? 1 : value === 'hard' ? 2 : value === 'good' ? 4 : 5;
        shouldRequeue = value === 'again';
        study.answered[value] = (study.answered[value] || 0) + 1;
    }

    state.cards[cardId] = updated;
    study.xpEarned += xp;
    study.ratings[cardId] = numericScore;
    const spent = Date.now() - (study.cardTimes[cardId] || Date.now());
    study.cardTimes[cardId] = Math.min(spent, 120000);

    recordReviewStat(wasNew);

    // Leech notification (AnkiDroid feature)
    if ((updated.lapses || 0) === 4 || (updated.lapses || 0) === 8) {
        showToast(currentLang === 'fa' ? '🩸 هشدار کارت فرّار (Leech)! مثال یا تصویر به این کارت اضافه کنید.' : '🩸 Leech detected! Consider adding a mnemonic or hint.', 'info');
    }

    if (shouldRequeue && study.cards.length < 300) {
        study.cards.push({ ...updated, id: cardId, type: 'learning' });
        study.total = study.cards.length;
    }

    study.currentIndex++;
    saveData();
    playSound(shouldRequeue ? 'wrong' : 'correct');
    haptic(14);
    renderStudyCard();
}

function undoLastReview() {
    const study = state.currentStudy;
    if (!study || studyUndoStack.length === 0) return;

    const snap = studyUndoStack.pop();
    state.cards[snap.cardId] = snap.prevCardSnapshot;
    state.stats = snap.prevStatsSnapshot;
    study.cards.length = snap.prevQueueLength;
    study.total = snap.prevQueueLength;
    study.currentIndex = snap.prevIndex;
    study.xpEarned = snap.prevXpEarned;
    study.ratingsHistory.length = snap.prevHistoryLen;

    saveData();
    showToast(currentLang === 'fa' ? '↩️ پاسخ قبلی بازگردانی شد' : '↩️ Undid last rating', 'info');
    renderStudyCard();
}

// ===== Fixed Streak & Daily Review Counter =====
function recordReviewStat(wasNew = false) {
    const today = getDateStr(0);
    const yesterday = getDateStr(-1);
    const prevStudyDate = state.stats.lastStudyDate;

    state.stats.todayDate = today;
    state.stats.todayReviewed = (state.stats.todayReviewed || 0) + 1;
    state.stats.totalReviews = (state.stats.totalReviews || 0) + 1;
    if (wasNew) state.stats.todayNewStudied = (state.stats.todayNewStudied || 0) + 1;

    if (!state.stats.dailyReviews) state.stats.dailyReviews = {};
    state.stats.dailyReviews[today] = (state.stats.dailyReviews[today] || 0) + 1;

    if (prevStudyDate !== today) {
        if (prevStudyDate === yesterday) {
            state.stats.streak = (state.stats.streak || 0) + 1;
        } else {
            state.stats.streak = 1;
        }
        state.stats.lastStudyDate = today;
    } else if (!state.stats.streak) {
        state.stats.streak = 1;
    }

    checkDailyChallengeProgress();
}

// ===== AnkiDroid Card Actions During Study (Flag, Bury, Suspend, Edit) =====
function cycleCardFlag(cardId) {
    const c = state.cards[cardId];
    if (!c) return;
    c.flag = ((c.flag || 0) + 1) % 5; // 0 -> 1(Red) -> 2(Orange) -> 3(Green) -> 4(Blue) -> 0
    saveData();
    renderStudyCard();
}

function openStudyCardActions(cardId) {
    const c = state.cards[cardId];
    if (!c) return;
    openModal(`
        <div class="modal-header-bar">
            <h2 class="modal-title">⚙️ ${currentLang === 'fa' ? 'عملیات کارت فعلی' : 'Card Actions'}</h2>
            <button class="icon-btn" onclick="closeModalDirect()">✕</button>
        </div>
        <div class="deck-options-list">
            <button class="deck-option-btn" onclick="closeModalDirect();showEditCardModal('${cardId}', true)">✏️ ${t('editCard')}</button>
            <button class="deck-option-btn" onclick="buryCurrentStudyCard('${cardId}')">🌅 ${t('buryCard')}</button>
            <button class="deck-option-btn" onclick="suspendCurrentStudyCard('${cardId}')">⏸️ ${t('suspendCard')}</button>
            <button class="deck-option-btn" onclick="resetSingleCardProgress('${cardId}')">🔄 ${t('resetDeckProgress')}</button>
        </div>
    `);
}

function buryCurrentStudyCard(cardId) {
    if (!state.cards[cardId]) return;
    state.cards[cardId].buriedUntil = getDateStr(0);
    closeModalDirect();
    skipCurrentStudyCard(currentLang === 'fa' ? 'کارت تا فردا مخفی شد' : 'Card buried until tomorrow');
}

function suspendCurrentStudyCard(cardId) {
    if (!state.cards[cardId]) return;
    state.cards[cardId].suspended = true;
    closeModalDirect();
    skipCurrentStudyCard(currentLang === 'fa' ? 'کارت تعلیق شد' : 'Card suspended');
}

function resetSingleCardProgress(cardId) {
    const c = state.cards[cardId];
    if (!c) return;
    c.status = 'new';
    c.interval = 0;
    c.repetitions = 0;
    c.confidence = 0;
    c.stability = 0;
    c.dueDate = 0;
    saveData();
    closeModalDirect();
    showToast(currentLang === 'fa' ? 'پیشرفت کارت صفر شد' : 'Card progress reset', 'success');
    renderStudyCard();
}

function skipCurrentStudyCard(toastMsg) {
    const study = state.currentStudy;
    if (!study) return;
    study.cards.splice(study.currentIndex, 1);
    study.total = study.cards.length;
    saveData();
    showToast(toastMsg, 'info');
    renderStudyCard();
}

// ===== AnkiDroid Scratchpad Whiteboard =====
function toggleWhiteboard() {
    whiteboardActive = !whiteboardActive;
    const overlay = document.getElementById('whiteboardOverlay');
    const btn = document.getElementById('wbToggleBtn');
    if (overlay) overlay.classList.toggle('active', whiteboardActive);
    if (btn) btn.classList.toggle('active-tool', whiteboardActive);
    if (whiteboardActive) initWhiteboardCanvas();
}

function initWhiteboardCanvas() {
    const canvas = document.getElementById('whiteboardCanvas');
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width || 340;
    canvas.height = rect.height || 380;
    wbCtx = canvas.getContext('2d');
    wbCtx.lineWidth = 3;
    wbCtx.lineCap = 'round';
    wbCtx.lineJoin = 'round';
    wbCtx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-light').trim() || '#818cf8';

    const getPos = (e) => {
        const r = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - r.left, y: clientY - r.top };
    };

    canvas.onpointerdown = (e) => {
        wbDrawing = true;
        const p = getPos(e);
        wbCtx.beginPath();
        wbCtx.moveTo(p.x, p.y);
    };
    canvas.onpointermove = (e) => {
        if (!wbDrawing) return;
        const p = getPos(e);
        wbCtx.lineTo(p.x, p.y);
        wbCtx.stroke();
    };
    canvas.onpointerup = () => { wbDrawing = false; };
    canvas.onpointercancel = () => { wbDrawing = false; };
}

function clearWhiteboard() {
    const canvas = document.getElementById('whiteboardCanvas');
    if (canvas && wbCtx) wbCtx.clearRect(0, 0, canvas.width, canvas.height);
}

// ===== Audio Playback Helpers =====
function stopAllStudyAudio() {
    if (currentPlayingAudio) {
        try { currentPlayingAudio.pause(); } catch (e) {}
        currentPlayingAudio = null;
    }
    if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
    }
}

async function playCardAudio(filename) {
    if (!filename) return;
    let url = mediaUrlCache.get(filename);
    if (!url) url = await getMediaUrlAsync(filename);
    if (!url) return;

    stopAllStudyAudio();
    try {
        const audio = new Audio(url);
        currentPlayingAudio = audio;
        audio.play().catch(() => {});
        audio.onended = () => { if (currentPlayingAudio === audio) currentPlayingAudio = null; };
    } catch (e) {}
}

async function playAudioAndWait(filename) {
    if (!filename) return;
    let url = mediaUrlCache.get(filename);
    if (!url) url = await getMediaUrlAsync(filename);
    if (!url) return;

    return new Promise(resolve => {
        try {
            const audio = new Audio(url);
            currentPlayingAudio = audio;
            const done = () => {
                if (currentPlayingAudio === audio) currentPlayingAudio = null;
                resolve();
            };
            audio.onended = done;
            audio.onerror = done;
            audio.play().catch(done);
        } catch (e) {
            resolve();
        }
    });
}

// ===== Session Complete Summary Screen =====
function showStudyComplete(deckId) {
    const study = state.currentStudy;
    const container = document.getElementById('studyContainer');
    if (!container) return;

    const elapsedSec = study ? Math.max(1, Math.round((Date.now() - study.startTime) / 1000)) : 0;
    const mins = Math.floor(elapsedSec / 60);
    const secs = elapsedSec % 60;

    const ratingsList = Object.values(study?.ratings || {});
    const totalStudied = ratingsList.length;
    const goodCount = ratingsList.filter(r => r >= 3).length;
    const accuracy = totalStudied > 0 ? Math.round((goodCount / totalStudied) * 100) : 100;
    const xpEarned = study?.xpEarned || 0;

    if (xpEarned > 0) addXp(xpEarned);
    setTimeout(() => checkAchievements(), 350);

    const masteryInfo = getMasteryStats(deckId === '__ALL__' ? null : deckId);
    const retentionEst = totalStudied > 0 ? Math.min(99, Math.max(60, Math.round(accuracy * 0.88 + 11))) : masteryInfo.masteryPct;

    const today = getDateStr(0);
    if (!state.stats.retentionHistory) state.stats.retentionHistory = {};
    if (totalStudied > 0) state.stats.retentionHistory[today] = retentionEst;

    const timesArr = Object.values(study?.cardTimes || {}).filter(v => v > 0 && v < 120000);
    const avgSec = timesArr.length ? (timesArr.reduce((a, b) => a + b, 0) / timesArr.length / 1000).toFixed(1) : '0.0';

    container.innerHTML = `
        <div class="study-complete animate-slideUp">
            <div style="font-size:3.4rem;margin-bottom:8px">🏆</div>
            <h2 style="font-size:1.45rem;font-weight:900;margin-bottom:4px">${t('congratulations')}</h2>
            <p style="color:var(--text-secondary);font-size:0.86rem;max-width:420px">${t('finishedDeck')}</p>

            ${xpEarned > 0 ? `<div class="pill-badge xp-display" style="margin-top:12px;padding:8px 18px;font-size:0.9rem">⚡ +${xpEarned} XP</div>` : ''}

            <div class="complete-stats">
                <div class="complete-stat" style="--stat-color:var(--info)">
                    <div class="num">${totalStudied}</div>
                    <div class="lbl">${t('cards')}</div>
                </div>
                <div class="complete-stat" style="--stat-color:var(--success)">
                    <div class="num">${accuracy}%</div>
                    <div class="lbl">${t('accuracy')}</div>
                </div>
                <div class="complete-stat" style="--stat-color:var(--purple)">
                    <div class="num">${masteryInfo.masteryPct}%</div>
                    <div class="lbl">${t('weightedMastery')}</div>
                </div>
            </div>

            <div class="session-report">
                <h3 style="font-size:0.92rem;font-weight:800">📊 ${t('sessionReport')}</h3>
                <div class="session-insights">
                    <div class="session-insight">
                        <div class="insight-value">${avgSec}s</div>
                        <div class="insight-label">${t('avgTime')}</div>
                    </div>
                    <div class="session-insight">
                        <div class="insight-value">${mins}:${String(secs).padStart(2, '0')}</div>
                        <div class="insight-label">${t('totalTime')}</div>
                    </div>
                    <div class="session-insight">
                        <div class="insight-value">${retentionEst}%</div>
                        <div class="insight-label">${t('retention')}</div>
                    </div>
                    <div class="session-insight">
                        <div class="insight-value">${state.stats.streak || 1} 🔥</div>
                        <div class="insight-label">${t('streakDay')}</div>
                    </div>
                </div>
            </div>

            <div style="display:flex;gap:10px;width:100%">
                <button class="btn btn-secondary" style="flex:1" onclick="exitStudy()">🏠 ${t('home')}</button>
                <button class="btn btn-primary" style="flex:1" onclick="restartStudyCram()">⚡ ${t('studyAgain')}</button>
            </div>
        </div>
    `;

    state.currentStudy = null;
    saveData();
    if (xpEarned >= 30) spawnConfetti();
}

function restartStudyCram() {
    if (lastStudiedDeckId) {
        startStudy(lastStudiedDeckId, true);
    } else {
        startSmartMixStudy();
    }
}

// =========================================================================
// Importers & Exporters (.apkg Anki SQLite+Media, CSV/TSV, JSON)
// =========================================================================
function showImportModal() {
    openModal(`
        <div class="modal-header-bar">
            <h2 class="modal-title">📥 ${t('importDeck')}</h2>
            <button class="icon-btn" onclick="closeModalDirect()">✕</button>
        </div>
        <p style="color:var(--text-secondary);font-size:0.82rem;margin-bottom:14px">${t('importAnkiDeck')}</p>
        <div class="import-area" id="modalImportDropzone">
            <div class="import-icon">📦</div>
            <h3>${t('importHint')}</h3>
            <p style="margin-top:4px">.apkg • .tsv • .csv • .txt • .json</p>
            <input type="file" id="importFileInput" accept=".apkg,.json,.csv,.tsv,.txt" style="display:none" onchange="handleImportFile(event)">
        </div>
        <div id="importProgressContainer"></div>
        <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:10px;display:flex;justify-content:space-between;align-items:center;gap:10px">
            <span style="font-size:0.76rem;color:var(--text-muted)">${currentLang === 'fa' ? 'می‌خواهید سریع برنامه را تست کنید؟' : 'Want instant sample flashcards?'}</span>
            <button class="btn btn-secondary" type="button" onclick="createStarterDecks();closeModalDirect();renderHome();renderDecks();showToast('Starter decks added!','success')">✨ ${t('sampleDeck')}</button>
        </div>
    `);

    const zone = document.getElementById('modalImportDropzone');
    if (zone) {
        zone.onclick = (e) => {
            if (e.target.tagName !== 'INPUT') document.getElementById('importFileInput').click();
        };
        zone.ondragover = e => { e.preventDefault(); zone.classList.add('dragover'); };
        zone.ondragleave = () => zone.classList.remove('dragover');
        zone.ondrop = e => {
            e.preventDefault();
            zone.classList.remove('dragover');
            if (e.dataTransfer.files.length) processImportFile(e.dataTransfer.files[0]);
        };
    }
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (file) processImportFile(file);
}

async function processImportFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'apkg') await importAPKG(file);
    else if (ext === 'json') await importJSONFile(file);
    else if (['csv', 'tsv', 'txt'].includes(ext)) await importDelimitedFile(file);
    else showToast('Unsupported file format', 'error');
}

function parseCSVLine(line, sep) {
    const res = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
            else inQuotes = !inQuotes;
        } else if (ch === sep && !inQuotes) {
            res.push(cur);
            cur = '';
        } else {
            cur += ch;
        }
    }
    res.push(cur);
    return res;
}

async function importDelimitedFile(file) {
    try {
        const text = await file.text();
        const rawLines = text.split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith('#'));
        if (!rawLines.length) { showToast('Empty file!', 'error'); return; }

        const sample = rawLines[0];
        let sep = ',';
        if (sample.includes('\t')) sep = '\t';
        else if (sample.includes(';') && !sample.includes(',')) sep = ';';

        // Smart header detection (don't skip row 0 unless it's an obvious column header!)
        const firstCols = parseCSVLine(rawLines[0], sep).map(s => s.trim().toLowerCase());
        const headerKeywords = ['front', 'word', 'question', 'کلمه', 'سوال', 'واژه'];
        const startIdx = headerKeywords.includes(firstCols[0]) ? 1 : 0;

        const deckId = 'deck_csv_' + Date.now();
        const deckName = file.name.replace(/\.(csv|tsv|txt)$/i, '') || 'Imported Deck';
        state.decks[deckId] = { name: deckName, created: Date.now(), source: 'csv' };

        let count = 0;
        for (let i = startIdx; i < rawLines.length; i++) {
            const cols = parseCSVLine(rawLines[i], sep);
            if (cols.length >= 2) {
                const front = cols[0].trim();
                const back = cols[1].trim();
                const example = (cols[2] || '').trim();
                const tags = (cols[3] || '').trim() ? cols[3].split(/[, ]+/).filter(Boolean) : [];
                if (front && back) {
                    const cid = `card_${Date.now()}_${count}`;
                    state.cards[cid] = {
                        deckId,
                        cardType: hasClozeSyntax(front) ? 'cloze' : 'basic',
                        front,
                        back,
                        word: front,
                        meaning: back,
                        example,
                        tags,
                        status: 'new',
                        interval: 0,
                        easeFactor: 2.5,
                        repetitions: 0,
                        dueDate: 0,
                        confidence: 0,
                        reviewCount: 0,
                        created: Date.now()
                    };
                    count++;
                }
            }
        }

        saveData();
        closeModalDirect();
        renderHome();
        renderDecks();
        showToast(`${count} ${t('cards')} imported!`, 'success');
        addXp(25);
    } catch (e) {
        console.error(e);
        showToast('CSV/TSV Import failed', 'error');
    }
}

async function importJSONFile(file) {
    try {
        const data = JSON.parse(await file.text());
        // Full backup vs Single Deck export
        if (data.decks && data.cards) {
            Object.assign(state.decks, data.decks);
            Object.assign(state.cards, data.cards);
            saveData();
            closeModalDirect();
            renderHome();
            renderDecks();
            showToast(currentLang === 'fa' ? 'پشتیبان با موفقیت ادغام شد!' : 'Backup merged successfully!', 'success');
            return;
        }
        if (data.deck && Array.isArray(data.cards)) {
            const deckId = 'deck_' + Date.now();
            state.decks[deckId] = { name: data.deck.name || 'Imported Deck', created: Date.now(), source: 'json' };
            data.cards.forEach((c, idx) => {
                const cid = `card_${Date.now()}_${idx}`;
                state.cards[cid] = {
                    ...c,
                    deckId,
                    status: c.status || 'new',
                    interval: c.interval || 0,
                    confidence: c.confidence || 0
                };
            });
            saveData();
            closeModalDirect();
            renderHome();
            renderDecks();
            showToast(`${data.cards.length} ${t('cards')} imported!`, 'success');
        } else {
            showToast('Invalid JSON structure', 'error');
        }
    } catch (e) {
        showToast('Invalid JSON file', 'error');
    }
}

function cleanAnkiHtml(htmlStr) {
    if (!htmlStr) return '';
    let s = htmlStr
        .replace(/\[sound:[^\]]+\]/gi, '')
        .replace(/<img[^>]*>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/div>|<\/p>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    return s.replace(/\n{3,}/g, '\n\n').trim();
}

async function importAPKG(file) {
    const prog = document.getElementById('importProgressContainer');
    const setProg = (pct, msg) => {
        if (!prog) return;
        prog.innerHTML = `
            <div class="panel-card" style="margin-top:10px;text-align:center">
                <div style="font-weight:700;font-size:0.86rem;margin-bottom:8px">${escapeHtml(msg)} (${Math.round(pct)}%)</div>
                <div class="progress-bar-container"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
            </div>
        `;
    };

    try {
        setProg(8, 'Extracting .apkg archive...');
        const zip = await JSZip.loadAsync(file);
        const dbEntry = zip.file('collection.anki21') || zip.file('collection.anki2');
        if (!dbEntry) throw new Error('collection.anki21 / anki2 not found in archive');

        const dbBuf = await dbEntry.async('arraybuffer');

        // Extract media blobs into IndexedDB
        let mediaMap = {};
        const mediaJsonFile = zip.file('media');
        if (mediaJsonFile) {
            try { mediaMap = JSON.parse(await mediaJsonFile.async('string')); } catch (e) {}
        }

        const mediaEntries = Object.entries(mediaMap);
        let savedMedia = 0;
        for (let i = 0; i < mediaEntries.length; i += 10) {
            const batch = mediaEntries.slice(i, i + 10);
            await Promise.all(batch.map(async ([idxKey, realName]) => {
                const zf = zip.file(idxKey) || zip.file(realName);
                if (zf) {
                    const blob = await zf.async('blob');
                    await saveMediaBlob(realName, blob);
                    state.mediaMap[realName] = realName;
                    savedMedia++;
                }
            }));
            setProg(15 + (i / Math.max(1, mediaEntries.length)) * 35, `Saving media (${savedMedia}/${mediaEntries.length})...`);
        }

        setProg(55, 'Opening SQLite database...');
        const SQL = await initSqlJs({ locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${f}` });
        const db = new SQL.Database(new Uint8Array(dbBuf));

        // Read collection metadata (including crt creation timestamp to fix Anki due dates!)
        const colRes = db.exec('SELECT crt, decks, models FROM col');
        if (!colRes.length) throw new Error('Empty col table');
        const colCrtSec = Number(colRes[0].values[0][0]) || Math.floor(Date.now() / 1000);
        const decksJson = JSON.parse(colRes[0].values[0][1]);
        const modelsJson = JSON.parse(colRes[0].values[0][2]);

        const deckCounts = {};
        for (const ad of Object.values(decksJson)) {
            const did = 'deck_anki_' + ad.id;
            if (!state.decks[did]) {
                state.decks[did] = { name: ad.name || 'Anki Deck', created: Date.now(), source: 'anki' };
                deckCounts[did] = 0;
            }
        }

        const noteToCard = {};
        try {
            const cRes = db.exec('SELECT nid, did, type, queue, due, ivl, factor, reps, lapses FROM cards');
            if (cRes.length) {
                for (const r of cRes[0].values) {
                    const nid = String(r[0]);
                    if (!noteToCard[nid]) {
                        noteToCard[nid] = {
                            did: String(r[1]),
                            type: r[2],
                            queue: r[3],
                            due: r[4],
                            ivl: r[5],
                            factor: r[6],
                            reps: r[7],
                            lapses: r[8] || 0
                        };
                    }
                }
            }
        } catch (e) {}

        const nRes = db.exec('SELECT id, mid, flds, tags FROM notes');
        if (!nRes.length) throw new Error('No notes found');
        const notes = nRes[0].values;

        let imported = 0;
        for (let i = 0; i < notes.length; i++) {
            const [rawNid, rawMid, rawFlds, rawTags] = notes[i];
            const nid = String(rawNid);
            const mid = String(rawMid);
            const cInfo = noteToCard[nid];
            let targetDeckId = cInfo ? ('deck_anki_' + cInfo.did) : Object.keys(deckCounts)[0];
            if (!state.decks[targetDeckId]) targetDeckId = Object.keys(state.decks)[0];

            const flds = String(rawFlds).split('\x1f');
            const model = modelsJson[mid];
            const fldNames = model?.flds ? model.flds.map(f => f.name.toLowerCase()) : [];
            const fmap = {};
            fldNames.forEach((n, idx) => { if (idx < flds.length) fmap[n] = flds[idx]; });

            // Extract sounds & images from raw fields
            const allRawJoined = flds.join(' ');
            const soundMatches = [...allRawJoined.matchAll(/\[sound:([^\]]+)\]/gi)].map(m => m[1]);
            const imgMatch = allRawJoined.match(/<img[^>]+src=["']([^"']+)["']/i);

            const audioFile = soundMatches[0] || null;
            const audioFile3 = soundMatches[1] || null;
            const audioFile2 = soundMatches[2] || null;
            const imageFile = imgMatch ? imgMatch[1] : null;

            const rawFront = fmap['word'] || fmap['front'] || fmap['text'] || fmap['question'] || fmap['expression'] || flds[0] || '';
            const rawBack = fmap['meaning'] || fmap['back'] || fmap['answer'] || fmap['translation'] || fmap['definition'] || flds[1] || '';
            const rawEx = fmap['example'] || fmap['sentence'] || fmap['extra'] || flds[2] || '';
            const rawIpa = fmap['ipa'] || fmap['pronunciation'] || fmap['phonetic'] || '';

            const word = cleanAnkiHtml(rawFront);
            const meaning = cleanAnkiHtml(rawBack);
            if (!word && !meaning) continue;

            // Accurate Anki scheduling conversion using collection crt!
            let status = 'new', interval = 0, easeFactor = 2.5, repetitions = 0, dueDate = 0, lapses = 0;
            if (cInfo) {
                if (cInfo.type === 2) status = 'review';
                else if (cInfo.type === 1 || cInfo.type === 3) status = 'learning';
                interval = Math.max(0, cInfo.ivl || 0);
                easeFactor = cInfo.factor ? Math.max(1.3, cInfo.factor / 1000) : 2.5;
                repetitions = cInfo.reps || 0;
                lapses = cInfo.lapses || 0;
                if (status === 'review' && cInfo.due) {
                    // Anki review 'due' is days since col.crt
                    dueDate = (colCrtSec + cInfo.due * 86400) * 1000;
                }
            }

            const cid = `card_anki_${Date.now()}_${imported}`;
            state.cards[cid] = {
                deckId: targetDeckId,
                cardType: hasClozeSyntax(word) ? 'cloze' : 'basic',
                front: word,
                back: meaning,
                word,
                meaning,
                example: cleanAnkiHtml(rawEx),
                ipa: cleanAnkiHtml(rawIpa),
                audioFile,
                audioFile2,
                audioFile3,
                imageFile,
                tags: String(rawTags || '').trim().split(/\s+/).filter(Boolean),
                status,
                interval,
                easeFactor,
                repetitions,
                lapses,
                dueDate,
                confidence: status === 'review' ? (interval >= 21 ? 5 : 4) : 0,
                reviewCount: repetitions,
                created: Date.now()
            };

            deckCounts[targetDeckId] = (deckCounts[targetDeckId] || 0) + 1;
            imported++;

            if (i % 150 === 0) {
                setProg(60 + (i / notes.length) * 35, `Importing cards (${imported}/${notes.length})...`);
                await new Promise(r => setTimeout(r, 0));
            }
        }

        // Prune empty default Anki deck shells
        Object.entries(deckCounts).forEach(([did, cnt]) => {
            if (cnt === 0 && getDeckDueCounts(did).new === 0) {
                let anyCard = false;
                for (const k in state.cards) { if (state.cards[k].deckId === did) { anyCard = true; break; } }
                if (!anyCard) delete state.decks[did];
            }
        });

        db.close();
        saveData();
        setProg(100, 'Complete!');
        setTimeout(() => {
            closeModalDirect();
            renderHome();
            renderDecks();
            showToast(`${imported} ${t('cards')} (${savedMedia} media) imported!`, 'success');
            addXp(50);
        }, 400);
    } catch (e) {
        console.error('APKG Error:', e);
        if (prog) {
            prog.innerHTML = `<div class="panel-card" style="border-color:var(--danger);color:var(--danger);margin-top:10px">❌ ${escapeHtml(e.message)}</div>`;
        }
    }
}

function exportDeckTSV(deckId = null) {
    const lines = ['#separator:tab', '#html:false', '#columns:Front\tBack\tExample\tTags'];
    for (const cid in state.cards) {
        const c = state.cards[cid];
        if (!c) continue;
        if (deckId && c.deckId !== deckId && !isSubdeckOf(c.deckId, deckId)) continue;
        const f = (c.word || c.front || '').replace(/[\t\r\n]+/g, ' ');
        const b = (c.meaning || c.back || '').replace(/[\t\r\n]+/g, ' ');
        const ex = (c.example || '').replace(/[\t\r\n]+/g, ' ');
        const tg = (c.tags || []).join(' ');
        lines.push(`${f}\t${b}\t${ex}\t${tg}`);
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/tab-separated-values;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const name = deckId && state.decks[deckId] ? state.decks[deckId].name.replace(/[^\w\u0600-\u06FF]+/g, '_') : 'flashmind_all';
    a.href = url;
    a.download = `${name}_anki.tsv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(currentLang === 'fa' ? 'فایل استاندارد TSV آنکی دانلود شد!' : 'Anki TSV exported!', 'success');
}
