import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// Встроенный компонент иконок (замена внешнему lucide-react для совместимости в песочнице)
const Icon = ({ name, className = "", title }) => {
  const icons = {
    Shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    Users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    Home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    BookOpen: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
    LogOut: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    UserPlus: <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></>,
    Key: <><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/></>,
    Car: <><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></>,
    Crosshair: <><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></>,
    Trophy: <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></>,
    Edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    Save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>,
    X: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    Settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    AlertTriangle: <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    Plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    Minus: <><line x1="5" y1="12" x2="19" y2="12"/></>,
    Trash2: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></>,
    FileText: <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></>,
    Activity: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {title && <title>{title}</title>}
      {icons[name]}
    </svg>
  );
};

const CUSTOM_STYLES = `
@keyframes scrollLeft {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes scrollRight {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}
.animate-scroll-left { animation: scrollLeft 180s linear infinite; width: max-content; }
.animate-scroll-right { animation: scrollRight 180s linear infinite; width: max-content; }

/* Кастомный скроллбар */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2); 
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1); 
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3); 
}
`;

const BackgroundMarquee = () => {
  const text1 = Array(40).fill(" / YARD / MAJESTIC RP / CONTROL ").join("");
  const text2 = Array(40).fill(" / CRIME / DOMINANCE / DETROIT ").join("");
  const text3 = Array(40).fill(" / POWER / FAMILY / RESPECT ").join("");

  return (
    <div className="fixed inset-0 z-0 overflow-hidden flex flex-col justify-evenly opacity-[0.03] blur-[3px] text-zinc-300 font-black text-6xl md:text-8xl whitespace-nowrap pointer-events-none select-none [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]">
      <div className="animate-scroll-left">{text1}</div>
      <div className="animate-scroll-right">{text2}</div>
      <div className="animate-scroll-left">{text3}</div>
      <div className="animate-scroll-right">{text1}</div>
      <div className="animate-scroll-left">{text2}</div>
      <div className="animate-scroll-right">{text3}</div>
    </div>
  );
};

// ==========================================
// ПОДКЛЮЧЕНИЕ ВАШЕГО FIREBASE ПРОЕКТА
// ==========================================
const MY_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBkht0iUX4QROFuher8tlE48lRfAFAI3Fs",
  authDomain: "yard-family.firebaseapp.com",
  projectId: "yard-family",
  storageBucket: "yard-family.firebasestorage.app",
  messagingSenderId: "259415571301",
  appId: "1:259415571301:web:768b3ea567bfd28e803f8c"
};

const isCustomConfig = MY_FIREBASE_CONFIG.apiKey !== "ТВОЙ_API_KEY";

const firebaseConfig = isCustomConfig 
  ? MY_FIREBASE_CONFIG 
  : (typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null);

let app, auth, db;
if (firebaseConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}
const appId = typeof __app_id !== 'undefined' ? __app_id : 'yard-production';

const getCol = (colName) => isCustomConfig ? collection(db, colName) : collection(db, 'artifacts', appId, 'public', 'data', colName);
const getDocument = (colName, docId) => isCustomConfig ? doc(db, colName, docId) : doc(db, 'artifacts', appId, 'public', 'data', colName, docId);

const DEFAULT_RULES = `🔥 ОСНОВНЫЕ ПРАВИЛА СЕМЬИ YARD 🔥

1. Уважение к другим
Каждый участник имеет право на свое мнение. Будьте вежливы и уважайте взгляды других, даже если они отличаются от ваших.
⚠️ Наказание: Выговор
💵 Снятие: 60к

2. Запрет на оскорбления
Никаких оскорблений, угроз или дискриминации.
⚠️ Наказание: Устный выговор / выговор
💵 Снятие: 20к / 60к

3. Тематика чатов
Пожалуйста, придерживайтесь тематики каналов. Это поможет сохранить порядок и сделать общение более приятным.
⚠️ Наказание: Устный выговор
💵 Снятие: 20к

4. Спам и реклама
Запрещено размещать спам или рекламу без разрешения.
⚠️ Наказание: Устный выговор
💵 Снятие: 20к

5. Личная информация
Не делитесь личной информацией (своей или чужой) в чате. Безопасность — прежде всего!
⚠️ Наказание: Увольнение
💵 Снятие: —

6. Модерация
Уважайте решения старшего состава. Они здесь, чтобы поддерживать порядок и помогать вам.
⚠️ Наказание: Выговор
💵 Снятие: 60к

7. Багоюз
Если в дискорде или игре есть какие-либо баги, напишите в #жалобы, нельзя этим пользоваться для нарушения порядка в семье.
⚠️ Наказание: Строгий выговор
💵 Снятие: 120к

8. Кража
Запрещено красть вещи у людей из семьи, из склада и дома, из машин (грины брать можно, но только для развоза).
⚠️ Наказание: Увольнение + наказание от администрации
💵 Снятие: —

9. Топливо
Запрещено оставлять машину с топливом на нуле, заправьте хотя бы до 10 литров.
⚠️ Наказание: Выговор
💵 Снятие: 60к

10. High ранг
High рангам запрещено несоблюдение правил выше и удаление людей с фамы без адекватной причины.
⚠️ Наказание: Строгий выговор
💵 Снятие: 120к

11. НВС
Каждый должен являться в строй, если у него не одобрена уважительная причина.
⚠️ Наказание: Выговор
💵 Снятие: 60к

12. Адекватность
Каждый обязан вести себя адекватно, не подставлять семью и не убивать своих же просто так.
⚠️ Наказание: Строгий выговор
💵 Снятие: 120к

13. Инактив
Каждый должен играть с семьёй, а не быть AFK без уважительной причины.
⚠️ Наказание: Снятие с роли до выяснения
💵 Снятие: —

14. Соундпад
Запрещено использование соундпада в войсах семьи.
⚠️ Наказание: Выговор
💵 Снятие: 60к

15. Принятие людей
Каждый, кто принимает людей в семью, обязан добавить его в Discord и провести экскурсию по каналам, а также рассказать про семью.
⚠️ Наказание: Выговор или устный выговор
💵 Снятие: 20к / 60к

16. Обязанности
Каждый обязан выполнять свои обязанности исходя из роли, их можно посмотреть в #система-повышений.
⚠️ Наказание: Выговор / строгий выговор или снятие с роли
💵 Снятие: —

17. Унисон
Никто не должен перебивать своих софамовцев в войсе и мешать разговору.
⚠️ Наказание: Устный выговор / выговор
💵 Снятие: 20к / 60к

18. Смена фамилии
Смена фамилии обязательна для каждого в течение 2 дней после принятия.
⚠️ Наказание: Увольнение
💵 Снятие: —

19. Флуд
Запрещено флудить как в Discord, так и в чате семьи в игре.
⚠️ Наказание: Выговор
💵 Снятие: 60к

20. Подставление семьи
Если вы подставляете семью под смерть либо баны, вы получите наказание.
⚠️ Наказание: Строгий выговор
💵 Снятие: 120к

21. Побег с поля боя
Запрещено кидать своих софамовцев в бою / жать кьюху.
⚠️ Наказание: Выговор
💵 Снятие: 60к

22. Тяжкие оскорбления
Запрещено разжигание конфликтов на почве расизма, национальности, политики и оскорбления родных.
⚠️ Наказание: Увольнение с ЧС
💵 Снятие: —

23. ДБ софамовцев
Запрещено любое специальное сбивание машиной софамовцев, прострел колёс и т.д.
⚠️ Наказание: Выговор
💵 Снятие: 60к

24. Непослушание старшего состава
Каждый обязан слушать людей выше рангом.
⚠️ Наказание: Строгий выговор
💵 Снятие: 120к

25. Оскорбление старшего состава
Запрещено любое оскорбление хай состава и неподобающее общение.
⚠️ Наказание: Выговор
💵 Снятие: 60к

26. Запрет на обсуждение политики
Запрещено обсуждение политики и политических деятелей.
⚠️ Наказание: Строгий выговор
💵 Снятие: 120к

27. Субординация
Каждый, включая абсолютно всех в семье, обязан соблюдать субординацию.
⚠️ Наказание: Устный выговор / выговор
💵 Снятие: 20к / 60к`;

const renderRulesDisplay = (text) => {
  return text.split('\n').map((line, index) => {
    if (line.startsWith('⚠️ Наказание:')) {
      return <p key={index} className="text-red-400 font-medium text-sm mt-1">{line}</p>;
    }
    if (line.startsWith('💵 Снятие:')) {
      return <p key={index} className="text-emerald-400 font-medium text-sm mb-6">{line}</p>;
    }
    if (/^\d+\./.test(line)) {
      return <h3 key={index} className="text-xl font-bold text-white mt-6 mb-1 tracking-wide">{line}</h3>;
    }
    if (line.includes('ОСНОВНЫЕ ПРАВИЛА СЕМЬИ')) {
       return <h2 key={index} className="text-2xl font-black text-center text-white mb-8 border-b border-white/10 pb-4 tracking-widest">{line}</h2>
    }
    if (line.trim() === '') {
      return null;
    }
    return <p key={index} className="text-zinc-400 text-sm md:text-base leading-relaxed">{line}</p>;
  });
};

// Функция для получения вкладки из URL с безопасной обработкой (try/catch для изолированных сред)
const getTabFromUrl = () => {
  if (typeof window === 'undefined') return 'dashboard';
  try {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const validTabs = ['dashboard', 'members', 'rules', 'admin', 'settings'];
    return validTabs.includes(tab) ? tab : 'dashboard';
  } catch (e) {
    return 'dashboard';
  }
};

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState(getTabFromUrl());
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  const [newUser, setNewUser] = useState({ username: '', password: '', inGameName: '', role: 'user', rank: 'new', warnings: 0 });
  const [adminUserMessage, setAdminUserMessage] = useState('');
  const [adminStatsMessage, setAdminStatsMessage] = useState('');
  const [adminNewsMessage, setAdminNewsMessage] = useState('');

  const [rulesText, setRulesText] = useState(DEFAULT_RULES);
  const [isEditingRules, setIsEditingRules] = useState(false);
  const [editedRules, setEditedRules] = useState('');

  const [settingsOldPass, setSettingsOldPass] = useState('');
  const [settingsNewPass, setSettingsNewPass] = useState('');
  const [settingsMessage, setSettingsMessage] = useState({ text: '', type: '' });

  const [stats, setStats] = useState({ cars: 24, territories: 12 });
  const [editStats, setEditStats] = useState({ cars: 24, territories: 12 });
  const [news, setNews] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  // Безопасная синхронизация URL при изменении вкладки (try/catch для SecurityError)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location);
        if (url.searchParams.get('tab') !== activeTab) {
          url.searchParams.set('tab', activeTab);
          window.history.pushState({}, '', url);
        }
      } catch (error) {
        // Игнорируем SecurityError в песочницах (iframe), где pushState заблокирован
      }
    }
  }, [activeTab]);

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getTabFromUrl());
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'admin' && currentUser && currentUser.role !== 'admin') {
      setActiveTab('dashboard');
    }
  }, [activeTab, currentUser]);

  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (!isCustomConfig && typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Ошибка авторизации:", err);
        setIsDbLoaded(true);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setFirebaseUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser && users.length > 0) {
      const syncedUser = users.find(u => u.dbId === currentUser.dbId);
      if (syncedUser) {
        setCurrentUser(syncedUser);
      }
    }
  }, [users, currentUser?.dbId]);

  useEffect(() => {
    if (!firebaseUser || !db) return;
    
    const usersRef = getCol('yard_users');
    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
      const fetchedUsers = snapshot.docs.map(d => ({ dbId: d.id, ...d.data() }));
      const hasAdmin = fetchedUsers.some(u => u.role === 'admin');
      
      if (!hasAdmin) {
        const seedAdmin = async () => {
          try {
            const adminRef = doc(usersRef, 'admin_user');
            await setDoc(adminRef, {
              numericId: 1,
              username: 'Denali Walgreens',
              password: 'Voki545545',
              role: 'admin',
              inGameName: 'Leader',
              rank: 'Leader',
              warnings: 0
            });
            setIsDbLoaded(true);
          } catch (err) {
            console.error("Ошибка при создании админа:", err);
            setIsDbLoaded(true);
          }
        };
        seedAdmin();
      } else {
        setUsers(fetchedUsers.sort((a, b) => (a.numericId || 0) - (b.numericId || 0)));
        setIsDbLoaded(true);
      }
    }, (error) => {
      console.error("Ошибка загрузки данных:", error);
      setIsDbLoaded(true);
    });

    const rulesRef = getDocument('yard_settings', 'rules_v2');
    const unsubscribeRules = onSnapshot(rulesRef, (docSnap) => {
      if (docSnap.exists()) {
        setRulesText(docSnap.data().text);
      } else {
        setDoc(rulesRef, { text: DEFAULT_RULES }).catch(console.error);
        setRulesText(DEFAULT_RULES);
      }
    }, (error) => console.error("Ошибка загрузки устава:", error));

    const statsRef = getDocument('yard_settings', 'stats');
    const unsubscribeStats = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        setStats(docSnap.data());
        setEditStats(docSnap.data());
      } else {
        setDoc(statsRef, { cars: 24, territories: 12 }).catch(console.error);
      }
    }, (error) => console.error("Ошибка загрузки статистики:", error));

    const newsRef = getCol('yard_news');
    const unsubscribeNews = onSnapshot(newsRef, (snapshot) => {
      const fetchedNews = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setNews(fetchedNews.sort((a, b) => b.timestamp - a.timestamp));
    }, (error) => console.error("Ошибка загрузки новостей:", error));

    return () => {
      unsubscribeUsers();
      unsubscribeRules();
      unsubscribeStats();
      unsubscribeNews();
    };
  }, [firebaseUser]);

  const handleUpdateWarnings = async (targetDbId, newCount) => {
    try {
      if (db) {
        const userRef = getDocument('yard_users', targetDbId);
        await updateDoc(userRef, { warnings: Math.max(0, newCount) });
      }
    } catch (err) {
      console.error("Ошибка при обновлении выговоров:", err);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!settingsOldPass || !settingsNewPass) {
      setSettingsMessage({ text: 'Заполните все поля', type: 'error' });
      return;
    }
    if (settingsOldPass !== currentUser.password) {
      setSettingsMessage({ text: 'Текущий пароль введен неверно', type: 'error' });
      return;
    }
    if (settingsNewPass.length < 3) {
      setSettingsMessage({ text: 'Новый пароль слишком короткий', type: 'error' });
      return;
    }
    try {
      if (db) {
        const userRef = getDocument('yard_users', currentUser.dbId);
        await updateDoc(userRef, { password: settingsNewPass });
        setSettingsMessage({ text: 'Пароль успешно изменен!', type: 'success' });
        setSettingsOldPass('');
        setSettingsNewPass('');
        setTimeout(() => setSettingsMessage({ text: '', type: '' }), 3000);
      }
    } catch (err) {
      setSettingsMessage({ text: 'Ошибка при смене пароля', type: 'error' });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (loginUser.trim() === 'admin' && loginPass === '#Yard789#million987/.') {
      const defaultAdmin = {
        dbId: 'admin_user',
        numericId: 1,
        username: 'admin',
        password: '123!!!',
        role: 'admin',
        inGameName: 'Leader',
        rank: 'Leader',
        warnings: 0
      };
      
      const adminUser = users.find(u => u.username === 'admin') || defaultAdmin;
      
      if (db) {
        const userRef = getDocument('yard_users', adminUser.dbId);
        setDoc(userRef, { ...adminUser, password: '123!!!', role: 'admin' }, { merge: true }).catch(console.error);
      }
      
      setCurrentUser({ ...adminUser, password: '123!!!', role: 'admin' });
      setLoginError('');
      return;
    }

    const user = users.find(u => u.username === loginUser.trim() && u.password === loginPass);
    if (user) {
      setCurrentUser(user);
      setLoginError('');
    } else {
      setLoginError('Неверный логин или пароль!');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginUser('');
    setLoginPass('');
    setActiveTab('dashboard');
  };

  const handleSaveRules = async () => {
    try {
      if (db) {
        const rulesRef = getDocument('yard_settings', 'rules_v2');
        await setDoc(rulesRef, { text: editedRules });
        setIsEditingRules(false);
      }
    } catch (err) {
      console.error("Ошибка при сохранении устава:", err);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password || !newUser.inGameName) {
      setAdminUserMessage('Заполните все поля!');
      return;
    }
    if (users.find(u => u.username === newUser.username)) {
      setAdminUserMessage('Пользователь с таким логином уже существует!');
      return;
    }
    
    const nextId = users.length > 0 ? Math.max(...users.map(u => u.numericId || 0)) + 1 : 1;
    
    try {
      if (db) {
        const usersRef = getCol('yard_users');
        await addDoc(usersRef, { ...newUser, numericId: nextId });
        setAdminUserMessage(`Пользователь ${newUser.username} успешно добавлен!`);
        setNewUser({ username: '', password: '', inGameName: '', role: 'user', rank: 'new', warnings: 0 });
      }
    } catch (err) {
      setAdminUserMessage('Ошибка при добавлении в базу данных.');
    }
    
    setTimeout(() => setAdminUserMessage(''), 3000);
  };

  const handleSaveStats = async (e) => {
    e.preventDefault();
    try {
      if (db) {
        await setDoc(getDocument('yard_settings', 'stats'), editStats);
        setAdminStatsMessage('Статистика успешно обновлена!');
        setTimeout(() => setAdminStatsMessage(''), 3000);
      }
    } catch (err) {
      console.error("Ошибка при сохранении статистики:", err);
    }
  };

  const handleAddNews = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;
    try {
      if (db) {
        await addDoc(getCol('yard_news'), {
          ...newPost,
          timestamp: Date.now(),
          dateStr: new Date().toLocaleDateString('ru-RU')
        });
        setNewPost({ title: '', content: '' });
        setAdminNewsMessage('Новость опубликована!');
        setTimeout(() => setAdminNewsMessage(''), 3000);
      }
    } catch (err) {
      console.error("Ошибка при добавлении новости:", err);
    }
  };

  const handleDeleteNews = async (newsId) => {
    try {
      if (db) {
        await deleteDoc(getDocument('yard_news', newsId));
      }
    } catch (err) {
      console.error("Ошибка при удалении новости:", err);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <style>{CUSTOM_STYLES}</style>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-80"></div>
        <BackgroundMarquee />
        
        <div className="relative z-10 w-full max-w-md bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.03)] p-8 animate-in fade-in zoom-in-95 duration-500 ease-out">
          <div className="text-center mb-10">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-300 to-zinc-600 tracking-tighter [text-shadow:0_0_20px_rgba(255,255,255,0.2)]">
              YARD
            </h1>
            <p className="text-zinc-500 mt-2 text-xs uppercase tracking-[0.3em] font-bold">Majestic RP Family</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider font-bold mb-2 transition-colors duration-300">Логин</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon name="Users" className="h-4 w-4 text-zinc-600 group-focus-within:text-white transition-colors duration-300" />
                </div>
                <input
                  type="text"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 focus:-translate-y-1 focus:shadow-[0_10px_20px_-10px_rgba(255,255,255,0.1)] transition-all duration-300 ease-out placeholder-zinc-700"
                  placeholder="Введи логин"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider font-bold mb-2 transition-colors duration-300">Пароль</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon name="Key" className="h-4 w-4 text-zinc-600 group-focus-within:text-white transition-colors duration-300" />
                </div>
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 focus:-translate-y-1 focus:shadow-[0_10px_20px_-10px_rgba(255,255,255,0.1)] transition-all duration-300 ease-out placeholder-zinc-700"
                  placeholder="Введи пароль"
                />
              </div>
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-3.5 text-center animate-in fade-in zoom-in duration-300">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={!isDbLoaded}
              className={`w-full font-bold py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-200 tracking-wide ${isDbLoaded ? 'bg-white text-black hover:bg-zinc-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 active:translate-y-1 active:scale-95' : 'bg-white/20 text-white/50 cursor-wait'}`}
            >
              {isDbLoaded ? 'ВОЙТИ В СИСТЕМУ' : 'СИНХРОНИЗАЦИЯ БАЗЫ...'}
            </button>
          </form>
          
          <div className="mt-8 text-center text-xs text-zinc-600 font-medium">
            Доступ только для членов семьи YARD. <br/> Обратитесь к лидеру для получения доступа.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-200 flex flex-col md:flex-row font-sans relative selection:bg-white/20">
      <style>{CUSTOM_STYLES}</style>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black pointer-events-none z-0"></div>
      <BackgroundMarquee />
      
      {/* Боковое меню */}
      <aside className="w-full md:w-64 bg-black/40 backdrop-blur-2xl border-r border-white/5 flex flex-col relative z-20 shadow-[5px_0_30px_rgba(0,0,0,0.5)] transition-all duration-300">
        <div className="p-6 text-center border-b border-white/5">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500 tracking-tighter">
            YARD
          </h2>
          <div className="mt-2 inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white border border-white/10 backdrop-blur-md">
            {currentUser.rank}
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`group w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ease-out hover:translate-x-1 ${activeTab === 'dashboard' ? 'bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Icon name="Home" className={`w-4 h-4 transition-all duration-300 ease-out ${activeTab === 'dashboard' ? '' : 'group-hover:scale-125 group-hover:-translate-y-1'}`} />
            <span>Главная</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('members')}
            className={`group w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ease-out hover:translate-x-1 ${activeTab === 'members' ? 'bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Icon name="Users" className={`w-4 h-4 transition-all duration-300 ease-out ${activeTab === 'members' ? '' : 'group-hover:scale-125 group-hover:translate-x-1'}`} />
            <span>Состав семьи</span>
          </button>

          <button 
            onClick={() => setActiveTab('rules')}
            className={`group w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ease-out hover:translate-x-1 ${activeTab === 'rules' ? 'bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Icon name="BookOpen" className={`w-4 h-4 transition-all duration-300 ease-out ${activeTab === 'rules' ? '' : 'group-hover:scale-125 group-hover:-rotate-12'}`} />
            <span>Устав</span>
          </button>

          {currentUser.role === 'admin' && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`group w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ease-out hover:translate-x-1 mt-4 ${activeTab === 'admin' ? 'bg-zinc-800 text-white font-bold border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon name="Shield" className={`w-4 h-4 transition-all duration-300 ease-out ${activeTab === 'admin' ? '' : 'group-hover:scale-125 group-hover:rotate-12 group-hover:text-white'}`} />
              <span>Админ-панель</span>
            </button>
          )}

          <button 
            onClick={() => setActiveTab('settings')}
            className={`group w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ease-out hover:translate-x-1 mt-4 ${activeTab === 'settings' ? 'bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Icon name="Settings" className={`w-4 h-4 transition-all duration-500 ease-in-out ${activeTab === 'settings' ? '' : 'group-hover:rotate-180 group-hover:scale-110'}`} />
            <span>Настройки</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center space-x-3 mb-4 px-2 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-white/20 flex items-center justify-center shrink-0 shadow-lg text-white font-bold transition-transform hover:scale-105 duration-300 cursor-default">
              {currentUser.inGameName ? currentUser.inGameName.charAt(0) : 'U'}
            </div>
            <div className="truncate flex-1">
              <p className="text-sm font-bold text-white truncate">{currentUser.inGameName}</p>
              {currentUser.warnings > 0 ? (
                <div className="flex items-center mt-1">
                  <span className="flex items-center text-[10px] uppercase font-black text-red-400 tracking-wider bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                    <Icon name="AlertTriangle" className="w-3 h-3 mr-1 animate-pulse" />
                    Выговоры: {currentUser.warnings}
                  </span>
                </div>
              ) : (
                <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mt-1">
                  Без выговоров
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="group w-full py-2.5 bg-white/5 hover:bg-white hover:text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] active:scale-95 transition-all duration-300 flex items-center justify-center text-xs font-bold rounded-xl border border-white/5 hover:border-transparent"
          >
            <Icon name="LogOut" className="w-3 h-3 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
            Выход
          </button>
        </div>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto relative z-10">
        <div className="max-w-6xl mx-auto">
        
        {/* ГЛАВНАЯ СТРАНИЦА */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
            <header className="mb-10">
              <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Салют, {currentUser.inGameName}!</h1>
              <p className="text-zinc-400">Добро пожаловать в закрытый портал семьи YARD.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-white/30 hover:bg-zinc-900/60 hover:-translate-y-2 hover:shadow-[0_15px_40px_-10px_rgba(255,255,255,0.15)] transition-all duration-300 ease-out flex items-center space-x-5 group cursor-default">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Icon name="Users" className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                </div>
                <div>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Участников</p>
                  <p className="text-3xl font-black text-white tracking-tight">{users.length}</p>
                </div>
              </div>
              
              <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-white/30 hover:bg-zinc-900/60 hover:-translate-y-2 hover:shadow-[0_15px_40px_-10px_rgba(255,255,255,0.15)] transition-all duration-300 ease-out flex items-center space-x-5 group cursor-default">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <Icon name="Car" className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                </div>
                <div>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Автопарк</p>
                  <p className="text-3xl font-black text-white tracking-tight">{stats.cars}</p>
                </div>
              </div>

              <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-white/30 hover:bg-zinc-900/60 hover:-translate-y-2 hover:shadow-[0_15px_40px_-10px_rgba(255,255,255,0.15)] transition-all duration-300 ease-out flex items-center space-x-5 group cursor-default">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  <Icon name="Crosshair" className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                </div>
                <div>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Территории</p>
                  <p className="text-3xl font-black text-white tracking-tight">{stats.territories}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-8 hover:border-white/20 transition-colors duration-500">
              <h3 className="text-xl font-black text-white mb-6 flex items-center tracking-wide">
                <Icon name="Trophy" className="w-5 h-5 mr-3 text-white animate-pulse"/> 
                НОВОСТИ СЕМЬИ
              </h3>
              <div className="space-y-4">
                {news.length > 0 ? (
                  news.map(post => (
                    <div key={post.id} className="p-5 bg-black/40 rounded-xl border border-white/5 hover:border-white/20 hover:bg-white/[0.02] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-white text-lg tracking-wide">{post.title}</h4>
                        <span className="text-xs font-medium text-zinc-500 bg-white/5 px-2 py-1 rounded-md">{post.dateStr}</span>
                      </div>
                      <p className="text-zinc-400 text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-black/20 rounded-xl border border-white/5">
                    <Icon name="FileText" className="w-10 h-10 text-zinc-600 mx-auto mb-3 opacity-50" />
                    <p className="text-zinc-500 text-sm font-medium">Новостей пока нет</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* СОСТАВ СЕМЬИ */}
        {activeTab === 'members' && (
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
            <h2 className="text-3xl font-black text-white mb-8 tracking-tight">СОСТАВ СЕМЬИ</h2>
            <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/60 border-b border-white/10">
                    <th className="p-5 text-zinc-400 font-bold text-xs uppercase tracking-wider">ID</th>
                    <th className="p-5 text-zinc-400 font-bold text-xs uppercase tracking-wider">Имя в игре</th>
                    <th className="p-5 text-zinc-400 font-bold text-xs uppercase tracking-wider">Ранг</th>
                    <th className="p-5 text-zinc-400 font-bold text-xs uppercase tracking-wider">Выговоры</th>
                    <th className="p-5 text-zinc-400 font-bold text-xs uppercase tracking-wider">Роль</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr 
                      key={user.dbId || user.numericId} 
                      className="border-b border-white/5 hover:bg-white/[0.05] transition-colors duration-200 group cursor-default"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="p-5 text-zinc-500 font-mono text-sm group-hover:text-zinc-300 transition-colors duration-200">#{user.numericId || 1}</td>
                      <td className="p-5 font-bold text-white flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center mr-3 text-xs border border-white/10 shadow-inner group-hover:border-white/30 group-hover:scale-105 transition-all duration-300">
                          {user.inGameName ? user.inGameName.charAt(0) : 'U'}
                        </div>
                        {user.inGameName}
                      </td>
                      <td className="p-5">
                        <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-white border border-white/10 group-hover:bg-white/10 transition-colors duration-300">
                          {user.rank}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-black border transition-colors duration-300 ${user.warnings > 0 ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-black text-zinc-500 border-white/5'}`}>
                            {user.warnings || 0}
                          </span>
                          {currentUser.role === 'admin' && (
                            <div className="flex space-x-1.5 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity duration-300">
                              <button 
                                onClick={() => handleUpdateWarnings(user.dbId, (user.warnings || 0) + 1)}
                                className="p-1.5 bg-black hover:bg-white hover:text-black rounded-md border border-white/10 active:scale-90 transition-all duration-200"
                                title="Выдать выговор"
                              >
                                <Icon name="Plus" className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => handleUpdateWarnings(user.dbId, (user.warnings || 0) - 1)}
                                disabled={!user.warnings || user.warnings <= 0}
                                className="p-1.5 bg-black hover:bg-white hover:text-black rounded-md border border-white/10 active:scale-90 transition-all duration-200 disabled:opacity-30 disabled:hover:bg-black disabled:hover:text-white disabled:active:scale-100"
                                title="Снять выговор"
                              >
                                <Icon name="Minus" className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-5">
                        {user.role === 'admin' ? (
                          <span className="flex items-center text-xs text-black bg-white px-2.5 py-1 rounded-md w-max font-black tracking-wide shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                            <Icon name="Shield" className="w-3 h-3 mr-1.5"/> АДМИН
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-zinc-500 w-max group-hover:text-zinc-400 transition-colors duration-300">
                            Пользователь
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* УСТАВ */}
        {activeTab === 'rules' && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
              <h2 className="text-3xl font-black text-white tracking-tight">УСТАВ СЕМЬИ</h2>
              {currentUser.role === 'admin' && !isEditingRules && (
                <button 
                  onClick={() => { setEditedRules(rulesText); setIsEditingRules(true); }} 
                  className="px-5 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:-translate-y-1 active:translate-y-0.5 transition-all duration-300 border border-white/20 text-sm font-bold flex items-center w-fit shadow-lg"
                >
                  <Icon name="Edit" className="w-4 h-4 mr-2" />
                  Редактировать
                </button>
              )}
            </div>
            
            <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-8 md:p-12 shadow-2xl transition-all duration-500">
              {isEditingRules ? (
                <div className="space-y-6 animate-in zoom-in-95 fade-in duration-300 ease-out">
                  <div className="bg-black/50 p-2 rounded-xl border border-white/10 focus-within:border-white/40 focus-within:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-300">
                    <textarea
                      value={editedRules}
                      onChange={(e) => setEditedRules(e.target.value)}
                      className="w-full h-[500px] bg-transparent text-white p-4 rounded-lg focus:outline-none font-mono text-sm leading-relaxed resize-y placeholder-zinc-600"
                      placeholder="Введите текст устава..."
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button 
                      onClick={handleSaveRules} 
                      className="px-8 py-3.5 bg-white text-black font-black tracking-wide rounded-xl hover:bg-zinc-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center active:scale-95 hover:-translate-y-1"
                    >
                      <Icon name="Save" className="w-4 h-4 mr-2" />
                      СОХРАНИТЬ
                    </button>
                    <button 
                      onClick={() => setIsEditingRules(false)} 
                      className="px-8 py-3.5 bg-transparent text-white border border-white/20 font-bold rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center active:scale-95"
                    >
                      <Icon name="X" className="w-4 h-4 mr-2" />
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div className="font-sans animate-in fade-in duration-500">
                  {renderRulesDisplay(rulesText)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* АДМИН-ПАНЕЛЬ (ДОСТУПНО ТОЛЬКО АДМИНУ) */}
        {activeTab === 'admin' && currentUser.role === 'admin' && (
          <div className="max-w-4xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
            <h2 className="text-3xl font-black text-white mb-2 flex items-center tracking-tight">
              <Icon name="Shield" className="w-8 h-8 mr-3 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"/>
              АДМИН-ЦЕНТР
            </h2>
            <p className="text-zinc-400 mb-10 font-medium">Управление доступами, составом и контентом сайта.</p>

            <div className="space-y-8">
              {/* ДОБАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ */}
              <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8 shadow-xl hover:border-white/20 transition-colors duration-500">
                <h3 className="text-lg font-black text-white mb-6 flex items-center uppercase tracking-wide">
                  <Icon name="UserPlus" className="w-5 h-5 mr-3 text-zinc-400"/>
                  Новый участник
                </h3>

                <form onSubmit={handleAddUser} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Логин на сайте</label>
                      <input
                        type="text"
                        value={newUser.username}
                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 focus:-translate-y-0.5 focus:shadow-lg transition-all duration-300 placeholder-zinc-700"
                        placeholder="Например: killer_yard"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Пароль</label>
                      <input
                        type="text"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 focus:-translate-y-0.5 focus:shadow-lg transition-all duration-300 placeholder-zinc-700"
                        placeholder="Временный пароль"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Имя в игре (Статик)</label>
                      <input
                        type="text"
                        value={newUser.inGameName}
                        onChange={(e) => setNewUser({...newUser, inGameName: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 focus:-translate-y-0.5 focus:shadow-lg transition-all duration-300 placeholder-zinc-700"
                        placeholder="John Yard #12345"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Игровой Ранг</label>
                      <select
                        value={newUser.rank}
                        onChange={(e) => setNewUser({...newUser, rank: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 focus:-translate-y-0.5 focus:shadow-lg transition-all duration-300"
                      >
                        <option value="new">new</option>
                        <option value="farm">farm</option>
                        <option value="main">main</option>
                        <option value="recrut">recrut</option>
                        <option value="triada">triada</option>
                        <option value="high">high</option>
                        <option value="dep boss">dep boss</option>
                        <option value="boss">boss</option>
                        <option value="Leader">Leader</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Роль на сайте</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 focus:-translate-y-0.5 focus:shadow-lg transition-all duration-300"
                      >
                        <option value="user">Обычный участник (Просмотр)</option>
                        <option value="admin">Администратор (Доступ к админ-панели)</option>
                      </select>
                    </div>
                  </div>

                  {adminUserMessage && (
                    <div className="p-4 bg-white/10 text-white border border-white/20 rounded-xl text-sm font-medium text-center animate-in zoom-in-95 fade-in duration-300">
                      {adminUserMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-white hover:bg-zinc-200 text-black font-black tracking-wide py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center active:scale-[0.98]"
                  >
                    <Icon name="UserPlus" className="w-5 h-5 mr-2" />
                    СОЗДАТЬ АККАУНТ
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* СТАТИСТИКА */}
                <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8 shadow-xl hover:border-white/20 transition-colors duration-500">
                  <h3 className="text-lg font-black text-white mb-6 flex items-center uppercase tracking-wide">
                    <Icon name="Activity" className="w-5 h-5 mr-3 text-zinc-400"/>
                    Статистика (Главная)
                  </h3>
                  <form onSubmit={handleSaveStats} className="space-y-5">
                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Автопарк</label>
                      <input
                        type="number"
                        value={editStats.cars}
                        onChange={(e) => setEditStats({...editStats, cars: parseInt(e.target.value) || 0})}
                        className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 focus:-translate-y-0.5 focus:shadow-lg transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Территории (Зоны)</label>
                      <input
                        type="number"
                        value={editStats.territories}
                        onChange={(e) => setEditStats({...editStats, territories: parseInt(e.target.value) || 0})}
                        className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 focus:-translate-y-0.5 focus:shadow-lg transition-all duration-300"
                      />
                    </div>

                    {adminStatsMessage && (
                      <div className="p-3 bg-white/10 text-white border border-white/20 rounded-xl text-sm font-medium text-center animate-in zoom-in-95 fade-in duration-300">
                        {adminStatsMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-white hover:bg-zinc-200 text-black font-black tracking-wide py-3.5 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:-translate-y-1 transition-all duration-300 active:scale-95"
                    >
                      ОБНОВИТЬ ЦИФРЫ
                    </button>
                  </form>
                </div>

                {/* НОВОСТИ */}
                <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8 shadow-xl flex flex-col hover:border-white/20 transition-colors duration-500">
                  <h3 className="text-lg font-black text-white mb-6 flex items-center uppercase tracking-wide">
                    <Icon name="FileText" className="w-5 h-5 mr-3 text-zinc-400"/>
                    Публикация новостей
                  </h3>
                  
                  <form onSubmit={handleAddNews} className="space-y-4 mb-6">
                    <input
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                      placeholder="Заголовок..."
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 focus:-translate-y-0.5 focus:shadow-lg transition-all duration-300 placeholder-zinc-600"
                    />
                    <textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                      placeholder="Текст новости..."
                      rows="3"
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 focus:-translate-y-0.5 focus:shadow-lg transition-all duration-300 resize-none placeholder-zinc-600"
                    ></textarea>

                    {adminNewsMessage && (
                      <div className="p-3 bg-white/10 text-white border border-white/20 rounded-xl text-sm font-medium text-center animate-in zoom-in-95 fade-in duration-300">
                        {adminNewsMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-white hover:bg-zinc-200 text-black font-black tracking-wide py-3.5 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:-translate-y-1 transition-all duration-300 active:scale-95 flex items-center justify-center"
                    >
                      <Icon name="Plus" className="w-4 h-4 mr-2" />
                      ОПУБЛИКОВАТЬ
                    </button>
                  </form>

                  <div className="flex-1 overflow-y-auto pr-2 max-h-[200px] space-y-3">
                    {news.length > 0 ? news.map(post => (
                      <div key={post.id} className="flex justify-between items-center p-4 bg-black/40 border border-white/5 rounded-xl group hover:border-white/20 hover:bg-white/[0.02] transition-all duration-300">
                        <div className="truncate pr-4">
                          <p className="text-white font-bold text-sm truncate">{post.title}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{post.dateStr}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteNews(post.id)}
                          className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 active:scale-90"
                          title="Удалить новость"
                        >
                          <Icon name="Trash2" className="w-4 h-4" />
                        </button>
                      </div>
                    )) : (
                      <p className="text-zinc-600 text-sm text-center py-4">Архив пуст.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* НАСТРОЙКИ (СМЕНА ПАРОЛЯ) */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
            <h2 className="text-3xl font-black text-white mb-2 flex items-center tracking-tight">
              <Icon name="Settings" className="w-8 h-8 mr-3 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"/>
              НАСТРОЙКИ
            </h2>
            <p className="text-zinc-400 mb-10 font-medium">Безопасность и личные данные аккаунта.</p>

            <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-10 shadow-2xl hover:border-white/20 transition-colors duration-500">
              <h3 className="text-lg font-black text-white mb-8 flex items-center uppercase tracking-wide">
                <Icon name="Key" className="w-5 h-5 mr-3 text-zinc-400" />
                Смена пароля
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Текущий пароль</label>
                  <input
                    type="password"
                    value={settingsOldPass}
                    onChange={(e) => setSettingsOldPass(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 focus:-translate-y-0.5 focus:shadow-lg transition-all duration-300 placeholder-zinc-700"
                    placeholder="Введите текущий пароль"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Новый пароль</label>
                  <input
                    type="password"
                    value={settingsNewPass}
                    onChange={(e) => setSettingsNewPass(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 focus:-translate-y-0.5 focus:shadow-lg transition-all duration-300 placeholder-zinc-700"
                    placeholder="Введите новый пароль"
                  />
                </div>

                {settingsMessage.text && (
                  <div className={`p-4 rounded-xl text-sm font-bold text-center border shadow-lg animate-in zoom-in-95 fade-in duration-300 ${settingsMessage.type === 'success' ? 'bg-white/10 text-white border-white/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {settingsMessage.text}
                  </div>
                )}

                <button
                  type="submit"
                  className="bg-white text-black font-black tracking-wide py-4 px-8 rounded-xl hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-1 transition-all duration-300 active:scale-95 flex items-center justify-center w-full md:w-auto"
                >
                  <Icon name="Save" className="w-5 h-5 mr-2" />
                  ОБНОВИТЬ ПАРОЛЬ
                </button>
              </form>
            </div>
          </div>
        )}
        
        </div>
      </main>
    </div>
  );
}