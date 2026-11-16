/* =========================================================================
   FlashMind Pro v12.0 — Core Engine, Localization, Storage & Schedulers
   100% Backward-Compatible with 'flashmind_pro_v10' + IndexedDB Media Store
   ========================================================================= */

const APP_KEY = 'flashmind_pro_v10'; // Preserved strictly so existing user data never disappears
const DB_NAME = 'flashmind_media_v2';
const STORE_NAME = 'blobs';
const DB_VERSION = 1;

// ===== Complete Bilingual Dictionary (FA & EN) =====
const i18n = {
    en: {
        appName: 'FlashMind Pro',
        proBadge: 'Brainscape × AnkiDroid',
        greeting: 'Good',
        morning: 'Morning',
        afternoon: 'Afternoon',
        evening: 'Evening',
        readyToLearn: 'Ready to Master Everything?',
        keepMomentum: 'Smart Spaced Repetition & Confidence-Based Mastery',
        level: 'Level',
        smartMix: 'Smart Mix Study',
        customStudy: 'Custom / Filtered',
        weightedMastery: 'Mastery',
        new: 'New',
        learning: 'Learning',
        toReview: 'Due Review',
        suspended: 'Suspended',
        buried: 'Buried',
        leech: 'Leech',
        todayProgress: "Today's Goal Progress",
        confidenceSpectrum: 'Brainscape Confidence Spectrum',
        unseen: 'Unseen',
        cardsOf: 'of',
        cards: 'cards',
        home: 'Dashboard',
        decks: 'Decks',
        browser: 'Card Browser',
        stats: 'Analytics',
        settings: 'Settings',
        myDecks: 'My Classes & Decks',
        manageDecks: 'Organize sub-decks (Parent::Child), track mastery & study',
        importDeck: 'Import Deck',
        addCard: 'Add Card',
        newDeck: 'New Deck',
        sampleDeck: 'Load Starter Decks',
        browseCards: 'Browse Cards',
        searchDecks: 'Search classes & decks...',
        importAnkiDeck: 'Import Anki (.apkg), CSV/TSV or JSON',
        importHint: 'Drag & drop .apkg / .csv / .tsv / .json here or click to choose',
        studyModes: 'Study Engine & Modes',
        brainscapeMode: 'Brainscape CBR',
        brainscapeDesc: '1–5 Confidence Rating & Weighted Mastery',
        fsrsMode: 'FSRS-4.5 AI',
        fsrsDesc: 'Modern Memory Stability & Retrievability',
        classicMode: 'Anki SM-2',
        classicDesc: 'Classic 4-button AnkiDroid scheduler',
        mcqMode: 'Multiple Choice',
        mcqDesc: '4-option interactive quiz test',
        typingMode: 'Type Answer',
        typingDesc: 'Active recall with character diff check',
        cramMode: 'Cram / Focus',
        cramDesc: 'Rapid review of weak & due cards',
        recommended: 'PRO',
        pomodoro: 'Pomodoro',
        weakCards: 'Weak Cards',
        leechCards: 'Leeches',
        statistics: 'Learning Analytics',
        learningAnalytics: 'Anki Forecast, Brainscape Mastery & Retention Curves',
        cardsReviewed: 'Daily Reviews (Last 30 Days)',
        forecastTitle: 'Upcoming Due Forecast (Next 14 Days)',
        maturityTitle: 'Card Maturity & Confidence Breakdown',
        forgettingCurve: 'Retention & Memory Stability (%)',
        activityCalendar: '90-Day Study Heatmap',
        achievements: 'Milestones & Achievements',
        customizeExp: 'Fine-tune schedulers, audio, display & backups',
        theme: 'Appearance & Theme',
        appTheme: 'Color Theme',
        chooseTheme: '6 handcrafted pro themes',
        study: 'Scheduler & Daily Limits',
        newCardsPerDay: 'New Cards / Day',
        maxNewCards: 'Maximum new cards introduced daily',
        reviewsPerDay: 'Max Reviews / Day',
        maxReviews: 'Daily review ceiling',
        dailyGoal: 'Daily Target',
        dailyGoalDesc: 'Cards to complete daily challenge',
        desiredRetention: 'FSRS Target Retention',
        desiredRetentionDesc: 'Optimal memory retention probability (80%–97%)',
        shuffleCards: 'Interleave / Shuffle',
        randomizeOrder: 'Mix cards across sub-decks',
        autoplayAudio: 'Auto-Play Audio / TTS',
        autoplayDesc: 'Speak pronunciation automatically',
        ttsFallback: 'Smart TTS Pronunciation',
        ttsFallbackDesc: 'Use Web Speech voice when card has no MP3',
        replayFrontAudio: 'Replay Front Audio on Answer',
        replayFrontAudioDesc: 'Reinforce pronunciation upon reveal',
        soundEffects: 'UI Sound Effects',
        playSounds: 'Subtle acoustic feedback',
        haptic: 'Haptic Vibration',
        hapticDesc: 'Tactile feedback on mobile devices',
        display: 'Interface & Typography',
        cardFontSize: 'Card Font Scale',
        cardFontSizeDesc: 'Adjust flashcard readability',
        language: 'Interface Language',
        selectLang: 'Switch English / فارسی (RTL)',
        data: 'Backup, Export & Maintenance',
        exportData: 'Full JSON Backup',
        backupJSON: 'Export all decks, progress & FSRS state',
        exportCSV: 'Export All Cards (Anki TSV)',
        exportCSVDesc: 'Tab-separated file ready for Anki Desktop',
        importData: 'Restore Backup',
        restoreBackup: 'Import FlashMind JSON backup',
        optimizeStorage: 'Optimize Database',
        cleanupDesc: 'Compact history & clean orphaned keys',
        resetAllData: 'Factory Reset',
        deleteAll: 'Permanently erase all decks & progress',
        showAnswer: 'Reveal Answer',
        tapToReveal: 'Tap card or press Space to reveal',
        howWellDidYouKnow: 'How well did you know this?',
        question: 'Prompt',
        answer: 'Answer',
        again: 'Again',
        hard: 'Hard',
        good: 'Good',
        easy: 'Easy',
        c1: 'Not at all',
        c2: 'Barely',
        c3: 'Somewhat',
        c4: 'Well',
        c5: 'Perfectly',
        undo: 'Undo',
        whiteboard: 'Whiteboard',
        buryCard: 'Bury Today',
        suspendCard: 'Suspend',
        flagCard: 'Flag',
        editCard: 'Edit Card',
        congratulations: 'Session Complete!',
        finishedDeck: 'Outstanding focus! Your memory traces are stronger now.',
        totalCards: 'Total Cards',
        accuracy: 'Accuracy',
        time: 'Duration',
        studyAgain: 'Cram / Study More',
        backToDecks: 'Back to Decks',
        totalReviews: 'Total Reviews',
        matureCards: 'Mastered Cards',
        avgEase: 'Weighted Mastery',
        streakDay: 'Day Streak',
        noDecksYet: 'Your Knowledge Library is Empty',
        importOrCreate: 'Import an Anki .apkg deck, load starter decks, or create your first card!',
        addNewCard: 'Create Flashcard',
        cardType: 'Note Type',
        typeBasic: 'Basic (Front → Back)',
        typeReversed: 'Basic & Reversed (2 Cards)',
        typeCloze: 'Cloze Deletion {{c1::answer}}',
        typeMCQ: 'Multiple Choice Quiz',
        deck: 'Target Deck',
        front: 'Front / Question / Cloze Text',
        back: 'Back / Meaning / Explanation',
        ipaLabel: 'Pronunciation / IPA (Optional)',
        hint: 'Hint (Optional)',
        example: 'Context Example Sentence',
        extraInfo: 'Extra Mnemonic / Notes',
        mcqWrongLabel: 'Wrong Choices (One per line, for Multiple Choice)',
        tags: 'Tags (comma separated)',
        createNewDeck: '+ Create New Deck...',
        newDeckName: 'New Deck Name (use :: for sub-decks, e.g. Medicine::Anatomy)',
        frontRequired: 'Please enter Front and Back content!',
        cardAdded: 'Flashcard saved successfully!',
        filterByDeck: 'Filter by Deck',
        allDecks: 'All Decks',
        searchCards: 'Search front, back, tags, examples...',
        noCardsFound: 'No matching flashcards found.',
        studyNow: 'Study Due',
        cramDeck: 'Cram All Cards',
        renameDeck: 'Rename Deck',
        exportAsJSON: 'Export Deck (.json)',
        exportAsTSV: 'Export for Anki (.tsv)',
        resetDeckProgress: 'Reset Progress',
        deleteDeck: 'Delete Deck',
        save: 'Save Changes',
        delete: 'Delete',
        cancel: 'Cancel',
        close: 'Close',
        confirmDelete: 'Are you sure you want to delete',
        cannotUndo: 'This action cannot be undone.',
        typeAnswer: 'Type the exact answer...',
        checkAnswer: 'Verify Answer',
        correct: 'Spot On!',
        incorrect: 'Close! Correct answer:',
        dailyChallenge: 'Daily Mastery Quest',
        sessionReport: 'Cognitive Session Summary',
        retention: 'Estimated 24h Retention',
        avgTime: 'Avg Speed / Card',
        totalTime: 'Focus Time',
        bestCard: 'Strongest Recall',
        worstCard: 'Needs Review',
        unlimited: 'Unlimited',
        small: 'Small',
        medium: 'Default',
        large: 'Large',
        extraLarge: 'Extra Large',
        less: 'Less',
        more: 'More'
    },
    fa: {
        appName: 'فلش‌مایند پرو',
        proBadge: 'ترکیب Brainscape و AnkiDroid',
        greeting: '',
        morning: 'صبح بخیر',
        afternoon: 'ظهر بخیر',
        evening: 'عصر بخیر',
        readyToLearn: 'آماده تسلط ۱۰۰٪ بر مطالب هستی؟',
        keepMomentum: 'ترکیب هوشمند الگوریتم FSRS آنکی و سیستم تسلط برین‌اسکیپ',
        level: 'سطح',
        smartMix: 'مطالعه ترکیبی هوشمند',
        customStudy: 'مطالعه سفارشی / فیلتردار',
        weightedMastery: 'تسلط کل',
        new: 'جدید',
        learning: 'در حال یادگیری',
        toReview: 'مرور موعد',
        suspended: 'معلیق‌شده',
        buried: 'مخفی امروز',
        leech: 'کارت مزاحم (Leech)',
        todayProgress: 'پیشرفت هدف روزانه',
        confidenceSpectrum: 'طیف تسلط رنگی (سبک Brainscape)',
        unseen: 'دیده‌نشده',
        cardsOf: 'از',
        cards: 'کارت',
        home: 'پیشخوان',
        decks: 'دسته‌ها',
        browser: 'مرورگر کارت‌ها',
        stats: 'آمار حرفه‌ای',
        settings: 'تنظیمات',
        myDecks: 'کلاس‌ها و دسته‌های من',
        manageDecks: 'مدیریت دسته‌ها و زیردسته‌ها (با ::)، رصد درصد تسلط و مرور',
        importDeck: 'درون‌ریزی بسته',
        addCard: 'افزودن کارت',
        newDeck: 'دسته جدید',
        sampleDeck: 'افزودن بسته‌های نمونه',
        browseCards: 'مرورگر کارت‌ها',
        searchDecks: 'جستجوی نام دسته یا کلاس...',
        importAnkiDeck: 'وارد کردن بسته Anki (.apkg)، فایل CSV/TSV یا JSON',
        importHint: 'فایل .apkg، .csv، .tsv یا .json را اینجا رها کنید یا کلیک نمایید',
        studyModes: 'موتور زمان‌بندی و حالت‌های مطالعه',
        brainscapeMode: 'برین‌اسکیپ (CBR)',
        brainscapeDesc: 'امتیاز اطمینان ۱ تا ۵ با محاسبه دقیق درصد تسلط',
        fsrsMode: 'الگوریتم هوشمند FSRS-4.5',
        fsrsDesc: 'پیشرفته‌ترین الگوریتم حافظه آنکی با پایداری پویا',
        classicMode: 'آنکی کلاسیک (SM-2)',
        classicDesc: 'سیستم ۴ دکمه‌ای استاندارد AnkiDroid',
        mcqMode: 'آزمون چهارگزینه‌ای',
        mcqDesc: 'تولید هوشمند گزینه‌ها از کارت‌های دسته',
        typingMode: 'تایپ پاسخ (املا)',
        typingDesc: 'فراخوانی فعال با مقایسه دقیق کاراکتربه‌کاراکتر',
        cramMode: 'مرور فشرده (Cram)',
        cramDesc: 'مرور سریع شب امتحان و کارت‌های دشوار',
        recommended: 'پیشنهادی',
        pomodoro: 'پومودورو',
        weakCards: 'کارت‌های ضعیف',
        leechCards: 'کارت‌های فرّار',
        statistics: 'تحلیل و آمار یادگیری',
        learningAnalytics: 'پیش‌بینی مرور آنکی، طیف تسلط برین‌اسکیپ و منحنی حافظه',
        cardsReviewed: 'تعداد مرور روزانه (۳۰ روز اخیر)',
        forecastTitle: 'پیش‌بینی بار مرور آینده (۱۴ روز پیش‌رو)',
        maturityTitle: 'تفکیک بلوغ و سطح اطمینان کارت‌ها',
        forgettingCurve: 'نرخ یادآوری و پایداری حافظه (%)',
        activityCalendar: 'تقویم حرارتی ۹۰ روز مطالعه',
        achievements: 'دستاوردها و نشان‌های افتخار',
        customizeExp: 'تنظیم دقیق الگوریتم‌ها، تلفظ صوتی، ظاهر و پشتیبان‌گیری',
        theme: 'ظاهر و پوسته برنامه',
        appTheme: 'تم رنگی',
        chooseTheme: '۶ پوسته مدرن و چشم‌نواز (شامل AMOLED)',
        study: 'تنظیمات الگوریتم و سقف روزانه',
        newCardsPerDay: 'کارت جدید در روز',
        maxNewCards: 'حداکثر کارت‌های جدید روزانه',
        reviewsPerDay: 'سقف مرور روزانه',
        maxReviews: 'حداکثر کارت‌های مروری در روز',
        dailyGoal: 'هدف روزانه',
        dailyGoalDesc: 'تعداد کارت برای تکمیل چالش روزانه',
        desiredRetention: 'نرخ یادآوری هدف (FSRS)',
        desiredRetentionDesc: 'احتمال یادآوری مطلوب بین ۸۰٪ تا ۹۷٪',
        shuffleCards: 'ترکیب تصادفی کارت‌ها',
        randomizeOrder: 'بر زدن کارت‌ها هنگام مطالعه',
        autoplayAudio: 'پخش خودکار تلفظ',
        autoplayDesc: 'پخش فایل صوتی یا تلفظ هنگام نمایش کارت',
        ttsFallback: 'تلفظ هوشمند ماشینی (TTS)',
        ttsFallbackDesc: 'تلفظ خودکار کلمات فاقد فایل صوتی',
        replayFrontAudio: 'تکرار صدای روی کارت در پاسخ',
        replayFrontAudioDesc: 'پخش مجدد تلفظ واژه هنگام دیدن معنی',
        soundEffects: 'افکت‌های صوتی رابط کاربری',
        playSounds: 'صدای ظریف ورق زدن و پاسخ صحیح',
        haptic: 'بازخورد لرزشی (Haptic)',
        hapticDesc: 'لرزش ملایم در موبایل هنگام ثبت پاسخ',
        display: 'نمایش، فونت و زبان',
        cardFontSize: 'اندازه نوشتار فلش‌کارت',
        cardFontSizeDesc: 'تنظیم مقیاس فونت کارت‌ها',
        language: 'زبان برنامه',
        selectLang: 'تغییر زبان فارسی (راست‌چین) / English',
        data: 'پشتیبان‌گیری، خروجی آنکی و نگهداری',
        exportData: 'پشتیبان کامل (JSON)',
        backupJSON: 'ذخیره تمام دسته‌ها، کارت‌ها و سوابق مرور',
        exportCSV: 'خروجی جدول آنکی (TSV)',
        exportCSVDesc: 'فایل استاندارد قابل ورود مستقیم به Anki',
        importData: 'بازیابی فایل پشتیبان',
        restoreBackup: 'بازگردانی فایل JSON ذخیره‌شده',
        optimizeStorage: 'بهینه‌سازی پایگاه داده',
        cleanupDesc: 'فشرده‌سازی و آزادسازی فضای حافظه',
        resetAllData: 'بازنشانی کامل برنامه',
        deleteAll: 'حذف دائمی تمام دسته‌ها و آمارها',
        showAnswer: 'نمایش پاسخ',
        tapToReveal: 'روی کارت بزنید یا کلید Space را فشار دهید',
        howWellDidYouKnow: 'چقدر به این کارت مسلط بودی؟',
        question: 'پرسش',
        answer: 'پاسخ',
        again: 'دوباره',
        hard: 'سخت',
        good: 'خوب',
        easy: 'آسان',
        c1: 'اصلاً نمی‌دانستم',
        c2: 'به‌سختی',
        c3: 'تا حدی',
        c4: 'خوب',
        c5: 'کاملاً مسلط',
        undo: 'بازگشت',
        whiteboard: 'تخته رسم',
        buryCard: 'مخفی تا فردا',
        suspendCard: 'تعلیق کارت',
        flagCard: 'پرچم‌گذاری',
        editCard: 'ویرایش کارت',
        congratulations: 'جلسه مطالعه کامل شد!',
        finishedDeck: 'فوق‌العاده بود! مسیرهای عصبی حافظه شما تقویت شدند.',
        totalCards: 'کل کارت‌ها',
        accuracy: 'دقت پاسخ',
        time: 'زمان مطالعه',
        studyAgain: 'مرور مجدد (فشرده)',
        backToDecks: 'بازگشت به دسته‌ها',
        totalReviews: 'کل مرورها',
        matureCards: 'کارت‌های مسلط',
        avgEase: 'تسلط وزنی کل',
        streakDay: 'روز پیوسته',
        noDecksYet: 'هنوز هیچ دسته‌ای نساخته‌اید',
        importOrCreate: 'فایل .apkg آنکی را وارد کنید، بسته‌های نمونه را بارگذاری کنید یا اولین کارت خود را بسازید!',
        addNewCard: 'ساخت فلش‌کارت حرفه‌ای',
        cardType: 'نوع یادداشت (Note Type)',
        typeBasic: 'ساده (رو ← پشت)',
        typeReversed: 'دوطرفه خودکار (ایجاد ۲ کارت معکوس)',
        typeCloze: 'جای خالی کلوز {{c1::پاسخ}}',
        typeMCQ: 'تستی چهارگزینه‌ای',
        deck: 'انتخاب دسته',
        front: 'روی کارت / واژه / متن جای خالی',
        back: 'پشت کارت / معنی / پاسخ تشریحی',
        ipaLabel: 'تلفظ فونتیک / IPA (اختیاری)',
        hint: 'راهنما / سرنخ (اختیاری)',
        example: 'جمله مثال کاربردی',
        extraInfo: 'نکات تکمیلی / رمزگردانی حافظه',
        mcqWrongLabel: 'گزینه‌های انحرافی (هر خط یک گزینه غلط برای حالت تستی)',
        tags: 'برچسب‌ها (با کاما جدا کنید)',
        createNewDeck: '+ ساخت دسته یا زیردسته جدید...',
        newDeckName: 'نام دسته (برای زیردسته از :: استفاده کنید؛ مثل زبان::آیلتس)',
        frontRequired: 'لطفاً متن رو و پشت کارت را وارد کنید!',
        cardAdded: 'فلش‌کارت با موفقیت ذخیره شد!',
        filterByDeck: 'فیلتر بر اساس دسته',
        allDecks: 'همه دسته‌ها',
        searchCards: 'جستجو در واژه، معنی، مثال یا برچسب...',
        noCardsFound: 'هیچ کارتی با این مشخصات پیدا نشد.',
        studyNow: 'شروع مطالعه',
        cramDeck: 'مرور فشرده همه کارت‌ها',
        renameDeck: 'تغییر نام دسته',
        exportAsJSON: 'خروجی بسته (.json)',
        exportAsTSV: 'خروجی جدول آنکی (.tsv)',
        resetDeckProgress: 'صفر کردن پیشرفت دسته',
        deleteDeck: 'حذف کامل دسته',
        save: 'ذخیره تغییرات',
        delete: 'حذف قطعی',
        cancel: 'انصراف',
        close: 'بستن',
        confirmDelete: 'آیا از حذف مورد زیر مطمئن هستید؟',
        cannotUndo: 'این عملیات قابل بازگشت نیست.',
        typeAnswer: 'پاسخ دقیق را تایپ کنید...',
        checkAnswer: 'بررسی پاسخ',
        correct: 'کاملاً صحیح! آفرین',
        incorrect: 'نیاز به دقت بیشتر! پاسخ صحیح:',
        dailyChallenge: 'چالش تسلط روزانه',
        sessionReport: 'گزارش تحلیلی جلسه مطالعه',
        retention: 'پیش‌بینی ماندگاری ۲۴ ساعته',
        avgTime: 'میانگین سرعت پاسخ',
        totalTime: 'زمان کل تمرکز',
        bestCard: 'بهترین یادآوری',
        worstCard: 'نیازمند تمرین بیشتر',
        unlimited: 'نامحدود',
        small: 'کوچک',
        medium: 'استاندارد',
        large: 'بزرگ',
        extraLarge: 'خیلی بزرگ',
        less: 'کمتر',
        more: 'بیشتر'
    }
};

let currentLang = localStorage.getItem('flashmind_lang') || 'fa';

function t(key) {
    return (i18n[currentLang] && i18n[currentLang][key]) || (i18n.en && i18n.en[key]) || key;
}

// ===== Global Application State =====
const DEFAULT_FSRS_W = [0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0234, 1.616, 0.1544, 1.0824, 1.9813, 0.0953, 0.2975, 2.2042, 0.2407, 2.9466];

let state = {
    decks: {},
    cards: {},
    mediaMap: {},
    settings: {
        newCardsPerDay: 20,
        reviewsPerDay: 200,
        dailyGoal: 50,
        desiredRetention: 0.9,
        shuffle: true,
        autoplay: true,
        ttsFallback: true,
        replayFrontAudio: true,
        theme: 'dark',
        sound: true,
        haptic: true,
        language: 'fa',
        studyMode: 'brainscape',
        cardFontSize: 1
    },
    stats: {
        streak: 0,
        lastStudyDate: null,
        todayDate: null,
        dailyReviews: {},
        totalReviews: 0,
        todayReviewed: 0,
        todayNewStudied: 0,
        pomodoroSessions: 0,
        typingAnswers: 0,
        challengesCompleted: 0,
        retentionHistory: {}
    },
    achievements: [],
    xp: 0,
    currentStudy: null,
    dailyChallenge: null,
    fsrsParams: { w: [...DEFAULT_FSRS_W] },
    onboardingShown: false
};

// Undo stack for active study session
let studyUndoStack = [];

// ===== IndexedDB Media Storage (Memory-Safe Blobs, Zero Base64 in JSON) =====
let mediaDB = null;
let dbReadyPromise = null;
const mediaUrlCache = new Map();

function getMediaDB() {
    if (dbReadyPromise) return dbReadyPromise;
    dbReadyPromise = new Promise((resolve, reject) => {
        if (mediaDB) { resolve(mediaDB); return; }
        if (!window.indexedDB) { reject(new Error('IndexedDB not supported')); return; }
        try {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
            req.onsuccess = (e) => {
                mediaDB = e.target.result;
                mediaDB.onversionchange = () => {
                    mediaDB.close();
                    mediaDB = null;
                    dbReadyPromise = null;
                };
                resolve(mediaDB);
            };
            req.onerror = (e) => reject(e.target.error);
            req.onblocked = () => reject(new Error('IndexedDB blocked'));
        } catch (err) {
            reject(err);
        }
    });
    return dbReadyPromise;
}

async function saveMediaBlob(filename, blob) {
    if (!filename || !blob) return false;
    try {
        const db = await getMediaDB();
        return new Promise((resolve) => {
            try {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                const req = store.put(blob, filename);
                req.onsuccess = () => resolve(true);
                req.onerror = () => resolve(false);
                tx.onabort = () => resolve(false);
            } catch (err) {
                resolve(false);
            }
        });
    } catch (e) {
        return false;
    }
}

async function getMediaBlob(filename) {
    if (!filename) return null;
    try {
        const db = await getMediaDB();
        return new Promise((resolve) => {
            try {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const req = store.get(filename);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            } catch (err) {
                resolve(null);
            }
        });
    } catch (e) {
        return null;
    }
}

async function getMediaUrlAsync(filename) {
    if (!filename) return null;
    if (mediaUrlCache.has(filename)) return mediaUrlCache.get(filename);
    const blob = await getMediaBlob(filename);
    if (!blob) return null;
    try {
        const url = URL.createObjectURL(blob);
        mediaUrlCache.set(filename, url);
        return url;
    } catch (e) {
        return null;
    }
}

function getMediaUrl(filename) {
    if (!filename) return null;
    return mediaUrlCache.get(filename) || null;
}

async function preloadMediaUrls(filenames) {
    const toLoad = filenames.filter(f => f && !mediaUrlCache.has(f));
    if (!toLoad.length) return;
    await Promise.all(toLoad.map(f => getMediaUrlAsync(f)));
}

async function clearAllMedia() {
    mediaUrlCache.forEach(url => { try { URL.revokeObjectURL(url); } catch (e) {} });
    mediaUrlCache.clear();
    try {
        const db = await getMediaDB();
        return new Promise((resolve) => {
            try {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).clear();
                tx.oncomplete = () => resolve();
                tx.onerror = () => resolve();
            } catch (e) { resolve(); }
        });
    } catch (e) {}
}

// ===== Persistence & Non-Destructive Schema Migration =====
function getDateStr(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function loadData() {
    try {
        const saved = localStorage.getItem(APP_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            state = {
                ...state,
                ...parsed,
                settings: { ...state.settings, ...(parsed.settings || {}) },
                stats: { ...state.stats, ...(parsed.stats || {}) },
                decks: parsed.decks || {},
                cards: parsed.cards || {},
                mediaMap: parsed.mediaMap || {},
                achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
                fsrsParams: (parsed.fsrsParams && Array.isArray(parsed.fsrsParams.w) && parsed.fsrsParams.w.length >= 17)
                    ? parsed.fsrsParams
                    : { w: [...DEFAULT_FSRS_W] }
            };
        }

        // Daily rollover check (fixes bug where todayReviewed never reset on a new day)
        const today = getDateStr(0);
        if (state.stats.todayDate !== today) {
            state.stats.todayDate = today;
            state.stats.todayReviewed = state.stats.dailyReviews?.[today] || 0;
            state.stats.todayNewStudied = 0;
            // Unbury cards buried on previous days
            for (const cid in state.cards) {
                const c = state.cards[cid];
                if (c && c.buriedUntil && c.buriedUntil !== today) {
                    delete c.buriedUntil;
                }
            }
        }

        const validThemes = ['dark', 'light', 'amoled', 'nord', 'dracula', 'emerald'];
        if (!validThemes.includes(state.settings.theme)) state.settings.theme = 'dark';
        if (!state.settings.desiredRetention || state.settings.desiredRetention < 0.75 || state.settings.desiredRetention > 0.98) {
            state.settings.desiredRetention = 0.9;
        }
    } catch (e) {
        console.error('Error loading state:', e);
    }
}

function cleanupBeforeSave() {
    for (const cardId in state.cards) {
        const card = state.cards[cardId];
        if (!card) { delete state.cards[cardId]; continue; }
        Object.keys(card).forEach(key => {
            const val = card[key];
            if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
                delete card[key];
            }
        });
    }
    const dates = Object.keys(state.stats.dailyReviews || {}).sort();
    if (dates.length > 180) {
        const cutoff = dates[dates.length - 180];
        dates.forEach(d => { if (d < cutoff) delete state.stats.dailyReviews[d]; });
    }
}

function saveData() {
    try {
        cleanupBeforeSave();
        const payload = {
            decks: state.decks,
            cards: state.cards,
            mediaMap: state.mediaMap,
            settings: state.settings,
            stats: state.stats,
            achievements: state.achievements,
            xp: state.xp,
            dailyChallenge: state.dailyChallenge,
            fsrsParams: state.fsrsParams,
            onboardingShown: state.onboardingShown
        };
        localStorage.setItem(APP_KEY, JSON.stringify(payload));
    } catch (e) {
        console.error('Storage save error:', e);
        if (typeof showToast === 'function') showToast(t('storageFull') || 'Storage quota reached!', 'error');
    }
}

// ===== Card Availability & Brainscape Mastery Metrics =====
function isCardAvailable(card) {
    if (!card) return false;
    if (card.suspended) return false;
    const today = getDateStr(0);
    if (card.buriedUntil === today) return false;
    return true;
}

/**
 * Brainscape Authentic Weighted Mastery Calculation:
 * Unseen (confidence 0) = 0%
 * Confidence 1 = 20%, 2 = 40%, 3 = 60%, 4 = 80%, 5 = 100%
 * If a card was studied via SM-2/FSRS without explicit 1-5 confidence, infer from interval/stability.
 */
function getCardConfidenceScore(card) {
    if (!card) return 0;
    if (card.confidence && card.confidence >= 1 && card.confidence <= 5) {
        return card.confidence;
    }
    if (card.status === 'new' || !card.reviewCount) return 0;
    const ivl = card.interval || 0;
    if (card.status === 'learning') return 2;
    if (ivl >= 21) return 5;
    if (ivl >= 7) return 4;
    if (ivl >= 2) return 3;
    return 2;
}

function getMasteryStats(deckId = null) {
    const spectrum = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    let weightedSum = 0;

    for (const cid in state.cards) {
        const c = state.cards[cid];
        if (!c) continue;
        if (deckId && c.deckId !== deckId && !isSubdeckOf(c.deckId, deckId)) continue;
        total++;
        const conf = getCardConfidenceScore(c);
        spectrum[conf] = (spectrum[conf] || 0) + 1;
        weightedSum += (conf / 5) * 100;
    }

    const masteryPct = total > 0 ? Math.round(weightedSum / total) : 0;
    return { total, masteryPct, spectrum };
}

function isSubdeckOf(childDeckId, parentDeckId) {
    if (!childDeckId || !parentDeckId) return false;
    if (childDeckId === parentDeckId) return true;
    const parent = state.decks[parentDeckId];
    const child = state.decks[childDeckId];
    if (!parent || !child) return false;
    const pName = (parent.name || '').trim();
    const cName = (child.name || '').trim();
    return cName.startsWith(pName + '::') || cName.startsWith(pName + ' / ');
}

function getDeckDueCounts(deckId = null) {
    let newCount = 0, learnCount = 0, reviewCount = 0;
    const now = Date.now();

    for (const cid in state.cards) {
        const c = state.cards[cid];
        if (!isCardAvailable(c)) continue;
        if (deckId && c.deckId !== deckId && !isSubdeckOf(c.deckId, deckId)) continue;

        const status = c.status || 'new';
        if (status === 'new') newCount++;
        else if (status === 'learning' && (c.dueDate || 0) <= now) learnCount++;
        else if (status === 'review' && (c.dueDate || 0) <= now) reviewCount++;
    }

    if (!deckId) {
        const remNew = Math.max(0, (state.settings.newCardsPerDay || 20) - (state.stats.todayNewStudied || 0));
        return {
            new: Math.min(newCount, remNew),
            rawNew: newCount,
            learning: learnCount,
            review: Math.min(reviewCount, state.settings.reviewsPerDay || 200),
            rawReview: reviewCount
        };
    }

    return { new: newCount, learning: learnCount, review: reviewCount };
}

// =========================================================================
// SCHEDULER 1: FSRS-4.5 (Free Spaced Repetition Scheduler — Anki Modern)
// =========================================================================
function applyFSRS(card, rating) {
    // rating: 1 = Again, 2 = Hard, 3 = Good, 4 = Easy
    const now = Date.now();
    const w = (state.fsrsParams && state.fsrsParams.w) ? state.fsrsParams.w : DEFAULT_FSRS_W;
    const requestRetention = state.settings.desiredRetention || 0.9;

    let stability = card.stability || 0;
    let difficulty = card.difficulty || 5;
    let status = card.status || 'new';
    let lapses = card.lapses || 0;
    let repetitions = card.repetitions || 0;
    let isLearningMinutes = false;
    let interval = 1;

    const clampD = d => Math.min(10, Math.max(1, d));
    const initD = r => clampD(w[4] - Math.exp(w[5] * (r - 1)) + 1);
    const nextIntervalDays = s => {
        const factor = Math.pow(requestRetention, 1 / -0.5) - 1;
        const ivl = (s / (19 / 81)) * factor;
        return Math.max(1, Math.min(36500, Math.round(ivl)));
    };

    if (status === 'new' || stability <= 0) {
        difficulty = initD(rating);
        stability = Math.max(0.1, w[rating - 1]);
        if (rating === 1) {
            interval = 5; status = 'learning'; isLearningMinutes = true;
        } else if (rating === 2) {
            interval = 15; status = 'learning'; isLearningMinutes = true;
        } else if (rating === 3) {
            interval = nextIntervalDays(stability); status = 'review'; repetitions = 1;
        } else {
            interval = Math.max(2, nextIntervalDays(stability)); status = 'review'; repetitions = 1;
        }
    } else {
        const elapsedDays = card.lastReview ? Math.max(0.01, (now - card.lastReview) / 86400000) : Math.max(0.1, card.interval || 1);
        const retrievability = Math.pow(1 + (19 / 81) * (elapsedDays / Math.max(0.1, stability)), -0.5);

        // Update Difficulty with mean reversion
        const deltaD = -w[6] * (rating - 3);
        const nextD = difficulty + deltaD * ((10 - difficulty) / 9);
        difficulty = clampD(w[7] * initD(4) + (1 - w[7]) * nextD);

        if (rating === 1) {
            lapses++;
            stability = Math.max(0.1, w[11] * Math.pow(difficulty, -w[12]) * (Math.pow(stability + 1, w[13]) - 1) * Math.exp(w[14] * (1 - retrievability)));
            interval = 10;
            status = 'learning';
            isLearningMinutes = true;
        } else {
            const hardPenalty = rating === 2 ? w[15] : 1;
            const easyBonus = rating === 4 ? w[16] : 1;
            const inc = Math.exp(w[8]) * (11 - difficulty) * Math.pow(stability, -w[9]) * (Math.exp(w[10] * (1 - retrievability)) - 1) * hardPenalty * easyBonus;
            stability = Math.max(0.2, stability * (1 + inc));
            interval = nextIntervalDays(stability);
            status = 'review';
            repetitions++;
        }
    }

    const dueDate = isLearningMinutes ? (now + interval * 60 * 1000) : (now + interval * 86400000);
    const mappedConf = rating === 1 ? 1 : rating === 2 ? 2 : rating === 3 ? 4 : 5;

    return {
        ...card,
        interval,
        difficulty: Number(difficulty.toFixed(2)),
        stability: Number(stability.toFixed(2)),
        status,
        lapses,
        repetitions,
        isLearningMinutes,
        confidence: mappedConf,
        lastReview: now,
        dueDate,
        reviewCount: (card.reviewCount || 0) + 1
    };
}

function formatSmartInterval(cardResult) {
    const ivl = cardResult.interval || 1;
    if (cardResult.isLearningMinutes || cardResult.status === 'learning') {
        if (ivl < 60) return ivl + (currentLang === 'fa' ? ' د' : 'm');
        return Math.round(ivl / 60) + (currentLang === 'fa' ? ' س' : 'h');
    }
    if (ivl < 30) return Math.round(ivl) + (currentLang === 'fa' ? ' ر' : 'd');
    if (ivl < 365) return (ivl / 30).toFixed(1).replace(/\.0$/, '') + (currentLang === 'fa' ? ' ماه' : 'mo');
    return (ivl / 365).toFixed(1) + (currentLang === 'fa' ? ' سال' : 'y');
}

// =========================================================================
// SCHEDULER 2: Classic AnkiDroid SM-2 Algorithm
// =========================================================================
function applySM2(card, quality) {
    // quality: 'again' | 'hard' | 'good' | 'easy'
    const now = Date.now();
    const learningSteps = [1, 10];
    let interval = card.interval || 0;
    let easeFactor = card.easeFactor || 2.5;
    let repetitions = card.repetitions || 0;
    let status = card.status || 'new';
    let lapses = card.lapses || 0;
    let learningStep = card.learningStep || 0;
    let isLearningMinutes = false;

    if (status === 'new' || status === 'learning') {
        if (quality === 'again') {
            learningStep = 0; interval = learningSteps[0]; status = 'learning'; isLearningMinutes = true; repetitions = 0;
        } else if (quality === 'hard') {
            interval = 6; status = 'learning'; isLearningMinutes = true;
        } else if (quality === 'good') {
            learningStep++;
            if (learningStep >= learningSteps.length) {
                interval = 1; status = 'review'; repetitions = 1;
            } else {
                interval = learningSteps[learningStep]; status = 'learning'; isLearningMinutes = true;
            }
        } else {
            interval = 4; status = 'review'; repetitions = 1; easeFactor = Math.min(3.2, easeFactor + 0.15);
        }
    } else {
        if (quality === 'again') {
            lapses++; repetitions = 0; status = 'learning'; learningStep = 0; interval = 10; isLearningMinutes = true;
            easeFactor = Math.max(1.3, easeFactor - 0.2);
        } else if (quality === 'hard') {
            interval = Math.max(1, Math.round(interval * 1.2)); repetitions++;
            easeFactor = Math.max(1.3, easeFactor - 0.15); status = 'review';
        } else if (quality === 'good') {
            interval = Math.max(interval + 1, Math.round(interval * easeFactor)); repetitions++; status = 'review';
        } else {
            interval = Math.max(interval + 2, Math.round(interval * easeFactor * 1.3)); repetitions++;
            easeFactor = Math.min(3.2, easeFactor + 0.15); status = 'review';
        }
    }

    const dueDate = isLearningMinutes ? (now + interval * 60 * 1000) : (now + interval * 86400000);
    const mappedConf = quality === 'again' ? 1 : quality === 'hard' ? 2 : quality === 'good' ? 4 : 5;

    return {
        ...card,
        interval,
        easeFactor: Number(easeFactor.toFixed(2)),
        repetitions,
        lapses,
        status,
        learningStep,
        isLearningMinutes,
        confidence: mappedConf,
        dueDate,
        lastReview: now,
        reviewCount: (card.reviewCount || 0) + 1
    };
}

// =========================================================================
// SCHEDULER 3: Brainscape CBR (Confidence-Based Repetition 1–5)
// Fixed bug where learning ms vs review days corrupted interval math!
// =========================================================================
function applyBrainscape(card, confidence) {
    const now = Date.now();
    let prevDays = (card.status === 'review' && card.interval > 0) ? card.interval : 0;
    let repetitions = card.repetitions || 0;
    let lapses = card.lapses || 0;
    let interval = 1;
    let status = 'review';
    let isLearningMinutes = false;

    if (confidence === 1) {
        interval = 3; // 3 minutes
        status = 'learning';
        isLearningMinutes = true;
        repetitions = 0;
        if (card.status === 'review') lapses++;
    } else if (confidence === 2) {
        interval = 20; // 20 minutes
        status = 'learning';
        isLearningMinutes = true;
    } else if (confidence === 3) {
        status = 'review';
        interval = prevDays < 1 ? 1 : Math.max(1, Math.round(prevDays * 1.6));
        repetitions++;
    } else if (confidence === 4) {
        status = 'review';
        interval = prevDays < 1 ? 3 : Math.max(2, Math.round(prevDays * 2.4));
        repetitions++;
    } else {
        // Confidence 5: Mastered — long interval
        status = 'review';
        interval = prevDays < 1 ? 7 : Math.max(5, Math.round(prevDays * 3.5));
        repetitions++;
    }

    const dueDate = isLearningMinutes ? (now + interval * 60 * 1000) : (now + interval * 86400000);

    return {
        ...card,
        interval,
        repetitions,
        lapses,
        status,
        isLearningMinutes,
        confidence,
        dueDate,
        lastReview: now,
        reviewCount: (card.reviewCount || 0) + 1
    };
}

// ===== Cloze Deletion Parser ({{c1::answer::hint}}) =====
function hasClozeSyntax(text) {
    return /\{\{c\d+::.+?\}\}/i.test(text || '');
}

function renderClozeText(rawText, revealed = false) {
    if (!rawText) return '';
    const escaped = escapeHtml(rawText);
    return escaped.replace(/\{\{c(\d+)::([^}:]+)(?:::([^}]+))?\}\}/gi, (_, num, answer, hint) => {
        if (revealed) {
            return `<span class="cloze-revealed">${answer}</span>`;
        }
        const label = hint ? `[${hint}]` : '[...]';
        return `<span class="cloze-blank">${label}</span>`;
    });
}

function extractClozeAnswers(rawText) {
    const matches = [];
    const re = /\{\{c\d+::([^}:]+)(?:::[^}]+)?\}\}/gi;
    let m;
    while ((m = re.exec(rawText || '')) !== null) {
        matches.push(m[1].trim());
    }
    return matches;
}

// ===== Web Speech API Smart TTS =====
function detectTextLang(text) {
    if (/[\u0600-\u06FF]/.test(text)) return 'fa-IR';
    if (/[\u0400-\u04FF]/.test(text)) return 'ru-RU';
    if (/[\u4E00-\u9FFF]/.test(text)) return 'zh-CN';
    if (/[äöüßÄÖÜ]/.test(text)) return 'de-DE';
    if (/[éèêëàâùûçœ]/i.test(text)) return 'fr-FR';
    return 'en-US';
}

function speakTTS(text, customLang = null) {
    if (!text || !('speechSynthesis' in window)) return;
    try {
        window.speechSynthesis.cancel();
        const clean = text.replace(/\{\{c\d+::([^}:]+)(?:::[^}]+)?\}\}/gi, '$1').replace(/<[^>]+>/g, '').trim();
        if (!clean) return;
        const utter = new SpeechSynthesisUtterance(clean);
        utter.lang = customLang || detectTextLang(clean);
        utter.rate = 0.95;
        window.speechSynthesis.speak(utter);
    } catch (e) {
        console.warn('TTS error:', e);
    }
}

// ===== Utility Helpers =====
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function haptic(ms = 12) {
    if (!state.settings.haptic) return;
    if (!navigator.userActivation || !navigator.userActivation.hasBeenActive) return;
    if (navigator.vibrate) {
        try { navigator.vibrate(ms); } catch (e) {}
    }
}

let sharedAudioCtx = null;
function playSound(type) {
    if (!state.settings.sound) return;
    try {
        if (!sharedAudioCtx) {
            sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume();
        const osc = sharedAudioCtx.createOscillator();
        const gain = sharedAudioCtx.createGain();
        osc.connect(gain);
        gain.connect(sharedAudioCtx.destination);

        const presets = {
            flip: { freq: 620, endFreq: 780, dur: 0.055, wave: 'sine', vol: 0.06 },
            correct: { freq: 587, endFreq: 880, dur: 0.13, wave: 'triangle', vol: 0.09 },
            wrong: { freq: 310, endFreq: 210, dur: 0.16, wave: 'sawtooth', vol: 0.06 },
            levelup: { freq: 523, endFreq: 1046, dur: 0.28, wave: 'sine', vol: 0.11 }
        };
        const p = presets[type] || presets.flip;
        osc.type = p.wave;
        osc.frequency.setValueAtTime(p.freq, sharedAudioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(p.endFreq, sharedAudioCtx.currentTime + p.dur);
        gain.gain.setValueAtTime(p.vol, sharedAudioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, sharedAudioCtx.currentTime + p.dur);
        osc.start();
        osc.stop(sharedAudioCtx.currentTime + p.dur);
    } catch (e) {}
}

// ===== Built-in Rich Starter Decks (Instant Demo Experience) =====
function createStarterDecks() {
    const now = Date.now();
    const d1 = 'deck_starter_ielts_' + now;
    const d2 = 'deck_starter_med_' + (now + 1);

    state.decks[d1] = {
        name: currentLang === 'fa' ? 'زبان انگلیسی::واژگان طلایی آیلتس (Academic)' : 'Languages::IELTS Academic Vocabulary',
        created: now,
        source: 'starter'
    };

    state.decks[d2] = {
        name: currentLang === 'fa' ? 'علوم پزشکی و شناختی::عصب‌شناسی یادگیری (Cloze)' : 'Neuroscience::Memory & Learning (Cloze)',
        created: now + 1,
        source: 'starter'
    };

    const sampleCards = [
        {
            deckId: d1,
            cardType: 'basic',
            word: 'Ubiquitous',
            ipa: 'juːˈbɪkwɪtəs',
            meaning: currentLang === 'fa' ? 'همه‌جا حاضر، فراگیر، رایج در همه‌جا' : 'Present, appearing, or found everywhere',
            example: 'Smartphones have become ubiquitous in modern daily life.',
            hint: currentLang === 'fa' ? 'مترادف Omnipresent' : 'Synonym: Omnipresent',
            tags: ['IELTS', 'Adjective', 'C1']
        },
        {
            deckId: d1,
            cardType: 'basic',
            word: 'Ephemeral',
            ipa: 'ɪˈfemərəl',
            meaning: currentLang === 'fa' ? 'زودگذر، ناپایدار، کوتاه‌مدت' : 'Lasting for a very short time; transitory',
            example: 'Fame in the world of social media is often ephemeral.',
            hint: currentLang === 'fa' ? 'متضاد Permanent' : 'Opposite of permanent',
            tags: ['IELTS', 'GRE', 'C2']
        },
        {
            deckId: d1,
            cardType: 'basic',
            word: 'Mitigate',
            ipa: 'ˈmɪtɪɡeɪt',
            meaning: currentLang === 'fa' ? 'کاهش دادن شدت، تسکین دادن، ملایم کردن' : 'Make less severe, serious, or painful',
            example: 'Planting urban trees helps mitigate the effects of air pollution.',
            hint: currentLang === 'fa' ? 'کاهش اثر منفی یک پدیده' : 'Alleviate / reduce severity',
            tags: ['IELTS', 'Verb', 'Academic']
        },
        {
            deckId: d1,
            cardType: 'basic',
            word: 'Pragmatic',
            ipa: 'præɡˈmætɪk',
            meaning: currentLang === 'fa' ? 'عمل‌گرایانه، واقع‌بینانه و کاربردی' : 'Dealing with things sensibly and realistically in a practical way',
            example: 'We need a pragmatic approach to solve the energy crisis.',
            tags: ['IELTS', 'Adjective']
        },
        {
            deckId: d1,
            cardType: 'basic',
            word: 'Resilient',
            ipa: 'rɪˈzɪliənt',
            meaning: currentLang === 'fa' ? 'تاب‌آور، انعطاف‌پذیر در برابر دشواری‌ها' : 'Able to withstand or recover quickly from difficult conditions',
            example: 'Spaced repetition builds resilient long-term neural pathways.',
            tags: ['Psychology', 'IELTS']
        },
        {
            deckId: d2,
            cardType: 'cloze',
            word: currentLang === 'fa'
                ? 'ساختار {{c1::هیپوکامپ::بخش مغز}} نقش کلیدی در تثبیت حافظه کوتاه‌مدت به بلندمدت دارد.'
                : 'The {{c1::Hippocampus::Brain region}} plays a crucial role in consolidating short-term into long-term memory.',
            meaning: currentLang === 'fa' ? 'هیپوکامپ (Hippocampus) در لوب گیجگاهی میانی قرار دارد.' : 'Located in the medial temporal lobe.',
            example: 'Active recall during sleep strengthens hippocampal-neocortical dialogue.',
            tags: ['Neuroscience', 'Cloze']
        },
        {
            deckId: d2,
            cardType: 'cloze',
            word: currentLang === 'fa'
                ? 'پدیده {{c1::منحنی فراموشی::نظریه ابینگهاوس}} نشان می‌دهد بدون مرور فاصله‌دار، اطلاعات به‌سرعت محو می‌شوند.'
                : 'Hermann Ebbinghaus discovered the {{c1::Forgetting Curve::Memory model}}, showing exponential memory decay without review.',
            meaning: currentLang === 'fa' ? 'کشف‌شده توسط هرمان ابینگهاوس در سال ۱۸۸۵' : 'Discovered in 1885; countered by Spaced Repetition.',
            tags: ['Cognitive-Science', 'Cloze']
        },
        {
            deckId: d2,
            cardType: 'basic',
            word: currentLang === 'fa' ? 'تفاوت بازیابی فعال (Active Recall) با روخوانی منفعل چیست؟' : 'Why is Active Recall 3x more effective than passive re-reading?',
            meaning: currentLang === 'fa'
                ? 'تلاش مغز برای بازیابی پاسخ از حافظه، پوشش میلین سیناپس‌ها را تقویت کرده و ماندگاری را چند برابر می‌کند.'
                : 'Retrieving information forces synaptic strengthening (Testing Effect) rather than mere recognition.',
            tags: ['Learning-Science']
        }
    ];

    sampleCards.forEach((item, idx) => {
        const cid = `card_starter_${now}_${idx}`;
        state.cards[cid] = {
            deckId: item.deckId,
            cardType: item.cardType || 'basic',
            front: item.word,
            back: item.meaning,
            word: item.word,
            meaning: item.meaning,
            ipa: item.ipa || '',
            example: item.example || '',
            hint: item.hint || '',
            tags: item.tags || [],
            status: 'new',
            interval: 0,
            easeFactor: 2.5,
            repetitions: 0,
            dueDate: 0,
            confidence: 0,
            reviewCount: 0,
            created: now + idx
        };
    });

    saveData();
}
