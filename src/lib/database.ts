// import { getApps, type FirebaseApp } from 'firebase/app';
// import { getFirestore, getDocs, collection, query, where } from 'firebase/firestore';
// import { initializeApp } from 'firebase/app';

// const firebaseConfig = {
// 	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
// 	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
// 	databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
// 	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
// 	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
// 	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
// 	appId: import.meta.env.VITE_FIREBASE_APP_ID,
// 	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
// };

// Initialize Firebase
// let app: FirebaseApp;
// if (!getApps().length) {
// 	console.debug('Initializing Firebase app');
// 	app = initializeApp(firebaseConfig);
// } else {
// 	console.debug('Using existing Firebase app');
// 	console.debug(getApps());
// 	app = getApps()[0];
// }
// const db = getFirestore(app);

const connection_string: string = import.meta.env.VITE_MONGO_DB_CONNECTION_STRING;
const roblox_db_name: string = import.meta.env.VITE_ROBLOX_DB_NAME;
const clan_battle_db_name: string = import.meta.env.VITE_PS99_CLAN_BATTLE_DB_NAME;

const client = new MongoClient(connection_string);
await client.connect();
const roblox_db = client.db(roblox_db_name);
const clan_battle_db = client.db(clan_battle_db_name);

import type { robloxUserData, clansData, clanData } from './get-ps99-data';
import { MongoClient } from 'mongodb';

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
	const robloxUsers: dbRobloxUser[] = [];
	const robloxUsersCollection = roblox_db.collection('users');
	const query = await robloxUsersCollection.find({}).toArray();
	for (const doc of query) {
		const data = doc;
		const robloxData = data as unknown as robloxUserData;
		robloxUsers.push({ id: doc._id.toString(), created_on: parse_id_for_date(doc._id.toString()), data: robloxData});

	}
	return robloxUsers;
}
	// try {
	// 	console.log('Starting to fetch data...');
	// 	const querySnapshot = await getDocs(collection(db, 'roblox_users'));
	// 	robloxUsers = querySnapshot.docs.map((doc) => {
	// 		const data = doc.data();
	// 		return { id: doc.id, created_on: parse_id_for_date(doc.id), data: data as robloxUserData };
	// 	});
	// 	console.log('Fetched roblox users:');
	// } catch (error) {
	// 	console.error('Failed to fetch roblox users', error);
	// } finally {
	// 	return robloxUsers;
	// }


export async function getClanTotals(): Promise<dbClanTotal[]> {
	let clanTotals: dbClanTotal[] = [];
	try {
		const clanTotalsCollection = clan_battle_db.collection('clan_totals');
		const query = await clanTotalsCollection.find({}).toArray();
		clanTotals = query.map((doc) => {
			const data = doc.data();
			return { id: doc.id, created_on: parse_id_for_date(doc.id), data: data as clansData };
		});
		console.log('Fetched clan totals:');
	} catch (error) {
		console.error('Failed to fetch clan totals', error);
	}
	return clanTotals;
}

export async function getClanDetails(clanName: string): Promise<dbClan[]> {
	let clanDetails: dbClan[] = [];
	try {
		const clans_collection = clan_battle_db.collection('clans');
		const query = await clans_collection.find({ Name: clanName }).toArray();
		// const clanQuery = query(collection(db, 'clans'), where('Name', '==', clanName));
		// const querySnapshot = await getDocs(clanQuery);
		clanDetails = query.map((doc) => {
			const data = doc.data();
			return { id: doc.id, created_on: parse_id_for_date(doc.id), data: data as clanData };
		});
		console.log('Fetched clan details:');
	} catch (error) {
		console.error('Failed to fetch clan details', error);
	}
	return clanDetails;
}

//export const dbInstance = db;
