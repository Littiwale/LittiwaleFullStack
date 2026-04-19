import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  const env = fs.readFileSync(filePath, 'utf8');
  env.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
};

loadEnvFile(path.resolve(__dirname, '..', '.env'));
loadEnvFile(path.resolve(__dirname, '..', '.env.local'));

const serviceAccountPath = path.resolve(__dirname, '..', 'service-account.json');

const loadServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (err) {
      console.error('FIREBASE_SERVICE_ACCOUNT is not valid JSON.');
      process.exit(1);
    }
  }

  const googleCredPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (googleCredPath && fs.existsSync(googleCredPath)) {
    return JSON.parse(fs.readFileSync(googleCredPath, 'utf8'));
  }

  if (fs.existsSync(serviceAccountPath)) {
    return JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  }

  return null;
};

const serviceAccount = loadServiceAccount();

const normalizeBucketName = (bucketName) => {
  if (!bucketName) return bucketName;
  let normalized = bucketName.trim();
  if ((normalized.startsWith('"') && normalized.endsWith('"')) || (normalized.startsWith("'") && normalized.endsWith("'"))) {
    normalized = normalized.slice(1, -1);
  }
  return normalized;
};

const envBucket = normalizeBucketName(process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET);
const projectId = serviceAccount?.project_id || process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
const fallbackBucket = projectId ? `${projectId}.appspot.com` : null;

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  if (!projectId) {
    console.error('Missing Firebase service account or FIREBASE_PROJECT_ID. Provide a service account JSON or set FIREBASE_PROJECT_ID.');
    process.exit(1);
  }
  admin.initializeApp();
}

const db = admin.firestore();
let bucket = admin.storage().bucket(envBucket || fallbackBucket);

const normalizeErrorMessage = (err) => {
  if (!err || !err.message) return String(err);
  return err.message;
};

const tryCreateBucket = async (bucketName) => {
  const candidate = admin.storage().bucket(bucketName);
  try {
    console.log(`Attempting to create bucket ${bucketName}...`);
    await candidate.create({ location: 'US' });
    console.log(`Created storage bucket ${bucketName}.`);
    bucket = admin.storage().bucket(bucketName);
    return true;
  } catch (err) {
    const msg = normalizeErrorMessage(err);
    if (err.code === 403 && /billing account/i.test(msg)) {
      throw new Error(`Unable to create storage bucket ${bucketName}: ${msg}. Enable billing for the Firebase project and retry.`);
    }
    console.warn(`Could not create bucket ${bucketName}: ${msg}`);
    return false;
  }
};

const ensureBucket = async () => {
  try {
    const [exists] = await bucket.exists();
    if (exists) return;
  } catch (err) {
    const msg = normalizeErrorMessage(err);
    if (err.code === 403 && /billing account/i.test(msg)) {
      throw new Error(`Unable to access storage bucket ${bucket.name}: ${msg}. Enable billing for the Firebase project and retry.`);
    }
    throw err;
  }

  console.warn(`Storage bucket ${bucket.name} does not exist, trying fallback bucket ${fallbackBucket}.`);
  bucket = admin.storage().bucket(fallbackBucket);

  try {
    const [fallbackExists] = await bucket.exists();
    if (fallbackExists) return;
  } catch (err) {
    const msg = normalizeErrorMessage(err);
    if (err.code === 403 && /billing account/i.test(msg)) {
      throw new Error(`Unable to access fallback storage bucket ${bucket.name}: ${msg}. Enable billing for the Firebase project and retry.`);
    }
    throw err;
  }

  const triedBuckets = [envBucket, fallbackBucket].filter(Boolean);
  for (const bucketName of triedBuckets) {
    if (await tryCreateBucket(bucketName)) return;
  }

  throw new Error(`Neither storage bucket ${envBucket || '<unset>'} nor fallback ${fallbackBucket} exists. Make sure Firebase Storage is enabled for project ${serviceAccount.project_id} and the bucket name is correct in .env.`);
};

const legacyFolder = path.resolve(__dirname, '..', '__DO_NOT_TOUCH_LEGACY_ARCHIVE__', 'images', 'announcements');
if (!fs.existsSync(legacyFolder)) {
  console.error('Legacy announcements folder not found:', legacyFolder);
  process.exit(1);
}

const files = fs.readdirSync(legacyFolder).filter((file) => /\.(png|jpe?g|webp|gif)$/i.test(file));
if (!files.length) {
  console.error('No announcement images found in legacy folder.');
  process.exit(1);
}

const sanitizeDocId = (name) => name.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();

const publicUrlFor = (bucketName, destination) => {
  return `https://storage.googleapis.com/${bucketName}/${encodeURIComponent(destination)}`;
};

const main = async () => {
  await ensureBucket();
  console.log(`Found ${files.length} legacy announcement image(s).`);
  for (const filename of files) {
    const filePath = path.join(legacyFolder, filename);
    const nameWithoutExt = path.basename(filename, path.extname(filename));
    const announcementId = `legacy-${sanitizeDocId(nameWithoutExt)}`;
    const storagePath = `announcements/${Date.now()}_${filename}`;
    const docRef = db.doc(`announcements/${announcementId}`);
    const existing = await docRef.get();
    if (existing.exists) {
      console.log(`Skipping already imported announcement: ${announcementId}`);
      continue;
    }

    console.log(`Uploading ${filename} to ${storagePath}...`);
    await bucket.upload(filePath, {
      destination: storagePath,
      metadata: {
        contentType: `image/${path.extname(filename).slice(1)}`,
      },
    });

    const file = bucket.file(storagePath);
    try {
      await file.makePublic();
      console.log(`Made ${storagePath} public.`);
    } catch (err) {
      console.warn(`Could not make file public, will use signed URL: ${err.message}`);
    }

    const imageUrl = publicUrlFor(bucket.name, storagePath);
    const title = nameWithoutExt.replace(/[-_]/g, ' ').replace(/\b(current|offer)\b/gi, (match) => match.toUpperCase());
    await docRef.set({
      title: title || 'Announcement',
      imageUrl,
      storagePath,
      expiresAt: null,
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Created announcement document: ${announcementId}`);
  }
  console.log('Legacy announcement import complete.');
};

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});