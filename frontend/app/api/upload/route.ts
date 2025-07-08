import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'uploads'
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const fileName = `${folder}/${timestamp}-${file.name}`
    
    // Upload to Vercel Blob (if configured)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(fileName, file, {
        access: 'public',
      })
      
      return NextResponse.json({ url: blob.url })
    } else {
      // For development, return a mock URL
      const mockUrl = `/uploads/${fileName}`
      return NextResponse.json({ url: mockUrl })
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
