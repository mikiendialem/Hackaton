import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, currentPassword, newPassword } = body

    // Update name
    if (name) {
      const { error } = await supabaseAdmin
        .from('users')
        .update({ name })
        .eq('id', session.user.id)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    // Update password
    if (currentPassword && newPassword) {
      // Get current user
      const { data: user, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('password')
        .eq('id', session.user.id)
        .single()

      if (fetchError || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Verify current password
      const passwordMatch = await bcrypt.compare(currentPassword, user.password)
      if (!passwordMatch) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12)

      const { error } = await supabaseAdmin
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', session.user.id)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

  } catch (err) {
    console.error('Profile update error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}