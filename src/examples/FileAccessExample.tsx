import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, Alert } from 'react-native';
import { useAndroidFileAccess } from '../hooks/useAndroidFileAccess';

export function FileAccessExample() {
  const {
    isLoading,
    error,
    requestPermissions,
    readFileFromDocuments,
    writeFileToDocuments,
    pickFile,
    listFiles,
    deleteFile,
    documentDirectory,
  } = useAndroidFileAccess();

  const [files, setFiles] = useState<string[]>([]);
  const [selectedContent, setSelectedContent] = useState<string>('');

  // Запитуємо дозволи при завантаженні компоненту
  useEffect(() => {
    requestPermissions();
    loadFiles();
  }, []);

  const loadFiles = async () => {
    const result = await listFiles();
    if (result.success && result.data) {
      try {
        const fileList = JSON.parse(result.data);
        setFiles(fileList);
      } catch {
        Alert.alert('Помилка', 'Неможливо розпарсити список файлів');
      }
    }
  };

  const handleWriteFile = async () => {
    const result = await writeFileToDocuments(
      'test-file.txt',
      'Це тестовий файл, створений DevAgent\n' + new Date().toISOString()
    );

    if (result.success) {
      Alert.alert('Успіх', `Файл створено: ${result.data}`);
      loadFiles();
    } else {
      Alert.alert('Помилка', result.error);
    }
  };

  const handleReadFile = async (fileName: string) => {
    const result = await readFileFromDocuments(fileName);
    if (result.success) {
      setSelectedContent(result.data || '');
      Alert.alert('Зміст файлу', result.data || '');
    } else {
      Alert.alert('Помилка', result.error);
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    Alert.alert(
      'Видалити файл?',
      `Ви дійсно хочете видалити "${fileName}"?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteFile(fileName);
            if (result.success) {
              Alert.alert('Успіх', 'Файл видалено');
              loadFiles();
            } else {
              Alert.alert('Помилка', result.error);
            }
          },
        },
      ]
    );
  };

  const handlePickFile = async () => {
    const result = await pickFile();
    if (result.success) {
      setSelectedContent(result.data || '');
      Alert.alert('Файл завантажено', 'Файл успішно прочитаний');
    } else {
      Alert.alert('Помилка', result.error);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#181825' }}>
      <Text style={{ color: '#cdd6f4', fontSize: 18, marginBottom: 16, fontWeight: 'bold' }}>
        Файлові операції
      </Text>

      {error && (
        <View style={{ backgroundColor: '#f38ba8', padding: 12, marginBottom: 16, borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontSize: 12 }}>⚠️ {error}</Text>
        </View>
      )}

      <View style={{ marginBottom: 16 }}>
        <Button
          title="Створити тестовий файл"
          onPress={handleWriteFile}
          disabled={isLoading}
          color="#89b4fa"
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Button
          title="Вибрати файл з пристрою"
          onPress={handlePickFile}
          disabled={isLoading}
          color="#a6e3a1"
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#a6adc8', fontSize: 12, marginBottom: 8 }}>
          Папка документів: {documentDirectory}
        </Text>
      </View>

      <Text style={{ color: '#cdd6f4', fontSize: 14, marginBottom: 8, fontWeight: '600' }}>
        Файли в документах ({files.length}):
      </Text>

      {files.length === 0 ? (
        <Text style={{ color: '#6c7086', fontSize: 12 }}>Немає файлів</Text>
      ) : (
        files.map((file) => (
          <View
            key={file}
            style={{
              backgroundColor: '#1e1e2e',
              padding: 12,
              marginBottom: 8,
              borderRadius: 6,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text
              style={{ color: '#cdd6f4', fontSize: 12, flex: 1 }}
              onPress={() => handleReadFile(file)}
            >
              📄 {file}
            </Text>
            <Button
              title="Видалити"
              onPress={() => handleDeleteFile(file)}
              color="#f38ba8"
            />
          </View>
        ))
      )}

      {selectedContent && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ color: '#cdd6f4', fontSize: 12, marginBottom: 8, fontWeight: '600' }}>
            Зміст вибраного файлу:
          </Text>
          <View style={{ backgroundColor: '#11111b', padding: 12, borderRadius: 6 }}>
            <Text style={{ color: '#bac2de', fontSize: 11, fontFamily: 'monospace' }}>
              {selectedContent}
            </Text>
          </View>
        </View>
      )}

      {isLoading && (
        <Text style={{ color: '#89b4fa', fontSize: 12, marginTop: 16, textAlign: 'center' }}>
          Завантаження...
        </Text>
      )}
    </ScrollView>
  );
}
