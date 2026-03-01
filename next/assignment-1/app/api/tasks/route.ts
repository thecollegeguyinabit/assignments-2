import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, orderBy, Timestamp, doc, getDoc } from 'firebase/firestore';

export async function GET(request: Request) {
  try {
    // const { searchParams } = new URL(request.url);
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Missing User ID' }, { status: 401 });
    }

    // Check if user is admin
    const userDoc = await getDoc(doc(db, 'users', userId));
    const role = userDoc.exists() ? userDoc.data().role : 'user';

    let q;
    if (role === 'admin') {
      q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    } else {
      // Remove orderBy('createdAt', 'desc') to avoid needing a composite index in Firestore
      q = query(collection(db, 'tasks'), where('ownerId', '==', userId));
    }

    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now())
      };
    });

    // Sort in memory to ensure correct order without requiring a composite index
    // (Firestore requires an index for where() + orderBy() on different fields)
    tasks.sort((a: any, b: any) => b.createdAt - a.createdAt);

    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const newTask = {
      ...body,
      ownerId: userId,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'tasks'), newTask);
    
    return NextResponse.json({ 
      id: docRef.id, 
      ...newTask, 
      createdAt: newTask.createdAt.toMillis() 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
