# Експорт React Native/Expo як APK та вирішення доступу до файлів

## 1. Встановлення EAS Build (рекомендується)

### Для Expo:
```bash
npm install -g eas-cli
eas login
eas build --platform android
```

## 2. Якщо ти робиш це як React Native в Termux

### Встанови інструменти:
```bash
pkg install -y android-sdk
pkg install -y android-ndk
```

### Інсталюй Gradle:
```bash
npm install -g react-native-cli
cd your-project
npm install
```

## 3. Мандати для доступу до файлів

Додай це в `app.json` (для Expo):

```json
{
  "expo": {
    "plugins": [
      [
        "expo-file-system",
        {
          "photosPermission": "Дозвіл на доступ до фото",
          "documentsPermission": "Дозвіл на доступ до документів"
        }
      ]
    ],
    "android": {
      "permissions": [
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.MANAGE_EXTERNAL_STORAGE",
        "android.permission.READ_MEDIA_IMAGES",
        "android.permission.READ_MEDIA_VIDEO",
        "android.permission.READ_MEDIA_AUDIO",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION"
      ],
      "compileSdkVersion": 34
    }
  }
}
```

Для **Android 13+** потрібен **READ_MEDIA_\***:
```json
"android.permission.READ_MEDIA_IMAGES",
"android.permission.READ_MEDIA_VIDEO",
"android.permission.READ_MEDIA_AUDIO"
```

Для **Android 12+** потрібно запитувати дозвіл на runtime:

```typescript
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export async function requestStoragePermission() {
  const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
  return result === RESULTS.GRANTED;
}
```

## 4. Важливо для Termux/мобільного девелопменту

### Проблеми на Termux:
- JAVA_HOME потрібно встановити:
```bash
export JAVA_HOME=$(which java | xargs dirname | xargs dirname)
# Або явно:
export JAVA_HOME=/data/data/com.termux/files/usr/opt/openjdk
```

- Gradle cache може заповнитися:
```bash
cd android
./gradlew clean
cd ..
```

## 5. Білд APK крок за кроком

### Для Expo (найпростіше):
```bash
# Встанови EAS CLI
npm install -g eas-cli
eas login

# Білдимо (виконується на Expo серверах)
eas build --platform android --local

# Скачуємо APK
# (файл буде у `./build/`)
```

### Для React Native (ручний білд):
```bash
# Переходимо в android папку
cd android

# Робимо clean
./gradlew clean

# Білдимо release APK
./gradlew assembleRelease

# APK буде у:
# app/build/outputs/apk/release/app-release.apk
```

## 6. Якщо білд падає на Termux

### Проблема: Недостатньо памяті
```bash
# Обмежимо Gradle память
echo "org.gradle.jvmargs=-Xmx512m" >> android/gradle.properties
```

### Проблема: Версія Gradle
```bash
# Перевіримо версію
cd android
./gradlew --version

# Якщо занадто стара, оновимо
./gradlew wrapper --gradle-version=8.0
```

### Проблема: SDK версія
```bash
# Перевіримо SDK
sdkmanager --list_installed

# Встановимо потрібну версію (API 34+)
sdkmanager "build-tools;34.0.0" "platforms;android-34"
```

## 7. Тестування APK на девайсі

```bash
# Встанови APK на пристрій через adb
adb install -r app/build/outputs/apk/release/app-release.apk

# Або якщо немає adb в Termux:
# Скачай APK і встанови вручну через файловий менеджер
```

## 8.Debooging файлових операцій

Додай це в код для логування доступу:

```typescript
import * as FileSystem from 'expo-file-system';

export async function testFileAccess() {
  try {
    const dir = FileSystem.documentDirectory;
    const files = await FileSystem.readDirectoryAsync(dir);
    console.log('Доступні файли:', files);
  } catch (error) {
    console.error('Помилка доступу до файлів:', error);
  }
}
```

## Стан файлів на Termux/Android

На Android файли можуть бути у:
- `FileSystem.documentDirectory` - приватна папка app
- `FileSystem.cacheDirectory` - тимчасові файли
- `/storage/emulated/0` - публічне сховище (потрібні спеціальні дозволи)
- Scoped Storage (Android 11+) - потрібно мати URI доступ

## Рекомендуємі налаштування для Expo

```json
{
  "name": "DevAgent",
  "slug": "dev-agent",
  "version": "1.0.0",
  "assetBundlePatterns": ["**/*"],
  "android": {
    "compileSdkVersion": 34,
    "targetSdkVersion": 34,
    "minSdkVersion": 21,
    "package": "com.devagent.app",
    "permissions": [
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "MANAGE_EXTERNAL_STORAGE",
      "READ_MEDIA_IMAGES",
      "READ_MEDIA_VIDEO",
      "READ_MEDIA_AUDIO",
      "INTERNET",
      "ACCESS_NETWORK_STATE"
    ],
    "useNextNotificationChannelId": true,
    "softwareKeyboardLayoutMode": "pan"
  }
}
```

Це все пов'язано з SCOPED STORAGE на Android 11+, тому абсолютні шляхи на `/storage/emulated/0` часто не працюють 🎯
