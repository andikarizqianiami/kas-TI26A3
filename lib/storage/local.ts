import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

export async function saveFile(
  file: File,
  directory: string = 'payment-proofs'
): Promise<string> {
  try {
    // Ensure upload directory exists
    const targetDir = join(UPLOAD_DIR, directory)
    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}-${randomString}.${extension}`
    const filepath = join(targetDir, filename)

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save file
    await writeFile(filepath, buffer)

    // Return public URL path
    return `/uploads/${directory}/${filename}`
  } catch (error) {
    console.error('Error saving file:', error)
    throw new Error('Failed to save file')
  }
}

export async function saveBase64Image(
  base64: string,
  directory: string = 'qris'
): Promise<string> {
  try {
    // Ensure upload directory exists
    const targetDir = join(UPLOAD_DIR, directory)
    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const filename = `${timestamp}-${randomString}.png`
    const filepath = join(targetDir, filename)

    // Remove base64 prefix if exists
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Save file
    await writeFile(filepath, buffer)

    // Return public URL path
    return `/uploads/${directory}/${filename}`
  } catch (error) {
    console.error('Error saving base64 image:', error)
    throw new Error('Failed to save image')
  }
}

export function validateImageFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('File harus berupa gambar (JPG, PNG, atau WebP)')
  }

  if (file.size > maxSize) {
    throw new Error('Ukuran file maksimal 5MB')
  }

  return true
}
