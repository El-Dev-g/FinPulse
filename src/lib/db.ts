// src/lib/db.ts
import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc, orderBy, setDoc } from 'firebase/firestore';
import type { Goal, Budget, Transaction, FinancialTask, RecurringTransaction, Category, AIPlan, UserProfile, Advice } from './types';
import { auth } from './firebase';
import { getFinancialAdvice } from './actions';

const getUid = async (): Promise<string | null> => {
    // Wait for the auth state to be initialized
    await auth.authStateReady();
    const user = auth.currentUser;

    if (!user) {
        // Add a small delay and retry once, as currentUser might not be immediately available
        await new Promise(resolve => setTimeout(resolve, 500));
        const userAfterDelay = auth.currentUser;
        if (!userAfterDelay) {
            console.warn("User not authenticated for DB operation.");
            return null;
        }
        return userAfterDelay.uid;
    }
    return user.uid;
};

// Generic add function
const addDataItem = async <T extends object>(collectionName: string, data: T, customUid?: string): Promise<string> => {
    const uid = customUid || await getUid();
    if (!uid) throw new Error("User not authenticated");
    const docRef = await addDoc(collection(db, `users/${uid}/${collectionName}`), {
        ...data,
        createdAt: new Date(),
    });
    return docRef.id;
};

// Generic get function
const getData = async <T>(collectionName: string): Promise<(T & { id: string })[]> => {
    const uid = await getUid();
    if (!uid) return [];
    const q = query(collection(db, `users/${uid}/${collectionName}`), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T & { id: string }));
};

// Generic update function
const updateDataItem = async <T extends object>(collectionName: string, id: string, data: Partial<T>): Promise<void> => {
    const uid = await getUid();
    if (!uid) throw new Error("User not authenticated");
    const docRef = doc(db, `users/${uid}/${collectionName}`, id);
    await updateDoc(docRef, data);
};

// Generic delete function
const deleteDataItem = async (collectionName: string, id: string): Promise<void> => {
    const uid = await getUid();
    if (!uid) throw new Error("User not authenticated");
    const docRef = doc(db, `users/${uid}/${collectionName}`, id);
    await deleteDoc(docRef);
};


// --- User Profile ---
export const updateUserProfile = async (uid: string, profileData: Partial<UserProfile>) => {
    if (!uid) throw new Error("UID is required to update a user profile.");
    const profileRef = doc(db, `users/${uid}/profile`, 'settings');
    await setDoc(profileRef, profileData, { merge: true });
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    if (!uid) return null;
    const profileRef = doc(db, `users/${uid}/profile`, 'settings');
    const docSnap = await getDoc(profileRef);
    if(docSnap.exists()){
        return docSnap.data() as UserProfile;
    }
    return null;
}


// --- Goals ---
export const addGoal = async (goal: Omit<Goal, 'id' | 'current' | 'createdAt' | 'status'>, autoGenerateAdvice: boolean = false) => {
    const goalData: { title: string; target: number; current: number; advice?: Advice, status: 'active' | 'archived' } = {
        title: goal.title,
        target: goal.target,
        current: 0,
        status: 'active'
    };

    if (autoGenerateAdvice) {
        // For free users, generate a simple advice plan automatically
        const prompt = `I am creating a new financial goal to "${goal.title}" with a target of $${goal.target}. Please give me a simple, encouraging financial plan with 3-5 steps to help me get started.`;
        const advice = await getFinancialAdvice(prompt);
        goalData.advice = advice;
    } else if (goal.advice) {
        // For Pro users, use the advice they might have selected
        goalData.advice = advice;
    }

    return addDataItem('goals', goalData);
};
export const getGoals = async (status: 'active' | 'archived' | 'all' = 'active') => {
    const uid = await getUid();
    if (!uid) return [];
    
    let q;
    if (status === 'all') {
        q = query(collection(db, `users/${uid}/goals`), orderBy('createdAt', 'desc'));
    } else {
        q = query(collection(db, `users/${uid}/goals`), where("status", "==", status), orderBy('createdAt', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal & { id: string }));
};
export const updateGoal = (id: string, goal: Partial<Goal>) => {
    return updateDataItem('goals', id, goal);
};
export const deleteGoal = (id: string) => {
    // We archive instead of deleting
    return updateGoal(id, { status: 'archived' });
};
export const permanentDeleteGoal = (id: string) => {
    return deleteDataItem('goals', id);
}
export const getGoal = async (id: string): Promise<(Goal & {id: string}) | null> => {
    const uid = await getUid();
    if (!uid) return null;
    const docRef = doc(db, `users/${uid}/goals`, id);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
        return { id: docSnap.id, ...docSnap.data() } as Goal & { id: string };
    }
    return null;
}
export const getGoalByTitle = async (title: string): Promise<(Goal & {id: string}) | null> => {
    const uid = await getUid();
    if (!uid) return null;
    const q = query(collection(db, `users/${uid}/goals`), where("title", "==", title));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Goal & { id: string };
    }
    return null;
}


// --- Budgets ---
export const addBudget = (budget: Omit<Budget, 'id'>) => addDataItem<Omit<Budget, 'id'>>('budgets', budget);
export const getBudgets = () => getData<Budget>('budgets');
export const updateBudget = (id: string, budget: Partial<Budget>) => updateDataItem('budgets', id, budget);
export const deleteBudget = (id: string) => deleteDataItem('budgets', id);

// --- Transactions ---
export const addTransaction = (transaction: Omit<Transaction, 'id' | 'Icon'>) => addDataItem<Omit<Transaction, 'id' | 'Icon'>>('transactions', transaction);
export const getTransactions = () => getData<Transaction>('transactions');

// --- Tasks ---
export const addTask = (task: Omit<FinancialTask, 'id'>) => addDataItem<Omit<FinancialTask, 'id'>>('tasks', task);
export const getTasks = () => getData<FinancialTask>('tasks');
export const updateTask = (id: string, task: Partial<FinancialTask>) => updateDataItem('tasks', id, task);
export const deleteTask = (id: string) => deleteDataItem('tasks', id);

// --- Recurring Transactions ---
export const addRecurringTransaction = (transaction: Omit<RecurringTransaction, 'id' | 'Icon'>) => addDataItem<Omit<RecurringTransaction, 'id' | 'Icon'>>('recurring', transaction);
export const getRecurringTransactions = () => getData<RecurringTransaction>('recurring');
export const updateRecurringTransaction = (id: string, transaction: Partial<RecurringTransaction>) => updateDataItem('recurring', id, transaction);
export const deleteRecurringTransaction = (id: string) => deleteDataItem('recurring', id);

// --- Categories ---
export const addCategory = async (category: Omit<Category, 'id' | 'createdAt'>, customUid?: string): Promise<string> => {
    const uid = customUid || await getUid();
    if (!uid) throw new Error("User not authenticated");
    // Check if category already exists
    const q = query(collection(db, `users/${uid}/categories`), where("name", "==", category.name));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        // Return existing category ID or simply don't add, depending on desired behavior
        return querySnapshot.docs[0].id;
    }
    return addDataItem<Omit<Category, 'id'>>('categories', category, uid);
};
export const getCategories = () => getData<Category>('categories');
export const deleteCategory = (id: string) => deleteDataItem('categories', id);

// --- AI Plans ---
export const addAIPlan = (plan: Omit<AIPlan, 'id'>) => addDataItem<Omit<AIPlan, 'id'>>('ai_plans', plan);
export const getAIPlans = () => getData<AIPlan>('ai_plans');
