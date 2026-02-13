import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import styles from './schools.module.css'

export default async function AdminSchoolsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'acsi_admin') {
    redirect('/login')
  }

  const supabase = await createClient()

  const { data: schools } = await supabase
    .from('schools')
    .select('*, school_members(count)')
    .order('name')

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Schools</h1>
          <p>Manage all schools in the platform</p>
        </div>
        <Link href="/admin/schools/new" className={styles.addButton}>
          + Add School
        </Link>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>School Name</th>
              <th>Location</th>
              <th>Students</th>
              <th>Mentors</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools?.map((school: any) => (
              <tr key={school.id}>
                <td className={styles.nameCell}>{school.name}</td>
                <td>{school.town}, {school.county}</td>
                <td>{school.student_count || '-'}</td>
                <td>{school.school_members?.[0]?.count || 0}</td>
                <td>
                  <div className={styles.actions}>
                    <Link
                      href={`/schools/${school.id}`}
                      className={styles.actionLink}
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/schools/${school.id}/edit`}
                      className={styles.actionLink}
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
