import { Directory, File, Paths } from 'expo-file-system';
export async function keepPhoto(uri: string, _base64: string, id: string) {
  const folder = new Directory(Paths.document, 'quest-proof');
  folder.create({ idempotent: true, intermediates: true });
  const file = new File(folder, id + '.jpg');
  if (!file.exists) new File(uri).copy(file);
  return file.uri;
}
