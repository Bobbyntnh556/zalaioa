import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, doc, setDoc, updateDoc, deleteDoc, increment } from 'firebase/firestore';

// Встроенный компонент иконок
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
    Activity: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
    Eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
    Calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    DollarSign: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    Award: <><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></>,
    List: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
    Clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    Star: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
    CheckCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
    Info: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
    Image: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>
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
// ПОДКЛЮЧЕНИЕ FIREBASE ПРОЕКТА
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

// Полный текст устава со всеми 27 пунктами восстановлен
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

const getTabFromUrl = () => {
  if (typeof window === 'undefined') return 'dashboard';
  try {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const validTabs = ['dashboard', 'members', 'rules', 'fleet', 'gallery', 'admin', 'settings'];
    return validTabs.includes(tab) ? tab : 'dashboard';
  } catch (e) {
    return 'dashboard';
  }
};

export default function App() {
  // Базовые состояния
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState(getTabFromUrl());
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  
  // Авторизация
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Данные коллекций
  const [rulesText, setRulesText] = useState(DEFAULT_RULES);
  const [stats, setStats] = useState({ territories: 12 });
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [honorBoard, setHonorBoard] = useState([]);
  const [logs, setLogs] = useState([]);
  const [fines, setFines] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [analytics, setAnalytics] = useState({ totalViews: 0, guestViews: 0, userViews: 0 });

  // Состояния для Админ-панели
  const [newUser, setNewUser] = useState({ 
    username: '', 
    password: '', 
    inGameName: '', 
    role: 'user', 
    rank: 'new', 
    warnings: 0, 
    bio: '' 
  });
  
  const [adminUserMessage, setAdminUserMessage] = useState('');
  const [adminStatsMessage, setAdminStatsMessage] = useState('');
  const [adminNewsMessage, setAdminNewsMessage] = useState('');
  const [adminEventMessage, setAdminEventMessage] = useState('');
  const [adminFleetMessage, setAdminFleetMessage] = useState('');
  const [adminHonorMessage, setAdminHonorMessage] = useState('');
  const [adminGalleryMessage, setAdminGalleryMessage] = useState('');

  const [editStats, setEditStats] = useState({ territories: 12 });
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', type: 'Собрание' });
  const [newVehicle, setNewVehicle] = useState({ model: '', plate: '' });
  const [newHonor, setNewHonor] = useState({ dbId: '', reason: '' });
  const [newImage, setNewImage] = useState({ url: '', caption: '' });
  
  const [adminEditSelectedId, setAdminEditSelectedId] = useState('');
  const [adminEditUsername, setAdminEditUsername] = useState('');
  const [adminEditInGameName, setAdminEditInGameName] = useState('');
  const [adminEditMessage, setAdminEditMessage] = useState({ text: '', type: '' });

  const [isEditingRules, setIsEditingRules] = useState(false);
  const [editedRules, setEditedRules] = useState('');

  // Модальное окно профиля игрока
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [newFine, setNewFine] = useState({ amount: '', reason: '' });
  const [newAchievement, setNewAchievement] = useState({ title: '', icon: 'Star' });
  const [modalMessage, setModalMessage] = useState('');

  // Настройки пользователя
  const [settingsBio, setSettingsBio] = useState('');
  const [settingsBioMessage, setSettingsBioMessage] = useState({ text: '', type: '' });
  const [settingsOldPass, setSettingsOldPass] = useState('');
  const [settingsNewPass, setSettingsNewPass] = useState('');
  const [settingsMessage, setSettingsMessage] = useState({ text: '', type: '' });
  
  const [now, setNow] = useState(Date.now());
  const hasCountedForLoad = useRef(false);

  // Таймер реального времени
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Синхронизация URL с активной вкладкой
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location);
        if (url.searchParams.get('tab') !== activeTab) {
          url.searchParams.set('tab', activeTab);
          window.history.pushState({}, '', url);
        }
      } catch (error) {}
    }
  }, [activeTab]);

  useEffect(() => {
    const handlePopState = () => setActiveTab(getTabFromUrl());
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  // Проверка прав доступа к вкладкам
  useEffect(() => {
    if (currentUser) {
      if (activeTab === 'admin' && currentUser.role !== 'admin') {
        setActiveTab('dashboard');
      }
      if (activeTab === 'settings' && currentUser.role === 'guest') {
        setActiveTab('dashboard');
      }
    }
  }, [activeTab, currentUser]);

  // Загрузка биографии при переходе в настройки
  useEffect(() => {
    if (activeTab === 'settings' && currentUser) {
      setSettingsBio(currentUser.bio || '');
    }
  }, [activeTab, currentUser]);

  // Инициализация авторизации
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
        setIsDbLoaded(true);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setFirebaseUser);
    return () => unsubscribe();
  }, []);

  // Подсчет просмотров (Счетчик)
  useEffect(() => {
    if (currentUser && db && !hasCountedForLoad.current) {
      hasCountedForLoad.current = true;
      const analyticsRef = getDocument('yard_settings', 'analytics');
      setDoc(analyticsRef, {
        totalViews: increment(1),
        [currentUser.role === 'guest' ? 'guestViews' : 'userViews']: increment(1)
      }, { merge: true }).catch(console.error);
    }
  }, [currentUser, db]);

  // Синхронизация текущего пользователя с базой данных
  useEffect(() => {
    if (currentUser && users.length > 0) {
      if (currentUser.role === 'guest') return;
      const syncedUser = users.find(u => u.dbId === currentUser.dbId);
      if (syncedUser) setCurrentUser(syncedUser);
    }
  }, [users, currentUser?.dbId, currentUser?.role]);

  // Подписка на коллекции Firestore
  useEffect(() => {
    if (!firebaseUser || !db) return;
    
    // Подписка на Пользователей
    const unsubscribeUsers = onSnapshot(getCol('yard_users'), (snapshot) => {
      const fetchedUsers = snapshot.docs.map(d => ({ dbId: d.id, ...d.data() }));
      const hasAdmin = fetchedUsers.some(u => u.role === 'admin');
      
      if (!hasAdmin) {
        // Создаем первого админа, если база пустая
        setDoc(doc(getCol('yard_users'), 'admin_user'), {
          numericId: 1, 
          username: 'admin', 
          password: '123', 
          role: 'admin', 
          inGameName: 'Leader', 
          rank: 'Leader', 
          warnings: 0, 
          bio: 'Создатель и лидер семьи', 
          joinDate: Date.now(), 
          achievements: []
        }).then(() => setIsDbLoaded(true)).catch(() => setIsDbLoaded(true));
      } else {
        setUsers(fetchedUsers.sort((a, b) => (a.numericId || 0) - (b.numericId || 0)));
        setIsDbLoaded(true);
      }
    });

    // Подписки на остальные коллекции
    const unsubRules = onSnapshot(getDocument('yard_settings', 'rules_v2'), d => {
      setRulesText(d.exists() ? d.data().text : DEFAULT_RULES);
    });
    
    const unsubStats = onSnapshot(getDocument('yard_settings', 'stats'), d => { 
      if(d.exists()){ 
        setStats(d.data()); 
        setEditStats(d.data()); 
      }
    });
    
    const unsubNews = onSnapshot(getCol('yard_news'), s => {
      setNews(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.timestamp - a.timestamp));
    });
    
    const unsubEvents = onSnapshot(getCol('yard_events'), s => {
      setEvents(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => a.timestamp - b.timestamp));
    });
    
    const unsubVehicles = onSnapshot(getCol('yard_fleet'), s => {
      setVehicles(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    const unsubLogs = onSnapshot(getCol('yard_logs'), s => {
      setLogs(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.timestamp - a.timestamp).slice(0, 50));
    });
    
    const unsubFines = onSnapshot(getCol('yard_fines'), s => {
      setFines(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    const unsubHonor = onSnapshot(getDocument('yard_settings', 'honor_board'), d => {
      setHonorBoard(d.exists() ? (d.data().players || []) : []);
    });
    
    const unsubGallery = onSnapshot(getCol('yard_gallery'), s => {
      setGallery(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.timestamp - a.timestamp));
    });

    const unsubAnalytics = onSnapshot(getDocument('yard_settings', 'analytics'), d => { 
      if(d.exists()) setAnalytics(d.data()); 
    });

    return () => {
      unsubscribeUsers(); 
      unsubRules(); 
      unsubStats(); 
      unsubNews(); 
      unsubEvents();
      unsubVehicles(); 
      unsubLogs(); 
      unsubFines(); 
      unsubHonor(); 
      unsubGallery();
      unsubAnalytics();
    };
  }, [firebaseUser]);


  // ==========================================
  // ЛОГИРОВАНИЕ ДЕЙСТВИЙ (ACTION LOGS)
  // ==========================================
  const logAdminAction = async (actionText) => {
    if (!db || !currentUser || currentUser.role !== 'admin') return;
    try {
      await addDoc(getCol('yard_logs'), {
        text: actionText,
        adminName: currentUser.inGameName,
        timestamp: Date.now(),
        dateStr: new Date().toLocaleString('ru-RU')
      });
    } catch (e) { 
      console.error(e); 
    }
  };

  // ==========================================
  // ФУНКЦИИ АДМИНИСТРАТОРА
  // ==========================================
  const handleUpdateWarnings = async (targetDbId, newCount) => {
    if (!currentUser || currentUser.role !== 'admin') return; 
    try {
      if (db) {
        const user = users.find(u => u.dbId === targetDbId);
        await updateDoc(getDocument('yard_users', targetDbId), { warnings: Math.max(0, newCount) });
        logAdminAction(`Изменил количество выговоров игроку ${user?.inGameName} на ${newCount}`);
      }
    } catch (err) {}
  };

  const handleUpdateRank = async (targetDbId, newRank) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      if (db) {
        const user = users.find(u => u.dbId === targetDbId);
        await updateDoc(getDocument('yard_users', targetDbId), { rank: newRank });
        logAdminAction(`Изменил ранг игроку ${user?.inGameName} на ${newRank}`);
      }
    } catch (err) {}
  };

  const handleSaveRules = async () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      if (db) {
        await setDoc(getDocument('yard_settings', 'rules_v2'), { text: editedRules });
        setIsEditingRules(false);
        logAdminAction(`Обновил устав семьи`);
      }
    } catch (err) {}
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'admin') return;

    const safeUsername = newUser.username.trim();
    if (!safeUsername || !newUser.password.trim() || !newUser.inGameName.trim()) {
      return setAdminUserMessage('Заполните все поля!');
    }
    
    if (users.find(u => u.username === safeUsername)) {
      return setAdminUserMessage('Такой логин уже существует!');
    }
    
    const nextId = users.length > 0 ? Math.max(...users.map(u => u.numericId || 0)) + 1 : 1;
    
    try {
      if (db) {
        await addDoc(getCol('yard_users'), { 
          ...newUser, 
          username: safeUsername,
          password: newUser.password.trim(),
          inGameName: newUser.inGameName.trim(),
          numericId: nextId,
          joinDate: Date.now(),
          achievements: []
        });
        setAdminUserMessage(`Пользователь ${safeUsername} добавлен!`);
        logAdminAction(`Добавил нового пользователя: ${safeUsername} (${newUser.inGameName})`);
        setNewUser({ username: '', password: '', inGameName: '', role: 'user', rank: 'new', warnings: 0, bio: '' });
      }
    } catch (err) {}
    setTimeout(() => setAdminUserMessage(''), 3000);
  };

  const handleSaveStats = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      if (db) {
        await setDoc(getDocument('yard_settings', 'stats'), editStats);
        setAdminStatsMessage('Обновлено!');
        setTimeout(() => setAdminStatsMessage(''), 3000);
      }
    } catch (err) {}
  };

  const handleAddNews = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'admin') return;
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    try {
      if (db) {
        await addDoc(getCol('yard_news'), {
          title: newPost.title.trim(), 
          content: newPost.content.trim(),
          timestamp: Date.now(), 
          dateStr: new Date().toLocaleDateString('ru-RU')
        });
        setNewPost({ title: '', content: '' });
        setAdminNewsMessage('Опубликовано!');
        logAdminAction(`Опубликовал новость: "${newPost.title.trim()}"`);
        setTimeout(() => setAdminNewsMessage(''), 3000);
      }
    } catch (err) {}
  };

  const handleDeleteNews = async (newsId) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      if (db) {
        await deleteDoc(getDocument('yard_news', newsId));
        logAdminAction(`Удалил новость`);
      }
    } catch (err) {}
  };

  // Мероприятия
  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'admin') return;
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      return setAdminEventMessage('Заполните все поля');
    }
    
    try {
      if (db) {
        const timestamp = new Date(`${newEvent.date}T${newEvent.time}`).getTime();
        await addDoc(getCol('yard_events'), { ...newEvent, timestamp });
        setAdminEventMessage('Событие создано!');
        logAdminAction(`Создал мероприятие: ${newEvent.title}`);
        setNewEvent({ title: '', date: '', time: '', type: 'Собрание' });
        setTimeout(() => setAdminEventMessage(''), 3000);
      }
    } catch (err) {}
  };
  
  const handleDeleteEvent = async (id) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    if (db) {
      await deleteDoc(getDocument('yard_events', id));
    }
  };

  // Доска почета
  const handleAddHonor = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'admin') return;
    if (!newHonor.dbId || !newHonor.reason) return setAdminHonorMessage('Заполните поля');
    
    if (honorBoard.find(p => p.dbId === newHonor.dbId)) return setAdminHonorMessage('Игрок уже на доске');
    if (honorBoard.length >= 3) return setAdminHonorMessage('Максимум 3 игрока на доске');

    try {
      if (db) {
        const updatedBoard = [...honorBoard, newHonor];
        await setDoc(getDocument('yard_settings', 'honor_board'), { players: updatedBoard });
        setNewHonor({ dbId: '', reason: '' });
        setAdminHonorMessage('Добавлен!');
        
        const user = users.find(u => u.dbId === newHonor.dbId);
        logAdminAction(`Добавил ${user?.inGameName} на Доску почета`);
        
        setTimeout(() => setAdminHonorMessage(''), 3000);
      }
    } catch (err) {}
  };
  
  const handleRemoveHonor = async (dbId) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    if (db) {
      const updatedBoard = honorBoard.filter(p => p.dbId !== dbId);
      await setDoc(getDocument('yard_settings', 'honor_board'), { players: updatedBoard });
    }
  };

  // Автопарк
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'admin') return;
    if (!newVehicle.model || !newVehicle.plate) return setAdminFleetMessage('Заполните поля');
    
    try {
      if (db) {
        await addDoc(getCol('yard_fleet'), { model: newVehicle.model, plate: newVehicle.plate, addedAt: Date.now() });
        setNewVehicle({ model: '', plate: '' });
        setAdminFleetMessage('Авто добавлено');
        logAdminAction(`Добавил авто в парк: ${newVehicle.model} (${newVehicle.plate})`);
        setTimeout(() => setAdminFleetMessage(''), 3000);
      }
    } catch (err) {}
  };
  
  const handleDeleteVehicle = async (id) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    if (db) {
      await deleteDoc(getDocument('yard_fleet', id));
    }
  };

  // Галерея
  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role === 'guest') return; // Разрешаем загрузку всем, кроме гостей
    if (!newImage.url || !newImage.caption) return setAdminGalleryMessage('Заполните поля');
    
    try {
      if (db) {
        await addDoc(getCol('yard_gallery'), { 
          imageUrl: newImage.url, 
          caption: newImage.caption, 
          addedBy: currentUser.inGameName,
          timestamp: Date.now() 
        });
        setNewImage({ url: '', caption: '' });
        setAdminGalleryMessage('Фото добавлено!');
        
        // Логируем действие, только если это сделал админ
        if (currentUser.role === 'admin') {
          logAdminAction(`Добавил фото в галерею: ${newImage.caption}`);
        }
        
        setTimeout(() => setAdminGalleryMessage(''), 3000);
      }
    } catch (err) {}
  };

  const handleDeleteImage = async (id) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    if (db) await deleteDoc(getDocument('yard_gallery', id));
  };

  // Профили, Штрафы и Достижения
  const handleIssueFine = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'admin' || !selectedProfile) return;
    if (!newFine.amount || !newFine.reason) return setModalMessage('Заполните поля!');
    
    try {
      if (db) {
        await addDoc(getCol('yard_fines'), {
          userId: selectedProfile.dbId,
          amount: newFine.amount,
          reason: newFine.reason,
          date: Date.now(),
          dateStr: new Date().toLocaleDateString('ru-RU'),
          status: 'unpaid'
        });
        setNewFine({ amount: '', reason: '' });
        setModalMessage('Штраф выписан!');
        logAdminAction(`Выписал штраф ${newFine.amount}$ игроку ${selectedProfile.inGameName} (${newFine.reason})`);
        setTimeout(() => setModalMessage(''), 3000);
      }
    } catch (err) {}
  };

  const handlePayFine = async (fineId) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      if (db) {
        await updateDoc(getDocument('yard_fines', fineId), { status: 'paid' });
        logAdminAction(`Отметил штраф как оплаченный (ID: ${fineId})`);
      }
    } catch (err) {}
  };

  const handleAddAchievement = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'admin' || !selectedProfile) return;
    if (!newAchievement.title) return setModalMessage('Введите название достижения');
    
    try {
      if (db) {
        const achievement = { 
          ...newAchievement, 
          dateStr: new Date().toLocaleDateString('ru-RU'), 
          id: Date.now() 
        };
        const updatedAchievements = [...(selectedProfile.achievements || []), achievement];
        
        await updateDoc(getDocument('yard_users', selectedProfile.dbId), { achievements: updatedAchievements });
        
        setNewAchievement({ title: '', icon: 'Star' });
        setModalMessage('Достижение выдано!');
        logAdminAction(`Выдал достижение "${achievement.title}" игроку ${selectedProfile.inGameName}`);
        
        // Моментально обновляем локальное состояние для UI
        setSelectedProfile(prev => ({ ...prev, achievements: updatedAchievements }));
        setTimeout(() => setModalMessage(''), 3000);
      }
    } catch (err) {}
  };

  // Управление пользователями (изменение логина)
  const handleUpdateUserDetails = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'admin' || !adminEditSelectedId) return;
    
    const safeUsername = adminEditUsername.trim(); 
    const safeInGameName = adminEditInGameName.trim();
    
    if (!safeUsername || !safeInGameName) {
      return setAdminEditMessage({ text: 'Поля пустые!', type: 'error' });
    }
    
    if (users.some(u => u.username === safeUsername && u.dbId !== adminEditSelectedId)) {
      return setAdminEditMessage({ text: 'Логин занят!', type: 'error' });
    }
    
    try {
      if (db) {
        await updateDoc(getDocument('yard_users', adminEditSelectedId), { 
          username: safeUsername, 
          inGameName: safeInGameName 
        });
        setAdminEditMessage({ text: 'Обновлено!', type: 'success' });
        logAdminAction(`Изменил данные аккаунта (Логин: ${safeUsername}, Имя: ${safeInGameName})`);
        setTimeout(() => setAdminEditMessage({ text: '', type: '' }), 3000);
      }
    } catch (err) {}
  };

  // ==========================================
  // НАСТРОЙКИ ПОЛЬЗОВАТЕЛЯ
  // ==========================================
  const handleUpdateBio = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role === 'guest') return;
    try {
      if (db) {
        await updateDoc(getDocument('yard_users', currentUser.dbId), { bio: settingsBio.trim() });
        setSettingsBioMessage({ text: 'Биография успешно обновлена!', type: 'success' });
        setTimeout(() => setSettingsBioMessage({ text: '', type: '' }), 3000);
      }
    } catch (err) {}
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role === 'guest') return;
    
    if (!settingsOldPass || !settingsNewPass) {
      return setSettingsMessage({ text: 'Заполните все поля', type: 'error' });
    }
    if (settingsOldPass !== currentUser.password) {
      return setSettingsMessage({ text: 'Текущий пароль введен неверно', type: 'error' });
    }
    if (settingsNewPass.trim().length < 3) {
      return setSettingsMessage({ text: 'Новый пароль слишком короткий', type: 'error' });
    }
    
    try {
      if (db) {
        await updateDoc(getDocument('yard_users', currentUser.dbId), { password: settingsNewPass.trim() });
        setSettingsMessage({ text: 'Пароль изменен!', type: 'success' });
        setSettingsOldPass(''); 
        setSettingsNewPass('');
        setTimeout(() => setSettingsMessage({ text: '', type: '' }), 3000);
      }
    } catch (err) {}
  };

  // ==========================================
  // АВТОРИЗАЦИЯ
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (loginUser.trim() === 'admin' && loginPass === '#Yard789#million987/.') {
      const defaultAdmin = {
        dbId: 'admin_user', 
        numericId: 1, 
        username: 'admin', 
        password: '123', 
        role: 'admin', 
        inGameName: 'Leader', 
        rank: 'Leader', 
        warnings: 0, 
        bio: 'Создатель семьи'
      };
      
      const adminUser = users.find(u => u.username === 'admin') || defaultAdmin;
      
      if (db) {
        setDoc(getDocument('yard_users', adminUser.dbId), { ...adminUser, password: '123', role: 'admin' }, { merge: true }).catch(console.error);
      }
      setCurrentUser({ ...adminUser, password: '123', role: 'admin' });
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

  const handleGuestLogin = () => {
    setCurrentUser({ 
      dbId: 'guest_user', 
      username: 'guest', 
      inGameName: 'Гость', 
      role: 'guest', 
      rank: 'Guest', 
      warnings: 0, 
      bio: '' 
    });
    setLoginError(''); 
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null); 
    setLoginUser(''); 
    setLoginPass(''); 
    setActiveTab('dashboard');
  };

  // ==========================================
  // VIEW: ЭКРАН ВХОДА
  // ==========================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <style>{CUSTOM_STYLES}</style>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-80"></div>
        <BackgroundMarquee />
        
        <div className="relative z-10 w-full max-w-md bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.03)] p-8 animate-in fade-in zoom-in-95 duration-500 ease-out">
          <div className="text-center mb-10">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-300 to-zinc-600 tracking-tighter [text-shadow:0_0_20px_rgba(255,255,255,0.2)]">YARD</h1>
            <p className="text-zinc-500 mt-2 text-xs uppercase tracking-[0.3em] font-bold">Majestic RP Family</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider font-bold mb-2">Логин</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon name="Users" className="h-4 w-4 text-zinc-600 group-focus-within:text-white transition-colors duration-300" />
                </div>
                <input
                  type="text" 
                  value={loginUser} 
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all duration-300 placeholder-zinc-700"
                  placeholder="Введи логин"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider font-bold mb-2">Пароль</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon name="Key" className="h-4 w-4 text-zinc-600 group-focus-within:text-white transition-colors duration-300" />
                </div>
                <input
                  type="password" 
                  value={loginPass} 
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all duration-300 placeholder-zinc-700"
                  placeholder="Введи пароль"
                />
              </div>
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-3.5 text-center">
                {loginError}
              </div>
            )}

            <button 
              type="submit" 
              disabled={!isDbLoaded} 
              className={`w-full font-bold py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-200 tracking-wide ${isDbLoaded ? 'bg-white text-black hover:bg-zinc-200 active:scale-95' : 'bg-white/20 text-white/50 cursor-wait'}`}
            >
              {isDbLoaded ? 'ВОЙТИ В СИСТЕМУ' : 'СИНХРОНИЗАЦИЯ БАЗЫ...'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-black/60 px-2 text-zinc-500 font-bold uppercase tracking-wider">Или</span>
            </div>
          </div>

          <button 
            onClick={handleGuestLogin} 
            disabled={!isDbLoaded} 
            className={`w-full font-bold py-3 px-4 rounded-xl border border-white/20 transition-all duration-200 tracking-wide ${isDbLoaded ? 'bg-transparent text-white hover:bg-white/10 active:scale-95' : 'text-white/30 border-white/5 cursor-wait'}`}
          >
            {isDbLoaded ? 'ВОЙТИ КАК ГОСТЬ' : 'ОЖИДАНИЕ...'}
          </button>
          
          <div className="mt-8 text-center text-xs text-zinc-600 font-medium">
            Доступ только для членов семьи YARD. <br/> Обратитесь к лидеру для получения полного доступа.
          </div>
        </div>
      </div>
    );
  }

  // Helper arrays for rendering profiles
  const profileFines = fines.filter(f => f.userId === selectedProfile?.dbId);
  const unpaidFinesTotal = profileFines.filter(f => f.status === 'unpaid').reduce((acc, curr) => acc + Number(curr.amount), 0);

  // ==========================================
  // VIEW: ОСНОВНОЙ ИНТЕРФЕЙС ПРИЛОЖЕНИЯ
  // ==========================================
  return (
    <div className="min-h-screen bg-black text-zinc-200 flex flex-col md:flex-row font-sans relative selection:bg-white/20">
      <style>{CUSTOM_STYLES}</style>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black pointer-events-none z-0"></div>
      <BackgroundMarquee />
      
      {/* Боковое меню */}
      <aside className="w-full md:w-64 bg-black/40 backdrop-blur-2xl border-r border-white/5 flex flex-col relative z-20 shadow-[5px_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 shrink-0">
        <div className="p-6 text-center border-b border-white/5">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500 tracking-tighter">YARD</h2>
          <div className="mt-2 inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white border border-white/10 backdrop-blur-md">
            {currentUser.rank}
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {[
            { id: 'dashboard', icon: 'Home', label: 'Главная' },
            { id: 'members', icon: 'Users', label: 'Состав семьи' },
            { id: 'fleet', icon: 'Car', label: 'Автопарк' },
            { id: 'gallery', icon: 'Image', label: 'Галерея' },
            { id: 'rules', icon: 'BookOpen', label: 'Устав' },
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`group w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ease-out hover:translate-x-1 ${activeTab === tab.id ? 'bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon name={tab.icon} className={`w-4 h-4 transition-all duration-300 ease-out ${activeTab === tab.id ? '' : 'group-hover:scale-125'}`} />
              <span>{tab.label}</span>
            </button>
          ))}

          {currentUser.role === 'admin' && (
            <button 
              onClick={() => setActiveTab('admin')} 
              className={`group w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ease-out hover:translate-x-1 mt-4 ${activeTab === 'admin' ? 'bg-zinc-800 text-white font-bold border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon name="Shield" className={`w-4 h-4 transition-all duration-300 ease-out ${activeTab === 'admin' ? '' : 'group-hover:scale-125'}`} />
              <span>Админ-панель</span>
            </button>
          )}

          {currentUser.role !== 'guest' && (
            <button 
              onClick={() => setActiveTab('settings')} 
              className={`group w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ease-out hover:translate-x-1 mt-4 ${activeTab === 'settings' ? 'bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon name="Settings" className={`w-4 h-4 transition-all duration-500 ${activeTab === 'settings' ? '' : 'group-hover:rotate-180'}`} />
              <span>Настройки</span>
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center space-x-3 mb-4 px-2 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-white/20 flex items-center justify-center shrink-0 shadow-lg text-white font-bold transition-transform hover:scale-105 duration-300">
              {currentUser.inGameName ? currentUser.inGameName.charAt(0) : 'U'}
            </div>
            <div className="truncate flex-1">
              <p className="text-sm font-bold text-white truncate">{currentUser.inGameName}</p>
              {currentUser.role === 'guest' ? (
                <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider mt-1">Гостевой доступ</p>
              ) : currentUser.warnings > 0 ? (
                <span className="flex items-center text-[10px] uppercase font-black text-red-400 tracking-wider bg-red-500/10 w-fit px-1.5 py-0.5 rounded border border-red-500/20 mt-1">
                  <Icon name="AlertTriangle" className="w-3 h-3 mr-1 animate-pulse" /> Выговоры: {currentUser.warnings}
                </span>
              ) : (
                <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mt-1">Без выговоров</p>
              )}
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="group w-full py-2.5 bg-white/5 hover:bg-white hover:text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] active:scale-95 transition-all duration-300 flex items-center justify-center text-xs font-bold rounded-xl border border-white/5 hover:border-transparent"
          >
            <Icon name="LogOut" className="w-3 h-3 mr-2 transition-transform duration-300 group-hover:-translate-x-1" /> Выход
          </button>
        </div>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto relative z-10">
        <div className="max-w-6xl mx-auto">
        
        {/* ========================================================= */}
        {/* ГЛАВНАЯ СТРАНИЦА */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
            <header className="mb-10">
              <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Салют, {currentUser.inGameName}!</h1>
              <p className="text-zinc-400 mb-6">Добро пожаловать в закрытый портал семьи YARD.</p>
              
              {currentUser.bio && (
                 <div className="p-4 bg-white/5 border border-white/10 rounded-xl max-w-2xl text-sm text-zinc-300 italic shadow-lg flex items-start space-x-3">
                   <div className="text-zinc-500 font-serif text-3xl leading-none">"</div>
                   <div className="pt-1">{currentUser.bio}</div>
                 </div>
              )}
            </header>

            {/* ТАЙМЕР МЕРОПРИЯТИЙ */}
            {(() => {
              const upcomingEvents = events.filter(e => e.timestamp > now).sort((a, b) => a.timestamp - b.timestamp);
              if (upcomingEvents.length === 0) return null;
              
              const nextEvent = upcomingEvents[0];
              const diff = nextEvent.timestamp - now;
              const isUrgent = diff <= 15 * 60 * 1000; // 15 минут
              
              const d = Math.floor(diff / (1000 * 60 * 60 * 24));
              const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
              const m = Math.floor((diff / 1000 / 60) % 60);
              const s = Math.floor((diff / 1000) % 60);

              return (
                <div className={`relative overflow-hidden p-6 rounded-2xl border shadow-2xl transition-all duration-500 ${isUrgent ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'bg-gradient-to-r from-zinc-900 to-black border-white/10'}`}>
                  {isUrgent && <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none"></div>}
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center mb-4 md:mb-0">
                      <div className={`p-4 rounded-xl mr-5 ${isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'}`}>
                        <Icon name="Clock" className={`w-8 h-8 ${isUrgent ? 'animate-bounce' : ''}`} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Ближайшее событие</p>
                        <h3 className="text-2xl font-black text-white">{nextEvent.title} <span className="text-sm font-medium text-zinc-500 bg-black/50 px-2 py-1 rounded ml-2">{nextEvent.type}</span></h3>
                      </div>
                    </div>
                    <div className="flex space-x-3 text-center">
                      {d > 0 && <div className="bg-black/50 border border-white/10 rounded-lg p-3 min-w-[70px]"><span className="block text-2xl font-black text-white">{d}</span><span className="text-[10px] text-zinc-500 uppercase font-bold">Дней</span></div>}
                      <div className="bg-black/50 border border-white/10 rounded-lg p-3 min-w-[70px]"><span className={`block text-2xl font-black ${isUrgent ? 'text-red-400' : 'text-white'}`}>{h.toString().padStart(2, '0')}</span><span className="text-[10px] text-zinc-500 uppercase font-bold">Часов</span></div>
                      <div className="bg-black/50 border border-white/10 rounded-lg p-3 min-w-[70px]"><span className={`block text-2xl font-black ${isUrgent ? 'text-red-400' : 'text-white'}`}>{m.toString().padStart(2, '0')}</span><span className="text-[10px] text-zinc-500 uppercase font-bold">Минут</span></div>
                      <div className="bg-black/50 border border-white/10 rounded-lg p-3 min-w-[70px]"><span className={`block text-2xl font-black ${isUrgent ? 'text-red-400' : 'text-white'}`}>{s.toString().padStart(2, '0')}</span><span className="text-[10px] text-zinc-500 uppercase font-bold">Секунд</span></div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-center space-x-5 group cursor-default">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10"><Icon name="Users" className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" /></div>
                <div><p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Участников</p><p className="text-3xl font-black text-white">{users.length}</p></div>
              </div>
              <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-center space-x-5 group cursor-default">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10"><Icon name="Car" className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" /></div>
                <div><p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Автопарк</p><p className="text-3xl font-black text-white">{vehicles.length}</p></div>
              </div>
              <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-center space-x-5 group cursor-default">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10"><Icon name="Crosshair" className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" /></div>
                <div><p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Территории</p><p className="text-3xl font-black text-white">{stats.territories}</p></div>
              </div>
            </div>

            {/* Доска Почета */}
            {honorBoard.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-black text-white mb-6 flex items-center tracking-wide uppercase">
                  <Icon name="Award" className="w-5 h-5 mr-3 text-yellow-500"/> Доска Почета
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {honorBoard.map((honor, idx) => {
                    const u = users.find(x => x.dbId === honor.dbId);
                    if (!u) return null;
                    return (
                      <div key={idx} className="relative p-6 rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-800 to-black border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.1)] group">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Icon name="Star" className="w-16 h-16 text-yellow-500" /></div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-600 to-yellow-300 p-1 mb-4 shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                            <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-xl font-black text-white">
                              {u.inGameName.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <h4 className="font-bold text-white text-lg">{u.inGameName}</h4>
                          <span className="text-xs text-yellow-500 font-bold uppercase tracking-widest mt-1 bg-yellow-500/10 px-2 py-0.5 rounded-full">{u.rank}</span>
                          <p className="text-sm text-zinc-400 mt-4 italic">"{honor.reason}"</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* НОВОСТИ */}
              <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-8">
                <h3 className="text-xl font-black text-white mb-6 flex items-center tracking-wide"><Icon name="FileText" className="w-5 h-5 mr-3"/> НОВОСТИ</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {news.length > 0 ? news.map(post => (
                    <div key={post.id} className="p-5 bg-black/40 rounded-xl border border-white/5">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-white text-lg">{post.title}</h4>
                        <span className="text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded-md">{post.dateStr}</span>
                      </div>
                      <p className="text-zinc-400 text-sm whitespace-pre-wrap">{post.content}</p>
                    </div>
                  )) : <p className="text-zinc-600 text-sm text-center py-4">Новостей пока нет</p>}
                </div>
              </div>

              {/* МЕРОПРИЯТИЯ */}
              <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-8">
                <h3 className="text-xl font-black text-white mb-6 flex items-center tracking-wide"><Icon name="Calendar" className="w-5 h-5 mr-3"/> МЕРОПРИЯТИЯ</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {events.length > 0 ? events.filter(e => e.timestamp > Date.now() - 86400000).map(ev => {
                    const isSoon = ev.timestamp - Date.now() < 86400000 && ev.timestamp > Date.now(); // Less than 24h
                    return (
                      <div key={ev.id} className={`p-4 rounded-xl border flex items-center space-x-4 ${isSoon ? 'bg-white/5 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'bg-black/40 border-white/5'}`}>
                        <div className="flex flex-col items-center justify-center p-3 bg-black rounded-lg border border-white/10 min-w-[70px]">
                          <span className="text-xs text-zinc-500 font-bold uppercase">{ev.date.split('-')[2]} {['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'][parseInt(ev.date.split('-')[1])-1]}</span>
                          <span className="text-lg font-black text-white">{ev.time}</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-sm">{ev.type}</span>
                          <h4 className="font-bold text-white text-base mt-1">{ev.title}</h4>
                        </div>
                      </div>
                    )
                  }) : <p className="text-zinc-600 text-sm text-center py-4">В ближайшее время событий нет</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* СОСТАВ СЕМЬИ */}
        {/* ========================================================= */}
        {activeTab === 'members' && (
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
            <h2 className="text-3xl font-black text-white mb-8 tracking-tight">СОСТАВ СЕМЬИ</h2>
            <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/60 border-b border-white/10">
                    <th className="p-5 text-zinc-400 font-bold text-xs uppercase tracking-wider hidden sm:table-cell">ID</th>
                    <th className="p-5 text-zinc-400 font-bold text-xs uppercase tracking-wider">Имя в игре</th>
                    <th className="p-5 text-zinc-400 font-bold text-xs uppercase tracking-wider">Ранг</th>
                    <th className="p-5 text-zinc-400 font-bold text-xs uppercase tracking-wider">Роль</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr 
                      key={user.dbId} 
                      onClick={() => setSelectedProfile(user)}
                      className="border-b border-white/5 hover:bg-white/10 transition-colors duration-200 cursor-pointer group"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="p-5 text-zinc-500 font-mono text-sm hidden sm:table-cell">#{user.numericId || 1}</td>
                      <td className="p-5">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center mr-3 text-xs border border-white/10 shrink-0">
                            {user.inGameName ? user.inGameName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-white flex items-center">
                              {user.inGameName}
                              {user.warnings > 0 && <span className="ml-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Есть выговоры"></span>}
                              {fines.some(f => f.userId === user.dbId && f.status === 'unpaid') && <span className="ml-1 text-xs" title="Должник">💸</span>}
                            </p>
                            {user.bio && <p className="text-[10px] text-zinc-500 mt-0.5 truncate max-w-[200px]">{user.bio}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-white border border-white/10">{user.rank}</span>
                      </td>
                      <td className="p-5">
                        {user.role === 'admin' ? (
                          <span className="flex items-center text-xs text-black bg-white px-2 py-1 rounded-md w-max font-black shadow-[0_0_10px_rgba(255,255,255,0.3)]"><Icon name="Shield" className="w-3 h-3 mr-1"/> АДМИН</span>
                        ) : (
                          <span className="text-xs font-medium text-zinc-500 w-max">Пользователь</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* АВТОПАРК */}
        {/* ========================================================= */}
        {activeTab === 'fleet' && (
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
            <h2 className="text-3xl font-black text-white mb-8 tracking-tight">АВТОПАРК СЕМЬИ</h2>
            
            {currentUser.role === 'admin' && (
              <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl mb-8">
                <form onSubmit={handleAddVehicle} className="flex flex-col md:flex-row gap-4">
                  <input 
                    type="text" 
                    placeholder="Модель авто (напр. BMW M5 F90)" 
                    value={newVehicle.model} 
                    onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} 
                    className="flex-1 bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white/40" 
                  />
                  <input 
                    type="text" 
                    placeholder="Номера (напр. 1YARD001)" 
                    value={newVehicle.plate} 
                    onChange={e => setNewVehicle({...newVehicle, plate: e.target.value})} 
                    className="w-full md:w-48 bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white/40" 
                  />
                  <button type="submit" className="bg-white text-black font-black px-6 py-3 rounded-xl hover:bg-zinc-200 active:scale-95 transition-all">ДОБАВИТЬ</button>
                </form>
                {adminFleetMessage && <p className="text-sm text-white mt-3">{adminFleetMessage}</p>}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.length > 0 ? vehicles.map(v => (
                <div key={v.id} className="bg-zinc-900/40 rounded-2xl border border-white/10 p-6 flex justify-between items-center group hover:bg-white/5 transition-all">
                  <div>
                    <h4 className="font-bold text-white text-lg">{v.model}</h4>
                    <span className="text-xs font-mono text-zinc-400 bg-black px-2 py-1 rounded border border-white/5 mt-2 inline-block">{v.plate}</span>
                  </div>
                  {currentUser.role === 'admin' && (
                     <button 
                       onClick={() => handleDeleteVehicle(v.id)} 
                       className="p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                     >
                       <Icon name="Trash2" className="w-4 h-4" />
                     </button>
                  )}
                </div>
              )) : <div className="col-span-full text-center text-zinc-500 py-10">Автопарк пуст</div>}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ГАЛЕРЕЯ */}
        {/* ========================================================= */}
        {activeTab === 'gallery' && (
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
            <h2 className="text-3xl font-black text-white mb-8 tracking-tight">СЕМЕЙНАЯ ГАЛЕРЕЯ</h2>
            <p className="text-zinc-400 mb-8">Делитесь лучшими моментами семьи YARD.</p>

            {/* Форма загрузки фото для всех участников */}
            {currentUser.role !== 'guest' && (
              <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl mb-8">
                <form onSubmit={handleAddImage} className="flex flex-col md:flex-row gap-4">
                  <input 
                    type="url" 
                    placeholder="Ссылка на картинку (Imgur/Discord)" 
                    value={newImage.url} 
                    onChange={e => setNewImage({...newImage, url: e.target.value})} 
                    className="flex-1 bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white/40" 
                  />
                  <input 
                    type="text" 
                    placeholder="Подпись (например: ВЗМ 24.10.2023)" 
                    value={newImage.caption} 
                    onChange={e => setNewImage({...newImage, caption: e.target.value})} 
                    className="w-full md:w-64 bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white/40" 
                  />
                  <button type="submit" className="bg-white text-black font-black px-8 py-3 rounded-xl hover:bg-zinc-200 active:scale-95 transition-all">ДОБАВИТЬ</button>
                </form>
                {adminGalleryMessage && <p className="text-sm text-white mt-3 bg-white/10 p-2 rounded w-fit">{adminGalleryMessage}</p>}
              </div>
            )}

            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {gallery.length > 0 ? gallery.map(img => (
                <div key={img.id} className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-zinc-900/40 border border-white/10">
                  <img 
                    src={img.imageUrl} 
                    alt={img.caption} 
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300/111111/333333?text=Image+Not+Found'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-white font-bold text-lg mb-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{img.caption}</p>
                        <p className="text-zinc-400 text-xs translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">Добавил: {img.addedBy}</p>
                      </div>
                      {/* Удаление доступно только админам */}
                      {currentUser.role === 'admin' && (
                        <button 
                          onClick={() => handleDeleteImage(img.id)} 
                          className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-500 active:scale-95 transition-all translate-y-4 group-hover:translate-y-0 duration-300 delay-100"
                          title="Удалить фото"
                        >
                          <Icon name="Trash2" className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center text-zinc-600 py-20 font-medium">
                  Галерея пока пуста. Вскоре здесь появятся наши лучшие моменты!
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* УСТАВ */}
        {/* ========================================================= */}
        {activeTab === 'rules' && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-white tracking-tight">УСТАВ СЕМЬИ</h2>
              {currentUser.role === 'admin' && !isEditingRules && (
                <button 
                  onClick={() => { setEditedRules(rulesText); setIsEditingRules(true); }} 
                  className="px-5 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white hover:text-black hover:-translate-y-1 active:translate-y-0.5 transition-all text-sm font-bold flex items-center border border-white/20"
                >
                  <Icon name="Edit" className="w-4 h-4 mr-2" /> Редактировать
                </button>
              )}
            </div>
            
            <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-8 md:p-12 shadow-2xl">
              {isEditingRules ? (
                <div className="space-y-6">
                  <textarea 
                    value={editedRules} 
                    onChange={(e) => setEditedRules(e.target.value)} 
                    className="w-full h-[500px] bg-black/50 text-white p-4 rounded-lg focus:outline-none font-mono text-sm border border-white/10 focus:border-white/40" 
                  />
                  <div className="flex space-x-4">
                    <button 
                      onClick={handleSaveRules} 
                      className="px-8 py-3.5 bg-white text-black font-black rounded-xl hover:bg-zinc-200 active:scale-95 transition-all"
                    >
                      <Icon name="Save" className="w-4 h-4 mr-2 inline" /> СОХРАНИТЬ
                    </button>
                    <button 
                      onClick={() => setIsEditingRules(false)} 
                      className="px-8 py-3.5 bg-transparent text-white border border-white/20 font-bold rounded-xl hover:bg-white/10 active:scale-95 transition-all"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div>{renderRulesDisplay(rulesText)}</div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* АДМИН-ПАНЕЛЬ */}
        {activeTab === 'admin' && currentUser.role === 'admin' && (
          <div className="max-w-4xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
            <h2 className="text-3xl font-black text-white mb-8 flex items-center tracking-tight"><Icon name="Shield" className="w-8 h-8 mr-3"/> АДМИН-ЦЕНТР</h2>

            <div className="space-y-8">
              {/* АНАЛИТИКА */}
              <div className="bg-zinc-900/40 rounded-2xl border border-white/10 p-6 shadow-xl">
                <h3 className="text-lg font-black text-white mb-4 uppercase tracking-wide">Посещаемость портала</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-black/50 p-5 rounded-xl border border-white/5"><p className="text-zinc-500 text-xs font-bold uppercase mb-1">Всего</p><p className="text-4xl font-black text-white">{analytics.totalViews}</p></div>
                  <div className="bg-black/50 p-5 rounded-xl border border-white/5"><p className="text-zinc-500 text-xs font-bold uppercase mb-1">Пользователи</p><p className="text-4xl font-black text-emerald-400">{analytics.userViews}</p></div>
                  <div className="bg-black/50 p-5 rounded-xl border border-white/5"><p className="text-zinc-500 text-xs font-bold uppercase mb-1">Гости</p><p className="text-4xl font-black text-zinc-400">{analytics.guestViews}</p></div>
                </div>
              </div>

              {/* УПРАВЛЕНИЕ АККАУНТАМИ (ИЗМЕНЕНИЕ ЛОГИНА И ИМЕНИ) */}
              <div className="bg-zinc-900/40 rounded-2xl border border-white/10 p-6 shadow-xl">
                <h3 className="text-lg font-black text-white mb-4 uppercase tracking-wide flex items-center"><Icon name="Edit" className="w-5 h-5 mr-2" /> Управление аккаунтами</h3>
                <form onSubmit={handleUpdateUserDetails} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="md:col-span-1">
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Пользователь</label>
                    <select 
                      value={adminEditSelectedId} 
                      onChange={(e) => {
                        const id = e.target.value;
                        setAdminEditSelectedId(id);
                        const user = users.find(u => u.dbId === id);
                        if (user) {
                          setAdminEditUsername(user.username);
                          setAdminEditInGameName(user.inGameName);
                        } else {
                          setAdminEditUsername('');
                          setAdminEditInGameName('');
                        }
                      }}
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3"
                    >
                      <option value="" disabled>-- Выберите --</option>
                      {users.map(u => <option key={u.dbId} value={u.dbId}>{u.inGameName} ({u.username})</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Логин на сайте</label>
                    <input 
                      type="text" 
                      value={adminEditUsername} 
                      onChange={e => setAdminEditUsername(e.target.value)} 
                      disabled={!adminEditSelectedId}
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 disabled:opacity-50" 
                      placeholder="Новый логин"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Имя в игре</label>
                    <input 
                      type="text" 
                      value={adminEditInGameName} 
                      onChange={e => setAdminEditInGameName(e.target.value)} 
                      disabled={!adminEditSelectedId}
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 disabled:opacity-50" 
                      placeholder="Новое имя"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <button type="submit" disabled={!adminEditSelectedId} className="w-full bg-white text-black font-black py-3 rounded-xl hover:bg-zinc-200 disabled:opacity-50 transition-all active:scale-95">ОБНОВИТЬ</button>
                  </div>
                </form>
                {adminEditMessage.text && <p className={`text-sm mt-3 p-2 rounded font-bold ${adminEditMessage.type === 'success' ? 'bg-white/10 text-white' : 'bg-red-500/10 text-red-400'}`}>{adminEditMessage.text}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ДОБАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ */}
                <div className="bg-zinc-900/40 rounded-2xl border border-white/10 p-6 shadow-xl">
                  <h3 className="text-lg font-black text-white mb-4 uppercase tracking-wide">Создать аккаунт</h3>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Логин" 
                      value={newUser.username} 
                      onChange={e => setNewUser({...newUser, username: e.target.value})} 
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3" 
                    />
                    <input 
                      type="text" 
                      placeholder="Пароль" 
                      value={newUser.password} 
                      onChange={e => setNewUser({...newUser, password: e.target.value})} 
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3" 
                    />
                    <input 
                      type="text" 
                      placeholder="Имя в игре (Статик)" 
                      value={newUser.inGameName} 
                      onChange={e => setNewUser({...newUser, inGameName: e.target.value})} 
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3" 
                    />
                    <select 
                      value={newUser.rank} 
                      onChange={e => setNewUser({...newUser, rank: e.target.value})} 
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3"
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
                    <select 
                      value={newUser.role} 
                      onChange={e => setNewUser({...newUser, role: e.target.value})} 
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3"
                    >
                      <option value="user">Обычный участник (Просмотр)</option>
                      <option value="admin">Администратор (Доступ к админ-панели)</option>
                    </select>
                    <button type="submit" className="w-full bg-white text-black font-black py-3 rounded-xl hover:bg-zinc-200">СОЗДАТЬ</button>
                  </form>
                  {adminUserMessage && <p className="text-sm text-white mt-3 bg-white/10 p-2 rounded">{adminUserMessage}</p>}
                </div>

                {/* ДОСКА ПОЧЕТА */}
                <div className="bg-zinc-900/40 rounded-2xl border border-white/10 p-6 shadow-xl">
                  <h3 className="text-lg font-black text-white mb-4 uppercase tracking-wide">Доска почета</h3>
                  <form onSubmit={handleAddHonor} className="space-y-4">
                    <select 
                      value={newHonor.dbId} 
                      onChange={e => setNewHonor({...newHonor, dbId: e.target.value})} 
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3"
                    >
                      <option value="" disabled>-- Выберите игрока --</option>
                      {users.map(u => <option key={u.dbId} value={u.dbId}>{u.inGameName}</option>)}
                    </select>
                    <input 
                      type="text" 
                      placeholder="Причина (Например: Лучший стрелок месяца)" 
                      value={newHonor.reason} 
                      onChange={e => setNewHonor({...newHonor, reason: e.target.value})} 
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3" 
                    />
                    <button type="submit" className="w-full bg-yellow-500 text-black font-black py-3 rounded-xl hover:bg-yellow-400">ДОБАВИТЬ В ТОП</button>
                  </form>
                  {adminHonorMessage && <p className="text-sm text-white mt-3 bg-white/10 p-2 rounded">{adminHonorMessage}</p>}
                  
                  {/* Текущие в топе */}
                  <div className="mt-4 space-y-2">
                    {honorBoard.map(h => (
                       <div key={h.dbId} className="flex justify-between text-sm bg-black/40 p-2 rounded border border-white/5">
                         <span className="text-white truncate">{users.find(u=>u.dbId===h.dbId)?.inGameName || 'Неизвестно'}</span>
                         <button onClick={() => handleRemoveHonor(h.dbId)} className="text-red-400 hover:text-red-300">Удалить</button>
                       </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* МЕРОПРИЯТИЯ */}
                <div className="bg-zinc-900/40 rounded-2xl border border-white/10 p-6 shadow-xl">
                  <h3 className="text-lg font-black text-white mb-4 uppercase tracking-wide">Создать Событие</h3>
                  <form onSubmit={handleAddEvent} className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Название (ВЗМ, Собрание)" 
                      value={newEvent.title} 
                      onChange={e => setNewEvent({...newEvent, title: e.target.value})} 
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3" 
                    />
                    <div className="flex gap-4">
                      <input 
                        type="date" 
                        value={newEvent.date} 
                        onChange={e => setNewEvent({...newEvent, date: e.target.value})} 
                        className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 [color-scheme:dark]" 
                      />
                      <input 
                        type="time" 
                        value={newEvent.time} 
                        onChange={e => setNewEvent({...newEvent, time: e.target.value})} 
                        className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 [color-scheme:dark]" 
                      />
                    </div>
                    <select 
                      value={newEvent.type} 
                      onChange={e => setNewEvent({...newEvent, type: e.target.value})} 
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3"
                    >
                      <option>Собрание</option><option>Капт</option><option>ВЗМ</option><option>Тренировка</option><option>Другое</option>
                    </select>
                    <button type="submit" className="w-full bg-white text-black font-black py-3 rounded-xl hover:bg-zinc-200">СОЗДАТЬ СОБЫТИЕ</button>
                  </form>
                  {adminEventMessage && <p className="text-sm text-white mt-3 bg-white/10 p-2 rounded">{adminEventMessage}</p>}
                  
                  <div className="mt-4 max-h-[150px] overflow-auto space-y-2">
                    {events.map(ev => (
                       <div key={ev.id} className="flex justify-between items-center text-sm bg-black/40 p-2 rounded border border-white/5">
                         <span className="text-white truncate">{ev.title} ({ev.date})</span>
                         <button onClick={() => handleDeleteEvent(ev.id)} className="text-red-400 hover:text-red-300"><Icon name="Trash2" className="w-4 h-4" /></button>
                       </div>
                    ))}
                  </div>
                </div>

                {/* СТАТИСТИКА */}
                <div className="bg-zinc-900/40 rounded-2xl border border-white/10 p-6 shadow-xl">
                  <h3 className="text-lg font-black text-white mb-4 uppercase tracking-wide">Настройка статистики</h3>
                  <form onSubmit={handleSaveStats} className="space-y-4">
                    <div>
                      <label className="text-xs text-zinc-400 uppercase font-bold">Территории (Зоны)</label>
                      <input 
                        type="number" 
                        value={editStats.territories} 
                        onChange={e => setEditStats({...editStats, territories: parseInt(e.target.value) || 0})} 
                        className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 mt-1" 
                      />
                    </div>
                    <button type="submit" className="w-full bg-white text-black font-black py-3 rounded-xl hover:bg-zinc-200">ОБНОВИТЬ ЦИФРЫ</button>
                  </form>
                  {adminStatsMessage && <p className="text-sm text-white mt-3 bg-white/10 p-2 rounded">{adminStatsMessage}</p>}
                </div>
              </div>

              {/* ЛОГИ (ЖУРНАЛ ДЕЙСТВИЙ) */}
              <div className="bg-zinc-900/40 rounded-2xl border border-white/10 p-6 shadow-xl">
                <h3 className="text-lg font-black text-white mb-4 uppercase tracking-wide flex items-center"><Icon name="List" className="w-5 h-5 mr-2" /> Журнал действий (Логи)</h3>
                <div className="bg-black/50 border border-white/5 rounded-xl p-4 h-64 overflow-y-auto space-y-3 font-mono text-sm">
                  {logs.length > 0 ? logs.map(log => (
                    <div key={log.id} className="border-b border-white/5 pb-2">
                      <div className="flex gap-2 text-zinc-500 text-[10px] mb-1">
                        <span>{log.dateStr}</span> <span>•</span> <span className="text-emerald-400">{log.adminName}</span>
                      </div>
                      <p className="text-zinc-300">{log.text}</p>
                    </div>
                  )) : <p className="text-zinc-600 text-center py-4">Логов пока нет</p>}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* НАСТРОЙКИ */}
        {/* ========================================================= */}
        {activeTab === 'settings' && currentUser.role !== 'guest' && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
            <h2 className="text-3xl font-black text-white mb-8 flex items-center tracking-tight"><Icon name="Settings" className="w-8 h-8 mr-3"/> НАСТРОЙКИ</h2>

            <div className="bg-zinc-900/40 rounded-2xl border border-white/10 p-8 mb-8">
              <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wide">Мини Биография</h3>
              <form onSubmit={handleUpdateBio} className="space-y-4">
                <textarea 
                  value={settingsBio} 
                  onChange={e => setSettingsBio(e.target.value)} 
                  className="w-full h-24 bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-white/40 resize-none" 
                  placeholder="Расскажите о себе..." 
                />
                {settingsBioMessage.text && <div className="p-3 bg-white/10 rounded-xl text-sm font-bold">{settingsBioMessage.text}</div>}
                <button type="submit" className="bg-white text-black font-black py-3 px-8 rounded-xl hover:bg-zinc-200">СОХРАНИТЬ БИОГРАФИЮ</button>
              </form>
            </div>

            <div className="bg-zinc-900/40 rounded-2xl border border-white/10 p-8">
              <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wide">Смена пароля</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <input 
                  type="password" 
                  value={settingsOldPass} 
                  onChange={e => setSettingsOldPass(e.target.value)} 
                  className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3" 
                  placeholder="Текущий пароль" 
                />
                <input 
                  type="password" 
                  value={settingsNewPass} 
                  onChange={e => setSettingsNewPass(e.target.value)} 
                  className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3" 
                  placeholder="Новый пароль" 
                />
                {settingsMessage.text && <div className="p-3 bg-white/10 rounded-xl text-sm font-bold">{settingsMessage.text}</div>}
                <button type="submit" className="bg-white text-black font-black py-3 px-8 rounded-xl hover:bg-zinc-200">ОБНОВИТЬ ПАРОЛЬ</button>
              </form>
            </div>
          </div>
        )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* МОДАЛЬНОЕ ОКНО ПРОФИЛЯ ИГРОКА */}
      {/* ========================================================= */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedProfile(null)}>
          <div className="bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            
            <div className="relative h-32 bg-gradient-to-r from-zinc-800 to-black border-b border-white/5 flex items-end p-6">
              <button 
                onClick={() => setSelectedProfile(null)} 
                className="absolute top-4 right-4 text-zinc-500 hover:text-white bg-black/50 rounded-full p-2"
              >
                <Icon name="X" className="w-5 h-5"/>
              </button>
              <div className="absolute -bottom-10 left-6">
                <div className="w-24 h-24 rounded-full bg-black border-4 border-zinc-900 flex items-center justify-center text-3xl font-black text-white shadow-xl">
                  {selectedProfile.inGameName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            <div className="pt-14 px-8 pb-8 overflow-y-auto flex-1">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-black text-white flex items-center">
                    {selectedProfile.inGameName}
                    {selectedProfile.role === 'admin' && <Icon name="Shield" className="w-5 h-5 text-white ml-3" title="Администратор"/>}
                  </h2>
                  <p className="text-zinc-500 text-sm mt-1 flex items-center gap-3">
                    <span className="bg-white/10 px-2 py-0.5 rounded text-white font-bold">{selectedProfile.rank}</span>
                    <span className="font-mono">ID: {selectedProfile.numericId}</span>
                  </p>
                </div>
                
                {currentUser.role === 'admin' && (
                  <div className="flex items-center space-x-2 bg-black/30 p-2 rounded-xl border border-white/5">
                    <div className="text-center px-3 border-r border-white/10">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">Выговоры</p>
                      <p className="font-black text-red-400">{selectedProfile.warnings || 0}</p>
                    </div>
                    <button 
                      onClick={() => handleUpdateWarnings(selectedProfile.dbId, (selectedProfile.warnings || 0) + 1)} 
                      className="p-2 bg-white/5 hover:bg-white/20 rounded-lg"
                    >
                      <Icon name="Plus" className="w-4 h-4 text-white"/>
                    </button>
                    <button 
                      onClick={() => handleUpdateWarnings(selectedProfile.dbId, (selectedProfile.warnings || 0) - 1)} 
                      className="p-2 bg-white/5 hover:bg-white/20 rounded-lg"
                    >
                      <Icon name="Minus" className="w-4 h-4 text-white"/>
                    </button>
                  </div>
                )}
              </div>

              {selectedProfile.bio && (
                <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/5 italic text-sm text-zinc-300 border-l-4 border-l-white">
                  "{selectedProfile.bio}"
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Ачивки */}
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center"><Icon name="Award" className="w-4 h-4 mr-2 text-yellow-500"/> Достижения</h3>
                  <div className="space-y-3">
                    {(selectedProfile.achievements || []).length > 0 ? (selectedProfile.achievements || []).map(ach => (
                      <div key={ach.id} className="flex items-center p-3 bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-xl">
                        <Icon name={ach.icon || 'Star'} className="w-5 h-5 text-yellow-500 mr-3"/>
                        <div><p className="text-sm font-bold text-white">{ach.title}</p><p className="text-[10px] text-zinc-500">{ach.dateStr}</p></div>
                      </div>
                    )) : <p className="text-xs text-zinc-600">Нет достижений</p>}
                  </div>

                  {currentUser.role === 'admin' && (
                    <form onSubmit={handleAddAchievement} className="mt-4 flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Название медали" 
                        value={newAchievement.title} 
                        onChange={e=>setNewAchievement({...newAchievement, title: e.target.value})} 
                        className="flex-1 bg-black/50 border border-white/10 text-white text-sm rounded-lg px-3 py-2" 
                      />
                      <button type="submit" className="bg-yellow-500 text-black font-bold px-3 py-2 rounded-lg text-sm hover:bg-yellow-400">Выдать</button>
                    </form>
                  )}
                </div>

                {/* Штрафы */}
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center"><Icon name="DollarSign" className="w-4 h-4 mr-2 text-red-500"/> Финансы / Штрафы</h3>
                  
                  <div className="mb-4 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex justify-between items-center">
                    <span className="text-xs font-bold text-red-400 uppercase">Активный долг:</span>
                    <span className="font-black text-red-400 text-lg">{unpaidFinesTotal}$</span>
                  </div>

                  <div className="space-y-2 max-h-[150px] overflow-auto pr-2">
                    {profileFines.length > 0 ? profileFines.map(f => (
                       <div key={f.id} className={`p-3 rounded-xl border text-sm flex justify-between items-center ${f.status === 'paid' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                         <div>
                           <p className={`font-bold ${f.status === 'paid' ? 'text-emerald-400' : 'text-red-400'}`}>{f.amount}$ <span className="text-zinc-500 font-normal ml-2">{f.reason}</span></p>
                           <p className="text-[10px] text-zinc-600 mt-1">{f.dateStr}</p>
                         </div>
                         {f.status === 'unpaid' && currentUser.role === 'admin' && (
                           <button onClick={() => handlePayFine(f.id)} className="text-xs bg-emerald-500 text-black font-bold px-2 py-1 rounded hover:bg-emerald-400">Погасить</button>
                         )}
                         {f.status === 'paid' && <Icon name="CheckCircle" className="w-4 h-4 text-emerald-500" />}
                       </div>
                    )) : <p className="text-xs text-zinc-600">Штрафов нет</p>}
                  </div>

                  {currentUser.role === 'admin' && (
                    <form onSubmit={handleIssueFine} className="mt-4 flex flex-col gap-2 bg-black/30 p-3 rounded-xl border border-white/5">
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          placeholder="Сумма" 
                          value={newFine.amount} 
                          onChange={e=>setNewFine({...newFine, amount: e.target.value})} 
                          className="w-24 bg-black/50 border border-white/10 text-white text-sm rounded-lg px-3 py-2" 
                        />
                        <input 
                          type="text" 
                          placeholder="Причина (п. 1 устава)" 
                          value={newFine.reason} 
                          onChange={e=>setNewFine({...newFine, reason: e.target.value})} 
                          className="flex-1 bg-black/50 border border-white/10 text-white text-sm rounded-lg px-3 py-2" 
                        />
                      </div>
                      <button type="submit" className="w-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold px-3 py-2 rounded-lg text-sm hover:bg-red-500 hover:text-white transition-colors">Выписать штраф</button>
                    </form>
                  )}
                </div>
              </div>

              {modalMessage && <div className="mt-4 p-3 bg-white/10 text-white font-bold text-center rounded-xl text-sm">{modalMessage}</div>}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}