import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/db'

// GET - Get all settings
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await prisma.systemSetting.findMany()

    // Convert to key-value object
    const settingsObj: Record<string, any> = {}
    settings.forEach(setting => {
      try {
        settingsObj[setting.key] = JSON.parse(setting.value)
      } catch {
        settingsObj[setting.key] = setting.value
      }
    })

    return NextResponse.json({ settings: settingsObj })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Update settings (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can update settings.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { key, value } = body

    if (!key) {
      return NextResponse.json(
        { error: 'Key is required' },
        { status: 400 }
      )
    }

    // Upsert setting
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value: typeof value === 'string' ? value : JSON.stringify(value)
      },
      create: {
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value)
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_SETTING',
        entity: 'SystemSetting',
        entityId: setting.id,
        metadata: JSON.stringify({ key, value })
      }
    })

    return NextResponse.json({
      message: 'Setting updated successfully',
      setting
    })
  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
