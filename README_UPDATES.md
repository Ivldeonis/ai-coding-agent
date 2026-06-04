# DevAgent AI - Оновлена версія

## 🎉 Що нового?

### 1. **Російська мова в інтерфейсі** 🇷🇺
Весь UI тепер мовою-приносимо на російській мові за допомогою:
- Файл `src/i18n/ru.ts` - всі переклади
- Hook `useLanguage()` - доступ до перекладів

**Використання:**
```typescript
import { useLanguage } from './hooks/useLanguage';

export function MyComponent() {
  const { t } = useLanguage();
  
  return <button>{t.settings.addProvider}</button>;
}
```

### 2. **Динамічна загрузка моделей** 🤖
Тепер ти можеш завантажити доступні моделі з API провайдера замість жорсткодованого списку!

**Як це працює:**
1. Введи API ключ провайдера (OpenAI, OpenRouter, Gemini, локальний)
2. Натисни кнопку "Загрузити модели"
3. Виберіть із завантажених моделей

Підтримуються:
- ✅ OpenAI (GPT-4, GPT-4o)
- ✅ OpenRouter (Claude, Gemini, GPT)
- ✅ Google Gemini
- ✅ Ollama (локально)

### 3. **Файлові операції для Android** 📁
Додано `useAndroidFileAccess` hook для безпечної роботи з файлами на Android:
```typescript
import { useAndroidFileAccess } from './hooks/useAndroidFileAccess';

const {
  readFileFromDocuments,
  writeFileToDocuments,
  pickFile,
  listFiles,
  deleteFile,
  documentDirectory
} = useAndroidFileAccess();
```

**Методи:**
- `readFileFromDocuments(fileName)` - читання файлу
- `writeFileToDocuments(fileName, content)` - запис файлу
- `pickFile()` - вибір файлу з пристрою
- `listFiles()` - список файлів у документах
- `deleteFile(fileName)` - видалення файлу
- `copyFile(sourceUri, fileName)` - копіювання

## 🚀 Експорт як APK

### Спосіб 1: EAS Build (РЕКОМЕНДУЄТЬСЯ)
```bash
# Встанови EAS CLI
npm install -g eas-cli

# Авторизуйся
eas login

# Білдимо на серверах Expo
eas build --platform android

# Або локально на Termux:
eas build --platform android --local
```

### Спосіб 2: Локальний білд на Termux
```bash
# Встанови Gradle (якщо ще не встановлено)
cd android
./gradlew clean

# Білдимо APK
./gradlew assembleRelease

# APK буде у:
# app/build/outputs/apk/release/app-release.apk
```

### Проблеми і розв'язання

**Помилка: Недостатньо памяті на Termux**
```bash
echo "org.gradle.jvmargs=-Xmx512m" >> android/gradle.properties
```

**Помилка: JAVA_HOME не встановлено**
```bash
export JAVA_HOME=/data/data/com.termux/files/usr/opt/openjdk
```

**Помилка: Немає доступу до файлів на Android 11+**
Це вже вирішено! Додай мандати в `app.json` (вони вже там).

Для runtime дозволи:
```typescript
import { requestPermissions } from './hooks/useAndroidFileAccess';
await requestPermissions();
```

## 📋 Структура проекту

```
src/
├── i18n/
│   └── ru.ts              # Російські переклади
├── hooks/
│   ├── useLanguage.ts     # Мова
│   └── useAndroidFileAccess.ts  # Файлові операції
├── components/
│   └── SettingsPanel.tsx  # Оновлена з динамічними моделями
├── App.tsx
└── store.ts

app.json                    # Налаштування для Expo/APK
ANDROID_APK_GUIDE.md       # Детальна інструкція
```

## 🛠️ Встановлення залежностей

```bash
# Встанови залежності
npm install

# Для робі роботи з файлами:
npm install expo-file-system expo-document-picker expo-permissions
```

## 📱 Тестування на пристрої

### Через Expo Go
```bash
npm start
# Просканируй QR код в Expo Go додатку
```

### Через APK на пристрої
```bash
adb install -r app/build/outputs/apk/release/app-release.apk
```

## 🔧 Важливо для подальшого розвитку

### Додай більше мов
Створи файл `src/i18n/en.ts` і додай в `useLanguage`:
```typescript
const translations = {
  'ru': ru,
  'en': en, // <- додай тут
};
```

### Додай новий провайдер моделей
В `SettingsPanel.tsx` в методі `loadModels()` додай новий case:
```typescript
case 'myProvider':
  url = `${provider.baseUrl}/v1/models`;
  headers = { 'Authorization': `Bearer ${provider.apiKey}` };
  models = data.models.map(...);
  break;
```

### Синхронізація файлів з хмарою
Використай `writeFileToDocuments()` та `readFileFromDocuments()` з AsyncStorage для збереження налаштувань:
```typescript
const settings = await readFileFromDocuments('settings.json');
await writeFileToDocuments('settings.json', JSON.stringify(newSettings));
```

## 📚 Додатково

- `ANDROID_APK_GUIDE.md` - детальна інструкція по экспорту APK
- `src/examples/FileAccessExample.tsx` - приклад компоненту з файловими операціями

## 🐛 Дебаг на Termux

```bash
# Переконайся, що встановлено JDK
java -version

# Перевір Gradle
cd android
./gradlew --version

# Дивись логи
./gradlew assembleRelease --debug

# Очисти кеш
rm -rf ~/.gradle
rm -rf android/.gradle
cd android && ./gradlew clean
```

## ⚡ Швидкий старт

1. **Заповни API ключ** в Settings → AI Providers
2. **Натисни "Загрузити модели"** щоб завантажити доступні модели
3. **Виберіть модель** з завантажених
4. **Почни писати** запити в чат!

Успіхів! 🚀
