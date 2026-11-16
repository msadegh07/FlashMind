/* =========================================================================
   FlashMind Pro v12.0 — UI Controller, Card Editor, AnkiDroid Card Browser,
   Chart.js Analytics (Forecast, Maturity, Retention), Gamification & Shortcuts
   ========================================================================= */

let browserSelectedIds = new Set();
let browserQuickFilter = 'all';
let chartInstances = { reviews: null, forecast: null, maturity: null, retention: null };

// ===== Gamification & Levels =====
const LEVEL_NAMES_EN = ['Novice', 'Apprentice', 'Scholar', 'Specialist', 'Expert', 'Master', 'Grandmaster', 'Sage', 'Luminary', 'Immortal'];
const LEVEL_NAMES_FA = ['مبتدی', 'کارآموز', 'پژوهشگر', 'متخصص', 'خبره', 'استاد', 'استاد بزرگ', 'حکیم', 'نابغه', 'جاودان'];
const XP_THRESHOLDS = [100, 250, 500, 900, 1400, 2100, 3000, 4200, 5800, 8000];

const ACHIEVEMENTS = [
    { id: 'first_card', icon: '🌱', nameEn: 'First Spark', nameFa: 'اولین جرقه', descEn: 'Complete your first card review', descFa: 'ثبت اولین مرور فلش‌کارت', xp: 15, cond: s => (s.totalReviews || 0) >= 1 },
    { id: 'reviews_50', icon: '📚', nameEn: 'Dedicated Learner', nameFa: 'یادگیرنده پیگیر', descEn: '50 total card reviews', descFa: 'انجام ۵۰ مرور کارت', xp: 50, cond: s => (s.totalReviews || 0) >= 50 },
    { id: 'reviews_500', icon: '🎯', nameEn: 'Memory Athlete', nameFa: 'قهرمان حافظه', descEn: '500 total card reviews', descFa: 'انجام ۵۰۰ مرور کارت', xp: 200, cond: s => (s.totalReviews || 0) >= 500 },
    { id: 'reviews_2000', icon: '🏛️', nameEn: 'Polymath', nameFa: 'علامه دهر', descEn: '2000 total card reviews', descFa: 'عبور از مرز ۲۰۰۰ مرور', xp: 600, cond: s => (s.totalReviews || 0) >= 2000 },
    { id: 'streak_3', icon: '🔥', nameEn: '3-Day Momentum', nameFa: '۳ روز پیوستگی', descEn: 'Study 3 days in a row', descFa: '۳ روز مطالعه متوالی بدون وقفه', xp: 60, cond: s => (s.streak || 0) >= 3 },
    { id: 'streak_7', icon: '⚡', nameEn: 'Week Warrior', nameFa: 'جنگجوی هفته', descEn: '7-day study streak', descFa: 'یک هفته کامل مطالعه مستمر', xp: 150, cond: s => (s.streak || 0) >= 7 },
    { id: 'streak_30', icon: '👑', nameEn: 'Iron Discipline', nameFa: 'انضباط آهنین', descEn: '30-day unbroken streak', descFa: '۳۰ روز مطالعه مداوم روزانه', xp: 500, cond: s => (s.streak || 0) >= 30 },
    { id: 'master_25', icon: '💎', nameEn: 'Mastery 25', nameFa: 'تسلط الماسی', descEn: 'Reach Confidence 5 on 25 cards', descFa: 'تسلط کامل (سطح ۵) روی ۲۵ کارت', xp: 120, cond: (_, cards) => Object.values(cards || {}).filter(c => getCardConfidenceScore(c) === 5).length >= 25 },
    { id: 'pomodoro_5', icon: '🍅', nameEn: 'Deep Focus', nameFa: 'تمرکز عمیق', descEn: 'Start 5 Pomodoro focus sessions', descFa: 'اجرای ۵ جلسه تمرکز پومودورو', xp: 90, cond: s => (s.pomodoroSessions || 0) >= 5 }
];

function getUserLevelInfo(xp = 0) {
    let lvl = 1;
    let rem = xp;
    for (let i = 0; i < XP_THRESHOLDS.length; i++) {
        if (rem < XP_THRESHOLDS[i]) {
            return {
                level: lvl,
                currentInLevel: rem,
                neededForNext: XP_THRESHOLDS[i],
                pct: Math.min(100, Math.round((rem / XP_THRESHOLDS[i]) * 100)),
                title: currentLang === 'fa' ? LEVEL_NAMES_FA[lvl - 1] : LEVEL_NAMES_EN[lvl - 1]
            };
        }
        rem -= XP_THRESHOLDS[i];
        lvl = Math.min(10, i + 2);
    }
    return {
        level: 10,
        currentInLevel: XP_THRESHOLDS[9],
        neededForNext: XP_THRESHOLDS[9],
        pct: 100,
        title: currentLang === 'fa' ? LEVEL_NAMES_FA[9] : LEVEL_NAMES_EN[9]
    };
}

function addXp(amount) {
    const before = getUserLevelInfo(state.xp || 0).level;
    state.xp = (state.xp || 0) + amount;
    const afterInfo = getUserLevelInfo(state.xp);
    saveData();
    updateHeaderBadges();
    if (afterInfo.level > before) {
        playSound('levelup');
        showAchievementPopup('🚀', `${t('level')} ${afterInfo.level}!`, `${afterInfo.title} (+${amount} XP)`);
        spawnConfetti();
    }
}

function checkAchievements() {
    if (!Array.isArray(state.achievements)) state.achievements = [];
    ACHIEVEMENTS.forEach(ach => {
        if (state.achievements.includes(ach.id)) return;
        if (ach.cond(state.stats || {}, state.cards || {})) {
            state.achievements.push(ach.id);
            state.xp = (state.xp || 0) + ach.xp;
            saveData();
            const title = currentLang === 'fa' ? ach.nameFa : ach.nameEn;
            const desc = currentLang === 'fa' ? ach.descFa : ach.descEn;
            setTimeout(() => {
                showAchievementPopup(ach.icon, title, `${desc} (+${ach.xp} XP)`);
                spawnConfetti();
            }, 300);
        }
    });
}

function showAchievementPopup(icon, title, desc) {
    const p = document.getElementById('achievementPopup');
    const b = document.getElementById('achievementBackdrop');
    if (!p || !b) return;
    document.getElementById('achIcon').textContent = icon;
    document.getElementById('achTitle').textContent = title;
    document.getElementById('achDesc').textContent = desc;
    p.classList.add('show');
    b.classList.add('show');
}

function closeAchievement() {
    document.getElementById('achievementPopup')?.classList.remove('show');
    document.getElementById('achievementBackdrop')?.classList.remove('show');
}

function spawnConfetti() {
    const container = document.getElementById('confettiContainer');
    if (!container) return;
    const colors = ['#6366f1', '#a855f7', '#ec4899', '#fbbf24', '#10b981', '#06b6d4'];
    for (let i = 0; i < 36; i++) {
        const el = document.createElement('div');
        el.className = 'confetti';
        el.style.left = (Math.random() * 100) + '%';
        el.style.width = (6 + Math.random() * 6) + 'px';
        el.style.height = (6 + Math.random() * 10) + 'px';
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        el.style.animationDuration = (2.1 + Math.random() * 1.5) + 's';
        container.appendChild(el);
        setTimeout(() => el.remove(), 3800);
    }
}

// ===== Daily Challenge =====
function checkDailyChallengeProgress() {
    const today = getDateStr(0);
    const goal = state.settings.dailyGoal || 50;
    if (!state.dailyChallenge || state.dailyChallenge.date !== today) {
        state.dailyChallenge = { date: today, goal, rewarded: false };
    }
    state.dailyChallenge.goal = goal;
    if ((state.stats.todayReviewed || 0) >= goal && !state.dailyChallenge.rewarded) {
        state.dailyChallenge.rewarded = true;
        state.stats.challengesCompleted = (state.stats.challengesCompleted || 0) + 1;
        addXp(100);
        showToast(`🎯 ${t('dailyChallenge')} (+100 XP)`, 'achievement');
        spawnConfetti();
    }
}

// ===== Pomodoro Focus Timer =====
let pomodoroTimerId = null;
let pomodoroTargetMs = 0;

function togglePomodoro() {
    if (pomodoroTimerId) {
        clearInterval(pomodoroTimerId);
        pomodoroTimerId = null;
        document.getElementById('pomodoroBadge').style.display = 'none';
        showToast(currentLang === 'fa' ? 'تایمر پومودورو متوقف شد' : 'Pomodoro stopped', 'info');
        return;
    }
    pomodoroTargetMs = Date.now() + 25 * 60 * 1000;
    state.stats.pomodoroSessions = (state.stats.pomodoroSessions || 0) + 1;
    saveData();
    const badge = document.getElementById('pomodoroBadge');
    if (badge) badge.style.display = 'inline-flex';
    updatePomodoroTick();
    pomodoroTimerId = setInterval(updatePomodoroTick, 1000);
    showToast(currentLang === 'fa' ? '🍅 تمرکز ۲۵ دقیقه‌ای پومودورو آغاز شد!' : '🍅 25-min Pomodoro started!', 'success');
}

function updatePomodoroTick() {
    const rem = pomodoroTargetMs - Date.now();
    if (rem <= 0) {
        clearInterval(pomodoroTimerId);
        pomodoroTimerId = null;
        document.getElementById('pomodoroBadge').style.display = 'none';
        addXp(40);
        playSound('levelup');
        showToast(currentLang === 'fa' ? '🎉 پومودورو تمام شد! ۵ دقیقه استراحت کن (+40 XP)' : '🎉 Pomodoro complete! +40 XP', 'achievement');
        return;
    }
    const m = String(Math.floor(rem / 60000)).padStart(2, '0');
    const s = String(Math.floor((rem % 60000) / 1000)).padStart(2, '0');
    const el = document.getElementById('pomodoroBadgeTime');
    if (el) el.textContent = `${m}:${s}`;
}

// ===== Navigation & Theme =====
function navigateTo(pageId) {
    if (isInStudyMode && pageId !== 'studyPage') {
        stopAllStudyAudio();
        isInStudyMode = false;
        state.currentStudy = null;
        document.getElementById('appHeader')?.classList.remove('hidden');
        document.getElementById('bottomNav')?.classList.remove('study-hidden');
    }

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item, .sidebar-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === pageId);
    });

    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');

    if (pageId === 'homePage') renderHome();
    else if (pageId === 'decksPage') renderDecks();
    else if (pageId === 'browserPage') renderBrowserPage();
    else if (pageId === 'statsPage') renderStatsPage();
    else if (pageId === 'settingsPage') syncSettingsControls();

    const appContainer = document.querySelector('.app-container');
    if (appContainer) appContainer.scrollTop = 0;
}

function applyTranslations() {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
}

function changeLanguage(lang) {
    currentLang = lang;
    state.settings.language = lang;
    localStorage.setItem('flashmind_lang', lang);
    saveData();
    applyTranslations();
    renderHome();
    renderDecks();
    syncSettingsControls();
}

function setTheme(themeId) {
    state.settings.theme = themeId;
    document.documentElement.setAttribute('data-theme', themeId);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = themeId === 'light' ? '☀️' : '🌙';
    saveData();
    syncSettingsControls();
    if (document.getElementById('statsPage')?.classList.contains('active')) {
        renderStatsPage();
    }
}

function toggleQuickTheme() {
    const next = state.settings.theme === 'light' ? 'dark' : 'light';
    setTheme(next);
}

function applyCardFontScale() {
    document.documentElement.style.setProperty('--card-font-scale', state.settings.cardFontSize || 1);
}

function renderStudyModesUI(mode) {
    document.querySelectorAll('.mode-card').forEach(el => {
        el.classList.toggle('active', el.dataset.mode === mode);
    });
}

function setStudyMode(mode) {
    state.settings.studyMode = mode;
    saveData();
    renderStudyModesUI(mode);
    haptic(8);
}

function updateHeaderBadges() {
    const xpEl = document.getElementById('userXp');
    const stEl = document.getElementById('headerStreak');
    if (xpEl) xpEl.textContent = state.xp || 0;
    if (stEl) stEl.textContent = state.stats.streak || 0;
}

// ===== Render Home Dashboard =====
function renderHome() {
    // Check streak validity
    const today = getDateStr(0);
    const yesterday = getDateStr(-1);
    if (state.stats.lastStudyDate && state.stats.lastStudyDate !== today && state.stats.lastStudyDate !== yesterday) {
        state.stats.streak = 0;
    }

    updateHeaderBadges();

    // Greeting & Date
    const hr = new Date().getHours();
    const gKey = hr < 12 ? 'morning' : hr < 17 ? 'afternoon' : 'evening';
    const greetEl = document.getElementById('greetingFull');
    if (greetEl) {
        greetEl.textContent = currentLang === 'fa' ? `${t(gKey)} 👋` : `${t('greeting')} ${t(gKey)} 👋`;
    }
    const dateEl = document.getElementById('dateDisplay');
    if (dateEl) {
        try {
            dateEl.textContent = new Date().toLocaleDateString(currentLang === 'fa' ? 'fa-IR' : 'en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        } catch (e) {}
    }

    // Mastery Ring & Spectrum
    const mStats = getMasteryStats(null);
    const circumference = 2 * Math.PI * 36; // r=36 -> ~226.2
    const ringFg = document.getElementById('heroMasteryRing');
    if (ringFg) {
        ringFg.style.strokeDasharray = `${circumference}`;
        ringFg.style.strokeDashoffset = `${circumference - (mStats.masteryPct / 100) * circumference}`;
    }
    const ringPct = document.getElementById('heroMasteryPct');
    if (ringPct) ringPct.textContent = `${mStats.masteryPct}%`;

    // Due Queue Stats
    const due = getDeckDueCounts(null);
    document.getElementById('homeNewCount').textContent = due.new;
    document.getElementById('homeLearnCount').textContent = due.learning;
    document.getElementById('homeReviewCount').textContent = due.review;
    document.getElementById('homeMasteryCount').textContent = `${mStats.masteryPct}%`;

    // Daily Progress & Level
    const goal = state.settings.dailyGoal || 50;
    const revToday = state.stats.todayReviewed || 0;
    const goalPct = Math.min(100, Math.round((revToday / goal) * 100));
    document.getElementById('todayProgressFill').style.width = `${goalPct}%`;
    document.getElementById('todayProgressPct').textContent = `${goalPct}%`;
    document.getElementById('todayProgressText').textContent = `${revToday} ${t('cardsOf')} ${goal} ${t('cards')}`;
    const remDue = due.new + due.learning + due.review;
    document.getElementById('todayEtaText').textContent = `~${Math.max(1, Math.ceil(remDue * 0.25))} min`;

    const lvl = getUserLevelInfo(state.xp || 0);
    document.getElementById('homeLevelNum').textContent = lvl.level;
    document.getElementById('homeLevelTitle').textContent = lvl.title;
    document.getElementById('homeLevelXp').textContent = `${lvl.currentInLevel} / ${lvl.neededForNext} XP`;
    document.getElementById('homeLevelFill').style.width = `${lvl.pct}%`;

    // Brainscape 5-Color Spectrum Bar
    const specBar = document.getElementById('homeSpectrumBar');
    if (specBar) {
        const tot = Math.max(1, mStats.total);
        specBar.innerHTML = [0, 1, 2, 3, 4, 5].map(k => {
            const w = ((mStats.spectrum[k] || 0) / tot) * 100;
            return w > 0 ? `<div class="spectrum-seg s${k}" style="width:${w}%" title="Level ${k}: ${mStats.spectrum[k]}"></div>` : '';
        }).join('');
    }
    document.getElementById('specCountTotal').textContent = `${mStats.total} ${t('cards')}`;

    renderStudyModesUI(state.settings.studyMode || 'brainscape');
}

// ===== Render Decks Page =====
function renderDecks() {
    const list = document.getElementById('deckList');
    if (!list) return;
    const query = (document.getElementById('deckSearch')?.value || '').trim().toLowerCase();
    const deckIds = Object.keys(state.decks).sort((a, b) => (state.decks[a].name || '').localeCompare(state.decks[b].name || ''));

    if (deckIds.length === 0) {
        list.style.gridTemplateColumns = '1fr';
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🧠</div>
                <h3 style="font-size:1.1rem;font-weight:800;margin-bottom:6px">${t('noDecksYet')}</h3>
                <p style="color:var(--text-secondary);font-size:0.84rem;margin-bottom:18px">${t('importOrCreate')}</p>
                <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
                    <button class="btn btn-primary" onclick="createStarterDecks();renderHome();renderDecks();showToast('Starter decks ready!','success')">✨ ${t('sampleDeck')}</button>
                    <button class="btn btn-secondary" onclick="showImportModal()">📥 ${t('importDeck')}</button>
                    <button class="btn btn-secondary" onclick="showAddCardModal()">➕ ${t('addCard')}</button>
                </div>
            </div>
        `;
        return;
    }

    list.style.gridTemplateColumns = '';
    const filteredIds = deckIds.filter(id => (state.decks[id].name || '').toLowerCase().includes(query));

    list.innerHTML = filteredIds.map(deckId => {
        const deck = state.decks[deckId];
        const rawName = deck.name || 'Unnamed Deck';
        const parts = rawName.split(/::|\s\/\s/);
        const folderName = parts.length > 1 ? parts.slice(0, -1).join(' › ') : '';
        const leafName = parts[parts.length - 1];

        const due = getDeckDueCounts(deckId);
        const m = getMasteryStats(deckId);
        const tot = Math.max(1, m.total);

        const miniSegs = [1, 2, 3, 4, 5].map(k => {
            const w = ((m.spectrum[k] || 0) / tot) * 100;
            return w > 0 ? `<div class="spectrum-seg s${k}" style="width:${w}%"></div>` : '';
        }).join('');

        return `
            <div class="deck-card animate-fadeIn" onclick="startStudy('${deckId}')">
                <div class="deck-card-header">
                    <div class="deck-title-wrap">
                        <div class="deck-icon-badge">${folderName ? '🗂️' : '📘'}</div>
                        <div class="deck-name-group">
                            ${folderName ? `<div class="deck-folder-tag" dir="auto">${escapeHtml(folderName)}</div>` : ''}
                            <div class="deck-name" dir="auto">${escapeHtml(leafName)}</div>
                        </div>
                    </div>
                    <div class="deck-actions-inline">
                        <button class="deck-study-pill" type="button" onclick="event.stopPropagation();startStudy('${deckId}')">${t('studyNow')}</button>
                        <button class="deck-menu-btn" type="button" onclick="event.stopPropagation();showDeckOptions('${deckId}')">⋮</button>
                    </div>
                </div>

                <div class="deck-stats-row">
                    <div class="deck-stat"><span class="dot new"></span><span class="count">${due.new}</span><span class="label">${t('new')}</span></div>
                    <div class="deck-stat"><span class="dot learning"></span><span class="count">${due.learning}</span><span class="label">${t('learning')}</span></div>
                    <div class="deck-stat"><span class="dot review"></span><span class="count">${due.review}</span><span class="label">${t('toReview')}</span></div>
                    <div class="deck-stat" style="margin-inline-start:auto"><span class="count">${m.total}</span><span class="label">${t('cards')}</span></div>
                </div>

                <div class="deck-progress-container">
                    <div class="deck-spectrum-mini">${miniSegs}</div>
                    <span class="deck-progress-text">${m.masteryPct}% ${t('weightedMastery')}</span>
                </div>
            </div>
        `;
    }).join('');
}

function showCreateDeckModal() {
    openModal(`
        <div class="modal-header-bar">
            <h2 class="modal-title">📁 ${t('newDeck')}</h2>
            <button class="icon-btn" onclick="closeModalDirect()">✕</button>
        </div>
        <div class="form-group">
            <label>${t('newDeckName')}</label>
            <input type="text" id="createDeckNameInp" placeholder="e.g. Medicine::Cardiology" dir="auto"/>
        </div>
        <button class="btn btn-primary btn-full" onclick="saveNewDeckModal()">✅ ${t('save')}</button>
    `);
    setTimeout(() => document.getElementById('createDeckNameInp')?.focus(), 80);
}

function saveNewDeckModal() {
    const val = (document.getElementById('createDeckNameInp')?.value || '').trim();
    if (!val) return;
    const id = 'deck_' + Date.now();
    state.decks[id] = { name: val, created: Date.now(), source: 'manual' };
    saveData();
    closeModalDirect();
    renderDecks();
    showToast(currentLang === 'fa' ? 'دسته جدید ساخته شد!' : 'Deck created!', 'success');
}

function showDeckOptions(deckId) {
    const deck = state.decks[deckId];
    if (!deck) return;
    const m = getMasteryStats(deckId);
    openModal(`
        <div class="modal-header-bar">
            <div>
                <h2 class="modal-title" dir="auto">${escapeHtml(deck.name)}</h2>
                <div style="font-size:0.76rem;color:var(--text-muted)">${m.total} ${t('cards')} • ${m.masteryPct}% ${t('weightedMastery')}</div>
            </div>
            <button class="icon-btn" onclick="closeModalDirect()">✕</button>
        </div>
        <div class="deck-options-list">
            <button class="deck-option-btn" onclick="closeModalDirect();startStudy('${deckId}')">🎯 ${t('studyNow')}</button>
            <button class="deck-option-btn" onclick="closeModalDirect();startStudy('${deckId}', true)">⚡ ${t('cramDeck')}</button>
            <button class="deck-option-btn" onclick="closeModalDirect();showAddCardModal('${deckId}')">➕ ${t('addCard')}</button>
            <button class="deck-option-btn" onclick="closeModalDirect();openBrowserForDeck('${deckId}')">🔍 ${t('browseCards')}</button>
            <button class="deck-option-btn" onclick="promptRenameDeck('${deckId}')">✏️ ${t('renameDeck')}</button>
            <button class="deck-option-btn" onclick="exportSingleDeckJSON('${deckId}');closeModalDirect()">📤 ${t('exportAsJSON')}</button>
            <button class="deck-option-btn" onclick="exportDeckTSV('${deckId}');closeModalDirect()">📋 ${t('exportAsTSV')}</button>
            <button class="deck-option-btn" onclick="resetDeckCardsProgress('${deckId}')">🔄 ${t('resetDeckProgress')}</button>
            <button class="deck-option-btn danger" onclick="confirmDeleteDeck('${deckId}')">🗑️ ${t('deleteDeck')}</button>
        </div>
    `);
}

function promptRenameDeck(deckId) {
    const deck = state.decks[deckId];
    if (!deck) return;
    openModal(`
        <div class="modal-header-bar">
            <h2 class="modal-title">✏️ ${t('renameDeck')}</h2>
            <button class="icon-btn" onclick="closeModalDirect()">✕</button>
        </div>
        <div class="form-group">
            <label>${t('newDeckName')}</label>
            <input type="text" id="renameDeckInp" value="${escapeHtml(deck.name)}" dir="auto"/>
        </div>
        <button class="btn btn-primary btn-full" onclick="applyRenameDeck('${deckId}')">${t('save')}</button>
    `);
}

function applyRenameDeck(deckId) {
    const name = (document.getElementById('renameDeckInp')?.value || '').trim();
    if (!name || !state.decks[deckId]) return;
    state.decks[deckId].name = name;
    saveData();
    closeModalDirect();
    renderDecks();
    showToast(currentLang === 'fa' ? 'نام دسته ویرایش شد' : 'Deck renamed!', 'success');
}

function resetDeckCardsProgress(deckId) {
    for (const cid in state.cards) {
        const c = state.cards[cid];
        if (c && c.deckId === deckId) {
            c.status = 'new';
            c.interval = 0;
            c.repetitions = 0;
            c.confidence = 0;
            c.stability = 0;
            c.dueDate = 0;
            c.lapses = 0;
            delete c.suspended;
            delete c.buriedUntil;
        }
    }
    saveData();
    closeModalDirect();
    renderDecks();
    renderHome();
    showToast(currentLang === 'fa' ? 'پیشرفت تمام کارت‌های دسته بازنشانی شد' : 'Deck progress reset!', 'info');
}

function confirmDeleteDeck(deckId) {
    const deck = state.decks[deckId];
    if (!deck) return;
    openModal(`
        <h2 class="modal-title">⚠️ ${t('deleteDeck')}</h2>
        <p style="color:var(--text-secondary);margin:12px 0 18px">${t('confirmDelete')} "<strong>${escapeHtml(deck.name)}</strong>"? ${t('cannotUndo')}</p>
        <div style="display:flex;gap:10px">
            <button class="btn btn-secondary" style="flex:1" onclick="closeModalDirect()">${t('cancel')}</button>
            <button class="btn btn-danger" style="flex:1" onclick="executeDeleteDeck('${deckId}')">${t('delete')}</button>
        </div>
    `);
}

function executeDeleteDeck(deckId) {
    for (const cid in state.cards) {
        if (state.cards[cid]?.deckId === deckId) delete state.cards[cid];
    }
    delete state.decks[deckId];
    saveData();
    closeModalDirect();
    renderDecks();
    renderHome();
    showToast(currentLang === 'fa' ? 'دسته حذف شد' : 'Deck deleted', 'info');
}

function exportSingleDeckJSON(deckId) {
    const deck = state.decks[deckId];
    if (!deck) return;
    const cards = Object.values(state.cards).filter(c => c && c.deckId === deckId);
    downloadJSONObject({ deck, cards, exportDate: new Date().toISOString() }, `${deck.name.replace(/[^\w\u0600-\u06FF]+/g, '_')}_flashmind.json`);
}

// =========================================================================
// Rich Card Creator & Editor (Basic, Reversed, Cloze {{c1::...}}, MCQ, Media)
// =========================================================================
function insertClozeAtCursor(inputId) {
    const el = document.getElementById(inputId);
    if (!el) return;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const val = el.value;
    const selected = val.substring(start, end) || (currentLang === 'fa' ? 'پاسخ' : 'answer');
    const existingCount = (val.match(/\{\{c\d+::/gi) || []).length;
    const cNum = existingCount + 1;
    const snippet = `{{c${cNum}::${selected}}}`;
    el.value = val.substring(0, start) + snippet + val.substring(end);
    el.focus();
}

function showAddCardModal(preselectedDeckId = null) {
    const deckIds = Object.keys(state.decks);
    const deckOpts = deckIds.map(id =>
        `<option value="${id}" ${id === preselectedDeckId ? 'selected' : ''}>${escapeHtml(state.decks[id].name)}</option>`
    ).join('');

    const noDecks = deckIds.length === 0;

    openModal(`
        <div class="modal-header-bar">
            <h2 class="modal-title">➕ ${t('addNewCard')}</h2>
            <button class="icon-btn" onclick="closeModalDirect()">✕</button>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div class="form-group">
                <label>${t('deck')}</label>
                <select id="acDeckSelect" onchange="document.getElementById('acNewDeckWrap').style.display=this.value==='__new__'?'block':'none'">
                    ${deckOpts}
                    <option value="__new__" ${noDecks ? 'selected' : ''}>${t('createNewDeck')}</option>
                </select>
            </div>
            <div class="form-group">
                <label>${t('cardType')}</label>
                <select id="acNoteType" onchange="document.getElementById('acMcqWrap').style.display=this.value==='mcq'?'block':'none'">
                    <option value="basic">${t('typeBasic')}</option>
                    <option value="reversed">${t('typeReversed')}</option>
                    <option value="cloze">${t('typeCloze')}</option>
                    <option value="mcq">${t('typeMCQ')}</option>
                </select>
            </div>
        </div>

        <div class="form-group" id="acNewDeckWrap" style="display:${noDecks ? 'block' : 'none'}">
            <label>${t('newDeckName')}</label>
            <input type="text" id="acNewDeckName" placeholder="e.g. English::GRE Vocabulary" dir="auto"/>
        </div>

        <div class="form-group">
            <label>
                <span>${t('front')}</span>
                <button type="button" class="editor-tool-chip" onclick="insertClozeAtCursor('acFront');document.getElementById('acNoteType').value='cloze'">➕ {{c1::Cloze}}</button>
            </label>
            <textarea id="acFront" rows="2" dir="auto" placeholder="${currentLang === 'fa' ? 'واژه، پرسش یا متن دارای {{c1::جای خالی}}' : 'Word, prompt, or {{c1::cloze}} sentence'}"></textarea>
        </div>

        <div class="form-group">
            <label>${t('back')}</label>
            <textarea id="acBack" rows="2" dir="auto"></textarea>
        </div>

        <div class="form-group" id="acMcqWrap" style="display:none">
            <label>${t('mcqWrongLabel')}</label>
            <textarea id="acWrongChoices" rows="3" dir="auto" placeholder="Option B&#10;Option C&#10;Option D"></textarea>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div class="form-group">
                <label>${t('ipaLabel')}</label>
                <input type="text" id="acIpa" placeholder="juːˈbɪkwɪtəs"/>
            </div>
            <div class="form-group">
                <label>${t('hint')}</label>
                <input type="text" id="acHint" dir="auto"/>
            </div>
        </div>

        <div class="form-group">
            <label>${t('example')}</label>
            <input type="text" id="acExample" dir="auto"/>
        </div>

        <div class="form-group">
            <label>${t('tags')}</label>
            <input type="text" id="acTags" placeholder="IELTS, High-Yield, Chapter1" dir="auto"/>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:14px">
            <div class="form-group" style="margin:0">
                <label>🔊 Front MP3</label>
                <input type="file" id="acAudioFront" accept="audio/*" style="font-size:0.7rem;padding:6px"/>
            </div>
            <div class="form-group" style="margin:0">
                <label>🔉 Back MP3</label>
                <input type="file" id="acAudioBack" accept="audio/*" style="font-size:0.7rem;padding:6px"/>
            </div>
            <div class="form-group" style="margin:0">
                <label>🖼️ Image</label>
                <input type="file" id="acImage" accept="image/*" style="font-size:0.7rem;padding:6px"/>
            </div>
        </div>

        <button class="btn btn-primary btn-full" type="button" onclick="saveNewCardFromModal()">✅ ${t('addCard')}</button>
    `);
}

async function saveNewCardFromModal() {
    let deckId = document.getElementById('acDeckSelect').value;
    const noteType = document.getElementById('acNoteType').value;
    const front = document.getElementById('acFront').value.trim();
    const back = document.getElementById('acBack').value.trim();
    const ipa = document.getElementById('acIpa').value.trim();
    const hint = document.getElementById('acHint').value.trim();
    const example = document.getElementById('acExample').value.trim();
    const tags = document.getElementById('acTags').value.split(',').map(s => s.trim()).filter(Boolean);
    const wrongChoices = document.getElementById('acWrongChoices').value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

    if (!front || (!back && !hasClozeSyntax(front))) {
        showToast(t('frontRequired'), 'error');
        return;
    }

    if (deckId === '__new__') {
        const dName = document.getElementById('acNewDeckName').value.trim();
        if (!dName) { showToast(t('frontRequired'), 'error'); return; }
        deckId = 'deck_' + Date.now();
        state.decks[deckId] = { name: dName, created: Date.now(), source: 'manual' };
    }

    let audioFile = null, audioFile3 = null, imageFile = null;
    const af = document.getElementById('acAudioFront').files[0];
    const ab = document.getElementById('acAudioBack').files[0];
    const im = document.getElementById('acImage').files[0];

    if (af) {
        audioFile = `aud_f_${Date.now()}_${af.name}`;
        await saveMediaBlob(audioFile, af);
        state.mediaMap[audioFile] = audioFile;
    }
    if (ab) {
        audioFile3 = `aud_b_${Date.now()}_${ab.name}`;
        await saveMediaBlob(audioFile3, ab);
        state.mediaMap[audioFile3] = audioFile3;
    }
    if (im) {
        imageFile = `img_${Date.now()}_${im.name}`;
        await saveMediaBlob(imageFile, im);
        state.mediaMap[imageFile] = imageFile;
    }

    const baseId = `card_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const resolvedType = hasClozeSyntax(front) ? 'cloze' : (noteType === 'reversed' ? 'basic' : noteType);

    state.cards[baseId] = {
        deckId,
        cardType: resolvedType,
        front,
        back,
        word: front,
        meaning: back,
        ipa,
        hint,
        example,
        wrongChoices: wrongChoices.length ? wrongChoices : undefined,
        tags,
        audioFile,
        audioFile3,
        imageFile,
        status: 'new',
        interval: 0,
        easeFactor: 2.5,
        repetitions: 0,
        dueDate: 0,
        confidence: 0,
        reviewCount: 0,
        created: Date.now()
    };

    // If Reversed Note Type selected -> automatically create complementary Back → Front card!
    if (noteType === 'reversed' && back) {
        state.cards[baseId + '_rev'] = {
            deckId,
            cardType: 'basic',
            front: back,
            back: front,
            word: back,
            meaning: front,
            example,
            tags: [...tags, 'Reversed'],
            audioFile: audioFile3,
            audioFile3: audioFile,
            imageFile,
            status: 'new',
            interval: 0,
            easeFactor: 2.5,
            repetitions: 0,
            dueDate: 0,
            confidence: 0,
            reviewCount: 0,
            created: Date.now() + 1
        };
    }

    saveData();
    closeModalDirect();
    renderHome();
    renderDecks();
    if (document.getElementById('browserPage')?.classList.contains('active')) renderBrowserPage();
    showToast(t('cardAdded'), 'success');
    addXp(8);
}

function showEditCardModal(cardId, fromStudy = false) {
    const c = state.cards[cardId];
    if (!c) return;
    const deckOpts = Object.keys(state.decks).map(id =>
        `<option value="${id}" ${id === c.deckId ? 'selected' : ''}>${escapeHtml(state.decks[id].name)}</option>`
    ).join('');

    openModal(`
        <div class="modal-header-bar">
            <h2 class="modal-title">✏️ ${t('editCard')}</h2>
            <button class="icon-btn" onclick="closeModalDirect()">✕</button>
        </div>
        <div class="form-group">
            <label>${t('deck')}</label>
            <select id="ecDeck">${deckOpts}</select>
        </div>
        <div class="form-group">
            <label>
                <span>${t('front')}</span>
                <button type="button" class="editor-tool-chip" onclick="insertClozeAtCursor('ecFront')">➕ {{c1::Cloze}}</button>
            </label>
            <textarea id="ecFront" rows="2" dir="auto">${escapeHtml(c.word || c.front || '')}</textarea>
        </div>
        <div class="form-group">
            <label>${t('back')}</label>
            <textarea id="ecBack" rows="2" dir="auto">${escapeHtml(c.meaning || c.back || '')}</textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div class="form-group">
                <label>${t('ipaLabel')}</label>
                <input type="text" id="ecIpa" value="${escapeHtml(c.ipa || '')}"/>
            </div>
            <div class="form-group">
                <label>${t('hint')}</label>
                <input type="text" id="ecHint" value="${escapeHtml(c.hint || '')}" dir="auto"/>
            </div>
        </div>
        <div class="form-group">
            <label>${t('example')}</label>
            <textarea id="ecExample" rows="2" dir="auto">${escapeHtml(c.example || '')}</textarea>
        </div>
        <div class="form-group">
            <label>${t('tags')}</label>
            <input type="text" id="ecTags" value="${escapeHtml((c.tags || []).join(', '))}" dir="auto"/>
        </div>
        <div style="display:flex;gap:8px">
            <button class="btn btn-danger" type="button" onclick="deleteCardById('${cardId}', ${fromStudy})">🗑️</button>
            <button class="btn btn-primary" style="flex:1" type="button" onclick="saveEditedCard('${cardId}', ${fromStudy})">✅ ${t('save')}</button>
        </div>
    `);
}

function saveEditedCard(cardId, fromStudy) {
    const c = state.cards[cardId];
    if (!c) return;
    c.deckId = document.getElementById('ecDeck').value;
    c.word = document.getElementById('ecFront').value.trim();
    c.front = c.word;
    c.meaning = document.getElementById('ecBack').value.trim();
    c.back = c.meaning;
    c.ipa = document.getElementById('ecIpa').value.trim();
    c.hint = document.getElementById('ecHint').value.trim();
    c.example = document.getElementById('ecExample').value.trim();
    c.tags = document.getElementById('ecTags').value.split(',').map(s => s.trim()).filter(Boolean);
    if (hasClozeSyntax(c.word)) c.cardType = 'cloze';

    saveData();
    closeModalDirect();
    showToast(t('save') + ' ✓', 'success');
    if (fromStudy && state.currentStudy) renderStudyCard();
    else renderBrowserPage();
}

function deleteCardById(cardId, fromStudy) {
    delete state.cards[cardId];
    browserSelectedIds.delete(cardId);
    saveData();
    closeModalDirect();
    if (fromStudy && state.currentStudy) {
        skipCurrentStudyCard('Card deleted');
    } else {
        renderBrowserPage();
        renderDecks();
        renderHome();
    }
}

// =========================================================================
// Dedicated AnkiDroid Card Browser Page (Search, Filter Chips, Batch Ops)
// =========================================================================
function openBrowserForDeck(deckId) {
    navigateTo('browserPage');
    const sel = document.getElementById('browserDeckSelect');
    if (sel) {
        sel.value = deckId;
        renderBrowserList();
    }
}

function setBrowserChip(filterKey) {
    browserQuickFilter = filterKey;
    document.querySelectorAll('.filter-chip').forEach(ch => {
        ch.classList.toggle('active', ch.dataset.filter === filterKey);
    });
    renderBrowserList();
}

function renderBrowserPage() {
    const sel = document.getElementById('browserDeckSelect');
    if (sel) {
        const prev = sel.value;
        sel.innerHTML = `<option value="">${t('allDecks')}</option>` +
            Object.keys(state.decks).map(id => `<option value="${id}">${escapeHtml(state.decks[id].name)}</option>`).join('');
        if (prev && state.decks[prev]) sel.value = prev;
    }
    renderBrowserList();
}

function renderBrowserList() {
    const deckFilter = document.getElementById('browserDeckSelect')?.value || '';
    const query = (document.getElementById('browserSearchInput')?.value || '').trim().toLowerCase();
    const listEl = document.getElementById('browserCardList');
    const countEl = document.getElementById('browserResultCount');
    const batchBar = document.getElementById('browserBatchBar');
    if (!listEl) return;

    const now = Date.now();
    let matched = [];

    for (const cid in state.cards) {
        const c = state.cards[cid];
        if (!c) continue;
        if (deckFilter && c.deckId !== deckFilter && !isSubdeckOf(c.deckId, deckFilter)) continue;

        if (browserQuickFilter === 'new' && c.status !== 'new') continue;
        if (browserQuickFilter === 'due' && !((c.status === 'learning' || c.status === 'review') && (c.dueDate || 0) <= now && !c.suspended)) continue;
        if (browserQuickFilter === 'weak' && !(getCardConfidenceScore(c) >= 1 && getCardConfidenceScore(c) <= 2)) continue;
        if (browserQuickFilter === 'mastered' && getCardConfidenceScore(c) < 5) continue;
        if (browserQuickFilter === 'flagged' && !c.flag) continue;
        if (browserQuickFilter === 'suspended' && !c.suspended) continue;
        if (browserQuickFilter === 'leech' && (c.lapses || 0) < 4) continue;

        if (query) {
            const hay = `${c.word || ''} ${c.front || ''} ${c.meaning || ''} ${c.back || ''} ${c.example || ''} ${(c.tags || []).join(' ')}`.toLowerCase();
            if (!hay.includes(query)) continue;
        }
        matched.push({ ...c, id: cid });
    }

    if (countEl) countEl.textContent = `${matched.length} ${t('cards')}`;
    if (batchBar) {
        batchBar.style.display = browserSelectedIds.size > 0 ? 'flex' : 'none';
        const selCountEl = document.getElementById('batchSelectedCount');
        if (selCountEl) selCountEl.textContent = `${browserSelectedIds.size} selected`;
    }

    if (matched.length === 0) {
        listEl.innerHTML = `<div class="empty-state"><p>${t('noCardsFound')}</p></div>`;
        return;
    }

    const flagIcons = { 1: '🚩', 2: '🟧', 3: '🟩', 4: '🟦' };
    listEl.innerHTML = matched.slice(0, 250).map(c => {
        const conf = getCardConfidenceScore(c);
        const deckName = state.decks[c.deckId]?.name || '';
        const checked = browserSelectedIds.has(c.id) ? 'checked' : '';
        return `
            <div class="browse-card ${c.suspended ? 'suspended' : ''} ${(c.lapses || 0) >= 4 ? 'leech-card' : ''}">
                <input type="checkbox" ${checked} onchange="toggleBrowserSelect('${c.id}', this.checked)" style="width:17px;height:17px;cursor:pointer;accent-color:var(--accent)"/>
                <div class="browse-card-info" onclick="showEditCardModal('${c.id}', false)">
                    <div class="browse-card-front" dir="auto">
                        ${c.flag ? flagIcons[c.flag] + ' ' : ''}${escapeHtml(c.word || c.front || '')}
                    </div>
                    <div class="browse-card-back" dir="auto">${escapeHtml(c.meaning || c.back || '')}</div>
                    <div class="browse-card-meta">
                        <span>📁 ${escapeHtml(deckName.split('::').pop())}</span>
                        <span>• ${t(c.status || 'new')}</span>
                        ${conf > 0 ? `<span style="color:var(--cbr-${conf});font-weight:700">★ ${conf}/5</span>` : ''}
                        ${c.suspended ? `<span style="color:var(--warning)">⏸️ ${t('suspended')}</span>` : ''}
                        ${(c.lapses || 0) >= 4 ? `<span style="color:var(--danger)">🩸 Leech (${c.lapses})</span>` : ''}
                        ${(c.tags || []).slice(0, 3).map(tg => `<span>#${escapeHtml(tg)}</span>`).join('')}
                    </div>
                </div>
                <button class="icon-btn" onclick="speakTTS(${JSON.stringify(c.word || c.front || '').replace(/"/g, '&quot;')})" title="Speak">🔊</button>
                <button class="icon-btn" onclick="showEditCardModal('${c.id}', false)" title="Edit">✏️</button>
            </div>
        `;
    }).join('');
}

function toggleBrowserSelect(cardId, isChecked) {
    if (isChecked) browserSelectedIds.add(cardId);
    else browserSelectedIds.delete(cardId);
    renderBrowserList();
}

function batchToggleSuspend() {
    browserSelectedIds.forEach(cid => {
        if (state.cards[cid]) state.cards[cid].suspended = !state.cards[cid].suspended;
    });
    browserSelectedIds.clear();
    saveData();
    renderBrowserList();
    renderHome();
    showToast('Updated suspension status', 'info');
}

function batchResetCards() {
    browserSelectedIds.forEach(cid => {
        const c = state.cards[cid];
        if (c) {
            c.status = 'new'; c.interval = 0; c.repetitions = 0; c.confidence = 0; c.dueDate = 0;
            delete c.suspended;
        }
    });
    browserSelectedIds.clear();
    saveData();
    renderBrowserList();
    renderHome();
    showToast('Selected cards reset to New', 'success');
}

function batchDeleteCards() {
    browserSelectedIds.forEach(cid => delete state.cards[cid]);
    browserSelectedIds.clear();
    saveData();
    renderBrowserList();
    renderDecks();
    renderHome();
    showToast('Selected cards deleted', 'info');
}

// =========================================================================
// Analytics & Chart.js Dashboards (Forecast, Maturity, Reviews, Heatmap)
// =========================================================================
function renderStatsPage() {
    const allCards = Object.values(state.cards);
    const totalCards = allCards.length;
    const mStats = getMasteryStats(null);
    const matureCount = allCards.filter(c => getCardConfidenceScore(c) >= 4 || (c.interval || 0) >= 21).length;

    const overview = document.getElementById('statsOverview');
    if (overview) {
        overview.innerHTML = `
            <div class="overview-card" style="--card-color:var(--accent)">
                <div class="oc-label">${t('totalCards')}</div>
                <div class="oc-value">${totalCards}</div>
                <div class="oc-sub">${Object.keys(state.decks).length} ${t('decks')}</div>
            </div>
            <div class="overview-card" style="--card-color:var(--success)">
                <div class="oc-label">${t('totalReviews')}</div>
                <div class="oc-value">${state.stats.totalReviews || 0}</div>
                <div class="oc-sub">${state.stats.streak || 0} ${t('streakDay')} 🔥</div>
            </div>
            <div class="overview-card" style="--card-color:var(--purple)">
                <div class="oc-label">${t('matureCards')}</div>
                <div class="oc-value">${matureCount}</div>
                <div class="oc-sub">${totalCards ? Math.round((matureCount / totalCards) * 100) : 0}%</div>
            </div>
            <div class="overview-card" style="--card-color:var(--gold)">
                <div class="oc-label">${t('avgEase')}</div>
                <div class="oc-value">${mStats.masteryPct}%</div>
                <div class="oc-sub">Brainscape Index</div>
            </div>
        `;
    }

    renderReviews30Chart();
    renderForecast14Chart();
    renderMaturityDoughnut(mStats);
    renderRetentionLineChart();
    renderHeatmap90();
    renderAchievementsGrid();
}

function getChartThemeColors() {
    const isLight = state.settings.theme === 'light';
    return {
        text: isLight ? '#4a536e' : '#a2acc7',
        grid: isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.06)'
    };
}

function renderReviews30Chart() {
    const canvas = document.getElementById('reviewsBarCanvas');
    if (!canvas || typeof Chart === 'undefined') return;
    if (chartInstances.reviews) chartInstances.reviews.destroy();

    const labels = [];
    const values = [];
    for (let i = 13; i >= 0; i--) {
        const dStr = getDateStr(-i);
        labels.push(dStr.slice(5));
        values.push(state.stats.dailyReviews?.[dStr] || 0);
    }
    const colors = getChartThemeColors();
    chartInstances.reviews = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: '#6366f1',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: colors.grid }, ticks: { color: colors.text, precision: 0 } },
                x: { grid: { display: false }, ticks: { color: colors.text, maxRotation: 0, autoSkip: true } }
            }
        }
    });
}

function renderForecast14Chart() {
    const canvas = document.getElementById('forecastCanvas');
    if (!canvas || typeof Chart === 'undefined') return;
    if (chartInstances.forecast) chartInstances.forecast.destroy();

    const now = Date.now();
    const buckets = new Array(14).fill(0);
    const labels = [];
    for (let d = 0; d < 14; d++) {
        labels.push(d === 0 ? (currentLang === 'fa' ? 'امروز' : 'Today') : `+${d}d`);
    }

    Object.values(state.cards).forEach(c => {
        if (!c || c.suspended || c.status === 'new' || !c.dueDate) return;
        const diffDays = Math.max(0, Math.floor((c.dueDate - now) / 86400000));
        if (diffDays < 14) buckets[diffDays]++;
    });

    const colors = getChartThemeColors();
    chartInstances.forecast = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                data: buckets,
                backgroundColor: '#10b981',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: colors.grid }, ticks: { color: colors.text, precision: 0 } },
                x: { grid: { display: false }, ticks: { color: colors.text } }
            }
        }
    });
}

function renderMaturityDoughnut(mStats) {
    const canvas = document.getElementById('maturityCanvas');
    if (!canvas || typeof Chart === 'undefined') return;
    if (chartInstances.maturity) chartInstances.maturity.destroy();

    const s = mStats.spectrum;
    const total = mStats.total;
    const dataVals = total > 0 ? [s[0], s[1], s[2], s[3], s[4], s[5]] : [1, 0, 0, 0, 0, 0];
    const colors = getChartThemeColors();

    chartInstances.maturity = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: [t('unseen'), '1 - ' + t('c1'), '2 - ' + t('c2'), '3 - ' + t('c3'), '4 - ' + t('c4'), '5 - ' + t('c5')],
            datasets: [{
                data: dataVals,
                backgroundColor: ['#334155', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '64%',
            plugins: {
                legend: { position: 'right', labels: { color: colors.text, boxWidth: 11, font: { size: 11 } } }
            }
        }
    });
}

function renderRetentionLineChart() {
    const canvas = document.getElementById('forgettingCurveChart');
    if (!canvas || typeof Chart === 'undefined') return;
    if (chartInstances.retention) chartInstances.retention.destroy();

    const hist = Object.entries(state.stats.retentionHistory || {}).sort((a, b) => a[0].localeCompare(b[0])).slice(-14);
    const labels = hist.length ? hist.map(([d]) => d.slice(5)) : ['Day 1', 'Day 3', 'Day 7', 'Day 14'];
    const values = hist.length ? hist.map(([, v]) => v) : [96, 92, 90, 91];
    const colors = getChartThemeColors();

    chartInstances.retention = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                data: values,
                borderColor: '#a855f7',
                backgroundColor: 'rgba(168, 85, 247, 0.14)',
                tension: 0.35,
                fill: true,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { min: 50, max: 100, grid: { color: colors.grid }, ticks: { color: colors.text } },
                x: { grid: { display: false }, ticks: { color: colors.text } }
            }
        }
    });
}

function renderHeatmap90() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    const cells = [];
    for (let i = 89; i >= 0; i--) {
        const dStr = getDateStr(-i);
        const cnt = state.stats.dailyReviews?.[dStr] || 0;
        let lvl = 0;
        if (cnt > 0) lvl = 1;
        if (cnt >= 15) lvl = 2;
        if (cnt >= 35) lvl = 3;
        if (cnt >= 70) lvl = 4;
        if (cnt >= 120) lvl = 5;
        cells.push(`<div class="cal-day ${lvl ? 'level-' + lvl : ''} ${i === 0 ? 'today' : ''}" title="${dStr}: ${cnt} reviews"></div>`);
    }
    grid.innerHTML = cells.join('');
}

function renderAchievementsGrid() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;
    const unlocked = state.achievements || [];
    grid.innerHTML = ACHIEVEMENTS.map(a => {
        const ok = unlocked.includes(a.id);
        const name = currentLang === 'fa' ? a.nameFa : a.nameEn;
        const desc = currentLang === 'fa' ? a.descFa : a.descEn;
        return `
            <div class="achievement-item ${ok ? 'unlocked' : 'locked'}" onclick="showAchievementPopup('${a.icon}', ${JSON.stringify(name).replace(/"/g, '&quot;')}, ${JSON.stringify(desc + ' (+' + a.xp + ' XP)').replace(/"/g, '&quot;')})">
                <div class="ach-emoji">${a.icon}</div>
                <div class="ach-name">${escapeHtml(name)}</div>
            </div>
        `;
    }).join('');
}

// =========================================================================
// Settings, Backup & Restore
// =========================================================================
function syncSettingsControls() {
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    const setTog = (id, bool) => { const el = document.getElementById(id); if (el) el.classList.toggle('active', Boolean(bool)); };

    setVal('themeSelect', state.settings.theme || 'dark');
    setVal('newCardsPerDay', state.settings.newCardsPerDay || 20);
    setVal('reviewsPerDay', state.settings.reviewsPerDay || 200);
    setVal('dailyGoal', state.settings.dailyGoal || 50);
    setVal('desiredRetentionSelect', String(state.settings.desiredRetention || 0.9));
    setVal('cardFontSize', String(state.settings.cardFontSize || 1));
    setVal('languageSelect', currentLang);

    setTog('shuffleToggle', state.settings.shuffle);
    setTog('autoplayToggle', state.settings.autoplay);
    setTog('ttsToggle', state.settings.ttsFallback);
    setTog('replayFrontAudioToggle', state.settings.replayFrontAudio);
    setTog('soundToggle', state.settings.sound);
    setTog('hapticToggle', state.settings.haptic);
}

function toggleSetting(key, el) {
    state.settings[key] = !state.settings[key];
    if (el) el.classList.toggle('active', state.settings[key]);
    saveData();
    haptic(10);
}

function updateSetting(key, rawValue) {
    const num = Number(rawValue);
    state.settings[key] = Number.isNaN(num) ? rawValue : num;
    saveData();
    if (key === 'cardFontSize') applyCardFontScale();
    renderHome();
}

function downloadJSONObject(obj, filename) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function exportFullBackup() {
    downloadJSONObject(state, `flashmind_pro_backup_${getDateStr(0)}.json`);
    showToast(currentLang === 'fa' ? 'فایل پشتیبان کامل دانلود شد!' : 'Full JSON backup exported!', 'success');
}

function importFullBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    importJSONFile(file);
    event.target.value = '';
}

function optimizeDatabase() {
    const before = JSON.stringify(state).length;
    cleanupBeforeSave();
    saveData();
    const after = JSON.stringify(state).length;
    const savedKb = Math.max(0, ((before - after) / 1024)).toFixed(1);
    showToast(`${t('optimizeStorage')}: ${savedKb} KB freed`, 'success');
}

function confirmFactoryReset() {
    openModal(`
        <h2 class="modal-title">⚠️ ${t('resetAllData')}</h2>
        <p style="color:var(--text-secondary);margin:12px 0 18px">${t('deleteAll')} — ${t('cannotUndo')}</p>
        <div style="display:flex;gap:10px">
            <button class="btn btn-secondary" style="flex:1" onclick="closeModalDirect()">${t('cancel')}</button>
            <button class="btn btn-danger" style="flex:1" onclick="executeFactoryReset()">${t('delete')}</button>
        </div>
    `);
}

async function executeFactoryReset() {
    const keepLang = currentLang;
    const keepTheme = state.settings.theme;
    state.decks = {};
    state.cards = {};
    state.mediaMap = {};
    state.stats = { streak: 0, lastStudyDate: null, todayDate: getDateStr(0), dailyReviews: {}, totalReviews: 0, todayReviewed: 0, todayNewStudied: 0, pomodoroSessions: 0, typingAnswers: 0, challengesCompleted: 0, retentionHistory: {} };
    state.achievements = [];
    state.xp = 0;
    state.settings.language = keepLang;
    state.settings.theme = keepTheme;
    await clearAllMedia();
    saveData();
    closeModalDirect();
    renderHome();
    renderDecks();
    showToast('Factory reset completed', 'info');
}

// ===== Modal & Toast Helpers =====
function openModal(html) {
    const body = document.getElementById('modalBody');
    const overlay = document.getElementById('modalOverlay');
    if (body && overlay) {
        body.innerHTML = html;
        overlay.classList.add('active');
    }
}

function closeModalDirect() {
    document.getElementById('modalOverlay')?.classList.remove('active');
}

function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icons = { success: '✅', error: '❌', info: '💡', achievement: '🏆' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${icons[type] || '💡'}</span><span dir="auto">${escapeHtml(msg)}</span>`;
    container.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-8px)';
        el.style.transition = 'all 0.25s ease';
        setTimeout(() => el.remove(), 260);
    }, 2900);
}

// ===== Keyboard Shortcuts (Desktop Pro Workflow like Anki Desktop & Brainscape) =====
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        const activeTag = (document.activeElement?.tagName || '').toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
            if (e.key === 'Escape') closeModalDirect();
            return;
        }

        if (e.key === 'Escape') {
            if (document.getElementById('modalOverlay')?.classList.contains('active')) {
                closeModalDirect();
                return;
            }
        }

        const onStudy = document.getElementById('studyPage')?.classList.contains('active') && state.currentStudy;
        if (!onStudy) return;

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            undoLastReview();
            return;
        }

        const mode = state.settings.studyMode || 'brainscape';
        const card = state.currentStudy.cards[state.currentStudy.currentIndex];
        const isMCQ = mode === 'mcq' || card?.cardType === 'mcq';
        const answerWrap = document.getElementById('answerButtonsWrap');
        const isRevealed = answerWrap && answerWrap.style.display !== 'none';

        if ((e.code === 'Space' || e.key === 'Enter') && !isMCQ && mode !== 'typing') {
            e.preventDefault();
            if (!isRevealed) {
                flipCard();
            } else {
                // Space when revealed defaults to "Good" / "4" like Anki!
                if (mode === 'brainscape') submitCardRating('brainscape', 4);
                else if (mode === 'fsrs') submitCardRating('fsrs', 3);
                else submitCardRating('sm2', 'good');
            }
            return;
        }

        if (isMCQ && !isRevealed && e.key >= '1' && e.key <= '4') {
            const btns = document.querySelectorAll('.mcq-option-btn');
            const target = btns[parseInt(e.key, 10) - 1];
            if (target && !target.disabled) selectMCQOption(target);
            return;
        }

        if (isRevealed) {
            if (mode === 'brainscape' && !isMCQ && mode !== 'typing') {
                if (e.key >= '1' && e.key <= '5') submitCardRating('brainscape', parseInt(e.key, 10));
            } else if (mode === 'fsrs') {
                if (e.key >= '1' && e.key <= '4') submitCardRating('fsrs', parseInt(e.key, 10));
            } else {
                const map = { '1': 'again', '2': 'hard', '3': 'good', '4': 'easy' };
                if (map[e.key]) submitCardRating('sm2', map[e.key]);
            }
        }

        if (e.key.toLowerCase() === 'r' && card) {
            if (card.audioFile) playCardAudio(card.audioFile);
            else speakTTS(card.word || card.front || '');
        }
        if (e.key.toLowerCase() === 'w') toggleWhiteboard();
        if (e.key.toLowerCase() === 'e' && card) showEditCardModal(card.id, true);
    });
}

// ===== App Initialization =====
function initApp() {
    loadData();
    currentLang = state.settings.language || localStorage.getItem('flashmind_lang') || 'fa';

    // First-time empty library -> create rich starter decks so the user immediately sees Brainscape + Anki features
    if (!state.onboardingShown && Object.keys(state.decks).length === 0) {
        createStarterDecks();
        state.onboardingShown = true;
        saveData();
    }

    setTheme(state.settings.theme || 'dark');
    applyCardFontScale();
    applyTranslations();
    renderHome();
    renderDecks();
    syncSettingsControls();
    setupKeyboardShortcuts();
    handleInitialUrlParams();

    // Drag & Drop on Decks Import Area
    const dropArea = document.getElementById('importArea');
    if (dropArea) {
        dropArea.ondragover = e => { e.preventDefault(); dropArea.classList.add('dragover'); };
        dropArea.ondragleave = () => dropArea.classList.remove('dragover');
        dropArea.ondrop = e => {
            e.preventDefault();
            dropArea.classList.remove('dragover');
            if (e.dataTransfer.files.length) processImportFile(e.dataTransfer.files[0]);
        };
    }

    document.getElementById('modalOverlay')?.addEventListener('click', function (e) {
        if (e.target === this) closeModalDirect();
    });
}

function handleInitialUrlParams() {
    try {
        const params = new URLSearchParams(window.location.search);
        const view = params.get('view');
        const mode = params.get('mode');
        const reveal = params.get('reveal');
        if (mode) setStudyMode(mode);
        if (view === 'decks') navigateTo('decksPage');
        else if (view === 'browser') navigateTo('browserPage');
        else if (view === 'stats') navigateTo('statsPage');
        else if (view === 'settings') navigateTo('settingsPage');
        else if (view === 'study') {
            startQuickStudy();
            if (reveal === '1') setTimeout(() => flipCard(true), 250);
        }
    } catch (e) {}
}

window.addEventListener('DOMContentLoaded', initApp);
