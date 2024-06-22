export interface MemberPoints {
	createdOn: Date;
	points: number;
}

export interface robloxUserData {
	_id: number;
	hasVerifiedBadge: boolean;
	displayName: string;
	name: string;
}

export interface clansData {
	Created: number;
	Name: string;
	MemberCapacity: number;
	DepositedDiamonds: number;
	CountryCode: string;
	Members: number;
	Points: number;
}

export interface clanBattleConifgData {
	Title: string;
	_id: string;
	StartTime: number;
	FinishTime: number;
}

export interface activeClanBattle {
	configName: string;
	configData: clanBattleConifgData;
}

interface PointContribution {
	UserID: number;
	Points: number;
}

export interface Battle {
	ProcessedAwards: boolean;
	AwardUserIDs: number[];
	BattleID: string;
	Points: number;
	PointContributions: PointContribution[];
	EarnedMedal?: string;
}

interface Battles {
	[key: string]: Battle;
}

interface ClanMember {
	UserID: number;
	JoinTime: number;
}

interface ClanMemberWithName extends ClanMember {
	displayName: string;
	name: string;
}

interface ClanMemberWithDiamonds extends ClanMemberWithName {
	Diamonds: number;
}

interface ClanMemberWithPoints extends ClanMemberWithName {
	Points: {
		BattleID: string;
		Points: number;
	}[];
}

export interface ClanMemberFullDetails extends ClanMemberWithDiamonds, ClanMemberWithPoints {}

export interface clanData {
	Owner: number;
	Name: string;
	Icon: string;
	Desc: string;
	Members: ClanMember[];
	DepositedDiamonds: number;
	DiamondContributions: {
		AllTime: {
			Sum: number;
			Data: [
				{
					UserID: number;
					Diamonds: number;
				}
			];
		};
	};
	Status: string;
	Battles: Battles;
	CountryCode: string;
	BronzeMedals: number;
	SilverMedals: number;
	GoldMedals: number;
	LastKickTimestamp: number;
}

export interface ps99ApiResponse {
	status: string;
	data: clansData[] | activeClanBattle | clanData;
}

interface GetPs99DataOptions {
	page?: number;
	pageSize?: number;
	sort?: string;
	sortOrder?: string;
}

export async function getClans({
	page = 1,
	pageSize = 100,
	sort = 'Points',
	sortOrder = 'desc'
}: GetPs99DataOptions = {}): Promise<ps99ApiResponse> {
	const baseUrl = 'https://biggamesapi.io/api/clans';
	let response = await fetch(
		`${baseUrl}?page=${page}&pageSize=${pageSize}&sort=${sort}&sortOrder=${sortOrder}`
	);
	const apiData = (await response.json()) as ps99ApiResponse;
	const clanNames = (apiData.data as clansData[]).map((clan: clansData) => clan.Name);
	while (!clanNames.includes('SOUP')) {
		console.debug("SOUP isn't in the data, fetching more clans");
		page++;
		response = await fetch(
			`${baseUrl}?page=${page}&pageSize=${pageSize}&sort=${sort}&sortOrder=${sortOrder}`
		);
		apiData.data = (apiData.data as clansData[]).concat((await response.json()).data);
		clanNames.push(...(apiData.data as clansData[]).map((clan: clansData) => clan.Name));
	}
	return apiData;
}

export async function getActiveClanBattle(): Promise<ps99ApiResponse> {
	// https://biggamesapi.io/api/activeClanBattle
	const baseUrl = 'https://biggamesapi.io/api/activeClanBattle';
	const response = await fetch(baseUrl);
	return response.json();
}

export async function getClan(clanName: string): Promise<ps99ApiResponse> {
	const baseUrl = 'https://biggamesapi.io/api/clan';
	const response = await fetch(`${baseUrl}/${clanName}`);
	return response.json();
}

export function getClanMemberNames(
	clanData: clanData,
	usersData: robloxUserData[]
): ClanMemberWithName[] {
	const members = clanData.Members;
	members.push({ UserID: clanData.Owner, JoinTime: 0 });
	const membersWithNames = members.map((member: ClanMember) => {
		const userData = usersData.find((userData) => userData._id === member.UserID);
		return {
			...member,
			displayName: userData ? userData.displayName : 'Unknown',
			name: userData ? userData.name : 'Unknown'
		};
	});
	return membersWithNames;
}

export async function getClanMemberDiamondContibutions(
	clanData: clanData,
	clanMemberNames: ClanMemberWithName[]
): Promise<ClanMemberWithDiamonds[]> {
	const diamondContributions = clanData.DiamondContributions.AllTime.Data;
	const membersWithDiamonds = clanMemberNames.map((member) => {
		const diamondContribution = diamondContributions.find(
			(contribution) => contribution.UserID === member.UserID
		);
		const diamonds = diamondContribution ? diamondContribution.Diamonds : 0;
		return {
			...member,
			Diamonds: diamonds
		};
	});
	return membersWithDiamonds;
}

export async function getClanMemberPointContibutions(
	clanData: clanData,
	clanMemberNames: ClanMemberWithName[]
): Promise<ClanMemberWithPoints[]> {
	const pointContributions = clanData.Battles;
	const membersWithPoints = clanMemberNames.map((member) => {
		const points = Object.entries(pointContributions).reduce(
			(acc, [battleId, battle]) => {
				const pointContribution = battle.PointContributions.find(
					(pointContribution) => pointContribution.UserID === member.UserID
				);
				if (pointContribution) {
					acc.push({
						BattleID: battleId,
						Points: pointContribution.Points
					});
				} else {
					acc.push({
						BattleID: battleId,
						Points: 0
					});
				}
				return acc;
			},
			[] as { BattleID: string; Points: number }[]
		);
		return {
			...member,
			Points: points
		};
	});
	return membersWithPoints;
}

export async function getClanMemberFullDetails(
	clanMemberDiamondContibutions: ClanMemberWithDiamonds[],
	clanMemberPointContibutions: ClanMemberWithPoints[]
): Promise<ClanMemberFullDetails[]> {
	const membersWithFullDetails = clanMemberDiamondContibutions.map((member) => {
		const pointContributions = clanMemberPointContibutions.find(
			(pointContribution) => pointContribution.UserID === member.UserID
		);
		if (!pointContributions) {
			console.warn('Point contribution not found for member', member);
			return {
				...member,
				Points: []
			};
		}
		return {
			...member,
			Points: pointContributions.Points
		};
	});
	console.debug('getClanMemberFullDetails', membersWithFullDetails);
	return membersWithFullDetails;
}
