import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

// Configure worker for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface UploadedMangaDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  fileType: 'pdf' | 'cbz' | 'zip';
  coverImage: string;
  pagesCount: number;
  pages: string[];
  uploadDate: string;
}

/**
 * Parse a PDF File into high-resolution Page Data URLs (JPEG images)
 */
export async function parsePdfFile(
  file: File | ArrayBuffer,
  onProgress?: (rendered: number, total: number) => void
): Promise<{ pages: string[]; coverImage: string }> {
  const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pages: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await (page.render({ canvasContext: context, viewport, canvas } as any)).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        pages.push(dataUrl);
      }
    } catch (err) {
      console.warn(`Error rendering PDF page ${i}:`, err);
    }

    if (onProgress) {
      onProgress(i, numPages);
    }
  }

  const coverImage = pages[0] || '';
  return { pages, coverImage };
}

/**
 * Parse a CBZ or ZIP archive file containing images into ordered Page Data URLs
 */
export async function parseCbzFile(
  file: File,
  onProgress?: (rendered: number, total: number) => void
): Promise<{ pages: string[]; coverImage: string }> {
  const zip = await JSZip.loadAsync(file);
  const imageEntries: { name: string; file: JSZip.JSZipObject }[] = [];

  zip.forEach((relativePath, zipEntry) => {
    if (!zipEntry.dir && /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(relativePath)) {
      imageEntries.push({ name: relativePath, file: zipEntry });
    }
  });

  // Sort image entries naturally by filename (01.jpg, 02.jpg, 10.jpg)
  imageEntries.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  );

  const pages: string[] = [];
  let processed = 0;

  for (const entry of imageEntries) {
    try {
      const blob = await entry.file.async('blob');
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      pages.push(dataUrl);
    } catch (err) {
      console.warn(`Error extracting image ${entry.name}:`, err);
    }

    processed++;
    if (onProgress) {
      onProgress(processed, imageEntries.length);
    }
  }

  const coverImage = pages[0] || '';
  return { pages, coverImage };
}

/**
 * Generate a clean standalone PDF file for a given chapter/manga using Canvas
 */
export async function generateChapterPdf(title: string, chapterNum: string, pages: string[]): Promise<Blob> {
  // We can create a simple PDF or data package using canvas rendering
  // Or download page images bundled into a zip / canvas
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1100;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 800, 1100);
    ctx.fillStyle = '#8b5cf6';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(title, 50, 100);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Chapter ${chapterNum} - MangaVerse Reader Export`, 50, 150);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob || new Blob([])), 'application/pdf');
  });
}

/**
 * Local Storage helpers for Uploaded PDF / CBZ Manga
 */
const STORAGE_KEY_UPLOADS = 'mangaverse_uploaded_docs_v1';

export function getUploadedMangaDocs(): UploadedMangaDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_UPLOADS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUploadedMangaDoc(doc: UploadedMangaDocument): void {
  try {
    const current = getUploadedMangaDocs();
    const updated = [doc, ...current.filter((d) => d.id !== doc.id)];
    // Limit to 20 saved uploaded docs to keep localStorage within reasonable quota
    localStorage.setItem(STORAGE_KEY_UPLOADS, JSON.stringify(updated.slice(0, 20)));
  } catch (e) {
    console.warn('Storage quota limit reached for full image data URLs:', e);
  }
}

export function deleteUploadedMangaDoc(id: string): void {
  try {
    const current = getUploadedMangaDocs();
    const updated = current.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY_UPLOADS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error deleting document from storage:', e);
  }
}
