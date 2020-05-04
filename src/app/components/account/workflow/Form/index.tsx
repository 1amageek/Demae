import React from 'react';
import firebase from 'firebase'
import Account from 'models/account/Account'
import { Country } from 'common/Country';
import { useAuthUser } from 'hooks/auth'
import Board from 'components/Board'
import JP from './JP'
import US from './US'

export default ({ country, onCallback }: { country: Country, onCallback?: (next: boolean) => void }) => {
	const [auth] = useAuthUser()
	return (
		<Board>
			{country === 'JP' && <JP individual={{ phone: auth?.phoneNumber || undefined }} onCallback={onCallback} />}
			{country === 'US' && <US individual={{ phone: auth?.phoneNumber || undefined }} onCallback={onCallback} />}
		</Board>
	);
}
