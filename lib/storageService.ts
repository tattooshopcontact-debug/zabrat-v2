import { supabase } from './supabase';
import { Platform } from 'react-native';

// Upload une photo de profil vers Supabase Storage
export async function uploadAvatar(userId: string, uri: string): Promise<string | null> {
  try {
    const fileName = `avatars/${userId}_${Date.now()}.jpg`;

    if (Platform.OS === 'web') {
      // Web: fetch le blob depuis l'URI
      const response = await fetch(uri);
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });

      if (error) throw error;
    } else {
      // Mobile: utiliser FormData
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: fileName,
        type: 'image/jpeg',
      } as any);

      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, formData, { contentType: 'multipart/form-data', upsert: true });

      if (error) throw error;
    }

    // Récupérer l'URL publique
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);

    // Mettre à jour le profil
    await supabase.from('users').update({ avatar_url: data.publicUrl }).eq('id', userId);

    return data.publicUrl;
  } catch (err) {
    console.error('Avatar upload failed:', err);
    return null;
  }
}
