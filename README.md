This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Firebase

Firebase has been added to this project. The client SDK is initialized in `lib/firebase.ts`.

Example usage in a client component:

```tsx
'use client';
import firebaseApp from '@/lib/firebase';
import { getFirestore } from 'firebase/firestore';

const db = getFirestore(firebaseApp);

export function Example() {
	return <div>Firebase ready (project: {firebaseApp.options.projectId})</div>;
}
```

If you later add services that are browser-only (e.g. Analytics), import them dynamically or inside an effect to avoid SSR issues.

### Environment Variables

Public Firebase config lives in `.env.local` using the `NEXT_PUBLIC_` prefix:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### Firestore Utilities

Common helpers are provided in `lib/firestore.ts`:

```ts
import { fetchCollection, fetchDoc, createDoc, updateDocument, deleteDocument } from '@/lib/firestore';

// Get all docs
const items = await fetchCollection('accommodations');

// Query with where clauses
const coastal = await fetchCollection('accommodations', [
	{ field: 'region', op: '==', value: 'coast' }
]);

// Create
const newId = await createDoc('accommodations', { name: 'Sample', region: 'coast' });

// Update
await updateDocument('accommodations', newId, { region: 'mountain' });

// Delete
await deleteDocument('accommodations', newId);
```

#### Pagination & Advanced Queries

```ts
import { fetchCollectionPage } from '@/lib/firestore';

// First page
const page1 = await fetchCollectionPage('accommodations', {
	filters: [ { field: 'region', op: '==', value: 'coast' } ],
	order: [ { field: 'name', direction: 'asc' } ],
	limit: 10
});

// Next page
if (page1.nextCursor) {
	const page2 = await fetchCollectionPage('accommodations', {
		filters: [ { field: 'region', op: '==', value: 'coast' } ],
		order: [ { field: 'name', direction: 'asc' } ],
		limit: 10,
		cursor: page1.nextCursor
	});
}
```

