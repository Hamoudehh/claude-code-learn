# דאשבורד ייצור — מכונות המפעל

דאשבורד לבעל העסק, שמודד את תפקוד שלוש מכונות הייצור: **כנול**, **רונדו** ו**קרומסטר**.
האפיון המלא נמצא ב־[spec.md](spec.md).

לכל מכונה נמדדים: זמן עבודה, מספר עובדים, שם המוצר המיוצר, כמות מיוצרת ופחת ייצור בק"ג.

## דרישה מוקדמת

יש להתקין **Node.js 20 ומעלה** (כולל npm): https://nodejs.org — מומלץ גרסת LTS.
לאחר ההתקנה צריך לפתוח חלון טרמינל חדש כדי ש־`node` ו־`npm` יזוהו.

בדיקה שההתקנה הצליחה:

```bash
node -v
```

## הפעלה

כל הפקודות מורצות מתוך תיקיית הפרויקט (`repo-1`).

התקנת החבילות — תחילה בשורש הפרויקט:

```bash
npm install
```

ואחר כך של השרת והלקוח:

```bash
npm run install:all
```

טעינת נתוני דמו (30 ימים אחרונים, שלוש המכונות):

```bash
npm run seed
```

הרצת השרת והלקוח יחד:

```bash
npm run dev
```

- ממשק המשתמש: http://localhost:5173
- ה־API: http://localhost:4000/api/health

להרצה בנפרד: `npm run dev:server` ו־`npm run dev:client` בשני חלונות טרמינל.

## מבנה הפרויקט

```
/
├── spec.md                 # מסמך האפיון
├── package.json            # סקריפטים להרצת השרת והלקוח יחד
├── client/                 # React + TypeScript + Vite + Tailwind + Recharts
│   └── src/
│       ├── components/     # MachineCard, KpiTile, RangeSwitch, StatusDot, NavBar
│       ├── pages/          # Dashboard, UpdateMachine, Compare
│       ├── hooks/          # useDashboard
│       ├── lib/            # api, types, format
│       └── styles/         # index.css — פלטת הצבעים ומחלקות הכפתורים
└── server/                 # Node.js + Express + SQLite
    ├── src/
    │   ├── routes/         # machines, dashboard, logs
    │   ├── db/             # חיבור למסד הנתונים + schema.sql
    │   └── lib/            # חישובים נגזרים ועזרי תאריכים
    ├── seed.js             # נתוני דמו
    └── factory.db          # נוצר אוטומטית בהרצה ראשונה (לא נשמר ב-git)
```

## מסכים

| מסך | נתיב | תוכן |
|------|-------|-------|
| סקירה | `/` | ארבעה מדדי־על, שלושה כרטיסי מכונה, בורר טווח זמן |
| עדכון נתונים | `/update/:machineId` | טופס הזנה לרשומת ייצור חדשה |
| השוואה | `/compare` | גרפי כמות ופחת לפי מכונה, גרף תפוקה לאורך זמן, טבלת השוואה |

## API

| Method | Endpoint | תיאור |
|--------|----------|--------|
| GET | `/api/health` | בדיקת חיים |
| GET | `/api/machines` | רשימת המכונות |
| GET | `/api/dashboard?range=today\|week\|month` | נתוני הדאשבורד המסוכמים |
| GET | `/api/logs?machineId=&from=&to=` | רשומות ייצור |
| POST | `/api/logs` | הוספת רשומת ייצור |
| PUT | `/api/logs/:id` | עדכון רשומה |

## הערות

- הנתונים מוזנים ידנית. אין חיבור לבקרי המכונות (PLC/IoT) — ראו "מחוץ לתחום" ב־[spec.md](spec.md).
- הדאשבורד מתרענן אוטומטית כל 60 שניות.
- ניצולת הזמן מחושבת מול משמרת של 480 דקות. לשינוי: משתנה הסביבה `SHIFT_MINUTES` בשרת.
- אין משקל ליחידת מוצר, ולכן הפחת מוצג גם כק"ג לכל 100 יחידות מיוצרות.
