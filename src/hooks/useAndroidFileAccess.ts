import { useState, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Permissions from 'expo-permissions';

interface FileAccessResult {
  success: boolean;
  data?: string;
  error?: string;
}

export function useAndroidFileAccess() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Запитуємо дозвіл на доступ до файлів
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Permissions.askAsync(
        Permissions.MEDIA_LIBRARY,
        Permissions.DOCUMENTS
      );
      return status === 'granted';
    } catch (err) {
      setError(`Помилка запиту дозволу: ${err}`);
      return false;
    }
  }, []);

  // Читаємо файл з дозвіленого місця
  const readFileFromDocuments = useCallback(
    async (fileName: string): Promise<FileAccessResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const docDir = FileSystem.documentDirectory;
        if (!docDir) throw new Error('Document directory unavailable');

        const filePath = `${docDir}${fileName}`;
        const content = await FileSystem.readAsStringAsync(filePath);

        return { success: true, data: content };
      } catch (err) {
        const message = `Помилка читання файлу: ${err instanceof Error ? err.message : String(err)}`;
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Пишемо файл в приватну папку документів
  const writeFileToDocuments = useCallback(
    async (fileName: string, content: string): Promise<FileAccessResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const docDir = FileSystem.documentDirectory;
        if (!docDir) throw new Error('Document directory unavailable');

        const filePath = `${docDir}${fileName}`;
        await FileSystem.writeAsStringAsync(filePath, content);

        return { success: true, data: filePath };
      } catch (err) {
        const message = `Помилка запису файлу: ${err instanceof Error ? err.message : String(err)}`;
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Вибираємо файл через документ пікер
  const pickFile = useCallback(
    async (): Promise<FileAccessResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['text/*', 'application/json', '*/*'],
          copyToCacheDirectory: true,
        });

        if (result.canceled) {
          return { success: false, error: 'Файл не вибран' };
        }

        const file = result.assets[0];
        const content = await FileSystem.readAsStringAsync(file.uri);

        return {
          success: true,
          data: content,
        };
      } catch (err) {
        const message = `Помилка вибору файлу: ${err instanceof Error ? err.message : String(err)}`;
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Отримуємо список файлів з папки
  const listFiles = useCallback(
    async (dirPath?: string): Promise<FileAccessResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const path = dirPath || FileSystem.documentDirectory;
        if (!path) throw new Error('Directory unavailable');

        const files = await FileSystem.readDirectoryAsync(path);

        return {
          success: true,
          data: JSON.stringify(files, null, 2),
        };
      } catch (err) {
        const message = `Помилка читання папки: ${err instanceof Error ? err.message : String(err)}`;
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Видаляємо файл
  const deleteFile = useCallback(
    async (fileName: string): Promise<FileAccessResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const docDir = FileSystem.documentDirectory;
        if (!docDir) throw new Error('Document directory unavailable');

        const filePath = `${docDir}${fileName}`;
        await FileSystem.deleteAsync(filePath);

        return { success: true, data: `Файл видалено: ${fileName}` };
      } catch (err) {
        const message = `Помилка видалення файлу: ${err instanceof Error ? err.message : String(err)}`;
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Копіюємо файл з одного місця в інше
  const copyFile = useCallback(
    async (sourceUri: string, fileName: string): Promise<FileAccessResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const docDir = FileSystem.documentDirectory;
        if (!docDir) throw new Error('Document directory unavailable');

        const destPath = `${docDir}${fileName}`;
        await FileSystem.copyAsync({
          from: sourceUri,
          to: destPath,
        });

        return { success: true, data: destPath };
      } catch (err) {
        const message = `Помилка копіювання файлу: ${err instanceof Error ? err.message : String(err)}`;
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    error,
    requestPermissions,
    readFileFromDocuments,
    writeFileToDocuments,
    pickFile,
    listFiles,
    deleteFile,
    copyFile,
    documentDirectory: FileSystem.documentDirectory,
    cacheDirectory: FileSystem.cacheDirectory,
  };
}
