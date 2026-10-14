import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✓ Supabase client initialized with remote instance:', supabaseUrl);
  } catch (error) {
    console.warn('⚠️ Failed to initialize Supabase client:', error);
  }
} else {
  console.log('ℹ️ Running in resilient local mode with JSON/SQLite persistence. (Set SUPABASE_URL in .env to connect to live Supabase)');
}

/**
 * Uploads a file buffer or returns local URL
 */
export async function uploadCertificateFile(
  fileName: string,
  buffer: Buffer,
  mimeType: string
): Promise<{ url: string; storageType: 'supabase' | 'local' }> {
  if (supabase) {
    try {
      const sanitizedName = `${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('certificates')
        .upload(sanitizedName, buffer, {
          contentType: mimeType,
          upsert: true
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('certificates')
          .getPublicUrl(sanitizedName);

        return {
          url: publicUrlData.publicUrl,
          storageType: 'supabase'
        };
      } else {
        console.warn('Supabase storage upload error, falling back to local storage:', error?.message);
      }
    } catch (e) {
      console.warn('Supabase storage exception, falling back to local storage:', e);
    }
  }

  // Local storage fallback handled in upload middleware
  return {
    url: `/uploads/certificates/${fileName}`,
    storageType: 'local'
  };
}
