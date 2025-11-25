// app/users/[id]/page.tsx (Server Component)

import UserDetailClient from './UserDetailClient';

// This function pre-defines the list of user IDs to pre-render.
// Even if you have an unbounded set of IDs in production,
// you must define a subset here (or switch your rendering strategy).
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    // You may only list a subset of users here.
  ];
}

export default function UserPage({ params }: { params: { id: string } }) {
  // The server component can perform additional operations here if needed.
  return <UserDetailClient id={params.id} />;
}
