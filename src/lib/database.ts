import { getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, getDocs, collection, query, where } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
	console.debug('Initializing Firebase app');
	app = initializeApp(firebaseConfig);
} else {
	console.debug('Using existing Firebase app');
	console.debug(getApps());
	app = getApps()[0];
}
const db = getFirestore(app);

import type { robloxUserData, clansData, clanData } from './get-ps99-data';

export interface dbRobloxUser {
	id: string;
	created_on: Date;
	data: robloxUserData;
}

export interface dbClanTotal {
	id: string;
	created_on: Date;
	data: clansData;
}

export interface dbClan {
	id: string;
	created_on: Date;
	data: clanData;
}

function parse_id_for_date(id: string) {
	const dateStr = id.split('||')[1];
	const date = new Date(dateStr);
	return date;
}

export async function getRobloxUsers(): Promise<dbRobloxUser[]> {
	let robloxUsers: dbRobloxUser[] = [];
	try {
		console.log('Starting to fetch data...');
		const querySnapshot = await getDocs(collection(db, 'roblox_users'));
		robloxUsers = querySnapshot.docs.map((doc) => {
			const data = doc.data();
			return { id: doc.id, created_on: parse_id_for_date(doc.id), data: data as robloxUserData };
		});
		console.log('Fetched roblox users:');
	} catch (error) {
		console.error('Failed to fetch roblox users', error);
	} finally {
		return robloxUsers;
	}
}

export async function getClanTotals(): Promise<dbClanTotal[]> {
	let clanTotals: dbClanTotal[] = [];
	try {
		const querySnapshot = await getDocs(collection(db, 'clan_totals'));
		clanTotals = querySnapshot.docs.map((doc) => {
			const data = doc.data();
			return { id: doc.id, created_on: parse_id_for_date(doc.id), data: data as clansData };
		});
		console.log('Fetched clan totals:');
	} catch (error) {
		console.error('Failed to fetch clan totals', error);
	} finally {
		return clanTotals;
	}
}

export async function getClanDetails(clanName: string): Promise<dbClan[]> {
	let clanDetails: dbClan[] = [];
	try {
		const clanQuery = query(collection(db, 'clans'), where('Name', '==', clanName));
		const querySnapshot = await getDocs(clanQuery);
		clanDetails = querySnapshot.docs.map((doc) => {
			const data = doc.data();
			return { id: doc.id, created_on: parse_id_for_date(doc.id), data: data as clanData };
		});
		console.log('Fetched clan details:');
	} catch (error) {
		console.error('Failed to fetch clan details', error);
	} finally {
		return clanDetails;
	}
}

export const dbInstance = db;
