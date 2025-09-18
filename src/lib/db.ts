
// src/lib/db.ts
import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc, orderBy, setDoc, writeBatch } from 'firebase/firestore';
import type { Goal, Budget, Transaction, FinancialTask, RecurringTransaction, Category, AIPlan, UserProfile, Advice, Investment, Project, Account } from './types';
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

// Generic set function that can create or update a document with a specific ID
const setDataItem = async <T extends object>(collectionName: string, id: string, data: T, merge: boolean = false, customUid?: string): Promise<void> => {
    const uid = customUid || await getUid();
    if (!uid) throw new Error("User not authenticated");
    const docRef = doc(db, `users/${uid}/${collectionName}`, id);
    await setDoc(docRef, data, { merge });
};

// Generic add function for when you want Firestore to auto-generate an ID
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
    await setDataItem('profile', 'settings', profileData, true, uid);
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

// --- User Data Deletion ---
export const deleteUserData = async (uid: string): Promise<void> => {
    if (!uid) throw new Error("UID is required to delete user data.");

    console.log(`Starting data deletion for user: ${uid}`);

    const collectionsToDelete = [
        'transactions',
        'recurring',
        'goals',
        'budgets',
        'tasks',
        'categories',
        'ai_plans',
        'investments',
        'projects',
        'integrations',
        'accounts',
        'profile' // This will also delete the profile/settings doc
    ];

    const batch = writeBatch(db);

    for (const collectionName of collectionsToDelete) {
        const collectionRef = collection(db, `users/${uid}/${collectionName}`);
        const querySnapshot = await getDocs(collectionRef);
        
        if (!querySnapshot.empty) {
            console.log(`Deleting ${querySnapshot.docs.length} documents from '${collectionName}'...`);
            querySnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
        }
    }
    
    // The top-level user document might not exist if it was never explicitly created,
    // but we can try to delete it if it does.
    const userDocRef = doc(db, 'users', uid);
    batch.delete(userDocRef);

    await batch.commit();
    console.log(`Data deletion completed for user: ${uid}`);
};


// --- Goals ---
export const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'status'>, autoGenerateAdvice: boolean = false) => {
    const goalData: { title: string; target: number; current: number; advice?: Advice, status: 'active' | 'archived', projectId?: string } = {
        title: goal.title,
        target: goal.target,
        current: goal.current || 0,
        status: 'active',
        projectId: goal.projectId,
    };

    if (autoGenerateAdvice) {
        // For free users, generate a simple advice plan automatically
        const prompt = `I am creating a new financial goal to "${goal.title}" with a target of $${goal.target}. Please give me a simple, encouraging financial plan with 3-5 steps to help me get started.`;
        const advice = await getFinancialAdvice(prompt);
        goalData.advice = advice;
    } else if (goal.advice) {
        // For Pro users, use the advice they might have selected
        goalData.advice = goal.advice;
    }

    return addDataItem('goals', goalData);
};
export const getGoals = async (status: 'active' | 'archived' | 'all' = 'active') => {
    const uid = await getUid();
    if (!uid) return [];
    
    // Fetch all goals sorted by creation date
    const q = query(collection(db, `users/${uid}/goals`), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const allGoals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal & { id: string }));

    // Filter by status in the code if needed
    if (status === 'all') {
        return allGoals;
    }
    return allGoals.filter(goal => goal.status === status);
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
export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'Icon'>) => {
    let finalTransaction = { ...transaction };

    // If a goalId is present, check if that goal is linked to a project
    if (transaction.goalId) {
        const goal = await getGoal(transaction.goalId);
        if (goal && goal.projectId) {
            // Automatically link the transaction to the project as well
            finalTransaction.projectId = goal.projectId;
        }
    }
    return addDataItem<Omit<Transaction, 'id' | 'Icon'>>('transactions', finalTransaction);
};
export const getTransactions = () => getData<Transaction>('transactions');
export const deleteTransaction = (id: string) => deleteDataItem('transactions', id);

// --- Tasks ---
export const addTask = (task: Omit<FinancialTask, 'id'>) => {
    const taskData: Partial<Omit<FinancialTask, 'id' | 'createdAt'>> = {
        title: task.title,
        status: task.status,
    };
    if (task.dueDate) taskData.dueDate = task.dueDate;
    if (task.dueTime) taskData.dueTime = task.dueTime;
    if (task.goalId) taskData.goalId = task.goalId;
    if (task.projectId) taskData.projectId = task.projectId;
    
    return addDataItem<Partial<Omit<FinancialTask, 'id' | 'createdAt'>>>('tasks', taskData);
}
export const getTasks = () => getData<FinancialTask>('tasks');
export const updateTask = (id: string, task: Partial<FinancialTask>) => updateDataItem('tasks', id, task);
export const updateTasks = async (taskIds: string[], data: Partial<FinancialTask>): Promise<void> => {
    const uid = await getUid();
    if (!uid) throw new Error("User not authenticated");

    const batch = writeBatch(db);
    taskIds.forEach(taskId => {
        const docRef = doc(db, `users/${uid}/tasks`, taskId);
        batch.update(docRef, data);
    });

    await batch.commit();
};
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
    
    // Create a new document with an auto-generated ID
    const docRef = doc(collection(db, `users/${uid}/categories`));
    
    // Use set to create the document with the desired data
    await setDoc(docRef, {
        ...category,
        createdAt: new Date(),
    });
    
    return docRef.id;
};
export const getCategories = () => getData<Category>('categories');
export const deleteCategory = (id: string) => deleteDataItem('categories', id);

// --- AI Plans ---
export const addAIPlan = (plan: Omit<AIPlan, 'id'>) => addDataItem<Omit<AIPlan, 'id'>>('ai_plans', plan);
export const getAIPlans = () => getData<AIPlan>('ai_plans');


// --- Investments ---
export const addInvestment = (investment: Omit<Investment, 'id'>) => addDataItem('investments', investment);
export const getInvestments = () => getData<Investment>('investments');
export const updateInvestment = (id: string, investment: Partial<Investment>) => updateDataItem('investments', id, investment);
export const deleteInvestment = (id: string) => deleteDataItem('investments', id);

// --- Projects ---
export const addProject = (project: Omit<Project, 'id'>) => addDataItem('projects', project);
export const getProjects = () => getData<Project>('projects');
export const getProject = async (id: string): Promise<(Project & { id: string }) | null> => {
    const uid = await getUid();
    if (!uid) return null;
    const docRef = doc(db, `users/${uid}/projects`, id);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
        return { id: docSnap.id, ...docSnap.data() } as Project & { id: string };
    }
    return null;
}
export const updateProject = (id: string, project: Partial<Project>) => updateDataItem('projects', id, project);
export const deleteProject = (id: string) => deleteDataItem('projects', id);

// --- Linked Accounts ---
export const addAccount = (account: Omit<Account, 'id'>) => addDataItem('accounts', account);
export const getAccounts = () => getData<Account>('accounts');
export const updateAccount = (id: string, account: Partial<Account>) => updateDataItem('accounts', id, account);
export const deleteAccount = (id: string) => deleteDataItem('accounts', id);
