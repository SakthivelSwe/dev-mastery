import { redirect } from 'next/navigation';

// /system-design was an empty shell with no working backend endpoint.
// Route users to the actual System Design learning path.
export default function SystemDesignPage() {
  redirect('/system-design/studio');
}
