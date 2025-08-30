
// src/lib/db.ts
import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc, orderBy, setDoc } from 'firebase/firestore';
import type { Goal, Budget, Transaction, FinancialTask, RecurringTransaction, Category, AIPlan, UserProfile, Advice } from './types';
import { auth } from './firebase';

const getUid = async (): Promise<string> => {
    // Wait for the auth state to be initialized
    await auth.authStateReady();
    const user = auth.currentUser;

    if (!user) {
        // Add a small delay and retry once, as currentUser might not be immediately available
        await new Promise(resolve => setTimeout(resolve, 500));
        const userAfterDelay = auth.currentUser;
        if (!userAfterDelay) {
            throw new Error("User not authenticated");
        }
        return userAfterDelay.uid;
    }
    return user.uid;
};

// Generic add function
const addDataItem = async <T extends object>(collectionName: string, data: T): Promise<string> => {
    const uid = await getUid();
    const docRef = await addDoc(collection(db, `users/${uid}/${collectionName}`), {
        ...data,
        createdAt: new Date(),
    });
    return docRef.id;
};

// Generic get function
const getData = async <T>(collectionName: string): Promise<(T & { id: string })[]> => {
    const uid = await getUid();
    const q = query(collection(db, `users/${uid}/${collectionName}`), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T & { id: string }));
};

// Generic update function
const updateDataItem = async <T extends object>(collectionName: string, id: string, data: T): Promise<void> => {
    const uid = await getUid();
    const docRef = doc(db, `users/${uid}/${collectionName}`, id);
    await updateDoc(docRef, data);
};

// Generic delete function
const deleteDataItem = async (collectionName: string, id: string): Promise<void> => {
    const uid = await getUid();
    const docRef = doc(db, `users/${uid}/${collectionName}`, id);
    await deleteDoc(docRef);
};


// --- User Profile ---
export const updateUserProfile = async (profileData: Partial<UserProfile>) => {
    const uid = await getUid();
    const profileRef = doc(db, `users/${uid}/profile`, 'settings');
    await setDoc(profileRef, profileData, { merge: true });
}

export const getUserProfile = async (): Promise<UserProfile | null> => {
    const uid = await getUid();
    const profileRef = doc(db, `users/${uid}/profile`, 'settings');
    const docSnap = await getDoc(profileRef);
    if(docSnap.exists()){
        return docSnap.data() as UserProfile;
    }
    return null;
}


// --- Goals ---
export const addGoal = (goal: Omit<Goal, 'id' | 'current' | 'createdAt'>) => {
    const goalData: { title: string; target: number; current: number; advice?: Advice } = {
        title: goal.title,
        target: goal.target,
        current: 0,
    };
    if (goal.advice) {
        goalData.advice = goal.advice;
    }
    return addDataItem('goals', goalData);
};
export const getGoals = () => getData<Goal>('goals');
export const updateGoal = (id: string, goal: Partial<Goal>) => updateDataItem('goals', id, goal);
export const deleteGoal = (id: string) => deleteDataItem('goals', id);
export const getGoal = async (id: string): Promise<(Goal & {id: string}) | null> => {
    const uid = await getUid();
    const docRef = doc(db, `users/${uid}/goals`, id);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
        return { id: docSnap.id, ...docSnap.data() } as Goal & { id: string };
    }
    return null;
}
export const getGoalByTitle = async (title: string): Promise<(Goal & {id: string}) | null> => {
    const uid = await getUid();
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

// --- Categories ---
export const addCategory = async (category: Omit<Category, 'id' | 'createdAt'>): Promise<string> => {
    const uid = await getUid();
    // Check if category already exists
    const q = query(collection(db, `users/${uid}/categories`), where("name", "==", category.name));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        throw new Error("Category already exists.");
    }
    return addDataItem<Omit<Category, 'id'>>('categories', category);
};
export const getCategories = () => getData<Category>('categories');
export const deleteCategory = (id: string) => deleteDataItem('categories', id);

// --- AI Plans ---
export const addAIPlan = (plan: Omit<AIPlan, 'id'>) => addDataItem<Omit<AIPlan, 'id'>>('ai_plans', plan);
export const getAIPlans = () => getData<AIPlan>('ai_plans');
