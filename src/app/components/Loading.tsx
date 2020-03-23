import React from 'react'
import styled from 'styled-components'
import CircularProgress from '@material-ui/core/CircularProgress'

interface Props {
	transparent?: boolean
}
export default function Loading({ transparent }: Props) {
	return (
		<Container>
			<Background transparent={transparent} />
			<CircularProgress />
		</Container>
	)
}

const Container = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	// ${({ theme }) => `
	// 	z-index: ${theme.zindex.Most};
	// 	.MuiCircularProgress-colorPrimary {
	// 		color: ${theme.palette.Black};
	// 	}
	// `}
`
const Background = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	// ${({ theme }) => `
	// 	background; ${theme.palette.Background};
	// 	z-index: ${theme.zindex.Most};
	// `}
	// ${({ transparent }) => transparent && `
	// 	opacity: 0.5;
	// `}
`
