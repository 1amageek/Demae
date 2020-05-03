import React from 'react';
import Account from 'models/account/Account'
import { Country } from 'common/Country';
import Board from '../Board'
import JP from './JP'
import US from './US'

export default ({ country, onCallback }: { country: Country, onCallback?: (next: boolean) => void }) => {
	return (
		<Board>
			{country === 'JP' && <JP individual={{}} onCallback={onCallback} />}
			{country === 'US' && <US individual={{}} onCallback={onCallback} />}
		</Board>
	);
}
